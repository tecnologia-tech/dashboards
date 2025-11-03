import dotenv from "dotenv";
import path from "path";
import https from "https";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const { NUTSHELL_USERNAME, NUTSHELL_API_TOKEN, NUTSHELL_API_URL } = process.env;

const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getWonLeads() {
  const url = `${NUTSHELL_API_URL}/leads/find`;
  console.log("🔗 URL final:", url);
  console.log("📬 Método: POST");
  console.log("🔑 Token:", NUTSHELL_API_TOKEN ? "[OK]" : "[FALTANDO]");
  console.log("👤 Usuário:", NUTSHELL_USERNAME);

  const body = JSON.stringify({ status: "Won" });
  console.log("📦 Corpo da requisição:", body);

  const headers = {
    Authorization: AUTH_HEADER,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  console.log("📬 Headers usados:", headers);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
    agent: httpsAgent,
  });
  console.log("📥 Status HTTP:", res.status, res.statusText);
  const text = await res.text();
  console.log("📦 Corpo bruto recebido:", text);

  if (!res.ok) throw new Error(`Erro HTTP ${res.status}: ${text}`);

  const data = JSON.parse(text);
  console.log(
    "📊 Tipo de resposta:",
    Array.isArray(data) ? "Array" : typeof data
  );
  console.log(
    "📈 Total de leads retornadas:",
    data.length || (data.leads?.length ?? 0)
  );

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
