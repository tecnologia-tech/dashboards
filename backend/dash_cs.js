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
const MONDAY_BOARD_ID = "8456132756";
const TABLE_NAME = "dash_cs";

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
  console.log("Pegando dados do Monday");
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

  console.log(`Total itens coletados: ${allItems.length}`);
  return allItems;
}

async function saveToPostgres(items) {
  console.log("Conectando ao banco");
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

    console.log("Limpando tabela antes de inserir");
    await client.query(`DELETE FROM ${TABLE_NAME}`);

    const insertQuery = `
      INSERT INTO ${TABLE_NAME}
        (id, empresa, cs, ultimo_followup, status_followup, data_start, data_final, onboard, compras,
         status_cs, recorrencia, preenchimento_form, email, id_timelines, qtde_visitas, ultima_visita,
         apresentacao_simulacao, arquivo_simulacao, valor_gerenciamento, motivos_lost, data_lost, fechamento, grupo)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
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
        col["data_mkn32mpk"] ?? "",
        col["status_mkn4y5d6"] ?? "",
        col["data_1__1"] ?? "",
        col["dup__of_data___start__1"] ?? "",
        col["dup__of_onboard_mkn255bv"] ?? "",
        col["dup__of_onboard_mkn2zjxs"] ?? "",
        col["status_mkn2b390"] ?? "",
        col["status_mkn2jtj"] ?? "",
        col["status_mkmxz8vy"] ?? "",
        col["e_mail_mkmwk6rb"] ?? "",
        col["texto_mkm7brnt"] ?? "",
        col["n_meros_mkn2nnp9"] ?? "",
        col["data_mkn2jh3s"] ?? "",
        col["dup__of__ltima_visita_mkn2hscj"] ?? "",
        col["arquivos_mkn2cbyw"] ?? "",
        col["n_meros_mkn23bb9"] ?? "",
        col["status_mkn3kd76"] ?? "",
        col["date_mkqy4c0e"] ?? "",
        col["date_mkn2vpev"] ?? "",
        item.group?.title ?? "",
      ];

      await client.query(insertQuery, row);
    }

    console.log(
      `INSERIDOS: ${items.length} | Data: ${new Date().toLocaleString("pt-BR")}`
    );
  } catch (err) {
    console.error("Erro ao salvar no banco:", err);
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  try {
    console.log("Rodando main()");
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

export { main };