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

// Função para rodar um módulo
async function runModule(file) {
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;
  const start = Date.now();
  try {
    const mod = await import(modulePath + `?v=${Date.now()}`);
    if (typeof mod.default === "function") {
      await mod.default();
    }
    console.log(`✅ ${file} concluído (${formatTime(Date.now() - start)})`);
  } catch (err) {
    console.error(`❌ Erro em ${file}: ${err.message}`);
  }
}

// Função para rodar o ciclo de módulos
async function runSequentialLoop() {
  let ciclo = 1;

  while (true) {
    const cicloStart = Date.now();
    console.log(`🧭 Iniciando ciclo #${ciclo} às ${hora()}...`);

    // Rodando os módulos conforme a ordem desejada
    const batches = [
      // Primeiro lote
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_apoio.js", "dash_compras.js"],
      // Depois do primeiro ciclo
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_cs.js", "dash_csat.js"],
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_cx.js", "dash_delivery.js"],
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_fornecedores.js", "dash_handover.js"],
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_icp.js", "dash_ixdelivery.js"],
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_ixlogcomex.js", "dash_logmakers.js"],
      ["dash_geralcsOpen.js", "dash_geralcsWon.js"],
      ["dash_nps.js", "dash_onboarding.js"],
      // Adiciona os outros lotes conforme necessário
    ];

    // Executando cada lote sequencialmente
    for (const batch of batches) {
      const batchStart = Date.now();
      await Promise.all(batch.map((file) => runModule(file)));
      console.log(
        `✅ Lote concluído em ${formatTime(Date.now() - batchStart)}`
      );
    }

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
