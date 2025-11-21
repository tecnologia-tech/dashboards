import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const FONT_IMPORT =
  '@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");\n@keyframes goldenTextBreath {0% {text-shadow: 0 0 4px rgba(230,192,104,0.25), 0 0 9px rgba(255,190,111,0.18);}50% {text-shadow: 0 0 8px rgba(230,192,104,0.35), 0 0 14px rgba(255,190,111,0.26);}100% {text-shadow: 0 0 5px rgba(230,192,104,0.28), 0 0 10px rgba(255,190,111,0.2);}}';

const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

@keyframes heatShimmer {
  0% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(230,192,104,0.15)); }
  50% { transform: translate3d(0.4px,-0.3px,0) skewX(-0.5deg); filter: drop-shadow(0 0 2px rgba(255,190,111,0.25)); }
  100% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(230,192,104,0.18)); }
}

@keyframes goldParticleRise {
  0% { transform: translateY(0) translateX(0) scale(0.7); opacity: 0.2; }
  50% { opacity: 0.55; }
  100% { transform: translateY(-80px) translateX(10px) scale(1); opacity: 0; }
}

/* partículas dos rings */
.gold-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.gold-particles span {
  position: absolute;
  bottom: -10px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255,190,111,0.9), rgba(230,192,104,0.35));
  border-radius: 999px;
  filter: blur(1px);
  opacity: 0.6;
  animation: goldParticleRise 4.5s linear infinite;
}
`;

const HERO_BACKGROUND =
  "radial-gradient(220% 140% at 10% 0%, rgba(255,190,111,0.05), transparent 55%), radial-gradient(220% 140% at 90% 30%, rgba(230,192,104,0.05), transparent 55%), linear-gradient(145deg, rgba(10,8,6,0.98), rgba(4,2,2,0.96))";

const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(12,10,8,0.94), rgba(4,4,4,0.96))";

const RUNE_BACKGROUND =
  "radial-gradient(2px 6px at 12% 90%, rgba(230,192,104,0.10), transparent 60%), radial-gradient(2px 7px at 32% 95%, rgba(255,190,111,0.08), transparent 60%), radial-gradient(3px 8px at 54% 92%, rgba(255,214,170,0.06), transparent 60%), radial-gradient(2px 6px at 76% 94%, rgba(230,192,104,0.08), transparent 60%), radial-gradient(3px 9px at 88% 90%, rgba(255,190,111,0.08), transparent 60%), repeating-linear-gradient(110deg, rgba(230,192,104,0.035) 0 2px, transparent 2px 12px), radial-gradient(120% 140% at 50% 50%, rgba(230,192,104,0.05), transparent 65%)";

/* cor única de “linha” que você pediu */
const BORDER_COLOR = "1px solid rgba(230,192,104,0.4)";

export default function Geral() {
  return (
    <div
      className="w-full h-screen grid grid-rows-[35%_30%_31%_4%] bg-black text-white overflow-hidden font-['Cinzel']"
      style={{
        backgroundImage: HERO_BACKGROUND,
        backgroundSize: "cover",
        "--gold-light": "#F2C572",
        "--gold-mid": "#E5A844",
        "--gold-dark": "#C38A28",
      }}
    >
      <style>{FONT_IMPORT + "\n" + ANIMATION_STYLES}</style>

      <style>{`
        .titulo-card {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
          font-size: 40px;
          font-weight: 800;
          font-family: 'Cinzel', serif;
          color: var(--gold-light);
          letter-spacing: 0.08em;
          text-shadow: 0 0 6px rgba(230,192,104,0.35);
          animation: goldenTextBreath 6s ease-in-out infinite;
          white-space: nowrap;
        }

        /* todos os números em branco */
        .numero-branco,
        .numero-branco * {
          color: #ffffff !important;
          text-shadow: none !important;
        }
      `}</style>

      {/* ================= RINGS ================= */}
      <div className="flex justify-between items-center overflow-hidden px-10">
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
      <div className="grid grid-cols-3 gap-[2px] pb-2 px-[4px] auto-rows-fr">
        <OnboardingCard />
        <ComprasCard />
        <ImportacaoCard />
      </div>

      {/* ================= CSAT + REPUTAÇÃO ================= */}
      <div className="grid grid-cols-2 gap-[2px] overflow-hidden px-[4px]">
        <CSATCard />
        <ReputacaoCard />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="overflow-hidden px-[4px]">
        <DNBCard />
      </div>
    </div>
  );
}

//
// ================================================================
// RINGS — MENOS POLUIÇÃO, MAIS LEITURA DE LONGE
// ================================================================
function Ring({ title, value, estornos, meta, percent }) {
  const size = 280;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center overflow-hidden">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          borderRadius: 30,
          overflow: "hidden",
          border: "none",
          boxShadow: "none",
          background: "transparent",
        }}
      >
        {/* partículas internas */}
        <div className="gold-particles">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${8 + ((i * 7.5) % 84)}%`,
                animationDelay: `${i * 0.28}s`,
                animationDuration: `${4 + (i % 4) * 0.45}s`,
                width: `${4 + (i % 3)}px`,
                height: `${4 + (i % 3)}px`,
              }}
            />
          ))}
        </div>

        <svg width={size} height={size}>
          <defs>
            <linearGradient id="goldLux" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8C6B29" />
              <stop offset="50%" stopColor="#F2D788" />
              <stop offset="100%" stopColor="#8C6B29" />
            </linearGradient>
          </defs>

          {/* trilho */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(40,40,40,0.8)"
            strokeWidth={stroke}
            fill="none"
          />

          {/* ativo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#goldLux)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              filter: "drop-shadow(0 0 14px rgba(230,192,104,0.55))",
            }}
          />
        </svg>

        {/* centro do ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <div
            className="text-4xl md:text-5xl font-extrabold tracking-wide whitespace-nowrap"
            style={{
              color: "#f2d788",
              textShadow: "0 0 6px rgba(230,192,104,0.35)",
              animation:
                "goldenTextBreath 6s ease-in-out infinite, heatShimmer 18s ease-in-out infinite",
            }}
          >
            {title}
          </div>

          <div className="mt-1 text-5xl md:text-6xl font-extrabold whitespace-nowrap numero-branco">
            {value}
          </div>

          <div
            className="mt-1 text-2xl font-bold"
            style={{
              color: "#e6c068",
              textShadow: "0 0 6px rgba(230,192,104,0.3)",
            }}
          >
            Estornos: <span className="numero-branco">{estornos}</span>
          </div>
        </div>

        {/* porcentagem */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-5xl md:text-6xl font-extrabold numero-branco"
          style={{
            bottom: -4,
          }}
        >
          {percent}%
        </div>
      </div>

      <div
        className="mt-2 text-3xl md:text-4xl font-bold"
        style={{ color: "var(--gold-light)" }}
      >
        Meta <span className="numero-branco">{meta}</span>
      </div>
    </div>
  );
}

