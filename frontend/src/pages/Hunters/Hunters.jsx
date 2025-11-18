import React from "react";
import "./Hunters.css";
import huntersImg from "../../assets/Hunters/hunters.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const hunterPhotos = import.meta.glob("../../assets/Hunters/*.png", {
  eager: true,
});

function getRankEmoji(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return "⚔️";
}

function getHunterImage(name, index) {
  const file = index === 0 ? `${name}1.png` : `${name}.png`;
  const path = `../../assets/Hunters/${file}`;
  return hunterPhotos[path]?.default || null;
}

function getHunterBadge(name) {
  const path = `../../assets/Hunters/${name}Badge.png`;
  return hunterPhotos[path]?.default || null;
}

function formatCurrency(v) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* CONFIG DOS HUNTERS */
const HUNTERS = [
  { label: "Fernando", db: "Fernando Finatto", meta: 250000 },
  { label: "Monique", db: "Monique Moreira", meta: 250000 },
  { label: "Thiago", db: "Thiago Cardoso", meta: 250000 },
  { label: "Alan", db: "Alan Esteves", meta: 50000 },
];

export default function Hunters() {
  const [total, setTotal] = React.useState(null);
  const [hunters, setHunters] = React.useState([]);

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
      }));

      const filtered = parsed.filter(
        (d) =>
          d.data >= new Date("2025-11-01") && d.data <= new Date("2025-11-30")
      );

      let totalVendas = 0;
      let totalVendido = 0;

      let huntersCalc = HUNTERS.map((h) => {
        const rows = filtered.filter((r) => r.assigned === h.db);

        const vendas = rows.length;
        const vendido = rows.reduce((acc, r) => acc + r.valor, 0);
        const ticketMedio = vendas > 0 ? vendido / vendas : 0;

        totalVendas += vendas;
        totalVendido += vendido;

        return {
          nome: h.label,
          vendas,
          vendido,
          ticketMedio,
          meta: h.meta,
        };
      });

      huntersCalc.sort((a, b) => b.vendido - a.vendido);

      setHunters(huntersCalc);

      const metaTotal = HUNTERS.reduce((acc, h) => acc + h.meta, 0);

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
    <div className="hunters-container">
      {/* LATERAL */}
      <div className="hunters-left">
        <img src={huntersImg} alt="Hunter" />
      </div>

      <div className="hunters-right">
        {/* HEADER */}
        <div className="witcher-hero">
          <div className="hero-title">
            <span className="title-top">Geral</span>
            <span className="title-bottom">Hunters</span>
          </div>

          <div className="hero-metrics">
            <div className="metric orange">
              <label>Vendas</label>
              <strong>{total.vendas}</strong>
            </div>

            <div className="metric orange">
              <label>Vendido</label>
              <strong>{formatCurrency(total.vendido)}</strong>
            </div>

            <div className="metric white">
              <label>Meta</label>
              <strong>{formatCurrency(total.meta)}</strong>
            </div>

            <div className="metric white">
              <label>Ticket</label>
              <strong>{formatCurrency(total.ticketMedio)}</strong>
            </div>
          </div>
        </div>

        {/* HUNTERS */}
        <div className="hunters-row">
          {hunters.map((h, index) => {
            const photo = getHunterImage(h.nome, index);
            const pctNumber = (h.vendido / h.meta) * 100;
            const pctCapped = Math.min(Math.max(pctNumber, 0), 100);

            return (
              <div className="hunter-card" key={h.nome}>
                <div className="hunter-left-side">
                  <div className="hunter-percentage">
                    {pctCapped.toFixed(0)}%
                  </div>

                  <div className="gauge-wrapper">
                    <Gauge percent={pctCapped} />

                    <div className="gauge-fire-clip">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="fire-particle"
                          style={{ "--i": i }}
                        />
                      ))}
                    </div>

                    {photo && (
                      <img src={photo} className="hunter-photo" alt={h.nome} />
                    )}
                  </div>

                  <div className="hunter-name">
                    {getRankEmoji(index)} {h.nome}
                  </div>

                  {getHunterBadge(h.nome) && (
                    <img
                      src={getHunterBadge(h.nome)}
                      className="hunter-badge"
                      alt={`${h.nome} badge`}
                    />
                  )}
                </div>

                <div className="hunter-right-side">
                  <div className="card-metric">
                    <label>Vendas</label>
                    <span className="highlight">{h.vendas}</span>
                  </div>

                  <div className="card-metric">
                    <label>Vendido</label>
                    <span className="highlight">
                      {formatCurrency(h.vendido)}
                    </span>
                  </div>

                  <div className="card-metric">
                    <label>Ticket</label>
                    <span>{formatCurrency(h.ticketMedio)}</span>
                  </div>

                  <div className="card-metric">
                    <label>Meta</label>
                    <span>{formatCurrency(h.meta)}</span>
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

/* GAUGE */
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
            <stop offset="0%" stopColor="var(--fire)" />
            <stop offset="50%" stopColor="var(--quen)" />
            <stop offset="100%" stopColor="var(--blood)" />
          </linearGradient>
        </defs>

        {/* TRILHO */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="var(--metal-light)"
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
