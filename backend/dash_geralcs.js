// ✅ CÓDIGO FINAL — FULL SYNC WON + MULTI-TAGS PIPE + UPDATE TAG SOMENTE + 8 SIMULTÂNEOS

import { Client } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "banco.env") });

const NUTSHELL_USERNAME = "contato@metodo12p.com.br";
const NUTSHELL_API_TOKEN = "a68927c5dcbc967e9e97c6a3aa77cd6a0ce84854";
const NUTSHELL_API_URL = "https://app.nutshell.com/api/v1/json";
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_TOKEN}`).toString("base64");

function getEnvTrimmed(k) {
  const v = process.env[k];
  return typeof v === "string" ? v.trim() : v;
}
const PGHOST = getEnvTrimmed("PGHOST");
const PGPORT = getEnvTrimmed("PGPORT");
const PGDATABASE = getEnvTrimmed("PGDATABASE");
const PGUSER = getEnvTrimmed("PGUSER");
const PGPASSWORD = getEnvTrimmed("PGPASSWORD");
const PGSSLMODE = getEnvTrimmed("PGSSLMODE");

function validateEnvOrThrow() {
  const missing = [];
  if (!PGHOST) missing.push("PGHOST");
  if (!PGDATABASE) missing.push("PGDATABASE");
  if (!PGUSER) missing.push("PGUSER");
  if (typeof PGPASSWORD !== "string" || PGPASSWORD.length === 0)
    missing.push("PGPASSWORD");
  if (missing.length)
    throw new Error(`Variáveis faltando no banco.env: ${missing.join(", ")}`);
}
validateEnvOrThrow();

const dbCfgBase = {
  host: PGHOST,
  port: PGPORT ? Number(PGPORT) : 5432,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
};

const CONCURRENCY = 8;
const FIND_PAGE_SIZE = 50;

function pLimit(concurrency) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (!queue.length) return;
    if (active >= concurrency) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then((v) => {
        active--;
        resolve(v);
        next();
      })
      .catch((e) => {
        active--;
        reject(e);
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}
const limit = pLimit(CONCURRENCY);

async function callNutshellJSONRPC(method, params = {}, retries = 3) {
  const payload = {
    jsonrpc: "2.0",
    method,
    params,
    id: String(Math.floor(Date.now() / 1000)),
  };
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(NUTSHELL_API_URL, {
        method: "POST",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok)
        throw new Error(
          `HTTP ${res.status} ${res.statusText} - ${JSON.stringify(
            json.error ?? json
          )}`
        );
      if (json.error) throw new Error(JSON.stringify(json.error));
      return json.result ?? json;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      } else throw err;
    }
  }
}

async function connectWithAutoSSL() {
  const tries =
    PGSSLMODE === "true" || PGSSLMODE === "1" ? [true, false] : [false, true];
  let lastErr = null;
  for (const useSsl of tries) {
    const cfg = {
      host: dbCfgBase.host,
      port: dbCfgBase.port,
      database: dbCfgBase.database,
      user: dbCfgBase.user,
      password: dbCfgBase.password,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    };
    const client = new Client(cfg);
    try {
      await client.connect();
      console.log(`Conectado ao Postgres (ssl=${useSsl})`);
      return client;
    } catch (err) {
      lastErr = err;
      try {
        await client.end();
      } catch (_) {}
    }
  }
  throw lastErr;
}

async function fetchAllTags(numero) {
  try {
    const tryNum = Number.isNaN(Number(numero)) ? numero : Number(numero);
    const res = await callNutshellJSONRPC("findTags", {
      objectType: "Leads",
      objectId: tryNum,
    });
    const arr = res?.result?.Leads ?? res?.Leads ?? null;
    if (Array.isArray(arr) && arr.length > 0) return arr.join(" | ");
    return null;
  } catch {
    return null;
  }
}

(async function main() {
  console.log("Iniciando apenas UPDATE TAGS (WON)");

  let client;
  try {
    client = await connectWithAutoSSL();
  } catch (err) {
    console.error("Erro ao conectar:", err.message || err);
    process.exit(1);
  }

  const allLeadIds = [];
  try {
    let page = 1;
    while (true) {
      const params = { query: { status: 10 }, page, limit: FIND_PAGE_SIZE };
      const res = await callNutshellJSONRPC("findLeads", params);
      const leadsPage = Array.isArray(res) ? res : res.result ?? [];
      if (!Array.isArray(leadsPage) || leadsPage.length === 0) break;
      for (const s of leadsPage) if (s?.id) allLeadIds.push(s.id);
      if (leadsPage.length < FIND_PAGE_SIZE) break;
      page++;
    }
  } catch (err) {
    console.error("Erro ao buscar IDs WON:", err.message || err);
    try {
      await client.end();
    } catch (_) {}
    process.exit(1);
  }

  console.log(`IDs WON: ${allLeadIds.length}`);

  for (const id of allLeadIds) {
    await limit(async () => {
      try {
        const lead = await callNutshellJSONRPC("getLead", { leadId: id });
        const leadObj = lead?.result ?? lead;
        if (!leadObj?.id) return;
        const numero = String(leadObj.id);
        const pipeTags = await fetchAllTags(numero);
        if (!pipeTags) return;
        await client.query(
          "UPDATE dash_geralcs SET tag = $1 WHERE numero = $2",
          [pipeTags, numero]
        );
        console.log(`OK numero=${numero} tags=${pipeTags}`);
      } catch (err) {
        console.error("Falha leadId=" + id, err.message || err);
      }
    });
  }

  console.log("UPDATE TAGS CONCLUÍDO.");
  try {
    await client.end();
  } catch (_) {}
  process.exit(0);
})().catch((e) => {
  console.error("Erro geral:", e);
  process.exit(1);
});