//
// =====================================================================
// ONBOARDING
// =====================================================================
function OnboardingCard() {
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-1"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "150% 150%, 120% 120%",
      }}
    >
      <h2 className="titulo-card">Onboarding</h2>

      <div className="flex-1 pt-2 flex items-center justify-between gap-6">
        <div className="flex flex-col justify-center items-center flex-[0.9]">
          <div className="text-[92px] font-extrabold leading-none numero-branco">
            98
          </div>
          <div
            className="text-3xl"
            style={{ color: "#e6c068", letterSpacing: "0.08em" }}
          >
            CLIENTES
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 flex-[1.1]">
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
      <div
        className="w-14 h-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #f2d788, #4a3a2a 60%, #120f0b 100%)",
          boxShadow: "0 0 10px rgba(230,192,104,0.35)",
        }}
      />
      <div className="flex flex-col leading-tight">
        <div
          className="text-3xl font-bold"
          style={{
            color: "#f2d788",
            textShadow: "0 0 6px rgba(230,192,104,0.3)",
          }}
        >
          {name}
        </div>
        <div className="text-2xl">
          <span className="numero-branco">{count}</span>{" "}
          <span style={{ color: "#e6c068" }}>Clientes</span>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// COMPRAS
// =====================================================================
function ComprasCard() {
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-1"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "150% 150%, 120% 120%",
      }}
    >
      <h2 className="titulo-card">Compras</h2>

      <div className="flex-1 pt-2 flex flex-col">
        {/* linha 1 */}
        <div className="flex justify-between px-4 mb-2">
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Simulações
            </div>
            <div className="mt-1 text-[56px] font-extrabold leading-none numero-branco">
              15
            </div>
            <div className="text-xl" style={{ color: "#d0c3a4" }}>
              Em andamento
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Entregues
            </div>
            <div className="mt-1 text-[56px] font-extrabold leading-none numero-branco">
              177
            </div>
            <div className="text-xl font-bold">
              <span style={{ color: "#ff7a7a" }}>64.4%</span>{" "}
              <span className="text-lg" style={{ color: "#f5f0e4" }}>
                de 275
              </span>
            </div>
          </div>
        </div>

        {/* handovers */}
        <div className="text-center text-3xl font-bold text-[var(--gold-light)] mb-1">
          Handovers
        </div>

        <div className="flex justify-center items-center gap-10 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: "#d0c3a4" }}>
              Em andamento
            </span>
            <span className="text-[46px] font-extrabold leading-none numero-branco">
              7
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[46px] font-extrabold leading-none numero-branco">
              42
            </span>
            <span className="text-xl" style={{ color: "#d0c3a4" }}>
              Entregues
            </span>
          </div>
        </div>

        {/* linha separadora no estilo que você gostou */}
        <div
          className="my-1"
          style={{ borderTop: "1px solid rgba(230,192,104,0.4)" }}
        />

        {/* account */}
        <div className="flex items-center justify-center gap-3 mt-auto pb-2">
          <img src="/china.png" className="w-10 h-6 rounded-sm" />
          <span className="text-2xl font-bold text-[var(--gold-light)]">
            ACCOUNT (MÊS):
          </span>
          <span className="text-2xl font-semibold numero-branco">
            $7.151,90
          </span>
          <span className="text-xl" style={{ color: "#d0c3a4" }}>
            /
          </span>
          <span className="text-2xl font-semibold numero-branco">
            R$ 38.618,82
          </span>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// IMPORTAÇÃO
