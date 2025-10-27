import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const NUTSHELL_USERNAME = "contato@metodo12p.com.br";
const NUTSHELL_API_TOKEN = "a68927c5dcbc967e9e97c6a3aa77cd6a0ce84854";
const NUTSHELL_API_URL = "https://app.nutshell.com/api/v1/json";
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

function getEnvTrimmed(k) {
  const v = process.env[k];
  return typeof v === "string" ? v.trim() : v;
}

const PGHOST = getEnvTrimmed("PGHOST");
const PGPORT = getEnvTrimmed("PGPORT");
const PGDATABASE = getEnvTrimmed("PGDATABASE");
const PGUSER = getEnvTrimmed("PGUSER");
const PGPASSWORD = getEnvTrimmed("PGPASSWORD");
const PGSSLMODE = getEnvTrimmed("PGSSLMODE");

const dbCfgBase = {
  host: PGHOST,
  port: PGPORT ? Number(PGPORT) : 5432,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
};

function formatTags(tags) {
  if (!Array.isArray(tags)) return "";
  return tags
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();
      if (typeof tag === "object" && tag.name) return tag.name.trim();
      return null;
    })
    .filter(Boolean)
    .join(" | ");
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
  if (!isoString) return null;
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return null;
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  const yyyy = br.getFullYear();
  const mm = String(br.getMonth() + 1).padStart(2, "0");
  const dd = String(br.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseAmountToNumber(valueObj) {
  if (valueObj == null) return 0.0;
  let amt = valueObj.amount ?? valueObj;
  if (typeof amt === "number") return Number(amt.toFixed(2));
  if (typeof amt !== "string") {
    const n = Number(amt);
    return Number.isNaN(n) ? 0.0 : Number(n.toFixed(2));
  }
  let s = amt.trim();
  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    if (s.lastIndexOf(",") > s.lastIndexOf("."))
      s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (hasComma && !hasDot) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  s = s.replace(/[^\d.-]/g, "");
  const n = Number(s);
  return Number.isNaN(n) ? 0.0 : Number(n.toFixed(2));
}

function mapLeadToRow(leadFull) {
  const numero = extractNumeroFromLead(leadFull);
  const dataSQL = toSQLDateFromISO(
    leadFull.closedTime ?? leadFull.dueTime ?? leadFull.modifiedTime
  );
  const pipeline = leadFull.stageset?.name || leadFull.milestone?.name || "";
  const empresa =
    leadFull.primaryAccount?.name ?? leadFull.primaryAccountName ?? "";
  const assigned = leadFull.assignee?.name ?? leadFull.assigneeName ?? "";
  const valor = parseAmountToNumber(
    leadFull.value ?? leadFull.estimatedValue ?? 0
  );
  const tag = formatTags(leadFull.tags);
  const id_primary_company = leadFull.primaryAccount?.id
    ? `${leadFull.primaryAccount.id}-accounts`
    : leadFull.primaryAccountId
    ? `${leadFull.primaryAccountId}-accounts`
    : "";
  let id_primary_person = "";
  if (Array.isArray(leadFull.contacts) && leadFull.contacts.length > 0)
    id_primary_person = `${leadFull.contacts[0].id}-contacts`;
  else if (leadFull.primaryContactId)
    id_primary_person = `${leadFull.primaryContactId}-contacts`;

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
    id: String(Math.floor(Date.now() / 1000)),
  };
  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.result ?? json;
}

async function ensureTable(client) {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS dash_geralcs (
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
  const cols = [
    "data",
    "pipeline",
    "empresa",
    "assigned",
    "valor",
    "numero",
    "tag",
    "id_primary_company",
    "id_primary_person",
    "lead_id",
  ];
  const params = [];
  const placeholders = rows
    .map((r, i) => {
      const base = i * cols.length;
      params.push(
        r.data,
        r.pipeline,
        r.empresa,
        r.assigned,
        r.valor,
        r.numero,
        r.tag,
        r.id_primary_company,
        r.id_primary_person,
        r.lead_id
      );
      return `(${cols.map((_, k) => `$${base + k + 1}`).join(",")})`;
    })
    .join(",");

  const sql = `
    INSERT INTO dash_geralcs (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (numero) DO UPDATE SET
      data = EXCLUDED.data,
      pipeline = EXCLUDED.pipeline,
      empresa = EXCLUDED.empresa,
      assigned = EXCLUDED.assigned,
      valor = EXCLUDED.valor,
      tag = EXCLUDED.tag,
      id_primary_company = EXCLUDED.id_primary_company,
      id_primary_person = EXCLUDED.id_primary_person,
      lead_id = EXCLUDED.lead_id;
  `;
  await client.query(sql, params);
}

async function connectWithAutoSSL() {
  const tries =
    PGSSLMODE === "true" || PGSSLMODE === "1" ? [true, false] : [false, true];
  let lastErr = null;
  for (const useSsl of tries) {
    const cfg = {
      host: dbCfgBase.host,
      port: dbCfgBase.port,
      database: dbCfgBase.database,
      user: dbCfgBase.user,
      password: dbCfgBase.password,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
    const client = new Client(cfg);
    try {
      await client.connect();
      console.log(`Conectado ao Postgres (ssl=${useSsl})`);
      return client;
    } catch (err) {
      lastErr = err;
      try {
        await client.end();
      } catch (_) {}
    }
  }
  throw lastErr;
}

(async function main() {
  console.log("Iniciando FULL SYNC Nutshell -> Postgres (WON only)");
  let client;
  try {
    client = await connectWithAutoSSL();
    await ensureTable(client);
  } catch (err) {
    console.error("Erro ao conectar/garantir tabela:", err.message || err);
    process.exit(1);
  }

  const allLeadIds = [];
  try {
    let page = 1;
    while (true) {
      const params = { query: { status: 10 }, page, limit: 50 };
      const res = await callNutshellJSONRPC("findLeads", params);
      const leadsPage = Array.isArray(res) ? res : res.result ?? [];
      if (!Array.isArray(leadsPage) || leadsPage.length === 0) break;
      for (const s of leadsPage) if (s?.id) allLeadIds.push(s.id);
      if (leadsPage.length < 50) break;
      page++;
    }
  } catch (err) {
    console.error("Erro ao buscar IDs de leads:", err.message || err);
    try {
      await client.end();
    } catch (_) {}
    process.exit(1);
  }

  console.log(`Total de leads WON encontradas: ${allLeadIds.length}`);

  for (let i = 0; i < allLeadIds.length; i += 500) {
    const batchIds = allLeadIds.slice(i, i + 500);
    const batchNo = Math.floor(i / 500) + 1;

    const tasks = batchIds.map((id) =>
      (async () => {
        try {
          const res = await callNutshellJSONRPC("getLead", { leadId: id });
          const lead = res?.result ?? res;
          console.log(`Lead ${id} tags brutas:`, lead.tags);
          return lead;
        } catch {
          return null;
        }
      })()
    );

    const leadFullObjects = await Promise.all(tasks);
    const rows = leadFullObjects
      .filter((x) => x && (x.id || x.leadId))
      .map(mapLeadToRow)
      .filter((r) => r && r.numero);

    try {
      if (rows.length) {
        await upsertRows(client, rows);
        console.log(`Batch ${batchNo} inserido com ${rows.length} leads.`);
      }
    } catch (err) {
      console.error(`Erro no batch ${batchNo}:`, err.message || err);
    }
  }

  console.log("SYNC concluído.");
  try {
    await client.end();
  } catch (_) {}
  process.exit(0);
})();
