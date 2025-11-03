import dotenv from "dotenv";
import path from "path";
import https from "https";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const { NUTSHELL_USERNAME, NUTSHELL_API_TOKEN } = process.env;

const NUTSHELL_API_URL = "https://app.nutshell.com/api/v1/json";
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function getOpenLeads() {
  const body = {
    jsonrpc: "2.0",
    method: "findLeads",
    params: { query: { status: 0 }, limit: 100 },
    id: 1,
  };

  console.log("📡 Enviando para:", NUTSHELL_API_URL);
  console.log("📦 Corpo:", JSON.stringify(body, null, 2));

  const res = await fetch(NUTSHELL_API_URL, {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    agent: httpsAgent,
  });

  console.log("📥 Status HTTP:", res.status, res.statusText);
  const text = await res.text();
  console.log("📦 Resposta bruta:", text);

  const data = JSON.parse(text);
  if (data.error) throw new Error(JSON.stringify(data.error));

  const leads = data.result || [];
  console.log("📊 Total retornado:", leads.length);
  return leads;
}

(async () => {
  console.log("▶️ Executando dash_geralcsOpen.js...");
  try {
    const leads = await getOpenLeads();
    console.log(`✅ Leads “Open” recebidas: ${leads.length}`);
  } catch (err) {
    console.error("🚨 Erro geral em dash_geralcsOpen:", err.message);
  }
  console.log("🏁 dash_geralcsOpen concluído.");
})();
