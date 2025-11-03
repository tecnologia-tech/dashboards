import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import pkg from "pg";
const { Client } = pkg;
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

const MONDAY_BOARD_ID = "8918157934";
const TABLE_NAME = "dash_ixlogcomex";

const MONDAY_QUERY = `
  query ($board_id: ID!, $limit: Int!, $cursor: String) {
    boards(ids: [$board_id]) {
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
          group { title }
          column_values {
            id
            text
            value
          }
        }
      }
    }
  }
`;

async function getColumnMap() {
  const query = `
    query ($board_id: ID!) {
      boards(ids: [$board_id]) {
        columns {
          id
          title
        }
      }
    }
  `;

  const variables = { board_id: MONDAY_BOARD_ID };

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  const columns = data?.data?.boards?.[0]?.columns || [];

  const map = {};
  for (const col of columns) {
    if (col.id && col.title) map[col.id] = col.title;
  }

  return map;
}

async function getMondayData() {
  const allItems = [];
  let cursor = null;
  const limit = 50;

  do {
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: MONDAY_QUERY,
        variables: { board_id: MONDAY_BOARD_ID, limit, cursor },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Erro na requisição: ${response.status} ${response.statusText} - ${text}`
      );
    }

    const data = await response.json();
    const page = data?.data?.boards?.[0]?.items_page;
    if (!page) break;

    allItems.push(...(page.items || []));
    cursor = page.cursor;
  } while (cursor);

  return allItems;
}

async function saveToPostgres(items, columnMap) {
  const client = new Client({
    host: PGHOST,
    port: PGPORT ? parseInt(PGPORT, 10) : 5432,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: false,
  });

  try {
    await client.connect();

    const columnList = Object.entries(columnMap)
      .filter(([_, title]) => !!title && /^[a-zA-Z0-9_À-ÿ\s]+$/.test(title))
      .map(([_, title]) => ({ title }));

    if (columnList.length === 0) {
      throw new Error("Nenhum título de coluna válido foi encontrado.");
    }

    const columnDefs = columnList
      .map(({ title }) => `"${title}_text" TEXT, "${title}_value" TEXT`)
      .join(", ");

    await client.query(`DROP TABLE IF EXISTS ${TABLE_NAME};`);
    await client.query(`
      CREATE TABLE ${TABLE_NAME} (
        id TEXT,
        name TEXT,
        grupo TEXT,
        ${columnDefs}
      );
    `);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (
        id, name, grupo, ${columnList
          .flatMap(({ title }) => [`"${title}_text"`, `"${title}_value"`])
          .join(", ")}
      ) VALUES (
        ${[
          "$1",
          "$2",
          "$3",
          ...columnList.flatMap((_, i) => [`$${i * 2 + 4}`, `$${i * 2 + 5}`]),
        ].join(", ")}
      )
    `;

    let inserted = 0;
    for (const item of items) {
      const col = {};
      for (const c of item.column_values || []) {
        if (!c?.id || !columnMap[c.id]) continue;
        const title = columnMap[c.id];
        col[title] = {
          text: c.text ?? "",
          value:
            typeof c.value === "object"
              ? JSON.stringify(c.value)
              : c.value ?? "",
        };
      }

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        ...columnList.flatMap(({ title }) => {
          const c = col[title] || {};
          return [c.text ?? "", c.value ?? ""];
        }),
      ];

      await client.query(insertQuery, row);
      inserted++;
    }

    console.log(`✅ Inseridos ${inserted} registros na tabela ${TABLE_NAME}`);
  } catch (err) {
    console.error("❌ Erro ao salvar no banco:", err.message);
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function dashIXLogComex() {
  try {
    console.log("▶️ Executando módulo dash_ixlogcomex...");
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log(`✅ dash_ixlogcomex.js concluído com sucesso!`);
  } catch (err) {
    console.error("Erro geral:", err);
  }
}
