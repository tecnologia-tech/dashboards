import dotenv from "dotenv";
import https from "https";
import fetch from "node-fetch";
import pLimit from "p-limit";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const { NUTSHELL_USERNAME, NUTSHELL_API_TOKEN, NUTSHELL_API_URL } = process.env;

const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

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
  const pipelineId = lead.stageset?.id ? String(lead.stageset.id) : null;
  const pipeline = lead.stageset?.name ?? null;
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
    pipeline_id: pipelineId,
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
  const ids = new Set();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // últimos 7 dias

  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: {
        modifiedTime: {
          operator: "after",
          value: since,
        },
      },
      orderBy: "modifiedTime",
      orderDirection: "DESC",
      page,
    });

    if (!Array.isArray(leads) || leads.length === 0) break;

    for (const l of leads) {
      if (l?.id) ids.add(l.id);
    }
  }

  console.log(`📦 ${ids.size} leads recentes encontradas.`);
  return [...ids];
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
      pipeline_id TEXT,
      pipeline TEXT,
      empresa TEXT,
      assigned TEXT,
      valor NUMERIC(12,2),
      numero TEXT UNIQUE,  tag TEXT,
      id_primary_company TEXT,
      id_primary_person TEXT,
      lead_id TEXT PRIMARY KEY
    );
  `);
  await ensurePipelineColumns(client);
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

  const sql = `INSERT INTO dash_geralcsWon (${cols.join(",")})
    VALUES ${placeholders}
    ON CONFLICT (lead_id) DO UPDATE SET
    ${cols
      .filter((c) => c !== "lead_id")
      .map((c) => `${c}=EXCLUDED.${c}`)
      .join(", ")}
  `;
  await client.query(sql, vals);
}

async function ensurePipelineColumns(client) {
  const columnCheck = await client.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'dash_geralcswon'
      AND column_name = 'pipeline_id';
  `);

  if (!columnCheck.rowCount) {
    await client.query(
      `ALTER TABLE dash_geralcsWon ADD COLUMN pipeline_id TEXT;`
    );
  }

  await client.query(`
    UPDATE dash_geralcsWon
    SET pipeline_id = regexp_replace(pipeline, '^\\s*(\\d+)\\s+-\\s+(.+)$', '\\1'),
        pipeline = regexp_replace(pipeline, '^\\s*\\d+\\s+-\\s+(.+)$', '\\1')
    WHERE (pipeline_id IS NULL OR pipeline_id = '')
      AND pipeline ~ '^\\s*\\d+\\s+-\\s+';
  `);
}
const PIPELINE_METHODS = [
  "findStagesets",
  "findPipelines",
  "findProcessPipelines",
];

async function fetchPipelinesWithFallback() {
  const limitPerPage = 100;
  for (const method of PIPELINE_METHODS) {
    try {
      const all = [];
      for (let page = 1; ; page++) {
        const result = await callRPC(
          method,
          { orderBy: "id", orderDirection: "ASC", limit: limitPerPage, page },
          1
        );
        if (!Array.isArray(result) || result.length === 0) break;
        all.push(...result);
        if (result.length < limitPerPage) break;
      }
      if (all.length) {
        return all
          .filter((p) => p && p.id !== undefined && p.id !== null)
          .map((p) => ({
            id: String(p.id),
            name: p.name ?? "",
          }));
      }
    } catch (err) {
      console.warn(`⚠️ Falha ao chamar ${method}: ${err.message}`);
    }
  }
  return null;
}

async function ensurePipelinesTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      name TEXT,
      synced_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function upsertPipelines(client, pipelines) {
  if (!Array.isArray(pipelines) || !pipelines.length) return;
  const vals = [];
  const placeholders = pipelines
    .map((p, i) => {
      vals.push(p.id, p.name);
      return `($${i * 2 + 1}, $${i * 2 + 2})`;
    })
    .join(",");
  await client.query(
    `
    INSERT INTO pipelines (id, name)
    VALUES ${placeholders}
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      synced_at = NOW()
  `,
    vals
  );
}

export default async function main() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    console.log("✅ Pipeline armazenado em colunas separadas (id + nome)");
    let pipelinesSynced = false;
    let pipelinesCount = 0;
    try {
      const pipelines = await fetchPipelinesWithFallback();
      if (pipelines && pipelines.length) {
        await ensurePipelinesTable(client);
        await upsertPipelines(client, pipelines);
        pipelinesSynced = true;
        pipelinesCount = pipelines.length;
      } else {
        console.log("⚠️ Não foi possível obter pipelines, seguindo sem eles");
      }
    } catch (err) {
      console.log("⚠️ Não foi possível obter pipelines, seguindo sem eles");
    }
    if (pipelinesSynced) {
      console.log(`✅ Pipelines sincronizados: ${pipelinesCount}`);
    } else {
      console.log("⚠️ Pipelines não sincronizados");
    }

    const start = Date.now();
    const ids = await getAllLeadIds();

    const allRows = [];
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);

      const tasks = batch.map((id) =>
        limit(async () => {
          try {
            const lead = await callRPC("getLead", { leadId: id });

            // status WON = 10
            if (lead?.status?.id === 10) {
              allRows.push(mapLeadToRow(lead));
            }
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
    console.log("🏁 dash_geralcsWon finalizado com sucesso!\n");
  } finally {
    client.release();
  }
}
