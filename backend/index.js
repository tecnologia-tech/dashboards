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

// 🛡️ Captura erros globais para evitar crash
process.on("uncaughtException", (err) => {
  console.error(
    `\n💥 Erro não tratado (uncaughtException): ${err.message || err}`
  );
  process.stdout.write("\x07");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`\n💥 Rejeição não tratada (unhandledRejection): ${reason}`);
  process.stdout.write("\x07");
});

async function fetchTableData(tableName) {
  const client = new Client({
    host: PGHOST,
    port: PGPORT ? parseInt(PGPORT, 10) : undefined,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: false,
  });

  client.on("error", (err) => {
    console.error(
      `🚨 Erro crítico no cliente PG (${tableName}): ${err.message}`
    );
    process.stdout.write("\x07");
  });

  try {
    await client.connect();
    const result = await client.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (err) {
    console.error(
      `🚨 Erro ao buscar dados da tabela ${tableName}: ${err.message}`
    );
    process.stdout.write("\x07");
    return [];
  } finally {
    try {
      await client.end();
    } catch (err) {
      console.warn(
        `⚠️ Falha ao encerrar conexão PG (${tableName}): ${err.message}`
      );
    }
  }
}

async function runGeralcsWonLoop() {
  const file = "dash_geralcsWon.js";
  const modulePath = pathToFileURL(path.join(__dirname, file)).href;

  while (true) {
    console.log(
      `[${new Date().toLocaleTimeString()}] 🔁 Executando módulo: ${file}`
    );
    try {
      const dashModule = await import(modulePath + `?update=${Date.now()}`);
      if (typeof dashModule.default === "function") {
        await dashModule.default();
        console.count(
          `[${new Date().toLocaleTimeString()}] ✅ Finalizado: ${file}`
        );
      } else {
        console.warn(
          `[${new Date().toLocaleTimeString()}] ⚠️ Módulo ${file} não exporta função default`
        );
      }
    } catch (err) {
      console.error(
        `\n🚨 ERRO no módulo ${file} às ${new Date().toLocaleTimeString()}:\n→ ${
          err.message || err
        }\n`
      );
      process.stdout.write("\x07");
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

async function runOtherDashModulesLoop() {
  const files = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.startsWith("dash_") &&
        file.endsWith(".js") &&
        file !== "dash_geralcsWon.js"
    );

  while (true) {
    for (const file of files) {
      const modulePath = pathToFileURL(path.join(__dirname, file)).href;
      console.log(
        `[${new Date().toLocaleTimeString()}] ▶️ Executando módulo: ${file}`
      );
      try {
        const dashModule = await import(modulePath + `?update=${Date.now()}`);
        if (typeof dashModule.default === "function") {
          await dashModule.default();
          console.count(
            `[${new Date().toLocaleTimeString()}] ✅ Finalizado: ${file}`
          );
        } else {
          console.warn(
            `[${new Date().toLocaleTimeString()}] ⚠️ Módulo ${file} não exporta função default`
          );
        }
      } catch (err) {
        console.error(
          `\n🚨 ERRO no módulo ${file} às ${new Date().toLocaleTimeString()}:\n→ ${
            err.message || err
          }\n`
        );
        process.stdout.write("\x07");
      }
    }

    const results = {};
    for (const table of TABLES) {
      const data = await fetchTableData(table);
      results[table] = data;
    }
    dashboardData = results;
    console.log(`[${new Date().toLocaleTimeString()}] 📊 Dados atualizados`);
  }
}

console.log("🚀 Iniciando loops dos módulos...");
Promise.all([runGeralcsWonLoop(), runOtherDashModulesLoop()]);

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
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
