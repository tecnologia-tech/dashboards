import React from "react";
import lateralImg from "../../assets/Geral/Geral.png";
import { PieChart, Pie, Cell } from "recharts";

/* ============================================================
   ====================   COMPONENTE PRINCIPAL   ===============
   ============================================================ */
export default function Geral() {
  return (
    <div className="w-full h-screen bg-black text-white flex overflow-hidden">
      {/* ==================== LATERAL ESQUERDA ==================== */}
      <div className="w-[260px] min-w-[260px] h-full">
        <img src={lateralImg} className="w-full h-full object-cover" />
      </div>

      {/* ==================== ÁREA PRINCIPAL ==================== */}
      <div className="flex flex-col flex-1 overflow-hidden px-6 pb-4">
        {/* ==================== RINGS (Topo) ==================== */}
        <div className="flex justify-between mt-4 px-4">
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

        {/* ==================== CARDS DO MEIO ==================== */}
        <div className="grid grid-cols-3 gap-6 mt-5 h-[360px]">
          <OnboardingCard />
          <ComprasCard />
          <ImportacaoCard />
        </div>

        {/* ==================== CARDS INFERIORES ==================== */}
        <div className="grid grid-cols-2 gap-6 mt-4 h-[300px]">
          <CSATCard />
          <ReputacaoCard />
        </div>

        {/* ==================== FOOTER — DNB ==================== */}
        <div className="w-full mt-3">
          <DNBCard />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ====================   RING (ANÉIS)   ======================
   ============================================================ */
function Ring({ title, value, estornos, meta, percent }) {
  const size = 240;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center select-none">
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

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[#e6c068] text-3xl font-bold">{title}</div>
          <div
            className="text-5xl font-extrabold text-white leading-none"
            style={{ WebkitTextStroke: "1.2px black" }}
          >
            {value}
          </div>
          <div className="text-lg text-gray-300 mt-1">Estornos: {estornos}</div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 text-4xl font-extrabold text-white"
          style={{ bottom: 10, WebkitTextStroke: "1.2px black" }}
        >
          {percent}%
        </div>
      </div>

      <div className="text-xl font-bold text-[#e6c068] mt-2">Meta: {meta}</div>
    </div>
  );
}

/* ============================================================
   ====================   ONBOARDING CARD   ===================
   ============================================================ */
function OnboardingCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6 flex flex-col">
      <h2 className="text-3xl font-extrabold text-[#e6c068] text-center mb-4 uppercase">
        Onboarding
      </h2>

      <div className="flex justify-between">
        {/* Número grande */}
        <div className="flex flex-col items-center justify-center w-[200px]">
          <div
            className="text-8xl font-extrabold text-white"
            style={{ WebkitTextStroke: "2px black" }}
          >
            98
          </div>
          <div className="text-3xl text-gray-300 -mt-2">Clientes</div>
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-6 mt-3">
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
      <div className="w-14 h-14 rounded-full bg-gray-500" />
      <div>
        <div className="text-xl text-white font-bold">{name}</div>
        <div className="text-gray-300 text-lg">{count} Clientes</div>
      </div>
    </div>
  );
}

/* ============================================================
   ========================   COMPRAS   ========================
   ============================================================ */
function ComprasCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <h2 className="text-3xl font-bold text-[#e6c068] text-center mb-4">
        Compras
      </h2>

      <div className="flex justify-between px-4 mt-2">
        {/* SIMULAÇÕES */}
        <div className="flex flex-col items-center">
          <div className="text-xl text-[#e6c068] font-bold">Simulações</div>
          <div
            className="text-7xl font-extrabold"
            style={{ WebkitTextStroke: "1px black" }}
          >
            15
          </div>
          <div className="text-gray-300 text-xl mt-1">Em andamento</div>
        </div>

        {/* ENTREGUES */}
        <div className="flex flex-col items-center">
          <div className="text-xl text-[#e6c068] font-bold">Entregues</div>
          <div
            className="text-7xl font-extrabold"
            style={{ WebkitTextStroke: "1px black" }}
          >
            177
          </div>
          <div className="text-red-400 text-xl font-bold mt-1">
            64.4% <span className="text-white text-lg">de 275</span>
          </div>
        </div>

        {/* HANDOVER */}
        <div className="flex flex-col items-center">
          <div className="text-xl text-[#e6c068] font-bold">Handovers</div>
          <div
            className="text-7xl font-extrabold"
            style={{ WebkitTextStroke: "1px black" }}
          >
            7
          </div>
          <div className="text-gray-300 text-xl mt-1">Em andamento</div>

          <div
            className="text-6xl font-extrabold text-white mt-2"
            style={{ WebkitTextStroke: "1px black" }}
          >
            42
          </div>
          <div className="text-gray-300 text-lg">Entregues</div>
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="flex items-center gap-2 text-white text-lg mt-4">
        <span className="fi fi-cn fis"></span>
        <span>ACCOUNT (MÊS): $3.803,05 / R$ 20.298,02</span>
      </div>
    </div>
  );
}

