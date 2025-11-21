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

// Corrige fuso e formata data SQL
function toSQLDateFromISO(isoString) {
  if (!isoString || typeof isoString !== "string") return null;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;

  const adjusted = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return adjusted.toISOString().slice(0, 19).replace("T", " ");
}

function formatTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const valid = tags
    .map((t) => (typeof t === "object" ? t.name : t))
    .filter(Boolean);

  if (!valid.length) return null;

  return [...new Set(valid)].join(" | ");
}

function extractNumeroFromLead(lead) {
  const pathVal = lead.htmlUrlPath ?? lead.htmlUrl ?? "";

  if (typeof pathVal === "string" && pathVal.includes("/lead/")) {
    const parts = pathVal.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) return last;
  }

  if (typeof lead.name === "string") {
    const m = lead.name.match(/(\d{3,})/);
    if (m) return m[1];
  }

  return String(lead.id ?? lead.leadId ?? "");
}

// 🎯 AQUI ESTÁ O PONTO MAIS IMPORTANTE:
// PEGAR O PIPELINE REAL DA VITÓRIA (não o pipeline atual)
function getPipelineDaVitoria(lead) {
  return lead?.closedStage?.activity?.stageset?.name ?? null;
}

// Mapeia lead -> row SQL
function mapLeadToRow(lead) {
  return {
    data: toSQLDateFromISO(lead.closedTime),
    pipeline: getPipelineDaVitoria(lead), // <-- CORRIGIDO
    empresa: lead.primaryAccount?.name ?? "",
    assigned: lead.assignee?.name ?? "",
    valor: Number(lead.value?.amount ?? 0),
    numero: extractNumeroFromLead(lead),
    tag: formatTags(lead.tags),
    id_primary_company: lead.primaryAccount?.id ?? "",
    id_primary_person: lead.contacts?.[0]?.id ?? "",
    lead_id: String(lead.id),
  };
}

// Busca todos os leads WON
async function getAllLeadIds() {
  const ids = [];
  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: { status: 10 }, // WON
      page,
      limit: 500,
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id));
  }
  console.log(`📦 ${ids.length} leads WON encontrados.`);
  return ids;
}

// RPC comum com retry
async function callRPC(method, params = {}, retries = 3, delay = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
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

      if (!res.ok) {
        throw new Error(`Status ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.error) throw new Error(JSON.stringify(json.error));

      return json.result;
    } catch (err) {
      console.error(
        `⚠️ Erro RPC [${method}] tentativa ${attempt + 1}: ${err.message}`
      );

      if (attempt < retries - 1) {
        await sleep(delay);
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS dash_geralcsWon (
      data TIMESTAMP,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT UNIQUE,
      tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT,
      lead_id TEXT PRIMARY KEY
    );
  `);

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

  await client.query(
    `
    INSERT INTO dash_geralcsWon (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (lead_id) DO UPDATE SET
    ${cols
      .filter((c) => c !== "lead_id")
      .map((c) => `${c}=EXCLUDED.${c}`)
      .join(", ")}
  `,
    vals
  );
}

export default async function main() {
  const client = new Client(dbCfg);
  await client.connect();
  await ensureTable(client);

  const ids = await getAllLeadIds();
  const allRows = [];

  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);

    const tasks = batch.map((id) =>
      limit(async () => {
        let lead;

        try {
          lead = await callRPC("getLead", { leadId: id });
        } catch (err) {
          console.warn(`⚠️ Lead ${id} ignorado — erro 500 no Nutshell`);
          return;
        }

        const row = mapLeadToRow(lead);
        allRows.push(row);
      })
    );

    await Promise.all(tasks);

    if (allRows.length > 0) {
      await upsertRows(client, allRows);
      allRows.length = 0;
    }
  }

  const countRes = await client.query("SELECT COUNT(*) FROM dash_geralcsWon");
  console.log(`📊 Total atual na tabela: ${countRes.rows[0].count}`);

  await client.end();
  console.log("🏁 Finalizado com sucesso!");
}
