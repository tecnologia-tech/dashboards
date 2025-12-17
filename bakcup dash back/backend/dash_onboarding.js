import dotenv from "dotenv";
import fetch from "node-fetch";
import { pool } from "./db.js";
import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { MONDAY_API_URL, MONDAY_API_TOKEN } = process.env;
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

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: MONDAY_API_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();

  if (
    !data ||
    !data.data ||
    !data.data.boards ||
    !data.data.boards[0]?.columns
  ) {
    console.error(
      "Erro ao obter colunas do board. Verifique a resposta da API."
    );
    return {};
  }

  const columns = data.data.boards[0].columns;

  const map = {};
  columns.forEach((col) => {
    if (col.id && col.title) {
      const safeName = cleanName(col.title);
      map[col.id] = safeName;
    }
  });
  return map;
}

async function getMondayData() {
  const allItems = [];
  let cursor = null;
  const limit = 50;
  do {
    const res = await fetch(MONDAY_API_URL, {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_TOKEN,
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

  console.log(`📊 Total de itens recuperados do Monday: ${allItems.length}`);
  return allItems;
}

async function saveToPostgres(items, columnMap) {
  const client = await pool.connect();
  try {
    console.log(`💾 Salvando ${items.length} registros em ${TABLE_NAME}...`);
    const columns = Object.values(columnMap);
    const colDefs = columns.map((t) => `"${t}" TEXT`).join(", ");

    await client.query(`
      DROP TABLE IF EXISTS ${TABLE_NAME};
      CREATE TABLE ${TABLE_NAME} (
        id TEXT PRIMARY KEY,
        name TEXT,
        grupo TEXT,
        ${colDefs}
      );
    `);
    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (id, name, grupo, ${columns
      .map((c) => `"${c}"`)
      .join(", ")})
      VALUES (${["$1", "$2", "$3", ...columns.map((_, i) => `$${i + 4}`)].join(
        ", "
      )})
      ON CONFLICT (id) DO UPDATE SET
      ${columns
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .concat(["grupo = EXCLUDED.grupo"])
        .join(", ")}
    `;

    let inserted = 0;

    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c || !columnMap[c.id]) return;
        col[columnMap[c.id]] = c.text ?? "";
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        ...columns.map((t) => col[t] ?? ""),
      ];
      await client.query(insertQuery, row);
      inserted++;
    }
  } catch (err) {
    console.error("❌ Erro ao salvar:", err.message);
  } finally {
    client.release();
  }
}

export default async function dashCompras() {
  const start = Date.now();
  console.log("▶️ Executando dash_onboarding.js...");
  try {
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log(
      `🏁 dash_onboarding concluído em ${((Date.now() - start) / 1000).toFixed(
        1
      )}s`
    );
  } catch (err) {
    console.error("🚨 Erro geral em dash_onboarding:", err.message);
  }
}
