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

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

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

        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="var(--metal-light)"
          strokeWidth="14"
          opacity="0.35"
          strokeLinecap="round"
        />

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

export default function Hunters() {
  const { total, hunters } = huntersData;

  return (
    <div className="hunters-container">
      {/* LATERAL ESQUERDA */}
      <div className="hunters-left">
        <img src={huntersImg} alt="Hunter" />
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="hunters-right">
        {/* HERO */}
        <div className="witcher-hero">
          <div className="hero-title">Geral dos Hunters</div>

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

        {/* 4 HUNTERS */}
        <div className="hunters-row">
          {hunters.map((h) => {
            const photo = getHunterImage(h.nome);

            const pct = Math.min((h.vendido / h.meta) * 100, 100).toFixed(0);

            return (
              <div className="hunter-card" key={h.nome}>
                {/* ESQUERDA: tudo empilhado */}
                <div className="hunter-left-side">
                  {/* PORCENTAGEM */}
                  <div className="hunter-percentage">{pct}%</div>

                  {/* GAUGE + FOTO */}
                  <div className="gauge-wrapper">
                    <Gauge valor={h.vendido} meta={h.meta} />
                    {photo && (
                      <img src={photo} className="hunter-photo" alt={h.nome} />
                    )}
                  </div>

                  {/* NOME */}
                  <div className="hunter-name">{h.nome}</div>
                </div>

                {/* DIREITA */}
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
                    <label>Ticket Médio</label>
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
