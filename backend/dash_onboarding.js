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
      throw new Error(`Erro na requisição: ${response.status} ${text}`);
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

  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id TEXT,
      empresa TEXT,
      onboard TEXT,
      compras TEXT,
      cs TEXT,
      id_timelines TEXT,
      email TEXT,
      data_start TEXT,
      data_final TEXT,
      cliente TEXT,
      status_operacional TEXT,
      situacao TEXT,
      preenchimento_form TEXT,
      prazo_definir_account TEXT,
      account_assigned TEXT,
      prazo_onboard TEXT,
      onboard_realizado TEXT,
      prazo_planilha_recebida TEXT,
      planilha_recebida TEXT,
      prazo_compras TEXT,
      compras_finalizado TEXT,
      prazo_simulacao TEXT,
      simulacao_finalizada TEXT,
      prazo_total TEXT,
      data_congelamento TEXT,
      data_fechamento TEXT,
      data_cancelamento TEXT,
      data_vencido TEXT,
      produto TEXT,
      planilha_revisada TEXT,
      planilha_recusada TEXT
    );
  `);

  // Limpa a tabela antes de inserir
  await client.query(`DELETE FROM ${TABLE_NAME}`);

  const insertQuery = `
    INSERT INTO ${TABLE_NAME}
      (id, empresa, onboard, compras, cs, id_timelines, email, data_start, data_final, cliente,
       status_operacional, situacao, preenchimento_form, prazo_definir_account, account_assigned,
       prazo_onboard, onboard_realizado, prazo_planilha_recebida, planilha_recebida, prazo_compras,
       compras_finalizado, prazo_simulacao, simulacao_finalizada, prazo_total, data_congelamento,
       data_fechamento, data_cancelamento, data_vencido, produto, planilha_revisada, planilha_recusada)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
       $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
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
      col["pessoas_mkn13656"] ?? "",
      col["pessoas_mkn48dfh"] ?? "",
      col["dup__of_compras_mkn45f0y"] ?? "",
      col["texto_mkm7brnt"] ?? "",
      col["e_mail_mkmwk6rb"] ?? "",
      col["data_1__1"] ?? "",
      col["dup__of_data___start__1"] ?? "",
      col["status9__1"] ?? "",
      col["status__1"] ?? "",
      col["dup__of_cliente_mkm2vdvt"] ?? "",
      col["status_mkmxz8vy"] ?? "",
      col["data_mkm22hwz"] ?? "",
      col["data_mkky59nx"] ?? "",
      col["data_mkm252cs"] ?? "",
      col["data_mkkyg4nb"] ?? "",
      col["data_mkm6bqwn"] ?? "",
      col["data_mkkyj07y"] ?? "",
      col["data_mkm6797"] ?? "",
      col["date_mkky1vqk"] ?? "",
      col["data_mkm6q0df"] ?? "",
      col["date_mkky3sd"] ?? "",
      col["date_mkncmqh"] ?? "",
      col["data_mkkytr4r"] ?? "",
      col["data_mkkyvnfa"] ?? "",
      col["data_mkkyryxk"] ?? "",
      col["date_mkn5djnz"] ?? "",
      col["text_mkp0f3q7"] ?? "",
      col["date_mkp7fye2"] ?? "",
      col["numeric_mkp1a6s1"] ?? "",
    ];

    await client.query(insertQuery, row);
  }

  await client.end();
}

async function main() {
  try {
    const items = await getMondayData();
    if (!items.length) {
      console.log("Nenhum item retornado");
      return;
    }
    await saveToPostgres(items);
  } catch (err) {
    console.error("Erro:", err);
    process.exitCode = 1;
  }
}

main();
