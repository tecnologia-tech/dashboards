// dash_geralcsWon.js
import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import pLimit from "p-limit";
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

const httpsAgent = new https.Agent({ keepAlive: true });
const limit = pLimit(10);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callRPC(method, params = {}) {
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

async function getAllLeadIds() {
  const ids = [];
  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: { status: 10 }, // status=Won
      page,
      limit: 100,
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id));
  }
  return ids;
}

function mapLeadToRow(lead) {
  const id = String(lead.id ?? lead.leadId);
  const valor = Number(lead.value?.amount ?? 0);
  const empresa = lead.primaryAccount?.name ?? "";
  const assigned = lead.assignee?.name ?? "";
  const tag = Array.isArray(lead.tags)
    ? lead.tags.map((t) => t.name).join(" | ")
    : "";
  const pipeline = lead.stageset?.name ?? "";
  const data =
    lead.closedTime ??
    lead.dueTime ??
    lead.modifiedTime ??
    new Date().toISOString();
  const id_primary_company = lead.primaryAccount?.id ?? "";
  const id_primary_person = lead.contacts?.[0]?.id ?? "";
  return {
    data,
    pipeline,
    empresa,
    assigned,
    valor,
    numero: id, // apenas referência, não é mais PK
    tag,
    id_primary_company,
    id_primary_person,
    lead_id: id, // PK verdadeira
  };
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS dash_geralcsWon (
      data TIMESTAMP,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT,
      tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT,
      lead_id TEXT PRIMARY KEY
    );
  `);

  // 🔹 Limpa duplicados antigos baseados em "numero"
  await client.query(`
    DELETE FROM dash_geralcsWon a
    USING dash_geralcsWon b
    WHERE a.ctid < b.ctid
    AND a.numero = b.numero;
  `);
}

async function upsertRows(client, rows) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const vals = rows.flatMap((r) => cols.map((c) => r[c]));
  const placeholders = rows
    .map(
      (_, i) =>
        `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(",")})`
    )
    .join(",");

  const sql = `
    INSERT INTO dash_geralcsWon (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (lead_id) DO UPDATE SET
    ${cols
      .filter((c) => c !== "lead_id")
      .map((c) => `${c}=EXCLUDED.${c}`)
      .join(", ")}
  `;
  await client.query(sql, vals);
}

export default async function main() {
  const client = new Client(dbCfg);
  await client.connect();

  await ensureTable(client);

  const ids = await getAllLeadIds();

  const rows = [];
  const tasks = ids.map((id) =>
    limit(async () => {
      try {
        const lead = await callRPC("getLead", { leadId: id });
        rows.push(mapLeadToRow(lead));
      } catch (err) {
        if (err.message.includes("429")) await sleep(2000);
        console.warn("Falha em lead", id);
      }
    })
  );

  await Promise.all(tasks);
  await upsertRows(client, rows);

  await client.end();
}
