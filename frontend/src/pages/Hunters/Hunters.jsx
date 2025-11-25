import React from "react";
import huntersImg from "../../assets/Hunters/hunters.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const hunterPhotos = import.meta.glob("../../assets/Hunters/*.png", {
  eager: true,
});

const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

@keyframes fireSweep {
  0% { transform: translateY(20%); opacity: 0.05; }
  25% { transform: translateY(-10%); opacity: 0.14; }
  50% { transform: translateY(-30%); opacity: 0.08; }
  75% { transform: translateY(-60%); opacity: 0.12; }
  100% { transform: translateY(-100%); opacity: 0.05; }
}

@keyframes ashesRise {
  0% { background-position: 0 120%, 40% 130%, 80% 118%, 20% 126%; opacity: 0.07; }
  100% { background-position: 0 -30%, 40% -18%, 80% -20%, 20% -22%; opacity: 0.1; }
}

@keyframes emberField {
  0% { opacity: 0.04; transform: translateY(0); }
  50% { opacity: 0.08; transform: translateY(-8px); }
  100% { opacity: 0.04; transform: translateY(0); }
}

@keyframes goldenTextBreath {
  0% { text-shadow: 0 0 6px rgba(230,192,104,0.26), 0 0 12px rgba(255,122,26,0.16); filter: saturate(1); }
  50% { text-shadow: 0 0 10px rgba(230,192,104,0.36), 0 0 18px rgba(255,122,26,0.22); filter: saturate(1.07); }
  100% { text-shadow: 0 0 7px rgba(230,192,104,0.3), 0 0 14px rgba(255,122,26,0.18); filter: saturate(1.02); }
}

@keyframes heatShimmer {
  0% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(255,122,26,0.2)); }
  50% { transform: translate3d(0.4px,-0.2px,0) skewX(-0.6deg); filter: drop-shadow(0 0 2px rgba(230,192,104,0.25)); }
  100% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(255,122,26,0.18)); }
}

@keyframes heatWave {
  0% { transform: translateY(0) scaleY(1); opacity: 0.03; }
  45% { transform: translateY(-10px) scaleY(1.06); opacity: 0.06; }
  100% { transform: translateY(0) scaleY(1); opacity: 0.034; }
}

@keyframes moltenSweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 🔥 GLOW FULL HEIGHT NO CARD INTEIRO */
.hunter-full-glow {
  background:
    linear-gradient(
      to bottom,
      rgba(230,192,104,0.20) 0%,
      rgba(255,200,140,0.14) 25%,
      rgba(255,122,26,0.10) 50%,
      rgba(230,192,104,0.16) 75%,
      rgba(255,200,140,0.12) 100%
    );
  opacity: 0.55;
  mix-blend-mode: screen;
  filter: blur(28px);
  animation: hunterFullGlowBreath 7s ease-in-out infinite;
}

@keyframes hunterFullGlowBreath {
  0% { opacity: 0.35; transform: scaleY(0.96); }
  50% { opacity: 0.75; transform: scaleY(1.04); }
  100% { opacity: 0.35; transform: scaleY(0.96); }
}

/* 🔥 Glow interno da coluna esquerda */
.hunter-column-glow {
  background:
    linear-gradient(
      to bottom,
      rgba(230,192,104,0.28) 0%,
      rgba(255,200,140,0.18) 20%,
      rgba(255,122,26,0.14) 40%,
      rgba(230,192,104,0.22) 60%,
      rgba(255,200,140,0.16) 80%,
      transparent 100%
    );
  filter: blur(18px);
  opacity: 0.45;
  mix-blend-mode: screen;
  animation: hunterColumnBreath 9s ease-in-out infinite;
}

@keyframes hunterColumnBreath {
  0% { opacity: 0.30; }
  50% { opacity: 0.60; }
  100% { opacity: 0.30; }
}

/* ✨ PARTÍCULAS SUBINDO NO GAUGE (HUNTERS) */
.hunter-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hunter-particles span {
  position: absolute;
  bottom: -12px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255,200,140,0.95), rgba(255,122,26,0.45));
  border-radius: 999px;
  filter: blur(1px);
  opacity: 0.7;
  animation: hunterParticleRise 4s linear infinite;
}

