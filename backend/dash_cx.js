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
const MONDAY_BOARD_ID = "9870908872";
const TABLE_NAME = "dash_cx";

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
  console.dir(allItems.slice(0, 3), { depth: null });

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
        consultor TEXT,
        closer TEXT,
        pedido TEXT,
        data_inicio TEXT,
        data_limite TEXT,
        status TEXT,
        link_formulario TEXT,
        descricao TEXT,
        comparativo TEXT,
        clareza TEXT,
        sugestao TEXT,
        nenhum TEXT,
        data_resposta TEXT
      );
    `);
    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, nome, grupo, ordem, lead, consultor, closer, pedido, data_inicio, data_limite, status, link_formulario, descricao, comparativo, clareza, sugestao, nenhum, data_resposta)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
        col["status"] ?? "",
        col["numeric_mkv1bhck"] ?? "",
        col["text_mkv1pg5k"] ?? "",
        col["text_mkv1jv9q"] ?? "",
        col["numeric_mkv1qwr8"] ?? "",
        col["date_mkv1natd"] ?? "",
        col["date_mkv19wx4"] ?? "",
        col["color_mkv1dg1c"] ?? "",
        col["text_mkv1dzcp"] ?? "",
        col["long_text_mkv11ytt"] ?? "",
        col["color_mkv1t6ya"] ?? "",
        col["long_text_mkv18af0"] ?? "",
        col["long_text_mkv118b"] ?? "",
        col["long_text_mkv16vs4"] ?? "",
        col["date_mkv18tn8"] ?? "",
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
      return console.log("Nenhum registro retornado do Monday");
    }
    await saveToPostgres(items);
  } catch (err) {
    console.error("Erro geral:", err);
    process.exitCode = 1;
  }
}

main();
