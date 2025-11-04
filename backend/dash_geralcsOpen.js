import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

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

// Extract lead number from URL or lead name
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
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000); // Adjust to Brazil timezone
  return br.toISOString().slice(0, 10); // Return only the date part
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

function mapLeadToRow(leadFull, accountMap) {
  const numero = extractNumeroFromLead(leadFull);
  const dataSQL = toSQLDateFromISO(
    leadFull.closedTime ?? leadFull.dueTime ?? leadFull.modifiedTime
  );
  const pipeline = leadFull.stageset?.name || leadFull.milestone?.name || "";
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
  const empresa =
    leadFull.primaryAccount?.name ??
    accountMap[leadFull.primaryAccount?.id] ??
    "";

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

// Call Nutshell API using JSON-RPC
async function callNutshellJSONRPC(method, params = {}) {
  const payload = {
    jsonrpc: "2.0",
    method,
    params,
    id: String(Date.now()),
  };
  console.log(`🔄 Chamando método ${method}...`);
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

// Ensure the table exists
async function ensureTable(client) {
  console.log("📑 Verificando e criando a tabela se necessário...");
  await client.query(`DROP TABLE IF EXISTS dash_geralcsopen`);
  await client.query(`
    CREATE TABLE dash_geralcsopen (
      data DATE,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT PRIMARY KEY,
      tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT,
      lead_id TEXT );
  `);
  console.log("✅ Tabela criada ou verificada.");
}

// Upsert rows into the database
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

  const insertSQL = `
    INSERT INTO dash_geralcsopen (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (numero) DO UPDATE SET
      ${cols
        .filter((c) => c !== "numero")
        .map((c) => `${c} = EXCLUDED.${c}`)
        .join(", ")};`;

  console.log("📥 Iniciando upsert de dados...");
  try {
    await client.query("BEGIN;");
    await client.query("SET LOCAL lock_timeout = '10s';");
    await client.query(insertSQL, params);
    await client.query("COMMIT;");
    console.log(`✅ ${rows.length} registros upserted.`);
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("❌ Erro ao inserir:", err.message);
  }
}

function getHotStageIdsManualmente() {
  return [391, 1043, 1039]; // Manually defined stages
}

async function main() {
  const client = new Client(dbCfg);
  try {
    console.log("🔗 Conectando ao banco de dados...");
    await client.connect();
    await ensureTable(client);

    const hotStageIds = getHotStageIdsManualmente();
    console.log("📊 Obtendo leads das etapas:", hotStageIds);

    const allRows = [];
    for (const stageId of hotStageIds) {
      let page = 1;
      const leadIds = [];

      while (true) {
        console.log(`🔄 Buscando leads da etapa ${stageId}, página ${page}...`);
        const res = await callNutshellJSONRPC("findLeads", {
          query: { status: 0, stageId },
          page,
          limit: 50,
        });
        const leads = Array.isArray(res) ? res : res.result ?? [];
        if (!leads.length) break;
        leadIds.push(...leads.map((l) => l.id));
        page++;
      }

      for (let i = 0; i < leadIds.length; i += 100) {
        const batch = leadIds.slice(i, i + 100);
        console.log(
          `🔄 Processando batch de leads (IDs: ${batch.join(", ")})...`
        );
        const tasks = batch.map((id) =>
          callNutshellJSONRPC("getLead", { leadId: id }).catch(() => null)
        );
        const results = await Promise.all(tasks);

        const accountMap = {};
        results.forEach((lead) => {
          if (lead?.primaryAccount?.id && lead.primaryAccount?.name) {
            accountMap[lead.primaryAccount.id] = lead.primaryAccount.name;
          }
        });

        const rows = results
          .filter(Boolean)
          .map((lead) => mapLeadToRow(lead, accountMap))
          .filter((r) => r.numero);
        await upsertRows(client, rows);
        allRows.push(...rows);
      }
    }
  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    await client.end();
    console.log("🔌 Conexão com o banco encerrada.");
  }
}

export default main;
