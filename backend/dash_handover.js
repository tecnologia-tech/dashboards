import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";
const { Client } = pkg;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

const MONDAY_BOARD_ID = "8593332666";
const TABLE_NAME = "dash_handover";

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
    if (col.id && col.title) {
      const safeName = cleanName(col.title);
      map[col.id] = `${safeName}_${col.id}`;
    }
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
    const colDefs = columns.map((t) => `"${t}" TEXT`).join(", ");

    await client.query(`
      DROP TABLE IF EXISTS ${TABLE_NAME};
      CREATE TABLE ${TABLE_NAME} (
        id TEXT PRIMARY KEY,
        name TEXT,
        ${colDefs},
        grupo TEXT
      );
    `);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (id, name, ${columns
      .map((c) => `"${c}"`)
      .join(", ")}, grupo)
      VALUES (${[
        "$1",
        "$2",
        ...columns.map((_, i) => `$${i + 3}`),
        `$${columns.length + 3}`,
      ].join(", ")})
      ON CONFLICT (id) DO UPDATE SET
      ${columns
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .concat(["grupo = EXCLUDED.grupo"])
        .join(", ")}
    `;

    let count = 0;
    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c || !columnMap[c.id]) return;
        col[columnMap[c.id]] = c.text ?? "";
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        ...columns.map((t) => col[t] ?? ""),
        item.group?.title ?? "",
      ];

      await client.query(insertQuery, row);
      count++;
    }

    console.log(`✅ ${count} registros atualizados em ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Erro ao salvar ${TABLE_NAME}:`, err.message);
  } finally {
    await client.end();
  }
}

export default async function dashHandover() {
  const start = Date.now();
  console.log("▶️ Executando dash_handover.js...");
  try {
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log(
      `🏁 dash_handover concluído em ${((Date.now() - start) / 1000).toFixed(1)}s`
    );
  } catch (err) {
    console.error("🚨 Erro geral em dash_handover:", err.message);
  }
}
