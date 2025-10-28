import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const app = express();
const PORT = 3001;

let dashboardData = {};

app.use(cors());
app.use(express.json());

const TABLES = [
  "dash_apoio",
  "dash_compras",
  "dash_cs",
  "dash_csat",
  "dash_cx",
  "dash_fornecedores",
  "dash_geralcs",
  "dash_handover",
  "dash_icp",
  "dash_logmakers",
  "dash_nps",
  "dash_onboarding",
  "dash_reembolso",
  "dash_delivery",
  "dash_ixdelivery",
  "dash_ixlogcomex",
];

async function fetchTableData(tableName) {
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
    const result = await client.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (err) {
    console.error(`Erro ao buscar dados da tabela ${tableName}:`, err.message);
    return [];
  } finally {
    await client.end().catch(() => {});
  }
}

async function runDashModulesAndLoadData() {
  console.log("Iniciando execução dos módulos");
  const files = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith("dash_") && file.endsWith(".js"));

  for (const file of files) {
    const modulePath = pathToFileURL(path.join(__dirname, file)).href;
    console.log(`Executando módulo: ${file}`);
    try {
      const dashModule = await import(modulePath);
      if (typeof dashModule.default === "function") {
        await dashModule.default();
        console.log(`Módulo ${file} executado com sucesso.`);
      } else {
        console.warn(`Módulo ${file} não exporta uma função default.`);
      }
    } catch (err) {
      console.error(`Erro ao executar ${file}:`, err.message || err);
    }
  }

  console.log("📊 Carregando dados das tabelas");
  const results = {};

  for (const table of TABLES) {
    const data = await fetchTableData(table);
    results[table] = data;
    console.log(`📦 ${table}: ${data.length} registros carregados.`);
  }

  dashboardData = results;
  console.log(`[${new Date().toLocaleString()}] Dados prontos para o frontend`);
}

async function loopDashModules() {
  while (true) {
    await runDashModulesAndLoadData();
  }
}

loopDashModules();

app.get("/api/dashboard", (req, res) => {
  res.json(dashboardData);
});

TABLES.forEach((tableName) => {
  app.get(`/api/${tableName}`, async (req, res) => {
    const data = await fetchTableData(tableName);
    res.json(data);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
