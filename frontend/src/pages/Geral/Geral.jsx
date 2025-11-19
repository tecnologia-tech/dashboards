import React from "react";
import lateralImg from "../../assets/geral/geral.png"; // imagem lateral fixa

export default function Geral() {
  return (
    <div className="w-full h-screen bg-black text-white flex overflow-hidden">
      {/* ==================== LATERAL ESQUERDA ==================== */}
      <div className="w-[220px] min-w-[220px] h-full">
        <img src={lateralImg} className="w-full h-full object-cover" />
      </div>

      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex flex-col flex-1 overflow-auto px-6">
        {/* ==================== RINGS HEADER ==================== */}
        <div className="flex gap-10 justify-center mt-6">
          <Ring
            title="LTDA"
            value="857,1 mil"
            estornos="0"
            meta="R$ 1,4 mi"
            percent={61.2}
          />
          <Ring
            title="CS"
            value="284,0 mil"
            estornos="103mil"
            meta="R$ 800 mil"
            percent={33.4}
          />
          <Ring
            title="Bônus"
            value="43,5 mil"
            estornos="0"
            meta="R$ 300 mil"
            percent={29}
          />
          <Ring
            title="Repetidos"
            value="108,9 mil"
            estornos="103mil"
            meta="R$ 200 mil"
            percent={54.5}
          />
          <Ring
            title="12P"
            value="1,294 mi"
            estornos="103mil"
            meta="R$ 2,7 mi"
            percent={47.9}
          />
        </div>

        {/* ==================== GRID DO MEIO ==================== */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          {/* ============= ONBOARDING ============= */}
          <OnboardingCard />

          {/* ============= COMPRAS ============= */}
          <ComprasCard />

          {/* ============= IMPORTAÇÃO ============= */}
          <ImportacaoCard />
        </div>

        {/* ==================== GRID INFERIOR ==================== */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* ============= CSAT ============= */}
          <CSATCard />

          {/* ============= REPUTAÇÃO ============= */}
          <ReputacaoCard />

          {/* ============= DOLAR / NPS / BHAG ============= */}
          <DNBCard />
        </div>
      </div>
    </div>
  );
}

//
// ===================================================================
// RING (ANEL) – DOURADO – PORCENTAGEM FIXA NA PARTE INFERIOR
// ===================================================================
//
function Ring({ title, value, estornos, meta, percent }) {
  const size = 220;
  const stroke = 18;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Trilha */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Anel Ativo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#goldGrad)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />

          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="50%" stopColor="#ffd46b" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Conteúdo central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[#e6c068] text-3xl font-bold">{title}</div>
          <div
            className="text-5xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1px black" }}
          >
            {value}
          </div>
          <div className="text-lg text-gray-300 mt-1">Estornos: {estornos}</div>
        </div>

        {/* Porcentagem fixada na parte inferior */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-extrabold text-white"
          style={{ bottom: 10, WebkitTextStroke: "1.2px black" }}
        >
          {percent}%
        </div>
      </div>

      <div className="text-2xl font-bold text-[#e6c068] mt-3">Meta: {meta}</div>
    </div>
  );
}

//
// ===================================================================
// ONBOARDING CARD — Número grande à esquerda e lista à direita
// ===================================================================
//
/* ============================================
   COMPONENTE — ONBOARDING CARD (VERSÃO FINAL)
=============================================== */
function OnboardingCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6 flex flex-col w-full">
      {/* ===== TÍTULO ===== */}
      <div className="text-center mb-4">
        <h2
          className="text-3xl font-extrabold text-[#e6c068] uppercase tracking-wide"
          style={{ WebkitTextStroke: "0.5px black" }}
        >
          Onboarding
        </h2>
      </div>

      {/* ===== CONTEÚDO EM 2 COLUNAS ===== */}
      <div className="flex">
        {/* COLUNA ESQUERDA: 98 + Clientes (CENTRALIZADO PERFEITO) */}
        <div className="flex flex-col justify-center items-center w-[180px]">
          <div
            className="text-7xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1px black" }}
          >
            98
          </div>

          <div
            className="text-2xl font-semibold text-gray-300 mt-2"
            style={{ WebkitTextStroke: "0.4px black" }}
          >
            Clientes
          </div>
        </div>

        {/* COLUNA DIREITA: LISTA DE PESSOAS */}
        <div className="flex flex-col gap-6 ml-8">
          <Person name="Jayanne Queiroz" count="38" />
          <Person name="Jenifer Martins" count="22" />
          <Person name="Rayssa Veloso" count="37" />
        </div>
      </div>
    </div>
  );
}

