// dash_geralcsWon.js
import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import pLimit from "p-limit";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

// Configurações do ambiente
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

async function callRPC(method, params = {}) {
  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    agent: httpsAgent,
    headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: Date.now() }),
  });
  const json = await res.json().catch(() => null);
  if (!json || json.error) {
    throw new Error(
      `Erro RPC: ${JSON.stringify(json?.error || res.statusText)}`
    );
  }
  return json.result;
}

async function getAllLeadIds() {
  const ids = [];
  for (let page = 1; ; page++) {
    try {
      const leads = await callRPC("findLeads", {
        query: { status: 10 }, // status=10 é para Leads "Won"
        page,
        limit: 100,
      });

      if (!Array.isArray(leads) || leads.length === 0) break;

      ids.push(...leads.map((l) => l.id));
    } catch (error) {
      if (error.message.includes("429")) await sleep(2000); // Em caso de rate limit (erro 429)
      console.error("Erro ao buscar leads:", error);
      break;
    }
  }
  console.log(`📦 ${ids.length} leads encontrados.`);
  return ids;
}

function mapLeadToRow(lead) {
  return {
    id: lead.id,
    name: lead.name,
    description: lead.description,
    status: lead.status,
    value: lead.value ? lead.value.amount : null,
    currency: lead.value ? lead.value.currency : null,
  };
}

async function upsertRows(client, rows) {
  const query = `
    INSERT INTO leads (id, name, description, status, value, currency)
    VALUES ${rows
      .map(
        (row) =>
          `(${row.id}, '${row.name}', '${row.description}', ${row.status}, ${row.value}, '${row.currency}')`
      )
      .join(", ")}
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      value = EXCLUDED.value,
      currency = EXCLUDED.currency;
  `;

  await client.query(query);
  console.log("Dados inseridos/atualizados com sucesso.");
}

// Função principal que será chamada no index.js
export async function main() {
  const client = new Client(dbCfg);

  try {
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const leadIds = await getAllLeadIds();
    if (leadIds.length === 0) {
      console.log("Nenhum lead 'Won' encontrado.");
      return;
    }

    const rows = [];
    for (const id of leadIds) {
      try {
        const lead = await callRPC("getLead", { leadId: id });
        rows.push(mapLeadToRow(lead));
      } catch (err) {
        console.warn(`Falha ao recuperar o lead com ID ${id}: ${err.message}`);
      }
    }

    await upsertRows(client, rows);
  } catch (err) {
    console.error("Erro no processo:", err);
  } finally {
    await client.end();
    console.log("Conexão com o banco de dados encerrada.");
  }
}
