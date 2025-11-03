import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";
import https from "https";
import pLimit from "p-limit";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pkg;

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

const TABLE_NAME = "dash_geralcsOpen";
const httpsAgent = new https.Agent({ keepAlive: true });
const limit = pLimit(10);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchLeads(limit = 500) {
  const res = await fetch(`${NUTSHELL_API_URL}/v1/json`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "findLeads",
      params: {
        query: { isDeleted: false, "status.name": "Open" },
        limit,
      },
    }),
    agent: httpsAgent,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Erro ao buscar leads: ${res.status} - ${err}`);
  }

  const data = await res.json();
  return data?.result?.leads || [];
}

async function getLeadDetails(id) {
  try {
    const res = await fetch(`${NUTSHELL_API_URL}/v1/json`, {
      method: "POST",
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ method: "getLead", params: { leadId: id } }),
      agent: httpsAgent,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result || null;
  } catch {
    return null;
  }
}

async function saveToPostgres(leads) {
  const client = new Client({
    host: PGHOST,
    port: Number(PGPORT || 5432),
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  await client.query(`
    DROP TABLE IF EXISTS ${TABLE_NAME};
    CREATE TABLE ${TABLE_NAME} (
      id TEXT PRIMARY KEY,
      nome TEXT,
      cliente TEXT,
      criacao TIMESTAMP,
      status TEXT,
      valor NUMERIC,
      owner TEXT,
      fechamento_estimado TIMESTAMP
    );
  `);

  const insertQuery = `
    INSERT INTO ${TABLE_NAME} (id, nome, cliente, criacao, status, valor, owner, fechamento_estimado)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      cliente = EXCLUDED.cliente,
      criacao = EXCLUDED.criacao,
      status = EXCLUDED.status,
      valor = EXCLUDED.valor,
      owner = EXCLUDED.owner,
      fechamento_estimado = EXCLUDED.fechamento_estimado;
  `;

  for (const lead of leads) {
    await client.query(insertQuery, [
      lead.id ?? "",
      lead.name ?? "",
      lead.account?.name ?? "",
      lead.createdTime ? new Date(lead.createdTime) : null,
      lead.status?.name ?? "",
      lead.value?.amount ?? 0,
      lead.owner?.name ?? "",
      lead.closeTime ? new Date(lead.closeTime) : null,
    ]);
  }

  console.log(`✅ ${leads.length} registros atualizados em ${TABLE_NAME}`);
  await client.end().catch(() => {});
}

export default async function dashGeralCsOpen() {
  const start = Date.now();
  console.log("▶️ Executando dash_geralcsOpen.js...");
  try {
    const leads = await fetchLeads(1000);
    console.log(`🔍 ${leads.length} leads abertas encontradas.`);
    const detailed = await Promise.allSettled(
      leads.map((lead) => limit(() => getLeadDetails(lead.id)))
    );
    const validLeads = detailed
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);
    if (validLeads.length > 0) await saveToPostgres(validLeads);
    console.log(
      `🏁 dash_geralcsOpen concluído em ${((Date.now() - start) / 1000).toFixed(
        1
      )}s`
    );
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsOpen:", err.message);
  } finally {
    await sleep(1000);
  }
}
