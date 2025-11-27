import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import pkg from "pg";
import { fileURLToPath, pathToFileURL } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE } =
  process.env;

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(
  cors({
    origin: [
      "https://dashboards-five-sigma.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// POSTGRES CONNECTION
const pool = new Pool({
  host: PGHOST,
  port: parseInt(PGPORT || "5432"),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
  max: 5,
});

// UTILS
function formatTime(ms) {
  const s = (ms / 1000).toFixed(1);
  const min = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function hora() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// DYNAMIC MODULE RUNNER
async function runModule(file) {
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;
  const start = Date.now();
  const startHora = hora();

  console.log(`🟡 [${startHora}] Iniciando ${file}...`);

  try {
    const mod = await import(modulePath + `?v=${Date.now()}`);
    if (typeof mod.default === "function") {
      await mod.default();
    } else {
      console.log(`❌ [${hora()}] ${file} não possui função default.`);
    }

    const end = Date.now();
    const endHora = hora();
    console.log(
      `✅ [${endHora}] ${file} concluído em ${formatTime(end - start)}\n`
    );
  } catch (err) {
    console.error(`❌ [${hora()}] Erro em ${file}: ${err.message}\n`);
  }
}

// SEQUENTIAL LOOP
async function runSequentialLoop() {
  let ciclo = 1;

  const batches = [
    ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
    ["dash_apoio.js", "dash_compras.js", "dash_cs.js", "dash_csat.js"],
    ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
    [
      "dash_cx.js",
      "dash_delivery.js",
      "dash_fornecedores.js",
      "dash_handover.js",
    ],
    ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
    [
      "dash_icp.js",
      "dash_ixdelivery.js",
      "dash_ixlogcomex.js",
      "dash_logmakers.js",
    ],
    ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
    [
      "dash_nps.js",
      "dash_onboarding.js",
      "dash_reembolso.js",
      "estornos_nutshell.js", // <-- NOVO MÓDULO AQUI
    ],
  ];

  while (true) {
    const cicloStart = Date.now();
    console.log(`🧭 [${hora()}] Iniciando ciclo #${ciclo}...`);

    for (const batch of batches) {
      const batchStart = Date.now();
      console.log(`📂 [${hora()}] Iniciando lote: ${batch.join(", ")}`);

      await Promise.all(batch.map((file) => runModule(file)));

      console.log(
        `✅ [${hora()}] Lote ${batch.join(", ")} concluído em ${formatTime(
          Date.now() - batchStart
        )}\n`
      );
    }

    const cicloEnd = Date.now();
    console.log(
      `🏁 [${hora()}] Ciclo #${ciclo} concluído em ${formatTime(
        cicloEnd - cicloStart
      )}\n`
    );

    ciclo++;
  }
}

// TABLES AUTO DISCOVERY + MANUAL ADD
const TABLES = [
  ...fs
    .readdirSync(__dirname)
    .filter((f) => f.startsWith("dash_") && f.endsWith(".js"))
    .map((f) => f.replace(".js", "")),

  "estornos_nutshell", // <-- ADICIONADO AQUI
];

// FETCH DB DATA
async function fetchTableData(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    console.log(`✅ [${hora()}] Dados da tabela ${tableName} obtidos.`);
    return result.rows;
  } catch (err) {
    console.error(`🚨 [${hora()}] Erro ao buscar ${tableName}: ${err.message}`);
    return [];
  } finally {
    client.release();
  }
}

// ROUTES
app.get("/api/dashboard", async (req, res) => {
  const data = {};
  for (const t of TABLES) data[t] = await fetchTableData(t);
  res.json(data);
});

TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

// START SERVER
app.listen(PORT, () => {
  console.log(`🌐 [${hora()}] Servidor rodando em http://localhost:${PORT}`);
});

// AUTO START LOOP
(async function main() {
  console.log(`🚀 [${hora()}] Iniciando ciclo paralelo otimizado...`);
  await runSequentialLoop();
})();
