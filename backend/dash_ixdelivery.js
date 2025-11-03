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

const MONDAY_BOARD_ID = "8860920734";
const TABLE_NAME = "dash_ixdelivery";

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

function cleanName(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .trim();
}

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

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  const columns = data?.data?.boards?.[0]?.columns || [];

  const map = {};
  columns.forEach((col) => {
    if (col.id && col.title) map[col.id] = cleanName(col.title);
  });
  return map;
}

async function getMondayData() {
  const allItems = [];
  let cursor = null;
  const limit = 50;
  let page = 1;

  do {
    const res = await fetch("https://api.monday.com/v2", {
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

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Erro HTTP ${res.status} - ${text}`);
    }

    const data = await res.json();
    const pageData = data?.data?.boards?.[0]?.items_page;
    if (!pageData) break;

    allItems.push(...(pageData.items || []));
    cursor = pageData.cursor;
    console.log(`📦 Página ${page++} carregada (${allItems.length} itens)`);
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
    console.log(`💾 Salvando ${items.length} registros em ${TABLE_NAME}...`);

    const columns = Object.values(columnMap);
    const colDefs = columns
      .map((t) => `"${t}_text" TEXT, "${t}_value" TEXT`)
      .join(", ");

    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT PRIMARY KEY,
        name TEXT,
        grupo TEXT,
        ${colDefs}
      );
    `);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (id, name, grupo, ${columns
        .flatMap((c) => [`"${c}_text"`, `"${c}_value"`])
        .join(", ")})
      VALUES (${[
        "$1",
        "$2",
        "$3",
        ...columns.flatMap((_, i) => [`$${i * 2 + 4}`, `$${i * 2 + 5}`]),
      ].join(", ")})
      ON CONFLICT (id) DO UPDATE SET
      ${columns
        .flatMap((c) => [
          `"${c}_text" = EXCLUDED."${c}_text"`,
          `"${c}_value" = EXCLUDED."${c}_value"`,
        ])
        .concat(['grupo = EXCLUDED.grupo'])
        .join(", ")}
    `;

    let inserted = 0;
    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c?.id || !columnMap[c.id]) return;
        const title = columnMap[c.id];
        col[title] = {
          text: c.text ?? "",
          value:
            typeof c.value === "object"
              ? JSON.stringify(c.value)
              : c.value ?? "",
        };
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        ...columns.flatMap((t) => {
          const c = col[t] || {};
          return [c.text ?? "", c.value ?? ""];
        }),
      ];

      await client.query(insertQuery, row);
      inserted++;
    }

    console.log(`✅ ${inserted} registros atualizados em ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Erro ao salvar ${TABLE_NAME}:`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function dashIXDelivery() {
  const start = Date.now();
  console.log("▶️ Executando dash_ixdelivery.js...");
  try {
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log(
      `🏁 dash_ixdelivery concluído em ${((Date.now() - start) / 1000).toFixed(1)}s`
    );
  } catch (err) {
    console.error("🚨 Erro geral em dash_ixdelivery:", err.message);
  }
}
