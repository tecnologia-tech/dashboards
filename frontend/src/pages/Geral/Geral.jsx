import React from "react";
import lateralImg from "../../assets/Geral/Geral.png";
import { PieChart, Pie, Cell } from "recharts";

export default function Geral() {
  return (
    <div className="w-full h-screen bg-black text-white flex overflow-hidden">
      {/* ==================== LATERAL ESQUERDA ===================== */}
      <div className="w-[240px] min-w-[240px] h-full">
        <img src={lateralImg} className="w-full h-full object-cover" />
      </div>

      {/* ==================== ÁREA PRINCIPAL ======================= */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ===== RINGS (23%) ===== */}
        <div className="flex-[23] flex justify-between items-center min-h-0">
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

        {/* ===== CARDS (38%) ===== */}
        <div className="flex-[38] grid grid-cols-3 min-h-0 ga ">
          <OnboardingCard />
          <ComprasCard />
          <ImportacaoCard />
        </div>

        {/* ===== CSAT + REPUTAÇÃO (29%) ===== */}
        <div className="flex-[29] grid grid-cols-2 min-h-0 ga ">
          <CSATCard />
          <ReputacaoCard />
        </div>

        {/* ===== FOOTER (10%) ===== */}
        <div className="p-0 m-0">
          <DNBCard />
        </div>
      </div>
    </div>
  );
}

//
// ================================================================
// RINGS — DOURADOS
// ================================================================
function Ring({ title, value, estornos, meta, percent }) {
  const size = 220;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center m-0 p-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.15)"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[#e6c068] text-4xl font-bold whitespace-nowrap">
            {title}
          </div>

          <div
            className="text-5xl font-extrabold text-white leading-none whitespace-nowrap"
            style={{ WebkitTextStroke: "1px black" }}
          >
            {value}
          </div>

          <div
            className="text-3xl text-gray-300 whitespace-nowrap"
            style={{ WebkitTextStroke: "0.5px black" }}
          >
            Estornos: {estornos}
          </div>
        </div>

        {/* PORCENTAGEM */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-5xl font-extrabold text-white whitespace-nowrap"
          style={{ bottom: 4, WebkitTextStroke: "1.5px black" }}
        >
          {percent}%
        </div>
      </div>

      <div className="text-4xl font-bold text-[#e6c068] whitespace-nowrap">
        Meta {meta}
      </div>
    </div>
  );
}

