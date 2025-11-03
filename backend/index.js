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
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: PGHOST,
  port: parseInt(PGPORT || "5432"),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
  max: 5,
});

const colors = {
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
};

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

const TABLES = fs
  .readdirSync(__dirname)
  .filter((f) => f.startsWith("dash_") && f.endsWith(".js"))
  .map((f) => f.replace(".js", ""));

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
  try {
    console.log(colors.cyan(`▶️ Iniciando ${file}...`));
    const mod = await import(modulePath + `?v=${Date.now()}`);
    if (typeof mod.default === "function") {
      await mod.default();
    }
    console.log(
      colors.green(`✅ ${file} concluído (${formatTime(Date.now() - start)})`)
    );
  } catch (err) {
    console.error(colors.red(`❌ Erro em ${file}: ${err.message}`));
  }
}

async function runSequentialLoop() {
  const dashFiles = fs
    .readdirSync(__dirname)
    .filter(
      (f) =>
        f.startsWith("dash_") &&
        f.endsWith(".js") &&
        !["dash_geralcsWon.js", "dash_geralcsOpen.js"].includes(f)
    )
    .sort((a, b) => a.localeCompare(b));

  let ciclo = 1;

  while (true) {
    const cicloStart = Date.now();
    console.log(
      colors.yellow(`\n🧭 Iniciando ciclo #${ciclo} às ${hora()}...\n`)
    );

    const nutshellTasks = [
      runModule("dash_geralcsWon.js"),
      runModule("dash_geralcsOpen.js"),
    ];

    await Promise.allSettled(nutshellTasks);
    for (let i = 0; i < dashFiles.length; i += 4) {
      const currentBatch = dashFiles.slice(i, i + 4);
      console.log(
        colors.magenta(`⚙️  Rodando batch: ${currentBatch.join(", ")}`)
      );

      const tasks = currentBatch.map((f) => runModule(f));
      await Promise.allSettled(tasks);
      await sleep(2000);
    }

    const cicloEnd = Date.now();
    console.log(
      colors.green(
        `\n✅ Ciclo #${ciclo} concluído em ${formatTime(cicloEnd - cicloStart)}`
      )
    );

    console.log(
      colors.cyan(`🔁 Reiniciando ciclo em 1 minuto (${hora()})...\n`)
    );
    ciclo++;
    await sleep(60000);
  }
}

app.get("/api/dashboard", async (req, res) => {
  const data = {};
  for (const t of TABLES) {
    data[t] = await fetchTableData(t);
  }
  res.json(data);
});

TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

app.listen(PORT, () => {
  console.log(colors.green(`🌐 Servidor rodando em http://localhost:${PORT}`));
});

(async function main() {
  console.log(colors.cyan("🚀 Iniciando ciclo paralelo otimizado..."));
  await runSequentialLoop();
})();
