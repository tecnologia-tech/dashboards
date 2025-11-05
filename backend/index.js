import express from "express";
import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import pLimit from "p-limit";

// Obter o caminho do arquivo atual com import.meta.url
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Agora você pode usar o __dirname normalmente
dotenv.config({ path: path.join(__dirname, ".env") });

// Resto do seu código
const app = express();
const limit = pLimit(5); // Definir o limite de execução paralela (5, por exemplo)

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE } =
  process.env;

// Configuração do banco de dados PostgreSQL
const dbCfg = {
  host: PGHOST,
  port: PGPORT || 5432,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
};

// Função para conectar ao PostgreSQL
const connectDb = async () => {
  const client = new Client(dbCfg);
  await client.connect();
  return client;
};

// Função para realizar o insert com verificação de duplicidade
const insertData = async (client, table, data) => {
  try {
    const checkQuery = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await client.query(checkQuery, [data.id]);

    if (result.rows.length > 0) {
      console.log("O dado já existe na tabela, ignorando inserção...");
      return;
    }

    const insertQuery = `INSERT INTO ${table} (id, name, value) VALUES ($1, $2, $3)`;
    await client.query(insertQuery, [data.id, data.name, data.value]);

    console.log("Dados inseridos com sucesso");
  } catch (err) {
    console.error("Erro ao inserir dados:", err);
  }
};

// Função principal que executa os ciclos de dados
const runCycle = async () => {
  try {
    const client = await connectDb();

    // Aqui você pode rodar seus scripts, como dash_apoio.js, dash_compras.js, etc.
    // Por exemplo:

    // Simulação de execução de scripts
    console.log("Executando dash_apoio.js...");
    await limit(() => import("./dash_apoio.js")); // Executa paralelo
    console.log("Executando dash_compras.js...");
    await limit(() => import("./dash_compras.js")); // Executa paralelo

    // Exemplo de insert de dados
    const data = { id: "12345", name: "Produto 1", value: 100 };
    await insertData(client, "dash_compras", data);

    console.log("Ciclo concluído!");
    await client.end();
  } catch (err) {
    console.error("Erro durante o ciclo:", err);
  }
};

// Rota simples para testar o servidor
app.get("/", (req, res) => {
  res.send("Servidor está funcionando!");
});

// Inicia o ciclo ao iniciar o servidor
app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
  runCycle(); // Executa o ciclo de dados quando o servidor é iniciado
});
