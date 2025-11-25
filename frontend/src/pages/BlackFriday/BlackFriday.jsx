// =============================================================
//  BLACK FRIDAY – TEMA NEON (IDÊNTICO À LOGO BLACK.PNG)
// =============================================================

import { useEffect, useState, useRef } from "react";
import logoblackfriday from "../../assets/Black/black.png";

// 🔥 Paleta oficial baseada na logo black.png
const NEON_YELLOW = "#ffd83b";
const NEON_RED = "#ff2626";
const NEON_WHITE_GLOW = "rgba(255,255,255,0.75)";

const META_MENSAL = 1000000;

// Estilos globais + animações
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
  0% { box-shadow: 0 0 0 0 rgba(255,216,59,0.38); transform: scale(1); }
  70% { box-shadow: 0 0 0 10px rgba(255,216,59,0); transform: scale(1.05); }
  100% { box-shadow: 0 0 0 0 rgba(255,216,59,0); transform: scale(1); }
}
`;

// ==============================
// FUNDO idêntico à LOGO
// ==============================
const ROOT_BACKGROUND = `
radial-gradient(
  circle at center,
  rgba(0,0,0,1) 0%,
  rgba(0,0,0,1) 100%,
  rgba(255,255,255,0.008) 100%
)
`;

// ==============================
// CARD PREMIUM BLACK FRIDAY
// ==============================
const CARD_BG = `
linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.92) 100%)
`;

const CARD_STYLE = {
  backgroundImage: CARD_BG,
  backdropFilter: "blur(6px)",
  border: "2px solid rgba(255,255,255,0.10)",
  boxShadow: "0 0 18px rgba(255,255,255,0.08), inset 0 0 24px rgba(0,0,0,0.45)",
};

const CARD_FULL = {
  ...CARD_STYLE,
  background:
    "radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 70%), #000",
};

// ==============================
// SHADOWS
// ==============================
const YELLOW_GLOW = `0 0 12px ${NEON_YELLOW}, 0 0 32px rgba(255,216,59,0.55)`;
const RED_GLOW = `0 0 14px ${NEON_RED}, 0 0 36px rgba(255,38,38,0.70)`;
const WHITE_GLOW = `
  0 0 6px ${NEON_WHITE_GLOW},
  0 0 14px rgba(255,255,255,0.75),
  0 0 22px rgba(255,255,255,0.35)
