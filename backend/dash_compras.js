// dash_compras.js — versão corrigida e segura
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

const MONDAY_BOARD_ID = "18206014428";
const TABLE_NAME = "dash_compras";

// ====== QUERY BASE DO MONDAY ======
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

// ====== MAPEAMENTO DE COLUNAS ======
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
    if (col.id && col.title) map[col.id] = col.title;
  });
  return map;
}

// ====== BUSCAR TODOS OS ITENS DO MONDAY ======
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

// ====== SALVAR NO POSTGRES ======
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

    // Sanitizar nomes de colunas para evitar erros de espaço/acentos
    const cleanName = (title) =>
      title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .trim();

    const columnTitles = Object.values(columnMap)
      .filter((title) => !!title)
      .map((title) => `"${cleanName(title)}"`);

    if (columnTitles.length === 0)
      throw new Error("Nenhum título de coluna válido encontrado.");

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
        id, name, ${columnTitles.join(",")}, grupo
      ) VALUES (
        ${[
          "$1",
          "$2",
          ...columnTitles.map((_, i) => `$${i + 3}`),
          `$${columnTitles.length + 3}`,
        ].join(",")}
      )
    `;

    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c || !columnMap[c.id]) return;
        const key = cleanName(columnMap[c.id]);
        col[key] = c.text ?? "";
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        ...Object.values(columnMap)
          .filter((title) => !!title)
          .map((title) => col[cleanName(title)] ?? ""),
        item.group?.title ?? "",
      ];

      await client.query(insertQuery, row);
    }
  } catch (err) {
    console.error(`Erro ao salvar ${TABLE_NAME}: ${err.message}`);
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

// ====== EXECUÇÃO PRINCIPAL ======
export default async function dashCompras() {
  const columnMap = await getColumnMap();
  const items = await getMondayData();

  if (!items.length) {
    console.log("Nenhum registro retornado do Monday");
    return [];
  }

  await saveToPostgres(items, columnMap);
  return items;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  dashCompras().catch((e) =>
    console.error("Erro na execução direta:", e.message)
  );
}
