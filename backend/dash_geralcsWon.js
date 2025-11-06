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

function toSQLDateFromISO(isoString, leadId) {
  if (!isoString || typeof isoString !== "string") return null;

  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;

  const adjustedDate = new Date(d.getTime() - 3 * 60 * 60 * 1000);

  const datePart = adjustedDate.toISOString().slice(0, 10);
  const timePart = adjustedDate.toISOString().slice(11, 19);

  const finalDate = `${datePart} ${timePart}`;

  return finalDate;
}

function formatTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  const validTags = tags
    .map((tag) => (typeof tag === "object" ? tag.name : tag))
    .filter(Boolean);

  if (validTags.length === 0) return null;

  const uniqueTags = [...new Set(validTags)];
  return uniqueTags.join(" | ");
}

function extractNumeroFromLead(lead) {
  const pathVal = lead.htmlUrlPath ?? lead.htmlUrl ?? "";
  if (typeof pathVal === "string" && pathVal.includes("/lead/")) {
    const parts = pathVal.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;
  }

  if (typeof lead.name === "string") {
    const m = lead.name.match(/(\d{3,})/);
    if (m) return m[1];
  }

  return String(lead.id ?? lead.leadId ?? "");
}

function mapLeadToRow(lead) {
  const id = String(lead.id ?? lead.leadId); 
  if (!id) {
    console.warn(`⚠️ Lead sem ID encontrado. Lead: ${JSON.stringify(lead)}`);
  }
  const valor = Number(lead.value?.amount ?? 0);
  const empresa = lead.primaryAccount?.name ?? "";
  const assigned = lead.assignee?.name ?? "";
  const tag = formatTags(lead.tags);
  const pipeline = lead.stageset?.name ?? "";

  const data = toSQLDateFromISO(
    lead.closedTime ??
      lead.dueTime ??
      lead.modifiedTime ??
      new Date().toISOString(),
    id 
  );

  const id_primary_company = lead.primaryAccount?.id ?? "";
  const id_primary_person = lead.contacts?.[0]?.id ?? "";

  return {
    data, 
    pipeline,
    empresa,
    assigned,
    valor,
    numero: extractNumeroFromLead(lead),
    tag,
    id_primary_company,
    id_primary_person,
    lead_id: id, 
  };
}
async function getAllLeadIds() {
  const ids = [];
  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: { status: 10 },
      page,
      limit: 500, 
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id));
  }
  console.log(`📦 ${ids.length} leads encontrados.`);
  return ids;
}

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
        const errorMessage = `Erro na requisição (status ${res.status}): ${res.statusText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const json = await res.json();
      if (json.error) {
        const errorMessage = `Erro na resposta da API: ${JSON.stringify(
          json.error
        )}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      return json.result;
    } catch (err) {
      console.error(
        `⚠️ Erro na requisição para API (tentativa ${
          attempt + 1
        } de ${retries}): ${err.message}`
      );
      if (attempt < retries - 1) {
        console.log(`⏳ Tentando novamente em ${delay / 1000} segundos...`);
        await sleep(delay);
        delay *= 2; 
      } else {
        throw new Error(
          `Erro persistente após ${retries} tentativas: ${err.message}`
        );
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

  const start = Date.now();
  const ids = await getAllLeadIds();

  const allRows = [];
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);

    const tasks = batch.map((id) =>
      limit(async () => {
        try {
          const lead = await callRPC("getLead", { leadId: id });
          allRows.push(mapLeadToRow(lead));
        } catch (err) {
          console.warn("⚠️ Falha ao processar lead", id, err.message);
        }
      })
    );
    await Promise.all(tasks);

    await upsertRows(client, allRows);
    allRows.length = 0; 
  }

  const countRes = await client.query("SELECT COUNT(*) FROM dash_geralcsWon");
  const total = parseInt(countRes.rows[0].count, 10);

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`✅ Processamento concluído com sucesso!`);
  console.log(`📊 Total atual na tabela: ${total} registros.`);
  console.log(`⏱️ Tempo total: ${duration}s`);

  await client.end();
  console.log("🏁 dash_geralcsWon finalizado com sucesso!\n");
}
