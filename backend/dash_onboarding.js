// dash_onboarding.js

import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

// Initialize environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const {
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGSSLMODE,
  NUTSHELL_USERNAME,
  NUTSHELL_API_TOKEN,
  NUTSHELL_API_URL,
} = process.env;

// Authentication header for the Nutshell API
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

const dbCfg = {
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
};

const httpsAgent = new https.Agent({ keepAlive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Function to make a call to the Nutshell API via RPC
async function callRPC(method, params = {}) {
  console.log(`📡 Enviando para: ${NUTSHELL_API_URL}`);
  console.log(
    `📦 Corpo: ${JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: Date.now(),
    })}`
  );

  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    agent: httpsAgent,
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: Date.now() }),
  });

  const json = await res.json().catch(() => null);
  if (!json || json.error) {
    throw new Error(
      `Erro RPC: ${JSON.stringify(json?.error || res.statusText)}`
    );
  }

  return json.result;
}

// Main logic for fetching Onboarding data and inserting them into PostgreSQL
async function run() {
  const client = new Client(dbCfg);
  await client.connect();

  console.log("🔄 Buscando dados Onboarding...");

  const ids = await callRPC("findOnboarding", {
    query: { status: 10 }, // 'Completed' onboarding responses
    limit: 100,
  });
  console.log(`📦 ${ids.length} Onboarding encontrados`);

  const tasks = ids.map(async (id) => {
    try {
      console.log(`🔍 Buscando detalhes do Onboarding ${id}`);
      const onboardingDetails = await callRPC("getOnboarding", {
        onboardingId: id,
      });
      console.log(
        `📝 Onboarding encontrado: ${JSON.stringify(onboardingDetails)}`
      );

      // Insert Onboarding data into PostgreSQL
      const query =
        "INSERT INTO onboarding (id, status, user_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5)";
      await client.query(query, [
        onboardingDetails.id,
        onboardingDetails.status,
        onboardingDetails.user_id,
        onboardingDetails.start_date,
        onboardingDetails.end_date,
      ]);

      console.log(`✅ Onboarding ${id} inserido com sucesso`);
    } catch (error) {
      console.error(`⚠️ Falha ao processar Onboarding ${id}: ${error.message}`);
    }
  });

  await Promise.all(tasks);
  console.log("✅ Todos os Onboarding foram processados");

  await client.end();
  console.log("✅ Conexão com banco de dados fechada");
}

// Start the process
run().catch((error) => {
  console.error("❌ Erro inesperado:", error);
});
