import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import pkg from "pg";
const { Client } = pkg;
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

const MONDAY_BOARD_ID = "8918157934";
const TABLE_NAME = "dash_compras";

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
  console.log("Columns fetched from Monday:", data); // Log dos dados da tabela
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
  console.log(`Fetched ${allItems.length} items from Monday.`);
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

    // Logs para o processo de criação da tabela
    console.log(`Creating table: DROP IF EXISTS ${TABLE_NAME};`);
    await client.query(`
      DROP TABLE IF EXISTS ${TABLE_NAME};
      CREATE TABLE ${TABLE_NAME} (
        id TEXT PRIMARY KEY,
        name TEXT,
        value NUMERIC(12,2),  -- Criando a coluna "value"
        ${colDefs},
        grupo TEXT
      );
    `);

    // Logando as queries de inserção
    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (id, name, value, ${columns
      .map((c) => `"${c}"`)
      .join(", ")}, grupo)
      VALUES (${[
        "$1",
        "$2",
        "$3", // Para o valor "value"
        ...columns.map((_, i) => `$${i + 4}`),
        `$${columns.length + 4}`,
      ].join(", ")})
      ON CONFLICT (id) DO UPDATE SET
      ${columns
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .concat(["grupo = EXCLUDED.grupo", "value = EXCLUDED.value"])
        .join(", ")};
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
        item.value ?? 0, // Garantindo que o valor "value" seja passado corretamente
        ...columns.map((t) => col[t] ?? ""),
        item.group?.title ?? "",
      ];

      console.log(`Inserting row: ${JSON.stringify(row)}`); // Log do que está sendo inserido
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

export default async function dashCompras() {
  const start = Date.now();
  console.log("▶️ Executando dash_compras.js...");
  try {
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    console.log(
      `🏁 dash_compras concluído em ${((Date.now() - start) / 1000).toFixed(
        1
      )}s`
    );
  } catch (err) {
    console.error("🚨 Erro geral em dash_compras:", err.message);
  }
}
