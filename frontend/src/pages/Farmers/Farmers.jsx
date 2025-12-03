import farmersImg from "../../assets/Farmers/Farmers.png";
import rightSideImg from "../../assets/Farmers/RightSide.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const farmerPhotos = import.meta.glob("../../assets/Farmers/*.png", {
  eager: true,
});

/* ======================== ANIMAÇÕES, GLOWS E ESTILOS ======================== */
const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

/* ======================== ANIMAÇÕES GELO ======================== */
@keyframes iceBreath {
  0% { text-shadow: 0 0 6px rgba(159,207,255,0.26), 0 0 12px rgba(124,202,255,0.16); filter: saturate(1); }
  50% { text-shadow: 0 0 10px rgba(159,207,255,0.36), 0 0 18px rgba(124,202,255,0.22); filter: saturate(1.07); }
  100% { text-shadow: 0 0 7px rgba(159,207,255,0.3), 0 0 14px rgba(124,202,255,0.18); filter: saturate(1.02); }
}

@keyframes frostSweep {
  0% { transform: translateY(20%); opacity: 0.08; }
  25% { transform: translateY(-10%); opacity: 0.18; }
  50% { transform: translateY(-30%); opacity: 0.1; }
  75% { transform: translateY(-60%); opacity: 0.16; }
  100% { transform: translateY(-100%); opacity: 0.08; }
}

@keyframes snowDrift {
  0% { background-position: 0 140%; }
  100% { background-position: 0 -40%; }
}

@keyframes snowFloat {
  0% { transform: translate3d(0,0,0) scale(0.9); opacity: 0.3; }
  40% { transform: translate3d(-6px,-18px,0) scale(1); opacity: 0.7; }
  70% { transform: translate3d(8px,-32px,0) scale(1.1); opacity: 0.4; }
  100% { transform: translate3d(-4px,-48px,0) scale(0.8); opacity: 0; }
}

@keyframes heatShimmer {
  0% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(124,202,255,0.2)); }
  50% { transform: translate3d(0.4px,-0.2px,0) skewX(-0.6deg); filter: drop-shadow(0 0 2px rgba(159,207,255,0.35)); }
  100% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(124,202,255,0.2)); }
}

.farmer-full-glow {
  background:
    linear-gradient(
      to bottom,
      rgba(159,207,255,0.20) 0%,
      rgba(200,240,255,0.14) 25%,
      rgba(124,202,255,0.10) 50%,
      rgba(159,207,255,0.16) 75%,
      rgba(200,240,255,0.12) 100%
    );
  opacity: 0.55;
  mix-blend-mode: screen;
  filter: blur(28px);
  animation: farmerFullGlowBreath 7s ease-in-out infinite;
}

@keyframes farmerFullGlowBreath {
  0% { opacity: 0.35; transform: scaleY(0.96); }
  50% { opacity: 0.75; transform: scaleY(1.04); }
  100% { opacity: 0.35; transform: scaleY(0.96); }
}

.farmer-column-glow {
  background:
    linear-gradient(
      to bottom,
      rgba(159,207,255,0.28) 0%,
      rgba(200,240,255,0.18) 20%,
      rgba(124,202,255,0.14) 40%,
      rgba(159,207,255,0.22) 60%,
      rgba(200,240,255,0.16) 80%,
      transparent 100%
    );
  filter: blur(18px);
  opacity: 0.45;
  mix-blend-mode: screen;
  animation: farmerColumnBreath 9s ease-in-out infinite;
}

@keyframes farmerColumnBreath {
  0% { opacity: 0.30; }
  50% { opacity: 0.60; }
  100% { opacity: 0.30; }
}

.farmer-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.farmer-particles span {
  position: absolute;
  bottom: -12px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(200,240,255,0.95), rgba(124,202,255,0.45));
  border-radius: 999px;
  filter: blur(1px);
  opacity: 0.7;
  animation: farmerParticleRise 4s linear infinite;
}

