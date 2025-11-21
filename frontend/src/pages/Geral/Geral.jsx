import React from "react";
import { PieChart, Pie, Cell } from "recharts";

export default function Geral() {
  return (
    <div
      className="w-full h-screen bg-black text-white grid 
      grid-rows-[30%_37%_29%_5%] overflow-hidden"
    >
      {/* ================= RINGS ================= */}
      <div className="flex justify-around items-center px-6 overflow-hidden">
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

      {/* ================= CARDS DO MEIO ================= */}
      <div className="grid grid-cols-3 gap-4 px-4 pb-2 h-full overflow-hidden">
        <OnboardingCard />
        <ComprasCard />
        <ImportacaoCard />
      </div>

      {/* ================= CSAT + REPUTAÇÃO ================= */}
      <div className="grid grid-cols-2 gap-4 px-4 overflow-hidden">
        <CSATCard />
        <ReputacaoCard />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-4 overflow-hidden">
        <DNBCard />
      </div>
    </div>
  );
}

//
// ================================================================
// RINGS — ESCALÁVEL PARA TV 1080p E 4K
// ================================================================
function Ring({ title, value, estornos, meta, percent }) {
  const size = 270;
  const stroke = 25;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center overflow-hidden">
      <div
        className="relative"
        style={{ width: size, height: size, WebkitTextStroke: "2px black" }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={stroke}
            fill="none"
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gold)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />

          <defs>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a67820" />
              <stop offset="50%" stopColor="#ffd46b" />
              <stop offset="100%" stopColor="#a67820" />
            </linearGradient>
          </defs>
        </svg>

        {/* CENTRO DO RING */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-extrabold text-[#e6c068] tracking-wide whitespace-nowrap">
            {title}
          </div>
          <div
            className="text-6xl font-extrabold text-white whitespace-nowrap"
            style={{ WebkitTextStroke: "1px black" }}
          >
            {value}
          </div>
          <div
            className="text-2xl font-bold text-white"
            style={{ WebkitTextStroke: "0.5px black" }}
          >
            Estornos: {estornos}
          </div>
        </div>

        {/* PORCENTAGEM */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-6xl font-extrabold text-white"
          style={{ bottom: -10, WebkitTextStroke: "1.5px black" }}
        >
          {percent}%
        </div>
      </div>

      <div className="text-4xl font-bold text-[#e6c068] mt-2">Meta {meta}</div>
    </div>
  );
}

//
// =====================================================================
// ONBOARDING CARD
// =====================================================================
function OnboardingCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] flex flex-col p-2 min-w-0 overflow-hidden">
      <h2 className="text-5xl font-extrabold text-[#e6c068] tracking-wide text-center mb-2">
        Onboarding
      </h2>

      <div className="flex h-full items-center justify-around overflow-hidden">
        <div className="flex flex-col justify-center items-center">
          <div
            className="text-[120px] font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "3px black" }}
          >
            98
          </div>
          <div className="text-4xl text-gray-300">Clientes</div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <Person name="Jayanne" count="38" />
          <Person name="Jenifer" count="22" />
          <Person name="Rayssa" count="37" />
        </div>
      </div>
    </div>
  );
}

function Person({ name, count }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-500" />

      <div className="flex flex-col leading-tight">
        <div className="text-3xl text-white font-bold">{name}</div>
        <div className="text-2xl text-gray-300">{count} Clientes</div>
      </div>
    </div>
  );
}

