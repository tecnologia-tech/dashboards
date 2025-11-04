import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import https from "https"; // Adicionada a importação do módulo https
import pLimit from "p-limit"; // Certifique-se de importar pLimit se não estiver importado

// Configuração de arquivos e variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".envv") });

// Extraindo as variáveis de ambiente do arquivo .envv
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

// Função para obter todos os IDs das leads com status "open" (status=0)
async function getAllLeadIds() {
  const ids = [];
  console.log("🧭 Iniciando a busca de leads 'open'...");

  for (let page = 1; ; page++) {
    const leads = await callRPC("findLeads", {
      query: { status: 0 }, // Status 0 é "open"
      page,
      limit: 100,
    });
    if (!Array.isArray(leads) || leads.length === 0) break;
    ids.push(...leads.map((l) => l.id)); // Adicionando os IDs das leads
  }
  console.log(`📦 Total de ${ids.length} leads 'open' encontrados.`);
  return ids;
}

// Função principal do módulo, que faz a integração com o banco de dados
export default async function dashGeralcsOpen() {
  const start = Date.now();
  console.log("▶️ Executando dash_geralcsOpen...");

  try {
    // Obtém os IDs das leads com status "open"
    const leadIds = await getAllLeadIds();
    console.log(`📦 ${leadIds.length} leads 'open' encontrados.`);

    // Aqui você pode adicionar a lógica para salvar ou processar esses dados
    await saveToPostgres(leadIds); // A função saveToPostgres deve ser implementada para persistir os dados no banco de dados
    console.log(
      `🏁 dash_geralcsOpen concluído em ${((Date.now() - start) / 1000).toFixed(
        1
      )}s`
    );
  } catch (err) {
    console.error("🚨 Erro em dash_geralcsOpen:", err.message);
  }
}
