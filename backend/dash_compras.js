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
      const safeName = col.title
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");
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

    // Exclui a tabela antes de criar uma nova
    console.log(`Deletando a tabela ${TABLE_NAME}...`);
    await client.query(`DROP TABLE IF EXISTS ${TABLE_NAME};`);

    // Cria a tabela dinamicamente
    let createTableQuery = `CREATE TABLE ${TABLE_NAME} (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "grupo" TEXT
    `;

    // Adiciona as colunas dinamicamente
    Object.values(columnMap).forEach((colName) => {
      createTableQuery += `, "${colName}_text" TEXT, "${colName}_value" JSONB`; // Usando JSONB para valores mais complexos
    });
    createTableQuery += ");";

    await client.query(createTableQuery);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} ("id", "name", "grupo", ${Object.values(
      columnMap
    )
      .map((c) => `"${c}"`)
      .join(", ")})
      VALUES (${[
        "$1",
        "$2",
        "$3", // Para a coluna "grupo"
        ...Object.values(columnMap).map((_, i) => `$${i + 4}`),
      ].join(", ")})
      ON CONFLICT ("id") DO UPDATE SET
      ${Object.values(columnMap)
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .concat(['"grupo" = EXCLUDED."grupo"'])
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
              ? JSON.stringify(c.value) // Armazenando valores como JSONB
              : c.value ?? "",
        };
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "", // Para o campo grupo
        ...Object.values(columnMap).map((t) => col[t] ?? ""),
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
