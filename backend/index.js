import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🔗 Conexão com o banco
const client = new Client({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: false,
});

client.connect();

// 📊 Endpoint de exemplo
app.get("/api/dash_geralcsWon", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM dash_geralcsWon");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar dados:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// ✅ Teste simples
app.get("/", (req, res) => {
  res.send("API está rodando!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
