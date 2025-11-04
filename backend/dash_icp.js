// Importing necessary dependencies
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import pkg from "pg";
const { Client } = pkg;
import { fileURLToPath } from "url";

// Setting up file path and environment configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Environment variables for PostgreSQL and Monday API
const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, MONDAY_API_KEY } =
  process.env;

// Board ID and table name for Monday.com and PostgreSQL
const MONDAY_BOARD_ID = "8918157934";
const TABLE_NAME = "dash_icp";

// GraphQL query to fetch Monday data
const MONDAY_QUERY = `
  query ($board_id: ID!, $limit: Int!, $cursor: String) {
    boards(ids: [$board_id]) {
      items_page(limit: $limit, cursor: $cursor) {
        cursor
        items {
          id
          name
          group { title }
          column_values {
            id
            text
            value
          }
        }
      }
    }
  }
`;

// Function to clean and normalize column names for use in PostgreSQL
function cleanName(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove non-alphanumeric characters
    .trim(); // Trim extra spaces
}

// Function to fetch column mapping from Monday board
async function getColumnMap() {
  const query = `
    query ($board_id: ID!) {
      boards(ids: [$board_id]) {
        columns {
          id
          title
        }
      }
    }
  `;
  const variables = { board_id: MONDAY_BOARD_ID };

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      Authorization: MONDAY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await res.json();
  const columns = data?.data?.boards?.[0]?.columns || [];

  const map = {};
  columns.forEach((col) => {
    if (col.id && col.title) {
      const safeName = cleanName(col.title);
      map[col.id] = `${safeName}_${col.id}`; // Mapping column title to a safe name
    }
  });

  return map; // Returning the column map
}

// Function to fetch data from Monday board
async function getMondayData() {
  const allItems = [];
  let cursor = null;
  const limit = 50;
  let page = 1;

  do {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        Authorization: MONDAY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: MONDAY_QUERY,
        variables: { board_id: MONDAY_BOARD_ID, limit, cursor },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Erro HTTP ${res.status} - ${text}`);
    }

    const data = await res.json();
    const pageData = data?.data?.boards?.[0]?.items_page;
    if (!pageData) break;

    allItems.push(...(pageData.items || []));
    cursor = pageData.cursor; // Update cursor for pagination
  } while (cursor); // Keep fetching if cursor is present

  console.log(`📦 ${allItems.length} items fetched from Monday board.`);
  return allItems; // Return all fetched items
}

// Function to save data into PostgreSQL database
async function saveToPostgres(items, columnMap) {
  const client = new Client({
    host: PGHOST,
    port: PGPORT ? parseInt(PGPORT, 10) : 5432,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: false,
  });

  try {
    await client.connect();
    console.log(`💾 Saving ${items.length} records into ${TABLE_NAME}...`);

    const columns = Object.values(columnMap); // Get all column names from the map
    const colDefs = columns
      .map((t) => `"${t}_text" TEXT, "${t}_value" TEXT`) // Create column definitions for PostgreSQL
      .join(", ");

    // Create the table if it doesn't exist
    await client.query(`
      DROP TABLE IF EXISTS ${TABLE_NAME};
      CREATE TABLE ${TABLE_NAME} (
        id TEXT PRIMARY KEY,
        name TEXT,
        ${colDefs},
        grupo TEXT
      );
    `);

    // Insert records into the PostgreSQL table
    const insertQuery = `
      INSERT INTO ${TABLE_NAME} (id, name, grupo, ${columns
      .flatMap((c) => [`"${c}_text"`, `"${c}_value"`])
      .join(", ")})
      VALUES (${[
        "$1",
        "$2",
        "$3",
        ...columns.flatMap((_, i) => [`$${i * 2 + 4}`, `$${i * 2 + 5}`]),
      ].join(", ")})
      ON CONFLICT (id) DO UPDATE SET
      ${columns
        .flatMap((c) => [
          `"${c}_text" = EXCLUDED."${c}_text"`,
          `"${c}_value" = EXCLUDED."${c}_value"`,
        ])
        .concat(["grupo = EXCLUDED.grupo"])
        .join(", ")}
    `;

    let inserted = 0;
    for (const item of items) {
      const col = {};
      (item.column_values || []).forEach((c) => {
        if (!c?.id || !columnMap[c.id]) return;
        const title = columnMap[c.id];
        col[title] = {
          text: c.text ?? "",
          value:
            typeof c.value === "object"
              ? JSON.stringify(c.value)
              : c.value ?? "",
        };
      });

      const row = [
        item.id ?? "",
        item.name ?? "",
        item.group?.title ?? "",
        ...columns.flatMap((t) => {
          const c = col[t] || {};
          return [c.text ?? "", c.value ?? ""];
        }),
      ];

      await client.query(insertQuery, row);
      inserted++;
    }

    console.log(`✅ ${inserted} records updated in ${TABLE_NAME}`);
  } catch (err) {
    console.error(`❌ Error saving ${TABLE_NAME}:`, err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

// Main function to execute the script
export default async function dashICP() {
  const start = Date.now();
  console.log("▶️ Executing dash_icp.js...");
  try {
    const columnMap = await getColumnMap(); // Fetch column mappings from Monday
    const items = await getMondayData(); // Fetch data from Monday
    if (!items.length) {
      console.log("No records returned from Monday.");
      return [];
    }
    await saveToPostgres(items, columnMap); // Save the data to PostgreSQL
    console.log(
      `🏁 dash_icp completed in ${((Date.now() - start) / 1000).toFixed(1)}s`
    );
  } catch (err) {
    console.error("🚨 General error in dash_icp:", err.message);
  }
}
