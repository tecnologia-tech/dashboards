import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";
const { Client } = pkg;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

const MONDAY_BOARD_ID = "8149184073";
const TABLE_NAME = "dash_onboarding";

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

    const validColumns = Object.values(columnMap)
      .filter((title) => !!title && /^[a-zA-Z0-9_À-ÿ\s]+$/.test(title))
      .map((title) => `"${title}"`);

    if (validColumns.length === 0) {
      throw new Error("Nenhum título de coluna válido encontrado.");
    }

  
    await client.query(`DROP TABLE IF EXISTS ${TABLE_NAME};`);
    await client.query(`
      CREATE TABLE ${TABLE_NAME} (
        id TEXT,
        name TEXT,
        ${validColumns.map((t) => `${t} TEXT`).join(", ")},
        grupo TEXT
      );
    `);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (
        id, name, ${validColumns.join(", ")}, grupo
      ) VALUES (
        ${[
          "$1",
          "$2",
          ...validColumns.map((_, i) => `$${i + 3}`),
          `$${validColumns.length + 3}`,
        ].join(", ")}
      )
    `;

    let inserted = 0;
    for (const item of items) {
      const col = {};
      for (const c of item.column_values || []) {
        if (!c?.id || !columnMap[c.id]) continue;
        col[columnMap[c.id]] = c.text ?? "";
      }

      const row = [
        item.id ?? "",
        item.name ?? "",
        ...Object.values(columnMap)
          .filter((title) => !!title && /^[a-zA-Z0-9_À-ÿ\s]+$/.test(title))
          .map((title) => col[title] ?? ""),
        item.group?.title ?? "",
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

export default async function dashOnboarding() {
  try {
    console.log("▶️ Executando módulo dash_onboarding...");
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum item retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log("✅ dash_onboarding.js concluído com sucesso!");
  } catch (err) {
    console.error("Erro geral:", err);
  }
}
