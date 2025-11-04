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
dotenv.config({ path: path.join(__dirname, ".env") });

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
  max: 5, // Limita o número de conexões simultâneas
});

// Função para formatação do tempo
function formatTime(ms) {
  const s = (ms / 1000).toFixed(1);
  const min = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

// Função para pegar o horário atual no Brasil
function hora() {
  return new Date().toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

// Função para criar pausa
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Função para obter os arquivos das tabelas
const TABLES = fs
  .readdirSync(__dirname)
  .filter((f) => f.startsWith("dash_") && f.endsWith(".js"))
  .map((f) => f.replace(".js", ""));

// Função para buscar dados de uma tabela
async function fetchTableData(tableName) {
  const client = await pool.connect();
  try {
    console.log(`🔄 Buscando dados da tabela ${tableName}...`);
    const result = await client.query(`SELECT * FROM ${tableName}`);
    console.log(`✅ Dados da tabela ${tableName} obtidos com sucesso.`);
    return result.rows;
  } catch (err) {
    console.error(`🚨 Erro ao buscar ${tableName}: ${err.message}`);
    return [];
  } finally {
    client.release();
  }
}

// Função para rodar um módulo
async function runModule(file) {
  console.log(`▶️ Iniciando execução do módulo: ${file}...`); // Log de execução do módulo
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;
  const start = Date.now();
  try {
    console.log(`🔄 Importando módulo: ${file}`);
    const mod = await import(modulePath + `?v=${Date.now()}`);
    if (typeof mod.default === "function") {
      console.log(`🔄 Executando o módulo: ${file}`);
      await mod.default();
    }
    console.log(`✅ ${file} concluído (${formatTime(Date.now() - start)})`);
  } catch (err) {
    console.error(`❌ Erro em ${file}: ${err.message}`);
  }
}

// Função para rodar um loop sequencial
async function runSequentialLoop() {
  const dashFiles = fs
    .readdirSync(__dirname)
    .filter((f) => f.startsWith("dash_") && f.endsWith(".js"))
    .sort((a, b) => a.localeCompare(b));

  const nutshellFiles = ["dash_geralcsWon.js", "dash_geralcsOpen.js"];

  let ciclo = 1;

  while (true) {
    const cicloStart = Date.now();
    console.log(`🧭 Iniciando ciclo #${ciclo} às ${hora()}...`);

    // Rodando 2 arquivos dash_*.js seguidos de 2 módulos do Nutshell
    const dashBatch = [runModule(dashFiles[0]), runModule(dashFiles[1])];

    const nutshellBatch = [
      runModule(nutshellFiles[0]),
      runModule(nutshellFiles[1]),
    ];

    // Executando os dois batches
    await Promise.all([...dashBatch, ...nutshellBatch]);

    const cicloEnd = Date.now();
    console.log(
      `✅ Ciclo #${ciclo} concluído em ${formatTime(cicloEnd - cicloStart)}`
    );

    console.log(`🔁 Reiniciando ciclo em 1 minuto (${hora()})...`);
    ciclo++;
    await sleep(60000); // Espera 1 minuto antes de reiniciar o ciclo
  }
}

// Rota para coletar os dados de todas as tabelas
app.get("/api/dashboard", async (req, res) => {
  const data = {};
  for (const t of TABLES) {
    data[t] = await fetchTableData(t);
  }
  res.json(data);
});

// Rota dinâmica para as tabelas
TABLES.forEach((t) =>
  app.get(`/api/${t}`, async (req, res) => res.json(await fetchTableData(t)))
);

app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});

(async function main() {
  console.log("🚀 Iniciando ciclo paralelo otimizado...");
  await runSequentialLoop(); // Garantindo que o ciclo seja executado infinitamente
})();
