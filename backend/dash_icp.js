import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";
const { Client } = pkg;
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const MONDAY_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ1MzI2NTQzMywiYWFpIjoxMSwidWlkIjo3MDIwMTg1NiwiaWFkIjoiMjAyNS0wMS0wM1QxMjoyNzozOS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjcyMTM5MDgsInJnbiI6InVzZTEifQ.zX-Y65W_e9VfgHphK0EO7glGp1wyEMCqK9YKJQbDIJc";
const MONDAY_BOARD_ID = "8149184194";
const TABLE_NAME = "dash_icp";

const MONDAY_QUERY = `
  query ($board_id: ID!, $limit: Int!, $cursor: String) {
    boards(ids: [$board_id]) {
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
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
      throw new Error(`Erro na API do Monday: ${response.status} - ${text}`);
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
        id TEXT PRIMARY KEY,
        empresa TEXT,
        closer TEXT,
        contrato_assinado TEXT,
        cnpj TEXT,
        nome_cliente TEXT,
        whatsapp TEXT,
        email TEXT,
        uf TEXT,
        sexo TEXT,
        status_pedido TEXT
      )
    `);
    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, empresa, closer, contrato_assinado, cnpj, nome_cliente, whatsapp, email, uf, sexo, status_pedido)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        col["sele__o_individual__1"] ?? "",
        col["status6__1"] ?? "",
        col["n_meros__1"] ?? "",
        col["texto__1"] ?? "",
        col["dup__of_telefone_mkmtzxma"] ?? "",
        col["e_mail__1"] ?? "",
        col["color_mknyw7jr"] ?? "",
        col["status_mkmtvg94"] ?? "",
        col["color_mkr397r0"] ?? "",
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
      return console.log("Nenhum dado retornado.");
    }
    await saveToPostgres(items);
  } catch (err) {
    process.exitCode = 1;
  }
}

main();
