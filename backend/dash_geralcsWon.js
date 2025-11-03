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

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getWonLeads() {
  const url = `${NUTSHELL_API_URL}/leads?status=Won`;
  console.log("📡 Requisição →", url);

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    agent: httpsAgent,
  });

  const text = await res.text();
  console.log("📥 Resposta bruta:", text);
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}: ${text}`);

  const data = JSON.parse(text);
  return Array.isArray(data) ? data : data.leads || [];
}

async function saveToDatabase(leads) {
  const client = new Client(dbCfg);
  await client.connect();

  for (const lead of leads) {
    await client.query(
      `INSERT INTO dash_geralcswon (lead_id, name, date_closed, value, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_id) DO UPDATE
       SET name = EXCLUDED.name,
           date_closed = EXCLUDED.date_closed,
           value = EXCLUDED.value,
           status = EXCLUDED.status`,
      [
        lead.id,
        lead.name,
        lead.dateClosed ? new Date(lead.dateClosed) : null,
        lead.value ? lead.value.amount : 0,
        "Won",
      ]
    );
  }

  await client.end();
}

(async () => {
  console.log("▶️ Executando dash_geralcsWon.js...");
  try {
    const leads = await getWonLeads();
    console.log(`📊 ${leads.length} leads “Won” encontradas.`);
    if (leads.length > 0) {
      await saveToDatabase(leads);
      console.log(`💾 ${leads.length} registros salvos em dash_geralcswon.`);
    }
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsWon:", err.message);
  }
  console.log("🏁 dash_geralcsWon concluído.");
})();