// =====================================================================
function ImportacaoCard() {
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-1 h-full overflow-hidden"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "150% 150%, 120% 120%",
      }}
    >
      <h2 className="titulo-card">Importação</h2>

      <div className="flex-1 pt-2 flex flex-col px-3 overflow-hidden">
        <div className="flex justify-between flex-1 mb-3">
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Total Pedidos
            </div>
            <div className="mt-1 text-[60px] font-extrabold leading-none numero-branco">
              274
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Atracam esse mês
            </div>
            <div className="mt-1 text-[56px] font-extrabold leading-none numero-branco">
              26
            </div>
          </div>
        </div>

        <div className="text-2xl leading-snug text-center space-y-1 mb-10">
          <p style={{ color: "#d0c3a4" }}>
            Pedidos na China:{" "}
            <span className="numero-branco font-bold">188</span>
          </p>
          <p style={{ color: "#d0c3a4" }}>
            Pedidos em Logística:{" "}
            <span className="numero-branco font-bold">74</span>
          </p>
          <p style={{ color: "#d0c3a4" }}>
            Pedidos no Desembaraço:{" "}
            <span className="numero-branco font-bold">12</span>
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
    { label: "Muito boa", value: 24, color: "#5FA6E8" },
    { label: "Excelente", value: 9, color: "#8BCF7A" },
    { label: "Boa", value: 8, color: "#E6A347" },
    { label: "Regular", value: 1, color: "#E6A347" },
    { label: "Ruim", value: 1, color: "#E85B5B" },
  ];

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div
      className="px-4 py-1 flex flex-col rounded-xl"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "150% 150%, 120% 120%",
      }}
    >
      <h2 className="titulo-card">CSAT</h2>

      <div className="pt-1 flex flex-col justify-center flex-1 gap-1">
        {data.map((i) => (
          <div key={i.label} className="flex items-center gap-4">
            <div className="w-[170px] text-2xl" style={{ color: "#f5e7c8" }}>
              {i.label}
            </div>

            <div
              className="flex-1 h-9 rounded-lg overflow-hidden border shadow-[inset_0_0_8px_rgba(0,0,0,0.65)]"
              style={{
                borderColor: "#111",
                background: "linear-gradient(90deg, #181818, #101010, #181818)",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${(i.value / max) * 100}%`,
                  backgroundColor: i.color,
                  boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                }}
              />
            </div>

            <div className="text-3xl font-bold w-[60px] text-right numero-branco">
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

  const COLORS = ["#8BCF7A", "#E85B5B", "#E6A347"];

  return (
    <div
      className="flex flex-col rounded-xl px-2 py-1"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "150% 150%, 120% 120%",
      }}
    >
      <h2 className="titulo-card">Reputação 12P</h2>

      <div className="flex-1 pt-1 grid grid-cols-[2fr_1fr_1fr] gap-1 items-center">
        {/* texto esquerdo */}
        <div className="flex flex-col text-3xl leading-tight space-y-2 pl-2 whitespace-nowrap">
          <div>
            <span className="font-bold" style={{ color: "#8BCF7A" }}>
              FATURAMENTO:
            </span>
            <span className="numero-branco"> R$ 1.290.315,47</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "var(--gold-mid)" }}>
              ESTORNO:
            </span>
            <span className="numero-branco"> R$ 113.596</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "#E85B5B" }}>
              REEMBOLSO:
            </span>
            <span className="numero-branco"> R$ 59.389</span>
          </div>
          <div className="pt-2">
            <span className="font-bold" style={{ color: "var(--gold-light)" }}>
              RECLAME AQUI:
            </span>
            <span className="numero-branco text-3xl font-extrabold"> 0</span>
          </div>
        </div>

        {/* número central */}
        <div className="flex justify-center items-center">
          <div
            className="text-7xl md:text-8xl font-extrabold numero-branco"
            style={{
              textShadow: "0 0 12px rgba(230,192,104,0.4)",
              animation: "goldenTextBreath 6s ease-in-out infinite",
            }}
          >
            4,60%
          </div>
        </div>

        {/* donut */}
        <div className="flex justify-center items-center">
          <PieChart width={230} height={230}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
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
// FOOTER – DNB / NPS / BHAG
// =====================================================================
function DNBCard() {
  return (
    <div
      className="h-full flex items-center justify-around text-2xl rounded-xl px-4"
      style={{
        border: BORDER_COLOR,
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "180% 180%, 120% 120%",
      }}
    >
      <div>
        <span className="font-bold underline" style={{ color: "#8BCF7A" }}>
          Dólar
        </span>{" "}
        <span className="numero-branco">$5,34</span>
      </div>
      <div>
        <span className="font-bold underline" style={{ color: "#E6A347" }}>
          NPS
        </span>{" "}
        <span className="numero-branco">3,63</span>
      </div>
      <div>
        <span className="font-bold underline" style={{ color: "#F2C572" }}>
          BHAG 12P
        </span>{" "}
        <span className="numero-branco">1 / 100</span>
      </div>
    </div>
  );
}