//
// =====================================================================
// ONBOARDING CARD
// =====================================================================
function OnboardingCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] flex flex-col p-2">
      <h2 className="text-6xl text-[#e6c068] font-extrabold text-center mb-2">
        Onboarding
      </h2>

      <div className="flex h-full items-center">
        <div className="flex flex-col justify-center items-center w-[220px]">
          <div
            className="text-[150px] font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "3px black" }}
          >
            98
          </div>
          <div className="text-4xl text-gray-300">Clientes</div>
        </div>

        <div className="flex flex-col justify-center gap-4 ml-6">
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
      <div className="w-16 h-16 rounded-full bg-gray-500"></div>

      <div className="flex flex-col leading-tight">
        <div className="text-4xl text-white font-bold">{name}</div>
        <div className="text-3xl text-gray-300">{count} Clientes</div>
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
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-2 flex flex-col">
      <h2 className="text-6xl text-[#e6c068] text-center font-extrabold mb-4">
        Compras
      </h2>

      <div className="flex flex-col flex-1 px-6">
        {/* Linha 1 */}
        <div className="flex justify-between flex-1 mb-4">
          <div className="flex flex-col items-center flex-1">
            <div className="text-4xl text-[#e6c068] font-bold">Simulações</div>
            <div
              className="text-[75px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              15
            </div>
            <div className="text-3xl text-gray-300 mt-1">Em andamento</div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-4xl text-[#e6c068] font-bold">Entregues</div>
            <div
              className="text-[75px] font-extrabold leading-none mt-2"
              style={{ WebkitTextStroke: "3px black" }}
            >
              177
            </div>
            <div className="text-3xl font-bold text-red-400 mt-1">
              64.4% <span className="text-white text-2xl">de 275</span>
            </div>
          </div>
        </div>

        {/* Handovers */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-4xl text-[#e6c068] font-bold mb-2">
            Handovers
          </div>

          <div className="flex justify-center items-start ga6">
            <div className="flex flex-col items-center">
              <div
                className="text-[65px] font-extrabold leading-none"
                style={{ WebkitTextStroke: "3px black" }}
              >
                7
              </div>
              <div className="text-3xl text-gray-300 mt-1">Em andamento</div>
            </div>

            <div className="flex flex-col items-center">
              <div
                className="text-[65px] font-extrabold text-white leading-none"
                style={{ WebkitTextStroke: "3px black" }}
              >
                42
              </div>
              <div className="text-3xl text-gray-300 mt-1">Entregues</div>
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
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-2 flex flex-col justify-center items-center">
      <h2 className="text-6xl text-[#e6c068] font-extrabold text-center mb-4">
        Importação
      </h2>

      <div className="flex justify-center items-start gap-20 mb-4">
        <div className="flex flex-col items-center">
          <div className="text-3xl text-gray-300 mb-1">Total Pedidos</div>
          <div
            className="text-[90px] font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "2px black" }}
          >
            274
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-3xl text-gray-300 mb-1">Atracam esse mês</div>
          <div
            className="text-[90px] font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "2px black" }}
          >
            26
          </div>
        </div>
      </div>

      <div className="text-4xl text-gray-300 leading-snug text-center">
        <p>
          Pedidos na China: <span className="text-white font-bold">188</span>
        </p>
        <p>
          Pedidos em Logística: <span className="text-white font-bold">74</span>
        </p>
        <p>
          Pedidos no Desembaraço:{" "}
          <span className="text-white font-bold">12</span>
        </p>
      </div>
    </div>
  );
}

//
// =====================================================================
// CSAT — CENTRALIZADO E GRANDE
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
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-2 flex flex-col">
      <div className="text-4xl font-bold text-[#e6c068] text-center mb-2">
        CSAT
      </div>

      <div className="flex flex-col justify-center flex-1 gap-2">
        {data.map((i) => (
          <div key={i.label} className="flex items-center gap-3">
            {/* Label */}
            <div className="w-[160px] text-2xl text-gray-300">{i.label}</div>

            {/* Barra */}
            <div className="flex-1 bg-[#222] h-7 rounded-lg overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${(i.value / max) * 100}%`,
                  backgroundColor: i.color,
                }}
              ></div>
            </div>

            {/* Valor */}
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
// REPUTAÇÃO
// =====================================================================
function ReputacaoCard() {
  const data = [
    { name: "Faturamento", value: 1278288 },
    { name: "Estorno", value: 113596 },
    { name: "Reembolso", value: 59389 },
  ];

  const COLORS = ["#4caf50", "#ff3b3b", "#ff8c00"];

  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] p-4 flex items-center justify-between">
      {/* ==== BLOCO ESQUERDO ==== */}
      <div className="flex flex-col justify-center h-full pl-4">
        <h2 className="text-5xl font-extrabold text-[#e6c068] mb-4 tracking-wide">
          Reputação 12P
        </h2>

        <div className="space-y-1 text-2xl leading-snug">
          <p>
            <span className="text-green-400 font-bold">FATURAMENTO:</span>{" "}
            <span className="text-gray-200">R$ 1.290.315,47</span>
          </p>
          <p>
            <span className="text-orange-400 font-bold">ESTORNO:</span>{" "}
            <span className="text-gray-200">R$ 113.596</span>
          </p>
          <p>
            <span className="text-red-500 font-bold">REEMBOLSO:</span>{" "}
            <span className="text-gray-200">R$ 59.389</span>
          </p>
        </div>

        <div
          className="text-7xl font-extrabold text-white mt-4 leading-none"
          style={{ WebkitTextStroke: "2px black" }}
        >
          4,60%
        </div>

        <div className="text-[#e6c068] text-3xl font-bold mt-3">
          RECLAME AQUI:{" "}
          <span
            className="text-white text-5xl"
            style={{ WebkitTextStroke: "1px black" }}
          >
            0
          </span>
        </div>
      </div>

      {/* ==== GRÁFICO ==== */}
      <div className="flex justify-center items-center pr-6">
        <PieChart width={280} height={280}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
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
