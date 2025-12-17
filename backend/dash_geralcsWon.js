import dotenv from "dotenv";
import https from "https";
import fetch from "node-fetch";
import pLimit from "p-limit";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

/* ===================== SETUP ===================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const { NUTSHELL_USERNAME, NUTSHELL_API_TOKEN, NUTSHELL_API_URL } = process.env;

const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

const httpsAgent = new https.Agent({ keepAlive: true });
const limit = pLimit(10);

/* ===================== UTILS ===================== */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toSQLDateFromISO(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;

  // ajuste UTC → Brasil
  const adjusted = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return adjusted.toISOString().replace("T", " ").slice(0, 19);
}

function formatTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return null;
  return [...new Set(tags.map((t) => (typeof t === "object" ? t.name : t)))]
    .filter(Boolean)
    .join(" | ");
}

function extractNumeroFromLead(lead) {
  const pathVal = lead.htmlUrlPath ?? lead.htmlUrl ?? "";
  if (pathVal.includes("/lead/")) {
    const last = pathVal.split("/").filter(Boolean).pop();
    if (/^\d+$/.test(last)) return last;
  }

  if (typeof lead.name === "string") {
    const m = lead.name.match(/(\d{3,})/);
    if (m) return m[1];
  }

  return String(lead.id);
}

/* ===================== API ===================== */

async function callRPC(method, params = {}, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(NUTSHELL_API_URL, {
        method: "POST",
        agent: httpsAgent,
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: Date.now(),
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(JSON.stringify(json.error ?? json));
      }

      return json.result;
    } catch (err) {
      console.error(`⚠️ Erro API (${attempt}/${retries}): ${err.message}`);
      if (attempt < retries) {
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

/* ===================== FIND LEADS ===================== */
/**
 * ⚠️ REGRA DO NUTSHELL:
 * - query é OBRIGATÓRIO
 * - NÃO usar closedTime / modifiedTime / status
 */
async function getAllLeadIds() {
  const ids = new Set();

  const params = {
    query: {}, // 🔴 obrigatório
    orderBy: "id", // 🔒 único confiável
    orderDirection: "DESC",
    limit: 100,
  };

  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", { ...params, page });
    if (!Array.isArray(leads) || !leads.length) break;

    for (const l of leads) {
      if (l?.id) ids.add(l.id);
    }

    if (leads.length < params.limit) break;
  }

  console.log(`📦 Total de leads encontrados: ${ids.size}`);
  return [...ids];
}

/* ===================== MAP ===================== */

function mapLeadToRow(lead) {
  return {
    lead_id: String(lead.id),
    data: toSQLDateFromISO(lead.closedTime),
    pipeline_id: lead.stageset?.id ? String(lead.stageset.id) : null,
    pipeline: lead.stageset?.name ?? null,
    empresa: lead.primaryAccount?.name ?? "",
    assigned: lead.assignee?.name ?? "",
    valor: Number(lead.value?.amount ?? 0),
    numero: extractNumeroFromLead(lead),
    tag: formatTags(lead.tags),
    id_primary_company: lead.primaryAccount?.id ?? "",
    id_primary_person: lead.contacts?.[0]?.id ?? "",
  };
}

/* ===================== DB ===================== */

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS dash_geralcsWon (
      lead_id TEXT PRIMARY KEY,
      data TIMESTAMP,
      pipeline_id TEXT,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT UNIQUE,
      tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT
    );
  `);
}

async function upsertRows(client, rows) {
  if (!rows.length) return;

  const cols = Object.keys(rows[0]);
  const values = rows.flatMap((r) => cols.map((c) => r[c]));
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
      .join(",")}
  `;

  await client.query(sql, values);
}

/* ===================== MAIN ===================== */

export default async function main() {
  const client = await pool.connect();

  try {
    await ensureTable(client);

    const ids = await getAllLeadIds();
    const rows = [];

    for (const id of ids) {
      await limit(async () => {
        try {
          const lead = await callRPC("getLead", { leadId: id });
          const status = lead?.status?.id ?? lead?.status;

          // ✅ filtro WON SOMENTE AQUI
          if (status === 10 || String(status).toLowerCase() === "won") {
            rows.push(mapLeadToRow(lead));
          }
        } catch (err) {
          console.warn(`⚠️ Falha no lead ${id}: ${err.message}`);
        }
      });
    }

    await upsertRows(client, rows);

    const {
      rows: [{ count }],
    } = await client.query("SELECT COUNT(*) FROM dash_geralcsWon");

    console.log(`✅ dash_geralcsWon finalizado`);
    console.log(`📊 Total na tabela: ${count}`);
  } finally {
    client.release();
  }
}
