import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import pkg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pkg;

// ==========================
// PATH / ENV
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// ==========================
// ENV VARS
// ==========================
const {
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGSSLMODE,
  NUTSHELL_API_URL,
  NUTSHELL_USERNAME,
  NUTSHELL_API_KEY,
} = process.env;

// ==========================
// POSTGRES POOL
// ==========================
const pool = new Pool({
  host: PGHOST,
  port: Number(PGPORT || 5432),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
  max: 3,
});

// ==========================
// AUTH HEADER (BASIC)
// ==========================
const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${NUTSHELL_USERNAME}:${NUTSHELL_API_KEY}`).toString("base64");

// ==========================
// FETCH WON LEADS (REST)
// ==========================
async function fetchWonLeads(page = 0, limit = 50) {
  const url = new URL(NUTSHELL_API_URL);

  // principal filtro
  url.searchParams.append("filter[status]", "won");

  // paginação
  url.searchParams.append("page[page]", page);
  url.searchParams.append("page[limit]", limit);

  // ordenação
  url.searchParams.append("sort", "-closedTime");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: AUTH_HEADER,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Nutshell API ${res.status}: ${err}`);
  }

  return res.json();
}

// ==========================
// UPSERT NO BANCO
// ==========================
async function upsertLeads(leads) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const lead of leads) {
      await client.query(
        `
        INSERT INTO dash_geralcsWon (
          id,
          name,
          amount,
          currency,
          status,
          confidence,
          priority,
          closed_time,
          created_time,
          owner_type,
          html_url,
          updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,$11,NOW()
        )
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status,
          confidence = EXCLUDED.confidence,
          priority = EXCLUDED.priority,
          closed_time = EXCLUDED.closed_time,
          created_time = EXCLUDED.created_time,
          owner_type = EXCLUDED.owner_type,
          html_url = EXCLUDED.html_url,
          updated_at = NOW();
        `,
        [
          lead.id,
          lead.name,
          lead.value?.amount ? Number(lead.value.amount) : 0,
          lead.value?.currency || null,
          lead.status,
          lead.confidence ?? null,
          lead.priority ?? 0,
          lead.closedTime ? new Date(lead.closedTime) : null,
          lead.createdTime?.timestamp
            ? new Date(Number(lead.createdTime.timestamp) * 1000)
            : null,
          lead.ownerType || null,
          lead.htmlUrl || null,
        ]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ==========================
// MAIN (EXPORT DEFAULT)
// ==========================
export default async function dashGeralCsWon() {
  let page = 0;
  const limit = 50;

  while (true) {
    const data = await fetchWonLeads(page, limit);

    if (!data?.leads || data.leads.length === 0) {
      break;
    }

    await upsertLeads(data.leads);

    console.log(
      `📥 dash_geralcsWon → página ${page} | ${data.leads.length} leads`
    );

    if (data.leads.length < limit) break;

    page++;
  }
}
