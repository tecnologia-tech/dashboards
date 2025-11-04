import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
import pLimit from "p-limit";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

// Configuração de arquivos e variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

// Extraindo as variáveis de ambiente do arquivo banco.env
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

// Definindo o cabeçalho de autenticação básico para a API Nutshell
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

// Configuração do banco de dados PostgreSQL
const dbCfg = {
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
};

// Função para fazer chamadas à API Nutshell
const httpsAgent = new https.Agent({ keepAlive: true });
const limit = pLimit(10);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Função para realizar a chamada à API de RPC
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

// Função para obter todos os IDs das leads com status "cs" (status=3)
async function getAllLeadIds() {
  const ids = [];
  console.log("🧭 Iniciando a busca de leads 'cs'...");

  for (let page = 1; ; page++) {
    console.log(`📄 Buscando leads na página ${page}...`);
    const leads = await callRPC("findLeads", {
      query: { status: 3 }, // Status 3 é "cs"
      page,
      limit: 100,
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id)); // Adicionando os IDs das leads
    console.log(`📦 Encontrados ${leads.length} leads na página ${page}`);
  }
  console.log(`📦 Total de ${ids.length} leads 'cs' encontrados.`);
  return ids;
}

// Função principal do módulo, que faz a integração com o banco de dados
export default async function dashCs() {
  const start = Date.now();
  console.log("▶️ Executando dash_cs...");

  try {
    // Obtém os IDs das leads com status "cs"
    const leadIds = await getAllLeadIds();
    console.log(`📦 ${leadIds.length} leads 'cs' encontrados.`);

    // Aqui você pode adicionar a lógica para salvar ou processar esses dados
    await saveToPostgres(leadIds); // A função saveToPostgres deve ser implementada para persistir os dados no banco de dados
    console.log(
      `🏁 dash_cs concluído em ${((Date.now() - start) / 1000).toFixed(1)}s`
    );
  } catch (err) {
    console.error("🚨 Erro em dash_cs:", err.message);
  }
}
