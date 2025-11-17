import React from "react";
import "./Hunters.css";
import huntersImg from "../../assets/hunters.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const hunterPhotos = import.meta.glob("../../assets/*.png", { eager: true });

function getHunterImage(name) {
  const path = `../../assets/${name}.png`;
  return hunterPhotos[path]?.default || null;
}

const huntersData = {
  total: {
    vendas: 9,
    ticketMedio: 13273.53,
    vendido: 119461.75,
    meta: 700000,
  },
  ranking: [
    { nome: "Monique", valor: 44000 },
    { nome: "Fernando", valor: 34894.55 },
    { nome: "Thiago", valor: 22567.2 },
    { nome: "Alan", valor: 8000 },
  ],
  hunters: [
    {
      nome: "Fernando",
      vendas: 4,
      ticketMedio: 14348.64,
      vendido: 57394.55,
      meta: 200000,
    },
    {
      nome: "Monique",
      vendas: 5,
      ticketMedio: 11400,
      vendido: 57000,
      meta: 200000,
    },
    {
      nome: "Thiago",
      vendas: 3,
      ticketMedio: 14189.07,
      vendido: 42567.2,
      meta: 200000,
    },
    {
      nome: "Alan",
      vendas: 1,
      ticketMedio: 12456.07,
      vendido: 12127.2,
      meta: 100000,
    },
  ],
};

function formatCurrency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Gauge({ valor, meta }) {
  const pct = Math.min((valor / meta) * 100, 150);
  const pctDisplay = Math.min((valor / meta) * 100, 100).toFixed(0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className="gauge">
      <svg viewBox="0 0 160 90">
        <defs>
          <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--fire)" />
            <stop offset="50%" stopColor="var(--quen)" />
            <stop offset="100%" stopColor="var(--blood)" />
          </linearGradient>
        </defs>

        {/* fundo */}
        <path
          d="M20 80 A60 60 0 0 1 140 80"
          fill="none"
          stroke="var(--metal-light)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* progresso */}
        <path
          d="M20 80 A60 60 0 0 1 140 80"
          fill="none"
          stroke="url(#gaugeGlow)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>

      {/* 🔥 PORCENTAGEM AQUI */}
      <div className="gauge-percent">{pctDisplay}%</div>
    </div>
  );
}

export default function Hunters() {
  const { total, ranking, hunters } = huntersData;
  const topValor = Math.max(...ranking.map((r) => r.valor));

  return (
    <div className="hunters-container">
      <div className="hunters-left">
        <img src={huntersImg} alt="Hunter" />
      </div>

      <div className="hunters-right">
        <div className="hunters-root">
          {/* HERO */}
          <div className="witcher-hero">
            <div className="hero-title">Geral dos Hunters </div>
            <div className="hero-metrics">
              <div className="metric">
                <label>Vendas</label>
                <strong>{total.vendas}</strong>
              </div>
              <div className="metric">
                <label>Ticket Médio</label>
                <strong>{formatCurrency(total.ticketMedio)}</strong>
              </div>
              <div className="metric">
                <label>Vendido</label>
                <strong>{formatCurrency(total.vendido)}</strong>
              </div>
              <div className="metric">
                <label>Meta</label>
                <strong>{formatCurrency(total.meta)}</strong>
              </div>
            </div>
          </div>

          {/* RESUMO + RANKING */}
          <div className="hunters-main">
            <div className="summary-card">
              <div className="summary-header">
                <h2>Resumo das Caçadas</h2>
              </div>
              <div className="summary-body">
                <div className="summary-item">
                  <label>Vendas</label>
                  <div className="value">{total.vendas}</div>
                </div>
                <div className="summary-item">
                  <label>Ticket Médio</label>
                  <div className="value">
                    {formatCurrency(total.ticketMedio)}
                  </div>
                </div>
                <div className="summary-item">
                  <label>Vendido</label>
                  <div className="value highlight">
                    {formatCurrency(total.vendido)}
                  </div>
                </div>
                <div className="summary-item">
                  <label>Meta</label>
                  <div className="value">{formatCurrency(total.meta)}</div>
                </div>
              </div>
            </div>

            <div className="side-panel">
              <div className="panel ranking-panel">
                <div className="panel-title">Ranking Hunters</div>
                <div className="ranking-list">
                  {ranking.map((r, i) => (
                    <div key={r.nome} className="ranking-item">
                      <div className="ranking-info">
                        <span className="rank-index">#{i + 1}</span>
                        <span className="rank-name">{r.nome}</span>
                      </div>
                      <span className="rank-value">
                        {formatCurrency(r.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARDS 2x2 */}
          <div className="hunters-row">
            {hunters.map((h) => {
              const photo = getHunterImage(h.nome);

              return (
                <div className="hunter-card" key={h.nome}>
                  <div className="card-title">{h.nome}</div>

                  <div className="hunter-split">
                    {/* ESQUERDA */}
                    <div className="hunter-left">
                      <Gauge valor={h.vendido} meta={h.meta} />
                      {photo && (
                        <img
                          src={photo}
                          className="hunter-photo"
                          alt={h.nome}
                        />
                      )}
                    </div>

                    {/* DIREITA */}
                    <div className="hunter-right">
                      {/* Linha 1 → Vendido | Meta */}
                      <div className="card-metric">
                        <label>Vendido</label>
                        <span className="highlight">
                          {formatCurrency(h.vendido)}
                        </span>
                      </div>

                      <div className="card-metric">
                        <label>Meta</label>
                        <span>{formatCurrency(h.meta)}</span>
                      </div>

                      {/* Linha 2 → Vendas | Ticket Médio */}
                      <div className="card-metric">
                        <label>Vendas</label>
                        <span className="highlight">{h.vendas}</span>
                      </div>

                      <div className="card-metric">
                        <label>Ticket Médio</label>
                        <span>{formatCurrency(h.ticketMedio)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
