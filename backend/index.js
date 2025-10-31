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

// Utilitário para formatação de hora e duração
function formatTime(ms) {
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}
function hora() {
  return new Date().toLocaleTimeString("pt-BR");
}

// Cores para console
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

async function runGeralcsWonLoop() {
  const file = "dash_geralcsWon.js";
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;

  while (true) {
    const startTime = Date.now();
    console.log(colors.cyan(`▶️  ${file} iniciado`));

    try {
      const dashModule = await import(modulePath + `?v=${Date.now()}`);
      if (typeof dashModule.default === "function") {
        await dashModule.default();
      }
      const dur = formatTime(Date.now() - startTime);
      console.log(colors.green(`✅ ${file} concluído (tempo: ${dur})`));
    } catch (err) {
      console.error(colors.red(`🚨 Erro em ${file}: ${err.message}`));
    }

    console.log(
      colors.yellow(`🕒 Próxima execução em ${INTERVAL_MIN} minutos...\n`)
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
      const startTime = Date.now();
      console.log(colors.magenta(`▶️  Iniciando ${file} `));

      try {
        const dashModule = await import(modulePath + `?v=${Date.now()}`);
        if (typeof dashModule.default === "function") {
          await dashModule.default();
        }
        const dur = formatTime(Date.now() - startTime);
        console.log(colors.green(`✅ ${file} finalizado (tempo: ${dur})`));
      } catch (err) {
        console.error(colors.red(`🚨 Erro no ${file}: ${err.message}`));
      }
    }

    const results = {};
    for (const table of TABLES) results[table] = await fetchTableData(table);
    dashboardData = results;

    console.log(colors.cyan(`📊 Dashboard atualizado`));
    console.log(
      colors.yellow(
        `🕒 Aguardando ${INTERVAL_MIN} minutos para o próximo ciclo...\n`
      )
    );

    await new Promise((r) => setTimeout(r, INTERVAL_MIN * 60 * 1000));
  }
}

console.log(colors.cyan("🚀 Iniciando loops de atualização...\n"));
Promise.all([runGeralcsWonLoop(), runOtherDashModulesLoop()]);

app.get("/api/dashboard", (req, res) => res.json(dashboardData));
TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

app.listen(PORT, () =>
  console.log(colors.green(`🌐 Servidor rodando em http://localhost:${PORT}`))
);
