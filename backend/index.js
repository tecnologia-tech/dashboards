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
const PORT = process.env.PORT || 3001;
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

function formatTime(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function hora() {
  return new Date().toLocaleTimeString("pt-BR");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const colors = {
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
};

process.on("uncaughtException", (err) =>
  console.error(colors.red(`💥 Erro não tratado: ${err.message}`))
);
process.on("unhandledRejection", (reason) =>
  console.error(colors.red(`💥 Rejeição não tratada: ${reason}`))
);

async function fetchTableData(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (err) {
    console.error(colors.red(`🚨 Erro ao buscar ${tableName}: ${err.message}`));
    return [];
  } finally {
    client.release();
  }
}

async function runModule(file) {
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;
  const start = Date.now();
  console.log(colors.cyan(`▶️  Iniciando ${file}...`));

  try {
    const dashModule = await import(modulePath + `?v=${Date.now()}`);
    if (typeof dashModule.default === "function") {
      await dashModule.default();
    }
    const dur = formatTime(Date.now() - start);
    console.log(colors.green(`✅ ${file} concluído (${dur})`));
  } catch (err) {
    console.error(colors.red(`🚨 Erro em ${file}: ${err.message}`));
  }
}

async function runSequentialLoop() {
  const dashFiles = fs
    .readdirSync(__dirname)
    .filter(
      (f) =>
        f.startsWith("dash_") && f.endsWith(".js") && f !== "dash_geralcsWon.js"
    )
    .sort((a, b) => a.localeCompare(b));

  let ciclo = 1;

  while (true) {
    const cicloStart = Date.now();
    console.log(colors.yellow(`🧭 Iniciando ciclo #${ciclo}`));

    for (let i = 0; i < dashFiles.length; i += 2) {
      const currentFiles = dashFiles.slice(i, i + 2);
      await runModule("dash_geralcsWon.js");
      await sleep(3000);
      for (const file of currentFiles) {
        console.log(colors.magenta(`▶️  Agora: ${file}`));
        await runModule(file);
        await sleep(3000);
      }
    }

    const cicloEnd = Date.now();
    const cicloDuration = formatTime(cicloEnd - cicloStart);
    console.log(
      colors.green(`✅ Ciclo #${ciclo} concluído em ${cicloDuration}`)
    );

    console.log(
      colors.yellow(`🔁 Ciclo #${ciclo} completo! Reiniciando em 5s...\n`)
    );
    ciclo++;
    await sleep(5000);
  }
}

async function updateDashboardCache() {
  const results = {};
  for (const table of TABLES) {
    results[table] = await fetchTableData(table);
  }
  dashboardData = results;
  console.log(colors.cyan(`📊 Dashboard atualizado às ${hora()}`));
}

app.get("/api/dashboard", (req, res) => res.json(dashboardData));
TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

app.listen(PORT, () =>
  console.log(colors.green(`🌐 Servidor rodando em http://localhost:${PORT}`))
);

(async function main() {
  await updateDashboardCache();
  console.log(colors.cyan("🚀 Iniciando loop principal..."));
  await runSequentialLoop();
})();
