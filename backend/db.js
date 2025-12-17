import dotenv from "dotenv";
import path from "path";
import pkg from "pg";
import { fileURLToPath } from "url";
const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSLMODE } =
  process.env;
export const pool = new Pool({
  host: PGHOST,
  port: parseInt(PGPORT || "5432", 10),
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: PGSSLMODE === "true" ? { rejectUnauthorized: false } : false,
  max: 10,
});