@keyframes farmerParticleRise {
  0% {
    transform: translateY(0) translateX(0) scale(0.4);
    opacity: 0.2;
  }
  40% { opacity: 0.85; }
  100% {
    transform: translateY(-140px) translateX(10px) scale(1);
    opacity: 0;
  }
}
`;

const HERO_BACKGROUND =
  "radial-gradient(220% 140% at 10% 0%, rgba(120,160,200,0.05), transparent 55%), radial-gradient(220% 140% at 90% 30%, rgba(140,180,230,0.05), transparent 55%), linear-gradient(145deg, rgba(10,20,30,0.95), rgba(6,10,15,0.92))";

const METRIC_BACKGROUND =
  "linear-gradient(135deg, rgba(12,22,32,0.92), rgba(5,10,18,0.9)), radial-gradient(120% 120% at 20% 10%, rgba(159,207,255,0.12), transparent 50%), radial-gradient(120% 120% at 80% 80%, rgba(124,202,255,0.12), transparent 55%)";

const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(10,20,30,0.95), rgba(5,10,18,0.9))";

const SNOW_BACKGROUND =
  "radial-gradient(4px 18px at 20% 96%, rgba(150,200,255,0.08), transparent 60%), radial-gradient(5px 20px at 55% 99%, rgba(100,160,220,0.07), transparent 55%), radial-gradient(4px 18px at 85% 97%, rgba(217,217,217,0.06), transparent 60%)";

const BADGE_CLIP_PATH =
  "polygon(50% 0%, 95% 8%, 100% 22%, 100% 78%, 95% 92%, 50% 100%, 5% 92%, 0 78%, 0 22%, 5 8%)";

/* HELPERS */
function getRankEmoji(i) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
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

/* ========================= DADOS DOS FARMERS ========================= */
const FARMERS = [
  { label: "Tchoco", db: "Victor Biselli", meta: 50000 },
  { label: "Texugão", db: "Raul Cruz", meta: 50000 },
  { label: "Andrés", db: "Andrés Apolionario", meta: 50000 },
];

export default function Farmers({ dados }) {
  if (!dados) return null;

  const parsed = dados.map((d) => ({
    ...d,
    valor: Number(d.valor) || 0,
    data: new Date(d.data),
    assigned: d.assigned?.trim() || "",
  }));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const filtered = parsed.filter((d) => d.data >= start && d.data <= end);

  let totalVendas = 0;
  let totalVendido = 0;

  let farmersCalc = FARMERS.map((f) => {
    const rows = filtered.filter(
      (r) => r.assigned.toLowerCase() === f.db.trim().toLowerCase()
    );

    const vendas = rows.length;
    const vendido = rows.reduce((acc, r) => acc + r.valor, 0);

    totalVendas += vendas;
    totalVendido += vendido;

    return {
      nome: f.label,
      vendas,
      vendido,
      meta: f.meta,
    };
  });

  farmersCalc.sort((a, b) => b.vendido - a.vendido);

  const farmers = farmersCalc;

  const total = {
    vendas: totalVendas,
    vendido: totalVendido,
    meta: FARMERS.reduce((acc, f) => acc + f.meta, 0),
  };

  const percentualGeral =
    total.meta > 0 ? Math.round((total.vendido / total.meta) * 100) : 0;

  /* ========================= INTERFACE ========================= */
  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div className="flex h-screen w-full overflow-hidden bg-black font-['Cinzel'] text-[#e4f5ff]">
        {/* LATERAL */}
        <div className="relative flex w-[220px] min-w-[220px] items-center justify-center overflow-hidden bg-black">
          <img src={farmersImg} className="h-full w-full object-cover" />

          <div
            className="pointer-events-none absolute"
            style={{
              inset: "-10% 30% 10% -20%",
              background:
                "radial-gradient(90% 80% at 0% 50%, rgba(124,202,255,0.18), rgba(75,120,180,0.12), transparent 65%)",
              mixBlendMode: "screen",
              opacity: 0.32,
              filter: "blur(20px)",
              animation: "frostSweep 20s ease-in-out infinite",
            }}
          />
        </div>

        {/* CONTEÚDO */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-visible p-1.5 text-[#e4f5ff]">
          {/* HEADER */}
          <div
            className="relative z-10 mb-2 flex items-center justify-center rounded-[10px] border-2 border-[rgba(160,200,255,0.25)] px-4 py-4"
            style={{ backgroundImage: HERO_BACKGROUND }}
          >
            <div className="flex w-full items-stretch gap-6 overflow-hidden">
              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden text-center text-[26px] leading-tight text-[#9fcfff] animate-[iceBreath_5.5s_ease-in-out_infinite_alternate,heatShimmer_16s_ease-in-out_infinite]">
                <span className="text-[65px] font-bold leading-none">
                  Geral
                </span>
                <span className="text-[60px] font-bold leading-none">
                  Farmers
                </span>
              </div>

              {["Vendas", "Vendido", "Percentual", "Meta"].map((label, idx) => {
                const value = [
                  total.vendas,
                  formatCurrency(total.vendido),
                  `${percentualGeral}%`,
                  formatCurrency(total.meta),
                ][idx];

                const highlight = idx < 2;

                return (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center justify-center text-center min-w-[150px] gap-[4px] rounded-lg border border-[rgba(160,200,255,0.25)] px-4 py-2"
                    style={{ backgroundImage: METRIC_BACKGROUND }}
                  >
                    <label className="text-[16px] font-semibold uppercase tracking-[0.06em]">
                      {label}
                    </label>

                    <strong
                      className="font-extrabold"
                      style={{
                        fontSize: "50px",
                        color: highlight ? "#7ccaff" : "#ffffff",
                        textShadow: highlight
                          ? "0 0 10px rgba(124,202,255,0.45)"
                          : "0 0 6px rgba(210,230,255,0.3)",
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GRID FARMERS */}
          <div className="relative z-10 grid flex-1 grid-cols-2 gap-2">
            {farmers.map((f, index) => {
              const photo = getFarmerImage(f.nome, index);

              const pctNumber = f.meta > 0 ? (f.vendido / f.meta) * 100 : 0;
              const pctCapped = Math.min(Math.max(pctNumber, 0), 100);
              const pctLabel = pctCapped.toFixed(0);

              return (
                <div
                  key={f.nome}
                  className="relative flex gap-4 overflow-visible rounded-2xl border-2 border-[rgba(160,200,255,0.35)] p-4"
                  style={{ backgroundImage: CARD_BACKGROUND }}
                >
                  <div className="pointer-events-none absolute inset-0 farmer-full-glow" />

                  {/* COLUNA ESQUERDA */}
                  <div className="relative z-10 flex w-[260px] flex-col items-center gap-[19px]">
                    <div className="absolute inset-0 pointer-events-none farmer-column-glow" />

                    <div
                      className="relative mb-3 text-[33px] font-bold text-[#e4f5ff]"
                      style={{ textShadow: "0 0 6px rgba(159,207,255,0.35)" }}
                    >
                      {pctLabel}%
                    </div>

                    {/* GAUGE + FOTO */}
                    <div
                      className="relative flex h-[150px] w-[220px] items-start justify-center"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 70%, rgba(150,200,255,0.18), transparent 75%)",
                      }}
                    >
                      <div className="farmer-particles">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              left: `${10 + ((i * 6.3) % 80)}%`,
                              animationDelay: `${i * 0.35}s`,
                              animationDuration: `${3.4 + (i % 5) * 0.25}s`,
                            }}
                          />
                        ))}
                      </div>

                      <Gauge percent={pctCapped} />

                      {photo && (
                        <img
                          src={photo}
                          className="absolute left-1/2 top-[43%] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[rgba(124,202,255,0.9)] object-cover"
                        />
                      )}
                    </div>

                    {/* NOME */}
                    <div className="relative mt-[-30px] inline-flex items-center justify-center gap-[6px] text-center text-[36px] font-bold">
                      <span>{getRankEmoji(index)}</span>
                      {f.nome}
                    </div>

                    {/* BADGE */}
                    {getFarmerBadge(f.nome) && (
                      <img
                        src={getFarmerBadge(f.nome)}
                        className="h-[110px] w-[110px] object-cover"
                        style={{ clipPath: BADGE_CLIP_PATH }}
                      />
                    )}
                  </div>

                  {/* COLUNA DIREITA */}
                  <div className="relative z-10 flex flex-1 flex-col gap-[16px]">
                    {["Vendas", "Vendido", "Meta"].map((label, idx) => {
                      const values = [
                        f.vendas,
                        formatCurrency(f.vendido),
                        formatCurrency(f.meta),
                      ];

                      return (
                        <div
                          key={label}
                          className="flex flex-col min-h-[60px] items-center justify-center text-center gap-[2px] rounded-[10px] border border-[rgba(160,200,255,0.35)] px-3 py-1.5"
                          style={{ backgroundImage: METRIC_BACKGROUND }}
                        >
                          <label className="text-[18px] font-semibold tracking-wide">
                            {label}
                          </label>

                          <span
                            className="font-extrabold"
                            style={{ fontSize: "54px" }}
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

            {/* ========================= SLOT VAZIO COM IMAGEM ========================= */}
            {farmers.length % 2 !== 0 && (
              <div
                className="relative flex items-center justify-center rounded-2xl border-2 border-[rgba(160,200,255,0.35)] overflow-hidden"
                style={{ backgroundImage: CARD_BACKGROUND }}
              >
                <img
                  src={rightSideImg}
                  alt="Decorativo"
                  className="w-full h-full object-cover opacity-[0.93]"
                  style={{
                    filter: "brightness(1.03) contrast(1.05) saturate(1.1)",
                  }}
                />

                <div className="pointer-events-none absolute inset-0 farmer-full-glow" />
              </div>
            )}
          </div>

          {/* SNOW EFFECT */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: SNOW_BACKGROUND,
              opacity: 0.16,
              mixBlendMode: "screen",
              animation: "snowDrift 26s linear infinite",
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
  const dash = (pct / 100) * (circumference / 2);

  return (
    <div className="relative mt-[-50px] h-[140px] w-[220px]">
      <svg viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7ccaff" />
            <stop offset="50%" stopColor="#9fcfff" />
            <stop offset="100%" stopColor="#c9ccd1" />
          </linearGradient>
        </defs>

        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(140,180,230,0.35)"
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
