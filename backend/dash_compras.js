import { Pool } from "pg";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

// Defina seu BOARD_ID e o nome da tabela aqui
const MONDAY_BOARD_ID = "18206014428"; // ID do seu board no Monday.com
const TABLE_NAME = "dash_compras"; // Nome da tabela no banco de dados

// Configuração do Pool de Conexões do PostgreSQL
const pool = new Pool({
  host: PGHOST,
  port: parseInt(PGPORT || "5432"),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
});

// Função para pegar os nomes das colunas através da API do Monday.com
async function getBoardColumns(boardId) {
  const query = `
    query {
      boards(ids: [${boardId}]) {
        columns {
          id
          title
        }
      }
    }
  `;

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MONDAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return data.data.boards[0].columns; // Retorna as colunas do board
}

// Função para criar a tabela no PostgreSQL dinamicamente
async function createTable(boardId) {
  const columns = await getBoardColumns(boardId);

  // Gerando as colunas com tipo de dado text por padrão
  let columnDefs = columns
    .map((col) => {
      const safeColumnName = col.title.replace(/\s+/g, "_").toLowerCase(); // Normaliza os nomes
      return `"${safeColumnName}" TEXT`; // Assume que todas as colunas são do tipo texto
    })
    .join(", ");

  // Criação da query SQL para a tabela
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id SERIAL PRIMARY KEY,
      ${columnDefs}
    );
  `;

  try {
    // Criando a tabela no PostgreSQL
    await pool.query(createTableQuery);
    console.log(`Tabela '${TABLE_NAME}' criada com sucesso!`);
  } catch (error) {
    console.error("Erro ao criar a tabela:", error);
  }
}

// Função para salvar os dados recuperados do board na tabela
async function saveToPostgres(boardId, items, columnMap) {
  const insertQuery = `
    INSERT INTO ${TABLE_NAME} ("id", "name", "grupo", ${Object.values(columnMap)
    .map((c) => `"${c}"`)
    .join(", ")})
    VALUES (${[
      "$1",
      "$2",
      "$3",
      ...Object.values(columnMap).map((_, i) => `$${i + 4}`),
    ].join(", ")})
    ON CONFLICT ("id") DO UPDATE SET
    ${Object.values(columnMap)
      .map((c) => `"${c}" = EXCLUDED."${c}"`)
      .concat(['"grupo" = EXCLUDED."grupo"'])
      .join(", ")};
  `;

  try {
    // Inserindo os dados recuperados do Monday.com
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
              ? JSON.stringify(c.value)
              : c.value ?? "",
        };
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        ...Object.values(columnMap).map((t) => col[t] ?? ""),
      ];

      await pool.query(insertQuery, row);
      inserted++;
    }
    console.log(`✅ ${inserted} registros atualizados em ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Erro ao salvar dados em ${TABLE_NAME}:`, err.message);
  }
}

// Função principal para orquestrar a criação da tabela e inserção dos dados
async function processBoardData(boardId) {
  const columns = await getBoardColumns(boardId);

  // Mapeando as colunas para um formato amigável para PostgreSQL
  const columnMap = columns.reduce((map, col) => {
    map[col.id] = col.title.replace(/\s+/g, "_").toLowerCase();
    return map;
  }, {});

  // Criando a tabela no banco de dados
  await createTable(boardId);

  // Recuperando os dados do board
  const query = `
    query {
      boards(ids: [${boardId}]) {
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
  `;

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MONDAY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  const items = data.data.boards[0].items;

  console.log(`Total de itens recuperados: ${items.length}`);
  console.log("Dados a serem salvos:", items);

  // Salvando os dados no banco de dados
  await saveToPostgres(boardId, items, columnMap);
}

// Chame a função passando o ID do board do Monday.com
processBoardData(MONDAY_BOARD_ID); // Usando MONDAY_BOARD_ID que você já definiu
