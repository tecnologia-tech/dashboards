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
dotenv.config({ path: path.join(__dirname, ".env") }); // Verifique o nome do arquivo .env

// Extraindo as variáveis de ambiente do arquivo .env
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

// Função para criar a tabela, caso não exista
async function createTableIfNotExists(client) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS public.dash_geralcsopen
    (
      data date,
      pipeline text COLLATE pg_catalog."default",
      empresa text COLLATE pg_catalog."default",
      assigned text COLLATE pg_catalog."default",
      valor numeric(12,2),
      numero text COLLATE pg_catalog."default" NOT NULL,
      tag text COLLATE pg_catalog."default",
      id_primary_company text COLLATE pg_catalog."default",
      id_primary_person text COLLATE pg_catalog."default",
      lead_id text COLLATE pg_catalog."default",
      CONSTRAINT dash_geralcsopen_pkey PRIMARY KEY (numero),
      CONSTRAINT unique_lead_id UNIQUE (lead_id)
    )
    TABLESPACE pg_default;

    ALTER TABLE IF EXISTS public.dash_geralcsopen
      OWNER TO ${PGUSER};`; // Define o proprietário da tabela

  try {
    // Executa a criação da tabela
    await client.query(createTableQuery);
    console.log("✅ Tabela 'dash_geralcsopen' criada ou já existente.");
  } catch (err) {
    console.error("🚨 Erro ao criar a tabela:", err.message);
  }
}

// Função para salvar os dados na tabela dash_geralcsopen
async function saveToPostgres(leadIds) {
  const client = new Client(dbCfg);
  try {
    await client.connect(); // Conectar ao banco de dados PostgreSQL
    console.log("🔄 Conectado ao banco de dados PostgreSQL");

    // Cria a tabela se não existir
    await createTableIfNotExists(client);

    // Inserir dados na tabela dash_geralcsopen
    for (const leadId of leadIds) {
      // Verificar se o campo 'numero' está presente antes de tentar salvar
      const numero = leadId.numero; // Suponha que 'numero' seja parte do objeto leadId

      if (!numero) {
        continue; // Ignorar a inserção se 'numero' for null ou vazio
      }

      const query = `
        INSERT INTO public.dash_geralcsopen (lead_id, numero, data)
        VALUES ($1, $2, CURRENT_DATE) 
        ON CONFLICT (lead_id) DO NOTHING`; // Adicionando lead_id, numero e data (data atual)
      await client.query(query, [leadId, numero]); // Inserir leadId, numero e data na tabela
    }

    console.log(
      `📦 ${leadIds.length} leads salvos na tabela dash_geralcsopen.`
    );
  } catch (err) {
    console.error("🚨 Erro ao salvar dados no PostgreSQL:", err.message);
  } finally {
    await client.end(); // Fechar a conexão com o banco de dados
  }
}

// Função principal do módulo, que faz a integração com o banco de dados
export default async function dashGeralcsOpen() {
  const start = Date.now();
  console.log("▶️ Executando dash_geralcsOpen...");

  try {
    // Obtém os IDs das leads com status "open"
    const leadIds = await getAllLeadIds();
    console.log(`📦 ${leadIds.length} leads 'open' encontrados.`);

    // Salva os dados na tabela dash_geralcsopen
    await saveToPostgres(leadIds); // Chama a função para salvar os dados no PostgreSQL
    console.log(
      `🏁 dash_geralcsOpen concluído em ${((Date.now() - start) / 1000).toFixed(
        1
      )}s`
    );
  } catch (err) {
    console.error("🚨 Erro em dash_geralcsOpen:", err.message);
  }
}
