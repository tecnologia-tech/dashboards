import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import https from "https";
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
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getWonLeads() {
  // 🔧 monta URL correta da REST API (sem /json)
  const baseUrl = NUTSHELL_API_URL.replace(/\/json$/, "");
  const url = `${baseUrl}/leads?status=Won`;
  console.log("🔗 URL final da requisição:", url);
  console.log("🔑 Token:", NUTSHELL_API_TOKEN ? "[OK]" : "[FALTANDO]");
  console.log("👤 Usuário:", NUTSHELL_USERNAME);
  console.log("🌍 Endpoint base:", baseUrl);

  const headers = {
    Authorization: AUTH_HEADER,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  console.log("📬 Headers usados:", headers);

  const res = await fetch(url, { method: "GET", headers, agent: httpsAgent });

  console.log("📥 Status HTTP:", res.status, res.statusText);
  const text = await res.text();
  console.log("📦 Corpo bruto recebido:", text);

  if (!res.ok) throw new Error(`Erro HTTP ${res.status}: ${text}`);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ Erro ao parsear JSON:", e.message);
    throw new Error("Resposta não é JSON válida.");
  }

  console.log(
    "📊 Tipo de resposta:",
    Array.isArray(data) ? "Array" : typeof data
  );
  if (Array.isArray(data)) console.log(`📈 Total de leads: ${data.length}`);

  return Array.isArray(data) ? data : data.leads || [];
}

(async () => {
  console.log("▶️ Executando dash_geralcsWon.js...");
  try {
    const leads = await getWonLeads();
    console.log(`✅ Leads recebidas: ${leads.length}`);
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsWon:", err.message);
  }
  console.log("🏁 dash_geralcsWon concluído.");
})();