@keyframes hunterParticleRise {
  0% {
    transform: translateY(0) translateX(0) scale(0.4);
    opacity: 0.2;
  }
  40% {
    opacity: 0.85;
  }
  100% {
    transform: translateY(-140px) translateX(10px) scale(1);
    opacity: 0;
  }
}

`;

const HERO_BACKGROUND =
  "radial-gradient(220% 140% at 10% 0%, rgba(255,122,26,0.06), transparent 55%), radial-gradient(220% 140% at 90% 30%, rgba(230,192,104,0.05), transparent 55%), linear-gradient(145deg, rgba(16,14,12,0.9), rgba(8,8,8,0.92))";

const METRIC_BACKGROUND =
  "linear-gradient(135deg, rgba(28,26,24,0.92), rgba(18,18,18,0.9)), radial-gradient(120% 120% at 20% 10%, rgba(255,122,26,0.06), transparent 50%), radial-gradient(120% 120% at 80% 80%, rgba(230,192,104,0.05), transparent 55%)";
const LEFT_BEFORE_BACKGROUND =
  "radial-gradient(90% 80% at 0% 50%, rgba(255,122,26,0.18), rgba(184,29,19,0.12), transparent 65%)";

const LEFT_AFTER_BACKGROUND =
  "linear-gradient(180deg, transparent 0%, rgba(255,122,26,0.07) 25%, rgba(184,29,19,0.08) 45%, transparent 70%)";

const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(20,18,16,0.92), rgba(10,10,10,0.9)), radial-gradient(120% 130% at 18% 10%, rgba(255,122,26,0.06), transparent 48%), radial-gradient(120% 140% at 80% 80%, rgba(230,192,104,0.05), transparent 55%), linear-gradient(180deg, rgba(16,16,16,0.55), rgba(10,10,10,0.4))";

const CARD_GLOW_BACKGROUND =
  "radial-gradient(120% 90% at 50% 6%, rgba(255,122,26,0.08), rgba(184,29,19,0.05), transparent 60%), conic-gradient(from 0deg, rgba(255,189,120,0.08), rgba(255,122,26,0.04), rgba(230,192,104,0.12), rgba(255,189,120,0.08))";

const CARD_RUNE_BACKGROUND =
  "radial-gradient(2px 6px at 12% 90%, rgba(230,192,104,0.13), transparent 60%), radial-gradient(2px 7px at 32% 95%, rgba(255,122,26,0.12), transparent 60%), radial-gradient(3px 8px at 54% 92%, rgba(255,214,170,0.1), transparent 60%), radial-gradient(2px 6px at 76% 94%, rgba(230,192,104,0.12), transparent 60%), radial-gradient(3px 9px at 88% 90%, rgba(255,122,26,0.1), transparent 60%), repeating-linear-gradient(110deg, rgba(230,192,104,0.06) 0 2px, transparent 2px 12px), radial-gradient(120% 140% at 50% 50%, rgba(230,192,104,0.04), transparent 65%)";

const RIGHT_SPARKS_BACKGROUND =
  "radial-gradient(4px 18px at 20% 96%, rgba(230,192,104,0.08), transparent 60%), radial-gradient(5px 20px at 55% 99%, rgba(255,122,26,0.07), transparent 55%), radial-gradient(4px 18px at 85% 97%, rgba(217,217,217,0.06), transparent 60%), radial-gradient(3px 16px at 35% 95%, rgba(255,122,26,0.06), transparent 55%)";

const RIGHT_EMBER_BACKGROUND =
  "radial-gradient(4px 20px at 18% 105%, rgba(230,192,104,0.07), transparent 65%), radial-gradient(5px 22px at 64% 110%, rgba(255,122,26,0.06), transparent 62%), radial-gradient(4px 20px at 86% 108%, rgba(217,217,217,0.05), transparent 60%), radial-gradient(5px 24px at 42% 102%, rgba(255,122,26,0.05), transparent 60%)";

const BADGE_CLIP_PATH =
  "polygon(50% 0%, 95% 8%, 100% 22%, 100% 78%, 95% 92%, 50% 100%, 5% 92%, 0 78%, 0 22%, 5% 8%)";

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
  const value = Number(v) || 0;

  const format = (num, suffix) => {
    let n = num.toFixed(1);
    if (n.endsWith(".0")) n = n.slice(0, -2);
    return `R$ ${n}${suffix}`;
  };

  if (value >= 1_000_000_000) return format(value / 1_000_000_000, "B");
  if (value >= 1_000_000) return format(value / 1_000_000, "M");
  if (value >= 1_000) return format(value / 1_000, "K");

  let n = value.toFixed(1);
  if (n.endsWith(".0")) n = n.slice(0, -2);
  return `R$ ${n}`;
}

/* CONFIG DOS HUNTERS */
const HUNTERS = [
  { label: "Monique", db: "Monique Moreira", meta: 250000 },
  { label: "Fernando", db: "Fernando Finatto", meta: 250000 },
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
        assigned: d.assigned?.trim() || "",
      }));

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0 = janeiro, 11 = dezembro

      const start = new Date(year, month, 1, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59);

      const filtered = parsed.filter((d) => d.data >= start && d.data <= end);

      let totalVendas = 0;
      let totalVendido = 0;

      let huntersCalc = HUNTERS.map((h) => {
        const rows = filtered.filter(
          (r) => r.assigned.toLowerCase() === h.db.trim().toLowerCase()
        );

        const vendas = rows.length;
        const vendido = rows.reduce((acc, r) => acc + r.valor, 0);

        totalVendas += vendas;
        totalVendido += vendido;

        return {
          nome: h.label,
          vendas,
          vendido,
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
      });
    }

    loadData();
  }, []);

  if (!total) return null;

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div className="flex h-full w-full overflow-hidden bg-black font-['Cinzel'] text-[#f5e7c8]">
        {/* LATERAL */}
        <div className="relative flex w-[220px] min-w-[220px] items-center justify-center overflow-hidden bg-black">
          <img
            src={huntersImg}
            alt="Hunters"
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.95) contrast(1.02)" }}
          />

          <div
            className="pointer-events-none absolute"
            style={{
              inset: "-10% 30% 10% -20%",
              background: LEFT_BEFORE_BACKGROUND,
              mixBlendMode: "screen",
              opacity: 0.32,
              filter: "blur(20px)",
              animation: "fireSweep 20s ease-in-out infinite",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: LEFT_AFTER_BACKGROUND,
              mixBlendMode: "screen",
              opacity: 0.14,
            }}
          />
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-visible p-1.5 text-[#fdf3da]">
          {/* HEADER */}
          <div
            className="relative z-10 mb-2 flex items-center justify-center rounded-[10px] border-2 border-[rgba(230,192,104,0.25)] px-4 py-4"
            style={{
              backgroundImage: HERO_BACKGROUND,
              backgroundSize: "140% 140%",
            }}
          >
            <div className="flex w-full items-stretch gap-6 flex-nowrap overflow-hidden">
              {/* TÍTULO GERAL HUNTERS */}
              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden text-center text-[26px] leading-tight text-[#e6c068] animate-[goldenTextBreath_5.5s_ease-in-out_infinite_alternate,heatShimmer_16s_ease-in-out_infinite]">
                <span className="text-[65px] font-bold leading-none">
                  Geral
                </span>
                <span className="text-[60px] font-bold leading-none">
                  Hunters
                </span>

                <span
                  className="pointer-events-none absolute top-0 left-[-120%] h-full w-[70%]"
                  style={{
                    background:
                      "linear-gradient(120deg, transparent 0%, rgba(230,192,104,0.04) 30%, rgba(255,122,26,0.1) 50%, rgba(230,192,104,0.05) 70%, transparent 100%)",
                    transform: "skewX(-12deg)",
                    opacity: 0.08,
                    animation: "textShimmer 6s linear infinite",
                  }}
                />
              </div>

              {/* 4 CARDS DO HEADER */}
              {["Vendas", "Vendido", "Percentual", "Meta"].map((label, idx) => {
                const value = [
                  total.vendas,
                  formatCurrency(total.vendido),
                  `${Math.round((total.vendido / total.meta) * 100)}%`,
                  formatCurrency(total.meta),
                ][idx];

                const highlight = idx < 2;

                return (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center justify-center text-center min-w-[150px] gap-[4px] rounded-lg border border-[rgba(230,192,104,0.25)] px-4 py-2"
                    style={{
                      backgroundImage: METRIC_BACKGROUND,
                      backgroundSize: "220% 220%",
                      backgroundBlendMode: "overlay, normal",
                    }}
                  >
                    <label className="text-[16px] font-semibold uppercase tracking-[0.06em] text-[#e6c068]">
                      {label}
                    </label>

                    <strong
                      className="font-extrabold"
                      style={{
                        fontSize: "50px",
                        color: highlight ? "#ff7a1a" : "#ffffff",
                        textShadow: highlight
                          ? "0 0 10px rgba(255,122,26,0.45)"
                          : "0 0 6px rgba(230,224,210,0.3)",
                        animation: "heatShimmer 16s ease-in-out infinite",
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRID DE HUNTERS */}
          <div className="relative z-10 grid flex-1 grid-cols-2 gap-2">
            {hunters.map((h, index) => {
              const photo = getHunterImage(h.nome, index);
              const pctNumber = h.meta > 0 ? (h.vendido / h.meta) * 100 : 0;
              const pctCapped = Math.min(Math.max(pctNumber, 0), 100);
              const pctLabel = pctCapped.toFixed(0);

              return (
                <div
                  key={h.nome}
                  className="relative flex gap-4 overflow-visible rounded-2xl border-2 border-[rgba(230,192,104,0.35)] p-4"
                  style={{
                    backgroundImage: CARD_BACKGROUND,
                    backgroundSize: "160% 160%",
                    backgroundBlendMode: "overlay, normal",
                  }}
                >
                  {/* glow full card */}
                  <div className="pointer-events-none absolute inset-0 hunter-full-glow" />

                  {/* COLUNA ESQUERDA */}
                  <div className="relative z-10 flex w-[260px] flex-col items-center gap-[19px]">
                    {/* trilha interna */}
                    <div className="absolute inset-0 pointer-events-none hunter-column-glow" />

                    {/* porcentagem */}
                    <div
                      className="relative mb-3 text-[33px] font-bold text-[#e6c068]"
                      style={{
                        textShadow: "0 0 6px rgba(230,192,104,0.35)",
                        animation:
                          "goldenTextBreath 5.5s ease-in-out infinite alternate, heatShimmer 12s ease-in-out infinite",
                      }}
                    >
                      {pctLabel}%
                    </div>

                    {/* gauge + partículas + foto */}
                    <div
                      className="relative flex h-[150px] w-[220px] items-start justify-center"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 70%, rgba(230,192,104,0.14), transparent 75%)",
                      }}
                    >
                      {/* partículas subindo */}
                      <div className="hunter-particles">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              left: `${10 + ((i * 6.3) % 80)}%`,
                              animationDelay: `${i * 0.35}s`,
                              animationDuration: `${3.4 + (i % 5) * 0.25}s`,
                              width: `${4 + (i % 3)}px`,
                              height: `${4 + (i % 3)}px`,
                            }}
                          />
                        ))}
                      </div>

                      <Gauge percent={pctCapped} />

                      {photo && (
                        <img
                          src={photo}
                          className="absolute left-1/2 top-[40%] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[rgba(230,192,104,0.9)] object-cover shadow-[0_0_6px_rgba(230,192,104,0.35)]"
                          alt={h.nome}
                        />
                      )}
                    </div>

                    {/* nome */}
                    <div
                      className="relative mt-[-30px] inline-flex items-center justify-center gap-[6px] text-center text-[36px] font-bold text-[#e6c068]"
                      style={{
                        textShadow: "0 0 6px rgba(230,192,104,0.35)",
                        animation:
                          "goldenTextBreath 5.5s ease-in-out infinite alternate, heatShimmer 14s.ease-in-out infinite",
                      }}
                    >
                      <span
                        className="mr-1"
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(230,192,104,0.4))",
                        }}
                      >
                        {getRankEmoji(index)}
                      </span>
                      {h.nome}
                    </div>

                    {/* badge */}
                    {getHunterBadge(h.nome) && (
                      <div className="relative flex items-center justify-center">
                        <img
                          src={getHunterBadge(h.nome)}
                          className="mt-[-6px] h-[110px] w-[110px] object-cover"
                          style={{
                            clipPath: BADGE_CLIP_PATH,
                            border: "3px solid #e6c068",
                            boxShadow: `
                              0 0 12px rgba(230,192,104,0.45),
                              0 0 22px rgba(255,200,140,0.25),
                              inset 0 0 12px rgba(230,192,104,0.40)
                            `,
                            animation:
                              "goldenTextBreath 6s ease-in-out infinite alternate",
                            filter: "brightness(1.05) saturate(1.12)",
                          }}
                          alt={`${h.nome} badge`}
                        />
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            clipPath: BADGE_CLIP_PATH,
                            background:
                              "radial-gradient(circle at 50% 50%, rgba(230,192,104,0.20), transparent 70%)",
                            mixBlendMode: "screen",
                            filter: "blur(14px)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* COLUNA DIREITA */}
                  <div className="relative z-10 flex flex-1 flex-col gap-[16px]">
                    {["Vendas", "Vendido", "Meta"].map((label, idx) => {
                      const values = [
                        h.vendas,
                        formatCurrency(h.vendido),
                        formatCurrency(h.meta),
                      ];
                      const highlighted = idx < 2;

                      return (
                        <div
                          key={label}
                          className="flex flex-col min-h-[60px] items-center justify-center text-center gap-[2px] rounded-[10px] border border-[rgba(230,192,104,0.35)] px-3 py-1.5"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(28,26,24,0.92), rgba(18,18,18,0.9))",
                            backgroundImage: METRIC_BACKGROUND,
                            backgroundBlendMode: "overlay, normal",
                          }}
                        >
                          <label className="text-[18px] font-semibold tracking-wide text-[#e6c068]">
                            {label}
                          </label>

                          <span
                            className="whitespace-nowrap font-extrabold"
                            style={{
                              fontSize: "54px", // <<< EXATAMENTE COMO VOCÊ PEDIU
                              color:
                                label === "Meta"
                                  ? "#ffffff"
                                  : highlighted
                                  ? "#ff7a1a"
                                  : "#e6c068",
                              textShadow:
                                label === "Meta"
                                  ? "0 0 6px rgba(230,224,210,0.3)"
                                  : highlighted
                                  ? "0 0 10px rgba(255,122,26,0.4)"
                                  : "0 0 6px rgba(230,192,104,0.25)",
                              animation:
                                "heatShimmer 18s ease-in-out infinite, thermalWaver 4.2s ease-in-out infinite",
                            }}
                          >
                            {values[idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* overlays da direita */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: RIGHT_SPARKS_BACKGROUND,
              opacity: 0.1,
              mixBlendMode: "screen",
              animation: "ashesRise 26s linear infinite",
              zIndex: 0,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: RIGHT_EMBER_BACKGROUND,
              opacity: 0.06,
              mixBlendMode: "screen",
              filter: "blur(1px)",
              animation: "emberField 30s linear infinite",
              zIndex: 0,
            }}
          />
        </div>
      </div>
    </>
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
    <div
      className="relative mt-[-50px] h-[140px] w-[220px]"
      style={{
        animation:
          "gaugeBreath 18s.ease-in-out infinite, gaugeTremor 9s ease-in-out infinite, heatRipple 16s ease-in-out infinite",
      }}
    >
      <svg viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b81d13" />
            <stop offset="50%" stopColor="#ff7a1a" />
            <stop offset="100%" stopColor="#e6c068" />
          </linearGradient>
        </defs>

        {/* trilho */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(120,70,40,0.4)"
          strokeWidth="14"
          opacity="0.35"
          strokeLinecap="round"
        />

        {/* ativo */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="url(#gaugeGlow)"
          style={{ filter: "drop-shadow(0 0 10px rgba(230,192,104,0.45))" }}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
    </div>
  );
}
