import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

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

const ACCOUNT_NAME = "metodo12p";
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const dbCfg = {
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
};

async function callRPC(method, params) {
  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
    accountName: ACCOUNT_NAME,
  };
  console.log(`📡 Chamando RPC → ${method}`);
  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    agent: httpsAgent,
  });
  const text = await res.text();
  console.log("📩 Resposta bruta:", text);
  const data = JSON.parse(text);
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function getLeadsWon() {
  console.log("🔍 Buscando leads com status 'Won'...");
  const leads = await callRPC("Lead.find", {
    query: { isDeleted: false, status: "Won" },
    limit: 100,
  });
  console.log(`📊 Leads retornadas: ${leads?.length || 0}`);
  return leads || [];
}

(async () => {
  console.log("▶️ Executando dash_geralcsWon.js...");
  try {
    const leads = await getLeadsWon();
    console.log(`✅ Leads recebidas: ${leads.length}`);
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsWon:", err.message);
  }
  console.log("🏁 dash_geralcsWon concluído.");
})();
