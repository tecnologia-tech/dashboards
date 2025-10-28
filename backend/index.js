import express from "express";
import cron from "node-cron";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath, pathToFileURL } from "url";

// Setup para __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Armazenamento em memória
let dashboardData = {};

app.use(cors());
app.use(express.json());

// Função que executa todos os arquivos dash_*.js
async function runDashModules() {
  const files = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith("dash_") && file.endsWith(".js"));

  const results = {};

  for (const file of files) {
    const modulePath = pathToFileURL(path.join(__dirname, file)).href;
    try {
      const dashModule = await import(modulePath);
      if (typeof dashModule.default === "function") {
        const data = await dashModule.default();
        const key = file.replace(".js", "");
        results[key] = data;
      } else {
        console.warn(`⚠️ Módulo ${file} não exporta uma função default.`);
      }
    } catch (err) {
      console.error(`❌ Erro ao executar ${file}:`, err);
    }
  }

  dashboardData = results;
  console.log(`[${new Date().toLocaleString()}] ✅ Dados atualizados.`);
}

// Agendamento: a cada 15 minutos
cron.schedule("*/15 * * * *", runDashModules);

// Executa ao iniciar
runDashModules();

// Endpoint para o frontend acessar os dados
app.get("/api/dashboard", (req, res) => {
  res.json(dashboardData);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
