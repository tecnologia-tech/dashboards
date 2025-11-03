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

const dbCfg = {
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function callRPC(method, params) {
  const body = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
    accountName: ACCOUNT_NAME,
  };

  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    agent: httpsAgent,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`Erro RPC: ${JSON.stringify(data.error)}`);
  return data.result;
}

async function getLeadsOpen() {
  const allLeads = [];
  let page = 1;
  const limit = 100;
  let fetched;

  do {
    const leads = await callRPC("findLeads", {
      query: { status: 0 },
      page,
      limit,
    });
    fetched = leads.length;
    allLeads.push(...leads);
    page++;
  } while (fetched === limit);

  return allLeads;
}

async function saveToDatabase(leads) {
  const client = new Client(dbCfg);
  await client.connect();

  for (const lead of leads) {
    await client.query(
      `INSERT INTO dash_geralcsopen (lead_id, name, date_created, value, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_id) DO UPDATE
       SET name = EXCLUDED.name,
           date_created = EXCLUDED.date_created,
           value = EXCLUDED.value,
           status = EXCLUDED.status`,
      [
        lead.id,
        lead.name,
        lead.dateCreated ? new Date(lead.dateCreated) : null,
        lead.value ? lead.value.amount : 0,
        "Open",
      ]
    );
  }

  await client.end();
}

(async () => {
  console.log("▶️ Executando dash_geralcsOpen.js...");
  try {
    const leads = await getLeadsOpen();
    console.log(`🔍 ${leads.length} leads “Open” encontradas.`);
    if (leads.length > 0) {
      await saveToDatabase(leads);
      console.log(`💾 ${leads.length} registros salvos em dash_geralcsOpen.`);
    }
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsOpen:", err.message);
  }
  console.log("🏁 dash_geralcsOpen concluído.");
})();
