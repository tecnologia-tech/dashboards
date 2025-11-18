import React from "react";
import "./Farmers.css";
import farmersImg from "../../assets/Farmers/Farmers.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const farmerPhotos = import.meta.glob("../../assets/Farmers/*.png", {
  eager: true,
});

function getRankEmoji(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return "⚔️";
}

function getFarmerImage(name, index) {
  const file = index === 0 ? `${name}1.png` : `${name}.png`;
  const path = `../../assets/Farmers/${file}`;
  return farmerPhotos[path]?.default || null;
}

function getFarmerBadge(name) {
  const path = `../../assets/Farmers/${name}Badge.png`;
  return farmerPhotos[path]?.default || null;
}

function formatCurrency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* CONFIG DOS FARMERS */
const FARMERS = [
  { label: "Choco", db: "Victor Biselli", meta: 100000 },
  { label: "Texugão", db: "Raul Cruz", meta: 50000 },
  { label: "Cleyton", db: "Cleyton Cruz", meta: 50000 },
  { label: "Andrés", db: "Andrés Apolionario", meta: 0 },
];

export default function Farmers() {
  const [total, setTotal] = React.useState(null);
  const [farmers, setFarmers] = React.useState([]);

  React.useEffect(() => {
    async function loadData() {
      const res = await fetch(
        "https://dashboards-exur.onrender.com/api/dash_geralcswon"
      );
      const data = await res.json();

      const parsed = data.map((d) => ({
        ...d,
        valor: Number(d.valor) || 0,
        data: new Date(d.data),
        assigned: d.assigned?.trim() || "",
      }));

      const start = new Date("2025-11-01T00:00:00");
      const end = new Date("2025-11-30T23:59:59");

      const filtered = parsed.filter((d) => d.data >= start && d.data <= end);

      let totalVendas = 0;
      let totalVendido = 0;

      let farmersCalc = FARMERS.map((f) => {
        const rows = filtered.filter(
          (r) => r.assigned.toLowerCase() === f.db.trim().toLowerCase()
        );

        const vendas = rows.length;
        const vendido = rows.reduce((acc, r) => acc + r.valor, 0);
        const ticketMedio = vendas > 0 ? vendido / vendas : 0;

        totalVendas += vendas;
        totalVendido += vendido;

        return {
          nome: f.label,
          vendas,
          vendido,
          ticketMedio,
          meta: f.meta,
        };
      });

      farmersCalc.sort((a, b) => b.vendido - a.vendido);

      setFarmers(farmersCalc);

      const metaTotal = FARMERS.reduce((acc, f) => acc + f.meta, 0);

      setTotal({
        vendas: totalVendas,
        vendido: totalVendido,
        meta: metaTotal,
        ticketMedio: totalVendas ? totalVendido / totalVendas : 0,
      });
    }

    loadData();
  }, []);

  if (!total) return null;

  return (
    <div className="farmers-container">
      {/* LATERAL */}
      <div className="farmers-left">
        <img src={farmersImg} alt="Farmers" />
      </div>

      <div className="farmers-right">
        {/* HEADER */}
        <div className="witcher-hero">
          <div className="hero-title">
            <span className="title-top">Geral</span>
            <span className="title-bottom">Farmer</span>
          </div>

          <div className="hero-metrics">
            <div className="metric primary">
              <label>Vendas</label>
              <strong>{total.vendas}</strong>
            </div>

            <div className="metric primary">
              <label>Vendido</label>
              <strong>{formatCurrency(total.vendido)}</strong>
            </div>

            <div className="metric secondary">
              <label>Meta</label>
              <strong>{formatCurrency(total.meta)}</strong>
            </div>

            <div className="metric secondary">
              <label>Ticket</label>
              <strong>{formatCurrency(total.ticketMedio)}</strong>
            </div>
          </div>
        </div>

        {/* FARMERS */}
        <div className="farmers-row">
          {farmers.map((f, index) => {
            const photo = getFarmerImage(f.nome, index);
            const pctNumber = f.meta > 0 ? (f.vendido / f.meta) * 100 : 0;
            const pctCapped = Math.min(Math.max(pctNumber, 0), 100);
            const pctLabel = pctCapped.toFixed(0);

            return (
              <div className="farmer-card" key={f.nome} data-pct={pctLabel}>
                <div className="farmer-left-side">
                  <div className="farmer-percentage">{pctLabel}%</div>

                  <div className="gauge-wrapper">
                    <Gauge percent={pctCapped} />

                    <div className="gauge-ice-clip">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="ice-particle"
                          style={{
                            "--fp-size": "8px",
                            "--fp-speed": `${10 + (i % 6)}s`,
                          }}
                        />
                      ))}
                    </div>

                    {photo && (
                      <img src={photo} className="farmer-photo" alt={f.nome} />
                    )}
                  </div>

                  <div className="farmer-name">
                    {getRankEmoji(index)} {f.nome}
                  </div>

                  {getFarmerBadge(f.nome) && (
                    <img
                      src={getFarmerBadge(f.nome)}
                      className="farmer-badge"
                      alt={`${f.nome} badge`}
                    />
                  )}
                </div>

                <div className="farmer-right-side">
                  <div className="card-metric">
                    <label>Vendas</label>
                    <span className="highlight">{f.vendas}</span>
                  </div>

                  <div className="card-metric">
                    <label>Vendido</label>
                    <span className="highlight">
                      {formatCurrency(f.vendido)}
                    </span>
                  </div>

                  <div className="card-metric">
                    <label>Ticket</label>
                    <span>{formatCurrency(f.ticketMedio)}</span>
                  </div>

                  <div className="card-metric">
                    <label>Meta</label>
                    <span>{formatCurrency(f.meta)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================= GAUGE ========================= */
function Gauge({ percent }) {
  const pct = Math.min(Math.max(percent, 0), 100);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const activeLength = circumference / 2;
  const dash = (pct / 100) * activeLength;

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--ice)" />
            <stop offset="50%" stopColor="var(--frost)" />
            <stop offset="100%" stopColor="var(--silver)" />
          </linearGradient>
        </defs>

        {/* TRILHO */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(140,180,230,0.35)"
          strokeWidth="14"
          opacity="0.35"
          strokeLinecap="round"
        />

        {/* ATIVO */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="url(#gaugeGlow)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
    </div>
  );
}
