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

const MONDAY_BOARD_ID = "8182800749";
const TABLE_NAME = "dash_reembolso";

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
  columns.forEach((col) => {
    if (col.id && col.title) {
      map[col.id] = col.title;
    }
  });

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
        `Erro na requisição ao Monday: ${response.status} ${response.statusText} - ${text}`
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

async function saveToPostgres(items, columnMap) {
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

    const uniqueTitles = [
      ...new Set(
        Object.values(columnMap).filter(
          (title) => !!title && /^[a-zA-Z0-9_À-ÿ\s]+$/.test(title)
        )
      ),
    ];

    const columnTitles = uniqueTitles.map((title) => `"${title}"`);

    if (columnTitles.length === 0) {
      throw new Error("Nenhum título de coluna válido foi encontrado.");
    }

    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT,
        name TEXT,
        ${columnTitles.map((title) => `${title} TEXT`).join(", ")},
        grupo TEXT
      );
    `;
    await client.query(createQuery);

    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (
        id, name, ${columnTitles.join(", ")}, grupo
      ) VALUES (
        ${[
          "$1",
          "$2",
          ...columnTitles.map((_, i) => `$${i + 3}`),
          `$${columnTitles.length + 3}`,
        ].join(", ")}
      )
    `;

    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c || !columnMap[c.id]) return;
        col[columnMap[c.id]] = c.text ?? "";
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        ...uniqueTitles.map((title) => col[title] ?? ""),
        item.group?.title ?? "",
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

export default async function dashReembolso() {
  try {
    const columnMap = await getColumnMap();
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum registro retornado do Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap);
    return items;
  } catch (err) {
    console.error("Erro geral:", err);
    return [];
  }
}