`;

// ==============================
// HELPERS DE DATA E FORMATAÇÃO
// ==============================
function isDiaUtil(d) {
  const diaSemana = d.getDay();
  return diaSemana !== 0 && diaSemana !== 6;
}

function contarDiasUteisRestantes(dataRef) {
  const ultimoDia = new Date(dataRef.getFullYear(), dataRef.getMonth() + 1, 0);

  let dias = 0;
  for (let d = new Date(dataRef); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
    if (isDiaUtil(d)) dias++;
  }
  return dias;
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
export default function BlackFriday() {
  // ESTADOS
  const [dados, setDados] = useState([]);
  const [valorDiario, setValorDiario] = useState(0);
  const [totalVendido, setTotalVendido] = useState(0);
  const [somaOpen, setSomaOpen] = useState(0);
  const [totalEstornos, setTotalEstornos] = useState(0);
  const [percentualEstornos, setPercentualEstornos] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const hojeBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  const numero = formatarValor(valorDiario);

  // AUDIO
  useEffect(() => {
    audioRef.current = new Audio("/audios/comemora.mp3");
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

  // ==============================
  // FETCH PRINCIPAL (VENDAS / META DIÁRIA)
  // ==============================
  useEffect(() => {
    async function fetchData() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await r.json();
        if (!Array.isArray(rawData)) return;

        const inicioMes = new Date(hojeBR.getFullYear(), hojeBR.getMonth(), 1);

        const pipelineIds = ["71", "23", "47"];

        const filtradosMes = rawData.filter((i) => {
          const dt = new Date(i.data);
          return (
            pipelineIds.includes(String(i.pipeline_id)) &&
            dt >= inicioMes &&
            dt <= hojeBR
          );
        });

        // ultimas 3
        const recentes = [...filtradosMes]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);
        setDados(recentes);

        // TOTAL VENDIDO (SÓ DOS PIPELINES)
        const somaMes = filtradosMes.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );
        setTotalVendido(somaMes);

        // META BASE
        const restanteMes = Math.max(META_MENSAL - somaMes, 0);
        const diasRestantes = contarDiasUteisRestantes(hojeBR);

        const valorBaseHoje =
          diasRestantes > 0 ? restanteMes / diasRestantes : restanteMes;

        // VENDIDO HOJE
        const vendasHoje = filtradosMes.filter((i) => {
          const dt = new Date(i.data);
          return dt.toDateString() === hojeBR.toDateString();
        });

        const vendidoHoje = vendasHoje.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );

        let metaAjustadaHoje = Math.max(valorBaseHoje - vendidoHoje, 0);

        // ONTEM (DIA ÚTIL)
        let ontemRef = new Date(hojeBR);
        ontemRef.setDate(ontemRef.getDate() - 1);

        while (
          !isDiaUtil(ontemRef) &&
          ontemRef.getTime() >= inicioMes.getTime()
        ) {
          ontemRef.setDate(ontemRef.getDate() - 1);
        }

        let vendidoOntem = 0;
        let metaDiariaOntem = 0;
        let saldoOntem = 0;

        if (isDiaUtil(ontemRef)) {
          const vendasOntem = filtradosMes.filter((i) => {
            const dt = new Date(i.data);
            return dt.toDateString() === ontemRef.toDateString();
          });

          vendidoOntem = vendasOntem.reduce(
            (acc, i) => acc + Number(i.valor || 0),
            0
          );

          const totalVendidoAteOntem = filtradosMes
            .filter((i) => new Date(i.data) <= ontemRef)
            .reduce((acc, i) => acc + Number(i.valor || 0), 0);

          const restanteAteOntem = Math.max(
            META_MENSAL - totalVendidoAteOntem,
            0
          );

          const diasRestantesOntem = contarDiasUteisRestantes(ontemRef);

          metaDiariaOntem =
            diasRestantesOntem > 0
              ? (restanteAteOntem + vendidoOntem) / diasRestantesOntem
              : 0;

          saldoOntem = metaDiariaOntem - vendidoOntem;

          // ✅ Regra A: saldo positivo soma, saldo negativo diminui
          metaAjustadaHoje = Math.max(metaAjustadaHoje + saldoOntem, 0);
        }

        setValorDiario(metaAjustadaHoje);

        // DEBUG
        console.group("DEBUG META DIÁRIA BLACK FRIDAY");
        console.log("TOTAL_VENDIDO:", somaMes.toFixed(2));
        console.log("META_MENSAL:", META_MENSAL.toFixed(2));
        console.log("DIAS_UTEIS_RESTANTES:", diasRestantes);
        console.log("META_BASE_HOJE:", valorBaseHoje.toFixed(2));
        console.log("VENDIDO_HOJE:", vendidoHoje.toFixed(2));
        console.log("VENDIDO_ONTEM:", vendidoOntem.toFixed(2));
        console.log("META_ONTEM:", metaDiariaOntem.toFixed(2));
        console.log("SALDO_ONTEM:", saldoOntem.toFixed(2));
        console.log("META_AJUSTADA_FINAL:", metaAjustadaHoje.toFixed(2));
        console.groupEnd();
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
        if (!Array.isArray(data)) return;
        setSomaOpen(data.reduce((acc, i) => acc + Number(i.valor || 0), 0));
      } catch {
        // silencioso
      }
    }

    fetchData();
    fetchOpen();
  }, []);

  // ==============================
  // ESTORNOS
  // ==============================
  useEffect(() => {
    async function calcularEstornosEPercentual() {
      try {
        const rGeral = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const vendas = await rGeral.json();

        const rEstornos = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_reembolso`
        );
        const reembolsos = await rEstornos.json();

        if (!Array.isArray(vendas) || !Array.isArray(reembolsos)) return;

        const inicioMes = new Date(hojeBR.getFullYear(), hojeBR.getMonth(), 1);
        const fimMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        const totalGeral = vendas
          .filter((i) => {
            const dt = new Date(i.data);
            return dt >= inicioMes && dt <= fimMes;
          })
          .reduce((acc, i) => acc + Number(i.valor || 0), 0);

        const totalEstornos = reembolsos
          .filter((item) => {
            const dt = new Date(item?.Data_de_Devolucao);
            return (
              dt >= inicioMes &&
              dt <= fimMes &&
              item?.Devolucao_Status === "Feito ✅"
            );
          })
          .reduce((acc, item) => {
            const valorSanitizado = String(item?.Estorno_R || "0")
              .replace(/\s/g, "")
              .replace("R$", "")
              .replace(/\./g, "")
              .replace(",", ".");
            const valor = parseFloat(valorSanitizado);
            return acc + (Number.isFinite(valor) ? valor : 0);
          }, 0);

        setTotalEstornos(totalEstornos);

        const percentual =
          totalGeral > 0 ? (totalEstornos / totalGeral) * 100 : 0;
        setPercentualEstornos(percentual);

        console.log("DEBUG totalGeral:", totalGeral);
        console.log("DEBUG totalEstornos:", totalEstornos);
        console.log("DEBUG percentualEstornos:", percentual);
      } catch (err) {
        console.log("Erro ao calcular estornos:", err);
      }
    }

    calcularEstornosEPercentual();
  }, []);

  // ==============================
  // BARRA DE PROGRESSO MENSAL
  // ==============================
  const metaProgress = Math.min(1, totalVendido / META_MENSAL);
  const metaPercent = (metaProgress * 100).toFixed(2).replace(".", ",");

  // ==============================
  // RENDER
  // ==============================
  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {/* VIDEO EM TELA CHEIA */}
      {mostrarVideo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85">
          <video
            autoPlay
            loop
            playsInline
            className="h-[90vh] w-auto rounded-[24px] shadow-[0_0_32px_white]"
            src="/videos/comemora.mp4"
          />
        </div>
      )}

      {/* FUNDO BASE */}
      <div
        className="flex h-screen w-full flex-col overflow-hidden text-white"
        style={{
          backgroundImage: ROOT_BACKGROUND,
          backgroundSize: "cover",
          fontFamily: "'Baloo 2'",
          padding: "0 1.8vw 1.8vh 1.8vw",
          gap: "1.6vh",
        }}
      >
        {/* LOGO */}
        <div
          className="h-[15vh] w-full rounded-b-[26px] overflow-hidden shadow-[0_0_26px_rgba(255,255,255,0.28)]"
          style={{
            border: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          <img src={logoblackfriday} className="h-full w-full object-contain" />
        </div>

        {/* BLOCO HERO */}
        <div
          className="relative flex h-[38vh] items-center justify-center rounded-[32px]"
          style={CARD_FULL}
        >
          <div className="flex items-center gap-[2vw]">
            <div
              className="h-[10rem] w-[10rem] rounded-full flex items-center justify-center"
              style={{
                border: "2px solid rgba(255,255,255,0.15)",
                background: "rgba(0,0,0,0.55)",
                boxShadow: WHITE_GLOW,
              }}
            >
              <span
                className="text-[8rem] text-[#ffd83b] select-none"
                style={{
                  textShadow: YELLOW_GLOW,
                  animation: "pulseArrow 1.5s infinite",
                }}
              >
                ↓
              </span>
            </div>

            <div className="flex flex-col gap-[1.4vh]">
              <span
                className="text-[2.3rem] font-bold uppercase tracking-[0.14em]"
                style={{ color: NEON_YELLOW, textShadow: YELLOW_GLOW }}
              >
                Faltam hoje para a meta diária
              </span>

              <div className="flex items-end gap-[1rem] leading-none">
                <span
                  style={{
                    fontFamily: "'NeonLight Regular', sans-serif",
                    fontSize: "13rem",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.92)",
                    WebkitTextStroke: "1.1px rgba(255,255,255,0.9)",
                    textShadow: `
                      0 0 8px rgba(255,255,255,0.9),
                      0 0 20px rgba(255,255,255,0.6),
                      0 0 36px rgba(255,255,255,0.45)
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

        {/* BLOCOS INFERIORES */}
        <div className="flex flex-col flex-1 gap-[1.6vh]">
          {/* CONTAGEM + PROJEÇÃO */}
          <div className="flex flex-1 gap-[1.6vw]">
            <div
              className="relative flex flex-[2] flex-col items-center justify-center gap-[0.5vh] rounded-[32px]"
              style={CARD_FULL}
            >
              <div className="flex items-center gap-[1vw]">
                <span
                  className="text-[3rem] font-bold"
                  style={{ color: NEON_YELLOW, textShadow: YELLOW_GLOW }}
                >
                  Contagem total vendida:
                </span>

                <span
                  className="text-[5rem] font-black"
                  style={{
                    color: NEON_WHITE_GLOW,
                    textShadow: WHITE_GLOW,
                    fontFamily: "'NeonLight Regular', sans-serif",
                  }}
                >
                  {formatarValor(totalVendido)}
                </span>
              </div>

              <div className="relative w-[62%] mt-[0.4vh] flex items-center gap-[12px]">
                <div
                  className="relative flex-1 h-[34px] rounded-full overflow-hidden"
                  style={{
                    background: "linear-gradient(90deg, #0f0f0f, #161616)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    className="h-full rounded-full relative"
                    style={{
                      width: `${metaProgress * 100}%`,
                      background: `linear-gradient(90deg, ${NEON_YELLOW} 0%, #fff7bf 55%, #ffd83b 100%)`,
                      boxShadow: YELLOW_GLOW,
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
                  style={{
                    color: NEON_WHITE_GLOW,
                    textShadow: WHITE_GLOW,
                    fontFamily: "'NeonLight Regular', sans-serif",
                  }}
                >
                  {formatarValor(META_MENSAL)}
                </span>
              </div>
            </div>

            {/* PROJEÇÃO GERAL */}
            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={CARD_FULL}
            >
              <span
                className="text-[2.5rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: NEON_YELLOW, textShadow: YELLOW_GLOW }}
              >
                Projeção Geral
              </span>

              <span
                className="text-[6rem] font-black"
                style={{
                  color: WHITE_GLOW,
                  textShadow: WHITE_GLOW,
                  fontFamily: "'NeonLight Regular', sans-serif",
                }}
              >
                {formatarValor(somaOpen)}
              </span>
            </div>
          </div>

          {/* TABELA + ESTORNOS */}
          <div className="flex flex-1 gap-[1.6vw]">
            <div
              className="flex flex-[2] rounded-[32px] overflow-visible"
              style={CARD_FULL}
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
                  <tr style={{ background: "rgba(0,0,0,0.45)" }}>
                    {["Lead", "Empresa", "Vendedor", "Pipeline", "Valor"].map(
                      (label) => (
                        <th
                          key={label}
                          className="text-[1.45rem] py-[0.6vh]"
                          style={{
                            color: NEON_RED,
                            textShadow: RED_GLOW,
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
                          i % 2 === 0
                            ? "rgba(255,255,255,0.025)"
                            : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <td
                        className="py-[0.4vh] text-center"
                        style={{ color: NEON_WHITE_GLOW }}
                      >
                        {item.lead_id}
                      </td>

                      <td
                        className="text-center truncate px-[0.4vw]"
                        style={{ color: NEON_WHITE_GLOW }}
                      >
                        {item.empresa}
                      </td>

                      <td
                        className="text-center"
                        style={{ color: NEON_WHITE_GLOW }}
                      >
                        {item.assigned}
                      </td>

                      <td
                        className="text-center"
                        style={{ color: NEON_WHITE_GLOW }}
                      >
                        {item.pipeline}
                      </td>

                      <td
                        className="text-center pr-[1vw]"
                        style={{ color: NEON_WHITE_GLOW, whiteSpace: "nowrap" }}
                      >
                        {formatarValor(item.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ESTORNOS */}
            <div
              className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
              style={CARD_FULL}
            >
              <span
                className="text-[2.5rem] font-bold uppercase tracking-[0.18em]"
                style={{ color: NEON_RED, textShadow: RED_GLOW }}
              >
                Estornos
              </span>

              <span
                className="text-[6rem] font-black leading-none"
                style={{
                  color: NEON_RED,
                  textShadow: RED_GLOW,
                  fontFamily: "'NeonLight Regular', sans-serif",
                }}
              >
                {formatarValor(totalEstornos)}
              </span>

              <span
                className="text-[4rem] font-semibold"
                style={{
                  color: NEON_WHITE_GLOW,
                  textShadow: WHITE_GLOW,
                  fontFamily: "'NeonLight Regular', sans-serif",
                }}
              >
                {percentualEstornos.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
