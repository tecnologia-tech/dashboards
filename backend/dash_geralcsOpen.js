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
} = process.env;

const NUTSHELL_API_URL = "https://app.nutshell.com/api/v1/json";
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
  if (typeof lead.id === "string") {
    const m = lead.id.match(/^(\d+)-/);
    if (m) return m[1];
  }
  return String(lead.id ?? "");
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

function mapLeadToRow(lead) {
  const numero = extractNumeroFromLead(lead);
  const dataSQL = toSQLDateFromISO(
    lead.closedTime ?? lead.dueTime ?? lead.modifiedTime
  );
  const pipeline = lead.stageset?.name || lead.milestone?.name || "";
  const stage = lead.stage?.name ?? lead.milestone?.name ?? "";
  const empresa = lead.primaryC?.name ?? lead.primaryAccountName ?? "";
  const assigned = lead.assignee?.name ?? lead.assigneeName ?? "";
  const valor = parseAmountToNumber(lead.value ?? lead.estimatedValue ?? 0);
  const tag = formatTags(lead.tags);
  const id_primary_company = lead.primaryAccount?.id
    ? `${lead.primaryAccount.id}-accounts`
    : "";
  const id_primary_person =
    Array.isArray(lead.contacts) && lead.contacts.length > 0
      ? `${lead.contacts[0].id}-contacts`
      : "";

  return {
    data: dataSQL,
    pipeline,
    stage,
    empresa,
    assigned,
    valor,
    numero,
    tag,
    id_primary_company,
    id_primary_person,
    lead_id: String(lead.id ?? ""),
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
  const json = await res.json();
  if (!res.ok || json.error)
    throw new Error(JSON.stringify(json.error || json));
  return json.result;
}

async function ensureTable(client) {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS dash_geralcsopen (
      data DATE,
      pipeline TEXT,
      stage TEXT,
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
    BEGIN;
    SET LOCAL lock_timeout = '10s';
    INSERT INTO dash_geralcsopen (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (numero) DO UPDATE SET
      ${cols
        .filter((c) => c !== "numero")
        .map((c) => `${c} = EXCLUDED.${c}`)
        .join(", ")};
    COMMIT;
  `;
  await client.query(sql, params);
}

async function main() {
  const client = new Client(dbCfg);
  try {
    await client.connect();
    console.log("🚀 Conectado ao banco, iniciando busca de leads...");
    await ensureTable(client);

    let page = 1;
    const allLeadIds = [];

    while (true) {
      const res = await callNutshellJSONRPC("findLeads", {
        query: { status: 0 },
        page,
        limit: 50,
      });
      const leads = Array.isArray(res) ? res : res.result ?? [];
      console.log(`📄 Página ${page} retornou ${leads.length} leads`);
      if (!leads.length) break;
      allLeadIds.push(...leads.map((l) => l.id));
      page++;
    }

    console.log(`🔢 Total de IDs coletados: ${allLeadIds.length}`);

    for (let i = 0; i < allLeadIds.length; i += 20) {
      const batch = allLeadIds.slice(i, i + 20);
      const tasks = batch.map((id) =>
        callNutshellJSONRPC("getLead", { leadId: id }).catch(() => null)
      );
      const results = await Promise.all(tasks);

      for (const lead of results) {
        if (lead) {
          console.log("🔍", {
            id: lead.id,
            name: lead.name,
            stage: lead.stage?.name,
            milestone: lead.milestone?.name,
            stageset: lead.stageset?.name,
          });
        }
      }

      const valid = results.filter(
        (lead) =>
          lead &&
          (lead.stage?.name === "Hot 🔥" || lead.milestone?.name === "Hot 🔥")
      );

      console.log(`📦 Batch ${i / 20 + 1}: ${valid.length} leads válidas`);
      const rows = valid.map(mapLeadToRow).filter((r) => r.numero);
      await upsertRows(client, rows);
    }

    console.log("✅ Finalizado com sucesso.");
  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    await client.end();
  }
}

main();
