import { useEffect, useRef, useState } from "react";
import logolastdance from "../../assets/LastDance/lastdance.png";

const META_MENSAL = 1000000;
const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;900&display=swap");

@keyframes pulseArrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12px); }
}

@keyframes progressFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 180% 50%; }
}

@keyframes shineSweep {
  0% { transform: translateX(-80%) skewX(-12deg); opacity: 0; }
  35% { opacity: 0.9; }
  60% { opacity: 0; }
  100% { transform: translateX(130%) skewX(-12deg); opacity: 0; }
}

@keyframes goalPulse {
  0% { box-shadow: 0 0 0 0 rgba(202,208,3,0.35); transform: scale(1); }
  70% { box-shadow: 0 0 0 10px rgba(202,208,3,0); transform: scale(1.05); }
  100% { box-shadow: 0 0 0 0 rgba(202,208,3,0); transform: scale(1); }
}

@keyframes progressShimmer {
  0% { background-position: 0% 50%; opacity: 0.25; }
  50% { opacity: 0.65; }
  100% { background-position: 140% 50%; opacity: 0.25; }
}
`;

const ROOT_BACKGROUND =
  "radial-gradient(circle at 10% 20%, rgba(202,208,3,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.15), transparent 55%), linear-gradient(135deg, #dd044e, #f2266c 40%, #c4034e 100%)";
const BLOCO2_BACKGROUND =
  "linear-gradient(135deg, rgba(221,4,78,0.92), rgba(221,4,78,0.75))";
const BLOCO4_BACKGROUND =
  "linear-gradient(135deg, rgba(221,4,78,0.85), rgba(221,4,78,0.65))";
const TABLE_HEADER_BG = "rgba(221,4,78,0.8)";
const TABLE_ROW_ODD_BG = "rgba(255, 255, 255, 0.06)";
const TABLE_ROW_EVEN_BG = "rgba(255, 105, 145, 0.22)";
const PROGRESS_SPARKLES =
  "radial-gradient(6px 20px at 20% 40%, rgba(255,255,255,0.45), transparent 65%), radial-gradient(8px 30px at 60% 60%, rgba(255,250,165,0.4), transparent 70%), radial-gradient(5px 18px at 85% 20%, rgba(255,255,255,0.35), transparent 65%)";

const GOLD = "#cad003";
const PINK = "#dd044e";
const WHITE_GLOW = "rgba(255,255,255,0.85)";
const GOLD_GLOW = `0 0 12px ${GOLD}, 0 0 28px rgba(202,208,3,0.55)`;
const PINK_GLOW = `0 0 14px ${PINK}, 0 0 32px rgba(221,4,78,0.65)`;

const CARD_BG = `
linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.82) 100%)
`;

const CARD_STYLE = {
  backgroundImage: CARD_BG,
  backdropFilter: "blur(6px)",
  border: "2px solid rgba(255,255,255,0.12)",
  boxShadow: "0 0 18px rgba(0,0,0,0.45), inset 0 0 24px rgba(0,0,0,0.45)",
};

const CARD_FULL = {
  ...CARD_STYLE,
  background:
    "radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 70%), #d1044e",
};

export default function LastDance() {
  const [dados, setDados] = useState([]);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalEstornos] = useState(0);
  const [percentualEstornos] = useState(0);

  const audioRef = useRef(null);
  const hojeBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const numero = formatarValor(valorDiario);

  useEffect(() => {
    async function fetchData() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await r.json();
        if (!Array.isArray(rawData)) return;

        const pipelineIds = ["71", "23", "47", "59", "63", "35"];

        const filtradosMes = rawData.filter((i) => {
          const dt = new Date(i.data);

          // NORMALIZAÇÃO DE DATA
          const dataVenda = new Date(
            dt.getFullYear(),
            dt.getMonth(),
            dt.getDate()
          );

          const inicio = new Date(hojeBR.getFullYear(), hojeBR.getMonth(), 1);
          const fim = new Date(hojeBR.getFullYear(), hojeBR.getMonth() + 1, 0);

          return (
            pipelineIds.includes(String(i.pipeline_id)) &&
            dataVenda >= inicio &&
            dataVenda <= fim
          );
        });

        const recentes = [...filtradosMes]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(recentes);

        // SOMA DO MÊS → CORRETO
        const somaMes = filtradosMes.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );

        setTotalVendido(somaMes);

        const restante = Math.max(META_MENSAL - somaMes, 0);
        setFaltamParaMetaMensal(restante);

        // DIAS ÚTEIS FIXOS (15)
        const diasRestantesUteis = 15;

        const valorDiarioCalc =
          diasRestantesUteis > 0 ? restante / diasRestantesUteis : 0;

        setValorDiario(valorDiarioCalc);
      } catch (err) {
        console.log("Erro ao buscar dados:", err);
      }
    }

    async function fetchOpen() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsopen`
        );
        const data = await r.json();
        setSomaOpen(data.reduce((acc, i) => acc + Number(i.valor || 0), 0));
      } catch {}
    }

    fetchData();
    fetchOpen();
    const interval = setInterval(() => {
      fetchData();
      fetchOpen();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 🎯 REMOVIDO O BUG — não altera mais totalVendido aqui

  function playSom() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  const metaProgress = Math.min(
    1,
    Math.max(0, 1 - faltamParaMetaMensal / META_MENSAL)
  );
  const metaPercent = Math.round(metaProgress * 100);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="flex h-screen w-full flex-col overflow-hidden text-white"
        style={{
          backgroundImage: ROOT_BACKGROUND,
          fontFamily: "'Baloo 2', sans-serif",
          padding: "0 1.8vw 1.8vh 1.8vw",
          gap: "1.6vh",
        }}
      >
        {/* ---- HEADER ---- */}
        <div
          className="h-[15vh] w-full rounded-b-[26px] overflow-hidden shadow-[0_0_26px_rgba(255,255,255,0.28)]"
          style={{ border: "2px solid rgba(255,255,255,0.12)" }}
        >
          <img src={logolastdance} className="h-full w-full object-cover" />
        </div>

        {/* ---- BLOCO PRINCIPAL ---- */}
        <div
          className="relative flex h-[38vh] items-center justify-center rounded-[32px]"
          style={{ ...CARD_FULL, background: BLOCO2_BACKGROUND }}
        >
          <div className="flex items-center gap-[2vw]">
            <div
              className="h-[10rem] w-[10rem] rounded-full flex items-center justify-center"
              style={{
                border: "2px dashed rgba(255,255,255,0.35)",
                background: "rgba(0,0,0,0.35)",
                boxShadow: GOLD_GLOW,
              }}
            >
              <span
                className="text-[8rem] text-[#cad003] select-none"
                style={{
                  textShadow: GOLD_GLOW,
                  animation: "pulseArrow 1.5s infinite",
                }}
              >
                ↓
              </span>
            </div>

            <div className="flex flex-col gap-[1.4vh]">
              <span
                className="text-[2.3rem] font-bold uppercase tracking-[0.14em]"
                style={{ color: GOLD, textShadow: GOLD_GLOW }}
              >
                Faltam hoje para a meta diária
              </span>

              <div className="flex items-end gap-[1rem] leading-none">
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: "13rem",
                    fontWeight: 900,
                    color: "rgba(255,255,255,0.95)",
                    textShadow: `
                      0 0 8px rgba(255,255,255,0.9),
                      0 0 20px rgba(221,4,78,0.6),
                      0 0 36px rgba(202,208,3,0.65)
                  `,
                  }}
                >
                  {numero}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- BLOCOS INFERIORES ---- */}
        <div className="flex flex-col flex-1 gap-[1.6vh]">
          {/* ---- CONTAGEM TOTAL + PROGRESSO ---- */}
          <div className="flex flex-1 gap-[1.6vw]">
            <div
              className="relative flex flex-[2] flex-col items-center justify-center gap-[0.5vh] rounded-[32px]"
              style={{
                ...CARD_FULL,
                background:
                  "linear-gradient(135deg, rgba(221,4,78,0.82), rgba(221,4,78,0.65))",
              }}
            >
              <div className="flex items-center gap-[1vw]">
                <span
                  className="text-[3rem] font-bold"
                  style={{ color: GOLD, textShadow: GOLD_GLOW }}
                >
                  Contagem total vendida:
                </span>

                <span
                  className="text-[5rem] font-black"
                  style={{ color: WHITE_GLOW, textShadow: PINK_GLOW }}
                >
                  {formatarValor(totalVendido)}
                </span>
              </div>

              <div className="relative w-[62%] mt-[0.4vh] flex items-center gap-[12px]">
                <div
                  className="relative flex-1 h-[34px] rounded-full overflow-hidden"
                  style={{
                    background: "transparent",
                    border: `1px solid ${GOLD}`,
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${metaProgress * 100}%`,
                      background: `linear-gradient(90deg, ${GOLD}, #f7ff82, ${GOLD})`,
                      transition: "width 0.8s ease-in-out",
                      boxShadow: `0 0 12px rgba(202,208,3,0.55)`,
                    }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="text-[1.8rem] font-extrabold uppercase tracking-[0.12em]"
                      style={{
                        color: "white",
                        textShadow:
                          "0 0 6px rgba(255,255,255,0.85), 0 0 18px rgba(255,255,255,0.65)",
                      }}
                    >
                      {metaPercent}%
                    </span>
                  </div>
                </div>

                <span
                  className="text-[1.2rem] font-bold whitespace-nowrap"
                  style={{ color: "white", textShadow: PINK_GLOW }}
                >
                  {formatarValor(META_MENSAL)}
                </span>
              </div>
            </div>

            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={{
                ...CARD_STYLE,
                background: BLOCO4_BACKGROUND,
              }}
            >
              <span
                className="text-[2.5rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: GOLD, textShadow: GOLD_GLOW }}
              >
                Projeção Geral
              </span>

              <span
                className="text-[6rem] font-black"
                style={{ color: WHITE_GLOW, textShadow: PINK_GLOW }}
              >
                {formatarValor(somaOpen)}
              </span>
            </div>
          </div>

          {/* ---- TABELA ---- */}
          <div className="flex flex-1 gap-[1.6vw]">
            <div
              className="flex flex-[2] rounded-[32px] overflow-hidden"
              style={{ ...CARD_FULL, background: BLOCO4_BACKGROUND }}
            >
              <table className="w-full h-full text-center text-white table-fixed">
                <thead>
                  <tr style={{ background: TABLE_HEADER_BG }}>
                    {["Lead", "Empresa", "Vendedor", "Pipeline", "Valor"].map(
                      (label, idx) => (
                        <th
                          key={idx}
                          className="text-[1.45rem] py-[0.6vh]"
                          style={{
                            color: GOLD,
                            textShadow: GOLD_GLOW,
                            textAlign: "center",
                          }}
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody className="text-[1.55rem] leading-[1.15]">
                  {dados.map((item, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          i % 2 === 0 ? TABLE_ROW_ODD_BG : TABLE_ROW_EVEN_BG,
                      }}
                    >
                      <td style={{ color: WHITE_GLOW }}>{item.lead_id}</td>
                      <td style={{ color: WHITE_GLOW }}>{item.empresa}</td>
                      <td style={{ color: WHITE_GLOW }}>{item.assigned}</td>
                      <td style={{ color: WHITE_GLOW }}>{item.pipeline}</td>
                      <td style={{ color: WHITE_GLOW }}>
                        {formatarValor(item.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---- ESTORNOS ---- */}
            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={{
                ...CARD_STYLE,
                background: BLOCO4_BACKGROUND,
              }}
            >
              <span
                className="text-[2.5rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: GOLD, textShadow: GOLD_GLOW }}
              >
                Estornos
              </span>

              <span
                className="text-[6rem] font-black leading-none"
                style={{ color: WHITE_GLOW, textShadow: PINK_GLOW }}
              >
                0,00
              </span>

              <span
                className="text-[2rem] font-semibold"
                style={{ color: GOLD, textShadow: GOLD_GLOW }}
              >
                0,00%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
