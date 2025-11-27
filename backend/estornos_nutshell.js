import { parse } from "csv-parse/sync";
import fetch from "node-fetch";
import { pool } from "./db.js";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8iyU50KBGux98IZQaxQbnUYqRlDhDyE12Cq_Ueiq8aVHmCJHi72C63I1yZPjAn8lnAvZzOOE6WLvj/pub?gid=2033056171&single=true&output=csv";

export default async function importarEstornos() {
  try {
    console.log("🌐 Buscando dados diretamente do Google Sheets...");
    const response = await fetch(SHEET_URL);

    if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);

    const csv = await response.text();
    console.log("📄 CSV recebido. Convertendo...");

    const rows = parse(csv, { columns: true, skip_empty_lines: true });

    console.log(`📦 ${rows.length} linhas encontradas.`);

    const client = await pool.connect();

    const sql = `
      INSERT INTO estornos_nutshell
        (data, pipeline, empresa, assigned, valor, numero, tag, id_primary_company)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (numero)
      DO UPDATE SET
        data = EXCLUDED.data,
        pipeline = EXCLUDED.pipeline,
        empresa = EXCLUDED.empresa,
        assigned = EXCLUDED.assigned,
        valor = EXCLUDED.valor,
        tag = EXCLUDED.tag,
        id_primary_company = EXCLUDED.id_primary_company;
    `;

    let inseridas = 0;
    let ignoradas = 0;

    for (const r of rows) {
      const numero = (r["Número"] || r["numero"] || "").toString().trim();
      if (!numero || numero === "Número") {
        ignoradas++;
        continue;
      }

      const dataBruta = r["Data"] || r["data"] || "";
      let dataSQL = null;

      if (dataBruta.includes("/")) {
        const [dia, mes, ano] = dataBruta.split("/");
        if (ano && mes && dia) {
          dataSQL = `${ano}-${mes}-${dia} 00:00:00`;
        }
      }

      const valor = parseFloat(
        (r["Valor"] || "0").replace(/[^\d,.-]/g, "").replace(",", ".")
      );

      await client.query(sql, [
        dataSQL,
        r["Pipeline"] || null,
        r["Empresa"] || null,
        r["Assigned"] || null,
        valor,
        numero,
        r["Tag"] || null,
        r["ID Primary Company"] || null,
      ]);

      inseridas++;
    }

    client.release();

    console.log(`✅ Importação concluída.`);
    console.log(`➡️ Linhas salvas: ${inseridas}`);
    console.log(`🗑️ Linhas ignoradas: ${ignoradas}`);
  } catch (err) {
    console.error("❌ Erro ao salvar no banco:", err);
  }
}
