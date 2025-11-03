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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchLeads(limit = 500) {
  const response = await fetch(`${NUTSHELL_API_URL}/api/v1/leads/search`, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        conditions: [
          { field: "isDeleted", operator: "=", value: false },
          { field: "status.name", operator: "=", value: "Open" },
        ],
      },
      limit,
    }),
    agent: httpsAgent,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Erro ao buscar leads: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data?.results || [];
}

async function getLeadDetails(leadId) {
  const response = await fetch(`${NUTSHELL_API_URL}/api/v1/lead/${leadId}`, {
    headers: { Authorization: AUTH_HEADER },
    agent: httpsAgent,
  });
  if (!response.ok) return null;
  return response.json();
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

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
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
      INSERT INTO ${TABLE_NAME} (
        id, nome, cliente, criacao, status, valor, owner, fechamento_estimado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE SET
        nome = EXCLUDED.nome,
        cliente = EXCLUDED.cliente,
        criacao = EXCLUDED.criacao,
        status = EXCLUDED.status,
        valor = EXCLUDED.valor,
        owner = EXCLUDED.owner,
        fechamento_estimado = EXCLUDED.fechamento_estimado;
    `;

    let count = 0;
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
      count++;
    }

    console.log(`✅ ${count} registros atualizados em ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Erro ao salvar em ${TABLE_NAME}:`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

export default async function dashGeralCsOpen() {
  const start = Date.now();
  console.log("▶️ Executando dash_geralcsOpen.js...");

  try {
    const leads = await fetchLeads(500);
    console.log(`🔍 ${leads.length} leads abertos encontrados.`);

    const limit = pLimit(10); // 10 requisições simultâneas seguras
    const detailed = await Promise.allSettled(
      leads.map((lead) => limit(() => getLeadDetails(lead.id)))
    );

    const validLeads = detailed
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    if (validLeads.length === 0) {
      console.log("Nenhuma lead válida retornada da API Nutshell.");
      return [];
    }

    await saveToPostgres(validLeads);

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
