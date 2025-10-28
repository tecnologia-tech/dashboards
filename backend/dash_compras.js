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
        empresa TEXT,
        numero_pedido TEXT,
        prioridade TEXT,
        status_principal TEXT,
        status_secundario TEXT,
        status_terciario TEXT,
        lead TEXT,
        desconto TEXT,
        pessoa TEXT,
        analise TEXT,
        inicio TEXT,
        status_execucao TEXT,
        data_inicio TEXT,
        data_final TEXT,
        fim TEXT,
        solicitante TEXT,
        arquivo1 TEXT,
        arquivo2 TEXT,
        arquivo3 TEXT,
        arquivo4 TEXT,
        arquivo5 TEXT,
        observacoes TEXT,
        formula1 TEXT,
        texto1 TEXT,
        data_extra TEXT,
        formula2 TEXT,
        valor1 TEXT,
        valor2 TEXT,
        valor3 TEXT,
        valor4 TEXT,
        nome_cliente TEXT,
        email_cliente TEXT,
        telefone_cliente TEXT,
        status_extra TEXT,
        arquivo6 TEXT,
        arquivo7 TEXT,
        briefing1 TEXT,
        briefing2 TEXT,
        arquivo_final TEXT,
        grupo TEXT
      );
    `);
    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, empresa, numero_pedido, prioridade, status_principal, status_secundario, status_terciario, lead, desconto, pessoa, analise, inicio, status_execucao, data_inicio, data_final, fim, solicitante, arquivo1, arquivo2, arquivo3, arquivo4, arquivo5, observacoes, formula1, texto1, data_extra, formula2, valor1, valor2, valor3, valor4, nome_cliente, email_cliente, telefone_cliente, status_extra, arquivo6, arquivo7, briefing1, briefing2, arquivo_final, grupo)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41)
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
        col["n_meros__1"] ?? "",
        col["status_1__1"] ?? "",
        col["status"] ?? "",
        col["dup__of_status__1"] ?? "",
        col["status_11__1"] ?? "",
        col["dup__of_lead__1"] ?? "",
        col["color_mkwtm4x2"] ?? "",
        col["dup__of_pessoa__1"] ?? "",
        col["dup__of_dup__of_an_lise__1"] ?? "",
        col["bot_o__1"] ?? "",
        col["status__1"] ?? "",
        col["data"] ?? "",
        col["data_1__1"] ?? "",
        col["dup__of_bot_o__1"] ?? "",
        col["color_mkwt63kn"] ?? "",
        col["file_mkx2nhbb"] ?? "",
        col["file_mkwtf0cs"] ?? "",
        col["file_mkwtrq8r"] ?? "",
        col["file_mkwtxdkw"] ?? "",
        col["file_mkwtq03h"] ?? "",
        col["texto_longo__1"] ?? "",
        col["f_rmula__1"] ?? "",
        col["text_mkpd6rny"] ?? "",
        col["date_mkqxc103"] ?? "",
        col["formula_mkqxa153"] ?? "",
        col["numeric_mkszn0qy"] ?? "",
        col["numeric_mkszzf20"] ?? "",
        col["numeric_mkszhyxs"] ?? "",
        col["numeric_mkx14wkz"] ?? "",
        col["text_mkx1237c"] ?? "",
        col["email_mkp1e8fd"] ?? "",
        col["phone_mkx1b7zq"] ?? "",
        col["color_mkx1z8kr"] ?? "",
        col["file_mkx1v491"] ?? "",
        col["file_mkx15xq9"] ?? "",
        col["long_text_mkx1b8qb"] ?? "",
        col["long_text_mkx1snzf"] ?? "",
        col["filehnviqj10"] ?? "",
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

export default async function () {
  const items = await getMondayData();
  if (!items.length) {
    console.log("Nenhum registro retornado do Monday");
    return [];
  }
  await saveToPostgres(items);
  return items;
}
