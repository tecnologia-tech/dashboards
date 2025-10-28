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

const MONDAY_BOARD_ID = "9194427137";
const TABLE_NAME = "dash_csat";

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
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id TEXT,
        nome TEXT,
        grupo TEXT,
        ordem TEXT,
        lead TEXT,
        pedido TEXT,
        consultor TEXT,
        closer TEXT,
        atendimento TEXT,
        data_inicio TEXT,
        data_limite TEXT,
        status TEXT,
        link_formulario TEXT,
        observacoes TEXT,
        data_resposta TEXT
      );
    `);

    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, nome, grupo, ordem, lead, pedido, consultor, closer, atendimento, data_inicio, data_limite, status, link_formulario, observacoes, data_resposta)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c) return;
        col[c.id] = c.text ?? "";
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        col["color_mkr4cg73"] ?? "",
        col["numeric_mkr49cs2"] ?? "",
        col["numeric_mkrb8jw6"] ?? "",
        col["multiple_person_mkr4twn8"] ?? "",
        col["multiple_person_mkr4m799"] ?? "",
        col["multiple_person_mkr44npa"] ?? "",
        col["date_mkr46a4s"] ?? "",
        col["date_mkr4aetg"] ?? "",
        col["color_mkr4evmz"] ?? "",
        col["text_mkv0jqa1"] ?? "",
        col["long_text_mktz4b4d"] ?? "",
        col["date_mkr4rhvy"] ?? "",
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

export default async function () {
  const items = await getMondayData();
  if (!items.length) {
    console.log("Nenhum registro retornado do Monday");
    return [];
  }
  await saveToPostgres(items);
  return items;
}
