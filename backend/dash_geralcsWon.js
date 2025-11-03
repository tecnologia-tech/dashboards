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
const limit = pLimit(5);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callRPC(method, params = {}, attempt = 1) {
  try {
    console.log(`🔄 Iniciando RPC: ${method} (tentativa ${attempt})`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(NUTSHELL_API_URL, {
      method: "POST",
      agent: httpsAgent,
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: Date.now() }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const json = await res.json().catch(() => null);
    if (!json || json.error) {
      throw new Error(
        `Erro RPC: ${JSON.stringify(json?.error || res.statusText)}`
      );
    }
    console.log(`✅ RPC ${method} executado com sucesso!`);
    return json.result;
  } catch (err) {
    if (attempt < 3) {
      const wait = 2000 * attempt;
      console.warn(
        `⚠️ RPC ${method} falhou (tentativa ${attempt}) → retry em ${
          wait / 1000
        }s`
      );
      await sleep(wait);
      return callRPC(method, params, attempt + 1);
    } else {
      console.error(`🚨 RPC ${method} falhou após ${attempt} tentativas`);
      throw err;
    }
  }
}

async function getAllLeadIds() {
  const ids = [];
  console.log("🔄 Buscando todos os IDs dos leads...");
  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: { status: 10 },
      page,
      limit: 100,
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id));
    console.log(
      `📥 Página ${page} de leads processada. Total até agora: ${ids.length}`
    );
    await sleep(200);
  }
  console.log(`📊 Total de leads encontrados: ${ids.length}`);
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
    numero: id,
    tag,
    id_primary_company,
    id_primary_person,
    lead_id: id,
  };
}

async function ensureTable(client) {
  console.log("🔄 Verificando a existência da tabela...");
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

  await client.query(`
    DELETE FROM dash_geralcsWon a
    USING dash_geralcsWon b
    WHERE a.ctid < b.ctid
    AND a.numero = b.numero;
  `);
  console.log("✅ Tabela verificada/atualizada com sucesso.");
}

async function upsertRows(client, rows, batchSize = 500) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const vals = batch.flatMap((r) => cols.map((c) => r[c]));
    const placeholders = batch
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
    console.log(
      `✅ Inseridos ${batch.length} registros (batch ${i / batchSize + 1})`
    );
  }
}

export default async function main() {
  console.log("🔄 Iniciando o processo...");
  const client = new Client(dbCfg);
  await client.connect();
  await ensureTable(client);

  const ids = await getAllLeadIds();
  const rows = [];

  const tasks = ids.map((id) =>
    limit(async () => {
      try {
        console.log(`🔄 Buscando informações do lead ID: ${id}`);
        const lead = await callRPC("getLead", { leadId: id });
        rows.push(mapLeadToRow(lead));
      } catch (err) {
        console.warn(`⚠️ Falha em lead ${id}: ${err.message}`);
        if (err.message.includes("429")) await sleep(3000);
      }
    })
  );

  await Promise.all(tasks);
  console.log(`📊 Leads processados com sucesso: ${rows.length}`);
  await upsertRows(client, rows);
  await client.end();
  console.log("🏁 dash_geralcsWon.js concluído com sucesso!");
}
