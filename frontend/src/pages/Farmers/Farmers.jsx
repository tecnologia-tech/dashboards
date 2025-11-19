import React from "react";
import farmersImg from "../../assets/Farmers/Farmers.png";

/* IMPORTAÇÃO AUTOMÁTICA DAS FOTOS */
const farmerPhotos = import.meta.glob("../../assets/Farmers/*.png", {
  eager: true,
});

const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

@keyframes iceBreath {
  0% { filter: drop-shadow(0 0 2px rgba(150,200,255,0.2)); }
  100% { filter: drop-shadow(0 0 6px rgba(150,200,255,0.6)); }
}

@keyframes frostSweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
`;

const HERO_BACKGROUND =
  "radial-gradient(220% 140% at 10% 0%, rgba(120,160,200,0.05), transparent 55%), radial-gradient(220% 140% at 90% 30%, rgba(140,180,230,0.05), transparent 55%), linear-gradient(145deg, rgba(10,20,30,0.95), rgba(6,10,15,0.92))";
const METRIC_BACKGROUND =
  "linear-gradient(135deg, rgba(12,22,32,0.92), rgba(5,10,18,0.9)), radial-gradient(120% 120% at 20% 10%, rgba(159,207,255,0.12), transparent 50%), radial-gradient(120% 120% at 80% 80%, rgba(124,202,255,0.12), transparent 55%)";
const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(10,20,30,0.95), rgba(5,10,18,0.9))";
const SNOW_BACKGROUND =
  "radial-gradient(4px 18px at 20% 96%, rgba(150,200,255,0.08), transparent 60%), radial-gradient(5px 20px at 55% 99%, rgba(100,160,220,0.07), transparent 55%), radial-gradient(4px 18px at 85% 97%, rgba(217,217,217,0.06), transparent 60%)";
const ICE_PARTICLE_GRADIENT =
  "radial-gradient(60% 60% at 50% 50%, rgba(200,240,255,0.9), rgba(150,200,255,0.45), transparent 70%)";
const BADGE_CLIP_PATH =
  "polygon(50% 0%, 95% 8%, 100% 22%, 100% 78%, 95% 92%, 50% 100%, 5% 92%, 0 78%, 0 22%, 5% 8%)";

function getRankEmoji(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
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
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* CONFIG DOS FARMERS */
const FARMERS = [
  { label: "Choco", db: "Victor Biselli", meta: 100000 },
  { label: "Texugão", db: "Raul Cruz", meta: 50000 },
  { label: "Cleyton", db: "Cleyton Cruz", meta: 50000 },
  { label: "Andrés", db: "Andrés Apolionario", meta: 0 },
];

export default function Farmers() {
  const [total, setTotal] = React.useState(null);
  const [farmers, setFarmers] = React.useState([]);

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

      const start = new Date("2025-11-01T00:00:00");
      const end = new Date("2025-11-30T23:59:59");

      const filtered = parsed.filter((d) => d.data >= start && d.data <= end);

      let totalVendas = 0;
      let totalVendido = 0;

      let farmersCalc = FARMERS.map((f) => {
        const rows = filtered.filter(
          (r) => r.assigned.toLowerCase() === f.db.trim().toLowerCase()
        );

        const vendas = rows.length;
        const vendido = rows.reduce((acc, r) => acc + r.valor, 0);
        const ticketMedio = vendas > 0 ? vendido / vendas : 0;

        totalVendas += vendas;
        totalVendido += vendido;

        return {
          nome: f.label,
          vendas,
          vendido,
          ticketMedio,
          meta: f.meta,
        };
      });

      farmersCalc.sort((a, b) => b.vendido - a.vendido);

      setFarmers(farmersCalc);

      const metaTotal = FARMERS.reduce((acc, f) => acc + f.meta, 0);

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
    <>
      <style>{ANIMATION_STYLES}</style>

      <div className="flex h-full w-full overflow-hidden bg-black font-['Cinzel'] text-[#e4f5ff]">
        {/* LATERAL */}
        <div className="relative flex w-[220px] min-w-[190px] items-center justify-center overflow-hidden bg-black">
          <img
            src={farmersImg}
            alt="Farmers"
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.9) contrast(1.1)" }}
          />
        </div>

        <div
          className="flex min-w-0 flex-1 flex-col p-1.5"
          style={{
            backgroundImage: SNOW_BACKGROUND,
            backgroundSize: "160% 160%",
            animation: "snowDrift 26s linear infinite",
          }}
        >
          {/* HEADER */}
          <div
            className="mb-2 flex items-center justify-between rounded-[10px] border-2 border-[rgba(160,200,255,0.25)] px-3 py-2.5 text-[#e4f5ff]"
            style={{
              backgroundImage: HERO_BACKGROUND,
              backgroundSize: "140% 140%",
            }}
          >
            <div className="flex flex-col items-center overflow-hidden text-center text-[26px] leading-tight text-[#e4f5ff] animate-[iceBreath_6s_ease-in-out_infinite_alternate]">
              <span className="text-[32px] font-bold leading-none">Geral</span>
              <span className="text-[32px] font-bold leading-none">Farmer</span>
            </div>

            <div className="flex items-stretch gap-4">
              <div
                className="flex min-w-[130px] items-center justify-between gap-3 rounded-lg border border-[rgba(160,200,255,0.25)] px-4 py-2.5"
                style={{
                  backgroundImage: METRIC_BACKGROUND,
                  backgroundSize: "220% 220%",
                  backgroundBlendMode: "overlay, normal",
                }}
              >
                <label className="text-[15px] font-semibold uppercase tracking-[0.06em] text-[#e4f5ff]">
                  Vendas
                </label>
                <strong
                  className="text-[#7ccaff]"
                  style={{
                    fontSize: "clamp(30px, 3vw, 50px)",
                    animation: "heatShimmer 16s ease-in-out infinite",
                  }}
                >
                  {total.vendas}
                </strong>
              </div>

              <div
                className="flex min-w-[130px] items-center justify-between gap-3 rounded-lg border border-[rgba(160,200,255,0.25)] px-4 py-2.5"
                style={{
                  backgroundImage: METRIC_BACKGROUND,
                  backgroundSize: "220% 220%",
                  backgroundBlendMode: "overlay, normal",
                }}
              >
                <label className="text-[15px] font-semibold uppercase tracking-[0.06em] text-[#e4f5ff]">
                  Vendido
                </label>
                <strong
                  className="text-[#7ccaff]"
                  style={{
                    fontSize: "clamp(30px, 3vw, 50px)",
                    animation: "heatShimmer 16s ease-in-out infinite",
                  }}
                >
                  {formatCurrency(total.vendido)}
                </strong>
              </div>

              <div
                className="flex min-w-[130px] items-center justify-between gap-3 rounded-lg border border-[rgba(160,200,255,0.25)] px-4 py-2.5"
                style={{
                  backgroundImage: METRIC_BACKGROUND,
                  backgroundSize: "220% 220%",
                  backgroundBlendMode: "overlay, normal",
                }}
              >
                <label className="text-[15px] font-semibold uppercase tracking-[0.06em] text-[#e4f5ff]">
                  Meta
                </label>
                <strong
                  className="text-[#7ccaff]"
                  style={{
                    fontSize: "clamp(30px, 3vw, 50px)",
                    animation: "heatShimmer 16s ease-in-out infinite",
                  }}
                >
                  {formatCurrency(total.meta)}
                </strong>
              </div>

              <div
                className="flex min-w-[130px] items-center justify-between gap-3 rounded-lg border border-[rgba(160,200,255,0.25)] px-4 py-2.5"
                style={{
                  backgroundImage: METRIC_BACKGROUND,
                  backgroundSize: "220% 220%",
                  backgroundBlendMode: "overlay, normal",
                }}
              >
                <label className="text-[15px] font-semibold uppercase tracking-[0.06em] text-[#e4f5ff]">
                  Ticket
                </label>
                <strong
                  className="text-[#7ccaff]"
                  style={{
                    fontSize: "clamp(30px, 3vw, 50px)",
                    animation: "heatShimmer 16s ease-in-out infinite",
                  }}
                >
                  {formatCurrency(total.ticketMedio)}
                </strong>
              </div>
            </div>
          </div>

          {/* FARMERS */}
          <div className="grid flex-1 grid-cols-2 gap-2">
            {farmers.map((f, index) => {
              const photo = getFarmerImage(f.nome, index);
              const pctNumber = f.meta > 0 ? (f.vendido / f.meta) * 100 : 0;
              const pctCapped = Math.min(Math.max(pctNumber, 0), 100);
              const pctLabel = pctCapped.toFixed(0);

              return (
                <div
                  className="relative flex gap-4 overflow-hidden rounded-2xl border-2 border-[rgba(160,200,255,0.35)] p-4"
                  style={{
                    backgroundImage: CARD_BACKGROUND,
                    boxShadow:
                      "inset 0 0 25px rgba(75,120,160,0.25), 0 0 35px rgba(40,80,110,0.25)",
                    backgroundSize: "200% 200%",
                  }}
                  key={f.nome}
                  data-pct={pctLabel}
                >
                  <div className="flex w-[260px] flex-col items-center gap-[25px]">
                    <div
                      className="text-[32px] font-black text-[#7ccaff]"
                      style={{
                        textShadow: "0 0 12px rgba(150,200,255,0.5)",
                      }}
                    >
                      {pctLabel}%
                    </div>

                    <div
                      className="relative flex h-[150px] w-[220px] items-start justify-center"
                      style={{
                        backgroundImage:
                          "radial-gradient(80% 80% at 50% 90%, rgba(140,190,255,0.18), transparent 70%)",
                      }}
                    >
                      <Gauge percent={pctCapped} />

                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          clipPath: "ellipse(70% 60% at 50% 60%)",
                          mixBlendMode: "screen",
                        }}
                      >
                        {Array.from({ length: 40 }).map((_, i) => {
                          const left = (i * 37) % 100;
                          const top = (i * 53) % 100;
                          return (
                            <div
                              key={i}
                              className="absolute rounded-full"
                              style={{
                                width: "8px",
                                height: "8px",
                                left: `${left}%`,
                                top: `${top}%`,
                                marginLeft: "-4px",
                                marginTop: "-4px",
                                background: ICE_PARTICLE_GRADIENT,
                                filter: "blur(1px)",
                                mixBlendMode: "screen",
                                opacity: 0.8,
                                animation: `snowFloat ${
                                  10 + (i % 6)
                                }s ease-in-out infinite`,
                              }}
                            />
                          );
                        })}
                      </div>

                      {photo && (
                        <img
                          src={photo}
                          className="absolute left-1/2 top-[40%] h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#7ccaff] object-cover shadow-[0_0_14px_rgba(150,200,255,0.4)]"
                          alt={f.nome}
                        />
                      )}
                    </div>

                    <div
                      className="mt-[-30px] text-[32px] font-bold text-[#e4f5ff]"
                      style={{
                        textShadow: "0 0 8px rgba(150,200,255,0.5)",
                      }}
                    >
                      {getRankEmoji(index)} {f.nome}
                    </div>

                    {getFarmerBadge(f.nome) && (
                      <img
                        src={getFarmerBadge(f.nome)}
                        className="mt-[-6px] h-[120px] w-[120px] object-cover"
                        style={{
                          border: "2px solid #7ccaff",
                          boxShadow: "0 0 14px rgba(150,200,255,0.35)",
                          clipPath: BADGE_CLIP_PATH,
                        }}
                        alt={`${f.nome} badge`}
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-[25px]">
                    <div
                      className="flex min-h-[78px] items-center justify-between rounded-[10px] border border-[rgba(160,200,255,0.35)] px-3 py-1.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(12,20,30,0.85), rgba(4,8,14,0.9))",
                      }}
                    >
                      <label className="text-[20px] font-semibold tracking-wide text-[#e4f5ff]">
                        Vendas
                      </label>
                      <span
                        className="whitespace-nowrap font-extrabold text-[#7ccaff]"
                        style={{
                          fontSize: "clamp(26px, 3vw, 54px)",
                          textShadow: "0 0 10px rgba(150,200,255,0.5)",
                        }}
                      >
                        {f.vendas}
                      </span>
                    </div>

                    <div
                      className="flex min-h-[78px] items-center justify-between rounded-[10px] border border-[rgba(160,200,255,0.35)] px-3 py-1.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(12,20,30,0.85), rgba(4,8,14,0.9))",
                      }}
                    >
                      <label className="text-[20px] font-semibold tracking-wide text-[#e4f5ff]">
                        Vendido
                      </label>
                      <span
                        className="whitespace-nowrap font-extrabold text-[#7ccaff]"
                        style={{
                          fontSize: "clamp(26px, 3vw, 54px)",
                          textShadow: "0 0 10px rgba(150,200,255,0.5)",
                        }}
                      >
                        {formatCurrency(f.vendido)}
                      </span>
                    </div>

                    <div
                      className="flex min-h-[78px] items-center justify-between rounded-[10px] border border-[rgba(160,200,255,0.35)] px-3 py-1.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(12,20,30,0.85), rgba(4,8,14,0.9))",
                      }}
                    >
                      <label className="text-[20px] font-semibold tracking-wide text-[#e4f5ff]">
                        Ticket
                      </label>
                      <span
                        className="whitespace-nowrap font-extrabold text-[#c9ccd1]"
                        style={{
                          fontSize: "clamp(26px, 3vw, 54px)",
                        }}
                      >
                        {formatCurrency(f.ticketMedio)}
                      </span>
                    </div>

                    <div
                      className="flex min-h-[78px] items-center justify-between rounded-[10px] border border-[rgba(160,200,255,0.35)] px-3 py-1.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(12,20,30,0.85), rgba(4,8,14,0.9))",
                      }}
                    >
                      <label className="text-[20px] font-semibold tracking-wide text-[#e4f5ff]">
                        Meta
                      </label>
                      <span
                        className="whitespace-nowrap font-extrabold text-[#c9ccd1]"
                        style={{
                          fontSize: "clamp(26px, 3vw, 54px)",
                        }}
                      >
                        {formatCurrency(f.meta)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        backgroundImage:
          "radial-gradient(90% 70% at 50% 90%, rgba(180,220,255,0.2), transparent 70%), radial-gradient(90% 70% at 50% 80%, rgba(200,240,255,0.25), transparent 70%)",
        backgroundRepeat: "no-repeat",
        filter: "drop-shadow(0 0 18px rgba(150,200,255,0.3))",
      }}
    >
      <svg viewBox="0 0 200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gaugeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7ccaff" />
            <stop offset="50%" stopColor="#9fcfff" />
            <stop offset="100%" stopColor="#c9ccd1" />
          </linearGradient>
        </defs>

        {/* TRILHO */}
        <path
          d="M30 100 A70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(140,180,230,0.35)"
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
