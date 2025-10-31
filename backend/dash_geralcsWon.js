import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function toSQLDateFromISO(isoString) {
  if (!isoString || typeof isoString !== "string") return null;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return br.toISOString().slice(0, 10);
}

function parseAmountToNumber(valueObj) {
  if (valueObj == null) return 0.0;
  let amt = valueObj.amount ?? valueObj;
  const n = Number(amt);
  return Number.isNaN(n) ? 0.0 : Number(n.toFixed(2));
}

function formatTags(tags) {
  if (!Array.isArray(tags)) return "";
  return tags
    .map((tag) => (typeof tag === "object" ? tag.name : tag))
    .filter(Boolean)
    .join(" | ");
}

function mapLeadToRow(leadFull) {
  const numero = extractNumeroFromLead(leadFull);
  const dataSQL = toSQLDateFromISO(
    leadFull.closedTime ?? leadFull.dueTime ?? leadFull.modifiedTime
  );
  const pipeline = leadFull.stageset?.name || leadFull.milestone?.name || "";
  const empresa =
    leadFull.primaryAccount?.name ??
    leadFull.primaryC?.name ??
    leadFull.primaryAccountName ??
    "";
  const assigned = leadFull.assignee?.name ?? leadFull.assigneeName ?? "";
  const valor = parseAmountToNumber(
    leadFull.value ?? leadFull.estimatedValue ?? 0
  );
  const tag = formatTags(leadFull.tags);
  const id_primary_company = leadFull.primaryAccount?.id
    ? `${leadFull.primaryAccount.id}-accounts`
    : "";
  const id_primary_person =
    Array.isArray(leadFull.contacts) && leadFull.contacts.length > 0
      ? `${leadFull.contacts[0].id}-contacts`
      : "";

  return {
    data: dataSQL,
    pipeline,
    empresa,
    assigned,
    valor,
    numero,
    tag,
    id_primary_company,
    id_primary_person,
    lead_id: String(leadFull.id ?? leadFull.leadId),
  };
}

async function callNutshellJSONRPC(method, params = {}) {
  const payload = {
    jsonrpc: "2.0",
    method,
    params,
    id: String(Date.now()),
  };

  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  if (!json) {
    throw new Error("Resposta inválida da API (não é JSON)");
  }

  if (json.error) {
    throw new Error(`Erro da API: ${JSON.stringify(json.error)}`);
  }

  return json.result;
}

async function safeGetLead(id, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await callNutshellJSONRPC("getLead", { leadId: id });
    } catch (err) {
      if (err.message.includes("429")) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⏳ Aguardando ${delay}ms por limite de requisição...`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  console.warn(`⚠️ Falha permanente ao buscar lead ${id}`);
  return null;
}

async function ensureTable(client) {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS dash_geralcsWon (
      data DATE,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT PRIMARY KEY,
      tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT,
      lead_id TEXT
    );
  `;
  await client.query(createSQL);
}

async function upsertRows(client, rows) {
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const params = [];
  const placeholders = rows
    .map((r, i) => {
      const base = i * cols.length;
      params.push(...cols.map((c) => r[c]));
      return `(${cols.map((_, k) => `$${base + k + 1}`).join(",")})`;
    })
    .join(",");

  const sql = `
    INSERT INTO dash_geralcsWon (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (numero) DO UPDATE SET
      ${cols
        .filter((c) => c !== "numero")
        .map((c) => `${c} = EXCLUDED.${c}`)
        .join(", ")};
  `;
  await client.query(sql, params);
}

async function main() {
  const client = new Client(dbCfg);
  try {
    await client.connect();
    await ensureTable(client);

    const allLeadIds = [];
    let page = 1;
    while (true) {
      const res = await callNutshellJSONRPC("findLeads", {
        query: { status: 10 },
        page,
        limit: 50,
      });
      const leads = Array.isArray(res) ? res : res.result ?? [];
      if (!leads.length) break;
      allLeadIds.push(...leads.map((l) => l.id));
      page++;
      await sleep(500); // delay entre páginas
    }

    const allRows = [];
    for (let i = 0; i < allLeadIds.length; i += 25) {
      const batch = allLeadIds.slice(i, i + 25);
      const tasks = batch.map((id) => safeGetLead(id));
      const results = await Promise.all(tasks);

      const rows = results
        .filter(Boolean)
        .map(mapLeadToRow)
        .filter((r) => r.numero);
      await upsertRows(client, rows);
      allRows.push(...rows);
      await sleep(1000); 
    }
  } catch (err) {
    console.error("💥 Erro geral no módulo dash_geralcsWon:", err.message);
  } finally {
    await client.end();
  }
}

export default main;
