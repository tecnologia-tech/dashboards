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
const MONDAY_BOARD_ID = "8593336204";
const TABLE_NAME = `dash_board_${MONDAY_BOARD_ID}`;

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

async function getMondayData() {
  console.log("🔍 Buscando dados da board:", MONDAY_BOARD_ID);
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
        variables: {
          board_id: MONDAY_BOARD_ID,
          limit,
          cursor,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Erro na requisição: ${response.status} ${response.statusText} - ${text}`
      );
    }

    const data = await response.json();
    const itemsPage = data?.data?.boards?.[0]?.items_page;
    if (!itemsPage) break;

    allItems.push(...(itemsPage.items || []));
    cursor = itemsPage.cursor;
  } while (cursor);
  return allItems;
}

async function saveToPostgres(items) {
  const client = new Client({
    host: PGHOST,
    port: PGPORT ? parseInt(PGPORT, 10) : undefined,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: false,
  });

  try {
    await client.connect();

    // Detectar todos os campos únicos
    const allColumnIds = new Set();
    for (const item of items) {
      for (const col of item.column_values || []) {
        if (col?.id) allColumnIds.add(col.id);
      }
    }

    const columnList = Array.from(allColumnIds);
    const columnDefs = columnList
      .map((id) => `"${id}_text" TEXT, "${id}_value" TEXT`)
      .join(", ");
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT,
        nome TEXT,
        grupo TEXT,
        ${columnDefs}
      );
    `);
    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, nome, grupo, ${columnList
          .flatMap((id) => [`"${id}_text"`, `"${id}_value"`])
          .join(", ")})
      VALUES
        (${[
          "$1",
          "$2",
          "$3",
          ...columnList.flatMap((_, i) => [`$${i * 2 + 4}`, `$${i * 2 + 5}`]),
        ].join(", ")})
    `;

    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c?.id) return;
        col[c.id] = {
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
        ...columnList.flatMap((id) => {
          const c = col[id] || {};
          return [c.text ?? "", c.value ?? ""];
        }),
      ];

      await client.query(insertQuery, row);
    }
  } catch (err) {
    console.error("Erro ao salvar no banco:", err);
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  try {
    const items = await getMondayData();
    if (!items.length) {
      return console.log("Nenhum registro retornado do Monday.");
    }
    await saveToPostgres(items);
  } catch (err) {
    console.error("Erro geral:", err);
    process.exitCode = 1;
  }
}

export default async function () {
  try {
    const items = await getMondayData();
    if (!items.length) {
      return console.log("Nenhum registro retornado do Monday.");
    }
    await saveToPostgres(items);
  } catch (err) {
    console.error("Erro geral:", err);
    process.exitCode = 1;
  }
}
