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

async function callRPC(method, params) {
  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ method, params }),
    agent: httpsAgent,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function getLeadsWon() {
  const allLeads = [];
  let page = 1;
  const limit = 100;
  let fetched;

  do {
    const leads = await callRPC("findLeads", {
      query: { status: 10 },
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
      `INSERT INTO dash_geralcswon (lead_id, name, date_closed, value, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lead_id) DO UPDATE
       SET name = EXCLUDED.name, date_closed = EXCLUDED.date_closed,
           value = EXCLUDED.value, status = EXCLUDED.status`,
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
    const leads = await getLeadsWon();
    console.log(`🔍 ${leads.length} leads “Won” encontradas.`);
    if (leads.length > 0) {
      await saveToDatabase(leads);
      console.log(`💾 ${leads.length} registros salvos em dash_geralcsWon.`);
    }
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsWon:", err.message);
  }
  console.log("🏁 dash_geralcsWon concluído.");
})();