//
// =====================================================================
// COMPRAS CARD
// =====================================================================
function ComprasCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-2 flex flex-col min-w-0 overflow-hidden">
      <h2 className="text-5xl font-extrabold text-[#e6c068] tracking-wide text-center mb-4">
        Compras
      </h2>

      <div className="flex flex-col flex-1 px-4 overflow-hidden">
        <div className="flex justify-between flex-1 mb-4">
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl text-[#e6c068] font-bold">Simulações</div>
            <div
              className="text-[70px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              15
            </div>
            <div className="text-2xl text-gray-300 mt-1">Em andamento</div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl text-[#e6c068] font-bold">Entregues</div>
            <div
              className="text-[70px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              177
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">
              64.4% <span className="text-white text-xl">de 275</span>
            </div>
          </div>
        </div>

        {/* Handovers */}
        <div className="flex flex-col items-center flex-1 overflow-hidden">
          <div className="text-3xl text-[#e6c068] font-bold mb-2">
            Handovers
          </div>

          <div className="flex justify-center items-start gap-10">
            <div className="flex flex-col items-center">
              <div
                className="text-[55px] font-extrabold leading-none"
                style={{ WebkitTextStroke: "3px black" }}
              >
                7
              </div>
              <div className="text-2xl text-gray-300 mt-1">Em andamento</div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="text-[55px] font-extrabold text-white leading-none"
                style={{ WebkitTextStroke: "3px black" }}
              >
                42
              </div>
              <div className="text-2xl text-gray-300 mt-1">Entregues</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// IMPORTAÇÃO CARD
// =====================================================================
function ImportacaoCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-2 flex flex-col min-w-0 overflow-hidden">
      {/* TÍTULO */}
      <h2 className="text-5xl font-extrabold text-[#e6c068] tracking-wide text-center mb-4">
        Importação
      </h2>

      {/* WRAPPER EXATAMENTE IGUAL AO DO COMPRAS */}
      <div className="flex flex-col flex-1 px-4 overflow-hidden">
        {/* LINHA PRINCIPAL - ALTURA AGORA É A MESMA */}
        <div className="flex justify-between flex-1 mb-4">
          {/* Total Pedidos */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl text-[#e6c068] font-bold">
              Total Pedidos
            </div>

            <div
              className="text-[70px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              274
            </div>
          </div>

          {/* Atracam esse mês */}
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl text-[#e6c068] font-bold">
              Atracam esse mês
            </div>

            <div
              className="text-[70px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              26
            </div>
          </div>
        </div>

        {/* LINHAS DE STATUS */}
        <div className="text-3xl text-gray-300 leading-snug text-center space-y-1 mb-4">
          <p>
            Pedidos na China: <span className="text-white font-bold">188</span>
          </p>
          <p>
            Pedidos em Logística:{" "}
            <span className="text-white font-bold">74</span>
          </p>
          <p>
            Pedidos no Desembaraço:{" "}
            <span className="text-white font-bold">12</span>
          </p>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// CSAT
// =====================================================================
function CSATCard() {
  const data = [
    { label: "Muito boa", value: 24, color: "#4A90E2" },
    { label: "Excelente", value: 9, color: "#8BC34A" },
    { label: "Boa", value: 8, color: "#FFCC66" },
    { label: "Regular", value: 1, color: "#FFA726" },
    { label: "Ruim", value: 1, color: "#FF5252" },
  ];

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-4 flex flex-col min-w-0 overflow-hidden">
      <div className="text-5xl font-extrabold text-[#e6c068] tracking-wide text-center mb-2">
        CSAT
      </div>

      <div className="flex flex-col justify-center flex-1 gap-3">
        {data.map((i) => (
          <div key={i.label} className="flex items-center gap-4">
            <div className="w-[160px] text-2xl text-gray-300">{i.label}</div>

            <div className="flex-1 bg-[#222] h-7 rounded-lg overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${(i.value / max) * 100}%`,
                  backgroundColor: i.color,
                }}
              />
            </div>

            <div className="text-3xl font-bold w-[50px] text-right text-white">
              {i.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//
// =====================================================================
// REPUTAÇÃO 12P
// =====================================================================
function ReputacaoCard() {
  const data = [
    { name: "Faturamento", value: 1278288 },
    { name: "Estorno", value: 113596 },
    { name: "Reembolso", value: 59389 },
  ];

  const COLORS = ["#4caf50", "#ff3b3b", "#ff8c00"];

  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-4 min-w-0 flex flex-col">
      {/* GRID AJUSTADO — COLUNA DO TEXTO = 2x */}
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-center h-full">
        {/* ====== TÍTULO ====== */}
        <h2 className="col-span-3 text-5xl font-extrabold text-[#e6c068] tracking-wide text-center mb-4 whitespace-nowrap">
          Reputação 12P
        </h2>

        {/* ====== COLUNA 1 — TEXTO ====== */}
        <div className="flex flex-col text-2xl leading-tight space-y-2 pl-2">
          <div>
            <span className="text-green-400 font-bold">FATURAMENTO:</span>{" "}
            <span className="text-gray-200 whitespace-nowrap">
              R$ 1.290.315,47
            </span>
          </div>

          <div>
            <span className="text-orange-400 font-bold">ESTORNO:</span>{" "}
            <span className="text-gray-200 whitespace-nowrap">R$ 113.596</span>
          </div>

          <div>
            <span className="text-red-500 font-bold">REEMBOLSO:</span>{" "}
            <span className="text-gray-200 whitespace-nowrap">R$ 59.389</span>
          </div>

          <div className="pt-2">
            <span className="text-[#e6c068] font-bold">RECLAME AQUI:</span>{" "}
            <span
              className="text-white text-3xl font-extrabold"
              style={{ WebkitTextStroke: "1px black" }}
            >
              0
            </span>
          </div>
        </div>

        {/* ====== COLUNA 2 — NÚMERO CENTRAL ====== */}
        <div className="flex justify-center items-center">
          <div
            className="text-7xl font-extrabold text-white"
            style={{ WebkitTextStroke: "2px black" }}
          >
            4,60%
          </div>
        </div>

        {/* ====== COLUNA 3 — GRÁFICO ====== */}
        <div className="flex justify-center items-center">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              stroke="#111"
              strokeWidth={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// FOOTER – DNB
// =====================================================================
function DNBCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] h-full flex items-center justify-around text-3xl">
      <div>
        <span className="text-[#8ecf8f] font-bold underline">Dólar</span> $5,34
      </div>
      <div>
        <span className="text-[#ffb347] font-bold underline">NPS</span> 3,63
      </div>
      <div>
        <span className="text-[#e6c068] font-bold underline">BHAG 12P</span> 1 /
        100
      </div>
    </div>
  );
}
