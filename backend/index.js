import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import { fileURLToPath, pathToFileURL } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE } =
  process.env;

const app = express();
const PORT = 3001;
const INTERVAL_MIN = 15; // minutos entre ciclos
let dashboardData = {};

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: PGHOST,
  port: parseInt(PGPORT || "5432"),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
});

const TABLES = [
  "dash_apoio",
  "dash_compras",
  "dash_cs",
  "dash_csat",
  "dash_cx",
  "dash_delivery",
  "dash_fornecedores",
  "dash_geralcsOpen",
  "dash_geralcsWon",
  "dash_handover",
  "dash_icp",
  "dash_ixdelivery",
  "dash_ixlogcomex",
  "dash_logmakers",
  "dash_nps",
  "dash_onboarding",
  "dash_reembolso",
];

process.on("uncaughtException", (err) =>
  console.error(`💥 Erro não tratado: ${err.message}`)
);
process.on("unhandledRejection", (reason) =>
  console.error(`💥 Rejeição não tratada: ${reason}`)
);

async function fetchTableData(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (err) {
    console.error(`🚨 Erro ao buscar ${tableName}: ${err.message}`);
    return [];
  } finally {
    client.release();
  }
}

async function runGeralcsWonLoop() {
  const file = "dash_geralcsWon.js";
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;

  while (true) {
    const start = Date.now();
    console.log(
      `🔁 Executando ${file} às ${new Date().toLocaleTimeString()}...`
    );
    try {
      const dashModule = await import(modulePath + `?v=${Date.now()}`);
      if (typeof dashModule.default === "function") {
        await dashModule.default();
        const dur = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`✅ ${file} concluído em ${dur}s`);
      }
    } catch (err) {
      console.error(`🚨 Erro em ${file}: ${err.message}`);
    }
    console.log(
      `🕒 Aguardando ${INTERVAL_MIN} minutos para próxima execução...`
    );
    await new Promise((r) => setTimeout(r, INTERVAL_MIN * 60 * 1000));
  }
}

async function runOtherDashModulesLoop() {
  const files = fs
    .readdirSync(__dirname)
    .filter(
      (f) =>
        f.startsWith("dash_") && f.endsWith(".js") && f !== "dash_geralcsWon.js"
    );

  while (true) {
    for (const file of files) {
      const modulePath = pathToFileURL(path.join(__dirname, file)).href;
      const start = Date.now();
      console.log(`▶️ Iniciando ${file}...`);
      try {
        const dashModule = await import(modulePath + `?v=${Date.now()}`);
        if (typeof dashModule.default === "function") {
          await dashModule.default();
          const dur = ((Date.now() - start) / 1000).toFixed(1);
          console.log(`✅ ${file} finalizado (${dur}s)`);
        }
      } catch (err) {
        console.error(`🚨 Erro no ${file}: ${err.message}`);
      }
    }

    const results = {};
    for (const table of TABLES) results[table] = await fetchTableData(table);
    dashboardData = results;
    console.log(`📊 Dashboard atualizado (${new Date().toLocaleTimeString()})`);

    console.log(`🕒 Aguardando ${INTERVAL_MIN} minutos para próximo ciclo...`);
    await new Promise((r) => setTimeout(r, INTERVAL_MIN * 60 * 1000));
  }
}

console.log("🚀 Iniciando loops de atualização...");
Promise.all([runGeralcsWonLoop(), runOtherDashModulesLoop()]);

app.get("/api/dashboard", (req, res) => res.json(dashboardData));
TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

app.listen(PORT, () =>
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`)
);
