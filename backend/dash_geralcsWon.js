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

async function callRPC(method, params = {}) {
  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
      accountName: ACCOUNT_NAME,
    }),
    agent: httpsAgent,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function getStatusIdByName(name) {
  const statuses = await callRPC("getLeadStatuses");
  const found = statuses.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );
  if (!found) throw new Error(`Status "${name}" não encontrado no Nutshell`);
  return found.id;
}

async function getLeads(statusName) {
  const statusId = await getStatusIdByName(statusName);
  const leads = [];
  let page = 1,
    limit = 100,
    fetched;
  do {
    const res = await callRPC("findLeads", {
      query: { status: statusId },
      page,
      limit,
    });
    fetched = res.length;
    leads.push(...res);
    page++;
  } while (fetched === limit);
  return leads;
}

async function saveToDatabase(leads) {
  const client = new Client(dbCfg);
  await client.connect();
  for (const lead of leads) {
    await client.query(
      `INSERT INTO dash_geralcswon (lead_id, name, date_closed, value, status)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (lead_id) DO UPDATE
       SET name=EXCLUDED.name,date_closed=EXCLUDED.date_closed,value=EXCLUDED.value,status=EXCLUDED.status`,
      [
        lead.id,
        lead.name,
        lead.dateClosed ? new Date(lead.dateClosed) : null,
        lead.value?.amount || 0,
        "Won",
      ]
    );
  }
  await client.end();
}

(async () => {
  console.log("▶️ Executando dash_geralcsWon.js...");
  try {
    const leads = await getLeads("Won");
    console.log(`🔍 ${leads.length} leads “Won” encontradas.`);
    if (leads.length > 0) await saveToDatabase(leads);
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsWon:", err.message);
  }
  console.log("🏁 dash_geralcsWon concluído.");
})();