/* ============================================================
   =====================   IMPORTAÇÃO   ========================
   ============================================================ */
function ImportacaoCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <h2 className="text-3xl font-bold text-[#e6c068] text-center mb-4">
        Importação
      </h2>

      <div className="flex justify-between px-4">
        <div className="flex flex-col items-center">
          <div className="text-xl text-gray-300 mb-1">Total Pedidos</div>
          <div
            className="text-7xl font-extrabold text-white"
            style={{ WebkitTextStroke: "1px black" }}
          >
            274
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xl text-gray-300">Atracam esse mês</div>

          <div className="flex items-center gap-3">
            <span className="text-7xl text-[#65b5ff]">⚓</span>
            <span
              className="text-7xl font-extrabold text-white"
              style={{ WebkitTextStroke: "1px black" }}
            >
              26
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-xl text-gray-300 space-y-1">
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

/* ============================================================
   ========================== CSAT =============================
   ============================================================ */
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
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6">
      <div className="text-[#e6c068] text-3xl font-bold text-center mb-4">
        CSAT
      </div>

      <div className="flex flex-col gap-4">
        {data.map((i) => (
          <div key={i.label} className="flex items-center gap-4">
            <div className="w-[140px] text-lg text-gray-300">{i.label}</div>

            <div className="flex-1 bg-[#222] h-6 rounded-lg overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${(i.value / max) * 100}%`,
                  backgroundColor: i.color,
                }}
              ></div>
            </div>

            <div className="text-xl font-bold w-[50px] text-right">
              {i.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   =====================   REPUTAÇÃO   =========================
   ============================================================ */
function ReputacaoCard() {
  const data = [
    { name: "Faturamento", value: 1278288 },
    { name: "Estorno", value: 113596 },
    { name: "Reembolso", value: 59389 },
  ];

  const COLORS = ["#4caf50", "#ff3b3b", "#ff8c00"];

  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl p-6 flex justify-between items-center">
      <div className="text-xl">
        <div className="text-[#e6c068] text-3xl font-bold mb-4">
          Reputação 12P
        </div>

        <div className="text-lg text-gray-300 leading-relaxed">
          <span className="text-green-400 font-bold">FATURAMENTO:</span> R$
          1.290.315,47 <br />
          <span className="text-orange-400 font-bold">ESTORNO:</span> R$ 113.596{" "}
          <br />
          <span className="text-red-500 font-bold">REEMBOLSO:</span> R$ 59.389{" "}
          <br />
        </div>

        <div className="text-5xl font-extrabold mt-4">4,60%</div>
        <div className="text-[#e6c068] text-2xl font-bold mt-3">
          RECLAME AQUI: <span className="text-white text-4xl ml-3">0</span>
        </div>
      </div>

      <PieChart width={260} height={260}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}

/* ============================================================
   ========================   DNB FOOTER   =====================
   ============================================================ */
function DNBCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#e6c068] rounded-xl px-10 py-4 flex items-center justify-between text-2xl">
      <div className="flex items-center gap-2">
        <span className="text-[#8ecf8f] font-bold underline">Dólar</span>
        <span>$5,34</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[#ffb347] font-bold underline">NPS</span>
        <span>3,63</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[#e6c068] font-bold underline">BHAG 12P</span>
        <span>1 / 100</span>
      </div>
    </div>
  );
}
