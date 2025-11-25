import { useEffect, useState, useRef } from "react";
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

  const audioRef = useRef(null);
  const timerRef = useRef(null);

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
    audioRef.current = new Audio("/audios/comemora.mp3");
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await r.json();
        if (!Array.isArray(rawData)) return;

        const inicioMes = new Date(hojeBR.getFullYear(), hojeBR.getMonth(), 1);
        const fimMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0,
          23,
          59,
          59
        );

        const pipelineIds = ["71", "23", "47"];
        const filtradosMes = rawData.filter((i) => {
          const dt = new Date(i.data);
          return (
            pipelineIds.includes(String(i.pipeline_id)) &&
            dt >= inicioMes &&
            dt <= fimMes
          );
        });

        const recentes = [...filtradosMes]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(recentes);

        const somaMes = filtradosMes.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );
        setTotalVendido(somaMes);

        const restante = Math.max(META_MENSAL - somaMes, 0);
        setFaltamParaMetaMensal(restante);

        function isDiaUtil(d) {
          const diaSemana = d.getDay();
          return diaSemana !== 0 && diaSemana !== 6;
        }

        function contarDiasUteisRestantes(dataRef) {
          const ultimoDia = new Date(
            dataRef.getFullYear(),
            dataRef.getMonth() + 1,
            0
          );

          let dias = 0;
          for (
            let d = new Date(dataRef);
            d <= ultimoDia;
            d.setDate(d.getDate() + 1)
          ) {
            if (isDiaUtil(d)) dias++;
          }
          return dias;
        }

        const diasRestantesUteis = contarDiasUteisRestantes(hojeBR);

        const vendasHoje = filtradosMes.filter((i) => {
          const dt = new Date(i.data);
          return dt.toDateString() === hojeBR.toDateString();
        });

        const totalHoje = vendasHoje.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );

        const valorBase =
          diasRestantesUteis > 0 ? restante / diasRestantesUteis : 0;

        const metaAjustada = Math.max(valorBase - totalHoje, 0);

        let valorDiarioAjustado = metaAjustada;

        let ontemRef = new Date(hojeBR);
        ontemRef.setDate(ontemRef.getDate() - 1);

        while (
          !isDiaUtil(ontemRef) &&
          ontemRef.getTime() >= inicioMes.getTime()
        ) {
          ontemRef.setDate(ontemRef.getDate() - 1);
        }

        if (isDiaUtil(ontemRef) && ontemRef.getTime() >= inicioMes.getTime()) {
          const fimOntem = new Date(
            ontemRef.getFullYear(),
            ontemRef.getMonth(),
            ontemRef.getDate(),
            23,
            59,
            59,
            999
          );

          const vendasOntem = filtradosMes.filter((i) => {
            const dt = new Date(i.data);
            return dt.toDateString() === ontemRef.toDateString();
          });

          const vendidoOntem = vendasOntem.reduce(
            (acc, i) => acc + Number(i.valor || 0),
            0
          );

          const totalVendidoAteOntem = filtradosMes
            .filter((i) => new Date(i.data) <= fimOntem)
            .reduce((acc, i) => acc + Number(i.valor || 0), 0);

          const faltanteAteOntem = Math.max(
            META_MENSAL - totalVendidoAteOntem,
            0
          );

          const diasUteisRestantesOntem = contarDiasUteisRestantes(ontemRef);

          const metaDiariaOntem =
            diasUteisRestantesOntem > 0
              ? (faltanteAteOntem + vendidoOntem) / diasUteisRestantesOntem
              : 0;

          const saldoOntem = metaDiariaOntem - vendidoOntem;

          valorDiarioAjustado = Math.max(metaAjustada + saldoOntem, 0);
        }

        setValorDiario(valorDiarioAjustado);
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

  function playSom() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  function stopSom() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  function tocarAlertaTemporario() {
    setMostrarVideo(true);
    playSom();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stopSom();
      setMostrarVideo(false);
    }, 12000);
  }

  const metaProgress = Math.min(
    1,
    Math.max(0, 1 - faltamParaMetaMensal / META_MENSAL)
  );
  const metaPercent = Math.round(metaProgress * 100);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {mostrarVideo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85">
          <video
            autoPlay
            loop
            playsInline
            className="h-[90vh] w-auto rounded-[24px] shadow-[0_0_32px_rgba(202,208,3,0.55)]"
            src="/videos/comemora.mp4"
          />
        </div>
      )}

      <div
        className="flex h-screen w-full flex-col overflow-hidden text-white"
        style={{
          backgroundImage: ROOT_BACKGROUND,
          fontFamily: "'Baloo 2', sans-serif",
          padding: "0 1.8vw 1.8vh 1.8vw",
          gap: "1.6vh",
        }}
      >
        <div
          className="h-[15vh] w-full rounded-b-[26px] overflow-hidden shadow-[0_0_26px_rgba(255,255,255,0.28)]"
          style={{
            border: "2px solid rgba(255,255,255,0.12)",
          }}
        >
          <img
            src={logolastdance}
            className="h-full w-full object-cover"
            alt="Last Dance"
          />
        </div>

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
                    letterSpacing: "-0.01em",
                    lineHeight: "1",
                  }}
                >
                  {numero}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-[1.6vh]">
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
                    background:
                      "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(0,0,0,0.7))",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    className="h-full rounded-full relative"
                    style={{
                      width: `${metaProgress * 100}%`,
                      background: `linear-gradient(90deg, ${GOLD} 0%, #fffaa5 55%, ${GOLD} 100%)`,
                      boxShadow: GOLD_GLOW,
                      transition: "width 1s cubic-bezier(0.25, 1, 0.5, 1)",
                      backgroundSize: "160% 100%",
                      animation:
                        metaProgress > 0
                          ? "progressFlow 3s linear infinite"
                          : "none",
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 90%)",
                        transform: "translateX(-60%) skewX(-10deg)",
                        animation:
                          metaProgress > 0
                            ? "shineSweep 3.2s ease-in-out infinite"
                            : "none",
                      }}
                    />
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      backgroundImage: PROGRESS_SPARKLES,
                      backgroundSize: "140% 100%",
                      animation: "progressShimmer 3s linear infinite",
                    }}
                  />

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className="text-[2rem] font-extrabold uppercase tracking-[0.16em]"
                      style={{
                        color: "rgba(0,0,0,0.82)",
                        textShadow: "0 0 12px rgba(255,255,255,0.55)",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {metaPercent}%
                    </span>
                  </div>
                </div>

                <span
                  className="text-[1.2rem] font-bold whitespace-nowrap"
                  style={{ color: WHITE_GLOW, textShadow: PINK_GLOW }}
                >
                  {formatarValor(META_MENSAL)}
                </span>
              </div>
            </div>

            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={{
                ...CARD_STYLE,
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 70%), #000",
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
                12.500,00
              </span>

              <span
                className="text-[2rem] font-semibold"
                style={{ color: GOLD, textShadow: GOLD_GLOW }}
              >
                3,2%
              </span>
            </div>
          </div>

          <div className="flex flex-1 gap-[1.6vw]">
            <div
              className="flex flex-[2] rounded-[32px] overflow-visible"
              style={{ ...CARD_FULL, background: BLOCO4_BACKGROUND }}
            >
              <table className="w-full h-full text-center text-white table-fixed">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[32%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[18%]" />
                </colgroup>

                <thead>
                  <tr style={{ background: TABLE_HEADER_BG }}>
                    {["Lead", "Empresa", "Vendedor", "Pipeline", "Valor"].map(
                      (label, idx) => (
                        <th
                          key={label}
                          className="text-[1.45rem] py-[0.6vh]"
                          style={{
                            color: WHITE_GLOW,
                            textShadow: PINK_GLOW,
                            textAlign: idx === 4 ? "center" : "center",
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
                      <td
                        className="py-[0.4vh] text-center"
                        style={{ color: WHITE_GLOW }}
                      >
                        {item.lead_id}
                      </td>

                      <td
                        className="text-center truncate px-[0.4vw]"
                        style={{ color: WHITE_GLOW }}
                      >
                        {item.empresa}
                      </td>

                      <td className="text-center" style={{ color: WHITE_GLOW }}>
                        {item.assigned}
                      </td>

                      <td className="text-center" style={{ color: WHITE_GLOW }}>
                        {item.pipeline}
                      </td>

                      <td
                        className="text-center pr-[1vw]"
                        style={{ color: WHITE_GLOW, whiteSpace: "nowrap" }}
                      >
                        {formatarValor(item.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={{
                ...CARD_STYLE,
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 70%), #000",
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
        </div>
      </div>
    </>
  );
}