function Person({ name, count }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-500" />
      <div className="flex flex-col leading-tight">
        <span className="text-white text-xl font-semibold">{name}</span>
        <span className="text-gray-300 text-sm">{count} Clientes</span>
      </div>
    </div>
  );
}

//
// ===================================================================
// COMPRAS CARD
// ===================================================================
//
function ComprasCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6 flex flex-col items-center w-full">
      {/* ======= TÍTULO ======= */}
      <div
        className="text-3xl font-bold text-[#e6c068] mb-4"
        style={{ WebkitTextStroke: "0.5px black" }}
      >
        Compras
      </div>

      {/* ======= GRID PRINCIPAL ======= */}
      <div className="flex w-full justify-around text-center">
        {/* ---------------- SIMULAÇÕES ---------------- */}
        <div className="flex flex-col items-center">
          <div className="text-[#e6c068] text-xl font-bold mb-2">
            Simulações
          </div>

          <div
            className="text-6xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1px black" }}
          >
            15
          </div>

          <div className="text-gray-300 text-lg mt-1">Em andamento</div>
        </div>

        {/* ---------------- ENTREGUES ---------------- */}
        <div className="flex flex-col items-center">
          <div className="text-[#e6c068] text-xl font-bold mb-2">Entregues</div>

          <div
            className="text-6xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1px black" }}
          >
            177
          </div>

          <div className="text-red-400 font-bold text-lg mt-1">
            64.4% <span className="text-white text-base">de 275</span>
          </div>

          <div className="text-gray-300 text-lg">Entregues</div>
        </div>

        {/* ---------------- HANDOVERS ---------------- */}
        <div className="flex flex-col items-center">
          <div className="text-[#e6c068] text-xl font-bold mb-2">Handovers</div>

          <div
            className="text-6xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1px black" }}
          >
            7
          </div>

          <div className="text-gray-300 text-lg mt-1">Em andamento</div>

          <div
            className="text-5xl font-extrabold text-white leading-none mt-2"
            style={{ WebkitTextStroke: "1px black" }}
          >
            42
          </div>

          <div className="text-gray-300 text-lg">Entregues</div>
        </div>
      </div>

      {/* ======= ACCOUNT (MÊS) ======= */}
      {/* Linha ACCOUNT com bandeira da China */}
      <div className="flex items-center gap-2 text-sm text-white mt-4">
        <span className="fi fi-cn fis"></span>

        <span>ACCOUNT (MÊS): $3.803,05 / R$ 20.298,02</span>
      </div>
    </div>
  );
}

//
// ===================================================================
// IMPORTAÇÃO CARD
// ===================================================================
//
function ImportacaoCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <div className="text-purple-300 text-2xl font-bold mb-4">Importação</div>

      <div className="grid grid-cols-2 text-center">
        <div>
          <div className="text-5xl font-bold">274</div>
          <div className="text-gray-300 text-sm">Total Pedidos</div>
        </div>
        <div>
          <div className="text-5xl font-bold">26</div>
          <div className="text-gray-300 text-sm">Atracam</div>
        </div>
      </div>

      <div className="mt-4 text-gray-300 text-sm">
        China: 188
        <br />
        Logística: 74
        <br />
        Desembaraço: 12
      </div>
    </div>
  );
}

//
// ===================================================================
// CSAT CARD
// ===================================================================
//
function CSATCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <div className="text-[#ffb347] text-2xl font-bold mb-4">CSAT</div>
      <div className="text-gray-300">
        Muito boa: 24
        <br />
        Excelente: 9<br />
        Boa: 8<br />
        Regular: 1<br />
        Ruim: 1
      </div>
    </div>
  );
}

//
// ===================================================================
// REPUTAÇÃO CARD
// ===================================================================
//
function ReputacaoCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <div className="text-[#ffb347] text-2xl font-bold mb-4">
        Reputação 12P
      </div>

      <div className="text-gray-300">
        Faturamento: R$ 1.278.288,47
        <br />
        Estorno: R$ 113.596
        <br />
        Reembolso: R$ 59.389
        <br />
        <br />
        Nota CSAT: <span className="text-white text-3xl font-bold">4,60%</span>
        <br />
        Reclame Aqui: 0
      </div>
    </div>
  );
}

//
// ===================================================================
// DÓLAR / NPS / BHAG CARD
// ===================================================================
//
function DNBCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <div className="text-[#e6c068] text-2xl font-bold mb-4">
        Dólar / NPS / BHAG
      </div>

      <div className="text-gray-300">
        <span className="text-green-400 font-bold">Dólar:</span> $5,34
        <br />
        <span className="text-orange-400 font-bold">NPS:</span> 3,63
        <br />
        <span className="text-yellow-300 font-bold">BHAG:</span> 1 / 100
      </div>
    </div>
  );
}
