import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { main as atualizarDashboardCS } from "./dash_cs.js";

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "banco.env") });

const app = express();
app.use(cors());
app.use(express.json());

console.log("Iniciando atualização imediata do dash_cs...");
atualizarDashboardCS()
  .then(() => console.log("Atualização inicial concluída"))
  .catch((err) => console.error("Erro na atualização inicial:", err));

setInterval(() => {
  console.log("Executando atualização automática (15 min) de dash_cs...");
  atualizarDashboardCS().catch((err) =>
    console.error("Erro na atualização automática:", err)
  );
}, 15 * 60 * 1000);

app.get("/dash-cs", async (req, res) => {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: false,
  });

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM dash_cs");
    res.json({ dash_cs: result.rows });
  } catch (err) {
    console.error("Erro na API /dash-cs:", err);
    res.status(500).json({ error: "Erro ao consultar dash_cs" });
  } finally {
    await client.end().catch(() => {});
  }
});

app.listen(3001, () => {
  console.log("✅ API rodando em http://localhost:3001");
});
