// =============================================================
//  BLACK FRIDAY – TEMA NEON (IDÊNTICO À LOGO BLACK.PNG)
// =============================================================

import { useEffect, useState, useRef } from "react";
import logoblackfriday from "../../assets/Black/black.png";

// 🔥 Paleta oficial baseada na logo black.png
const NEON_YELLOW = "#ffd83b";
const NEON_RED = "#ff2626";
const NEON_WHITE_GLOW = "rgba(255,255,255,0.75)";

const META_MENSAL = 1300000;

// Estilos globais + animações
const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;900&display=swap");

@keyframes pulseArrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12px); }
}
`;

// ==============================
// FUNDO idêntico à LOGO:
// Preto total com glow branco suave
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
// Vidro fosco + glow muito suave
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

// 🔹 Estilo único para TODOS os cards (igual ao da Projeção Geral)
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

export default function BlackFriday() {
  // -----------------------------------------------------------
  // ESTADOS
  // -----------------------------------------------------------

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

  // -----------------------------------------------------------
  // FORMATADOR
  // -----------------------------------------------------------
  function formatarValor(valor) {
    if (!valor) return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // -----------------------------------------------------------
  // USE EFFECTS (fetch + áudio)
  // -----------------------------------------------------------

  // Áudio
  useEffect(() => {
    audioRef.current = new Audio("/audios/comemora.mp3");
  }, []);

  // Dados API
  // Dados API
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

        const pipelines = [
          "IMPORTAÇÃO CONJUNTA 🧩",
          "CONSULTORIA LANNISTER 🦁",
          "REPEDIDO 🏆",
          "GANHO PRODUTO 🧸",
          "GANHO FRETE 🚢",
          "FEE MENSAL 🚀",
        ];

        // =============================
        // FILTRAR VENDAS DO MÊS
        // =============================
        const filtradosMes = rawData.filter((i) => {
          const dt = new Date(i.data);
          return (
            pipelines.includes(i.pipeline) && dt >= inicioMes && dt <= fimMes
          );
        });

        // 3 mais recentes
        const recentes = [...filtradosMes]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);
        setDados(recentes);

        // SOMA DO MÊS
        const somaMes = filtradosMes.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );
        setTotalVendido(somaMes);

        // =============================
        // VALOR QUE FALTA PRA META
        // =============================
        const restante = Math.max(META_MENSAL - somaMes, 0);
        setFaltamParaMetaMensal(restante);

        // =============================
        // DIAS ÚTEIS RESTANTES (INCLUINDO HOJE)
        // =============================
        function contarDiasUteisRestantes() {
          const hoje = new Date();
          const ultimoDia = new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            0
          );

          let dias = 0;
          for (
            let d = new Date(hoje);
            d <= ultimoDia;
            d.setDate(d.getDate() + 1)
          ) {
            const diaSemana = d.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) dias++; // 0 = domingo, 6 = sábado
          }
          return dias;
        }

        const diasRestantesUteis = contarDiasUteisRestantes();

        // =============================
        // VENDAS DO DIA (DESCONTAR DA META)
        // =============================
        const vendasHoje = filtradosMes.filter((i) => {
          const dt = new Date(i.data);
          return dt.toDateString() === hojeBR.toDateString();
        });

        const totalHoje = vendasHoje.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );

        // =============================
        // META DIÁRIA AJUSTADA
        // =============================
        const valorBase =
          diasRestantesUteis > 0 ? restante / diasRestantesUteis : 0;

        const metaAjustada = Math.max(valorBase - totalHoje, 0);

        setValorDiario(metaAjustada);
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
  }, []);

  // -----------------------------------------------------------
  // SOM
  // -----------------------------------------------------------
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

  // Progresso meta
  const metaProgress = Math.min(
    1,
    Math.max(0, 1 - faltamParaMetaMensal / META_MENSAL)
  );

  // -----------------------------------------------------------
  // RETORNO DO COMPONENTE
  // -----------------------------------------------------------

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
                Faltam hoje para a meta
              </span>

              <div
                className="text-[13rem] font-black leading-none"
                style={{ color: NEON_RED, textShadow: RED_GLOW }}
              >
                {formatarValor(valorDiario)}
              </div>
            </div>
          </div>
        </div>

        {/* CONTAGEM + PROGRESSO */}
        <div
          className="relative flex h-[20vh] flex-col items-center justify-center gap-[2vh] rounded-[32px]"
          style={CARD_FULL}
        >
          <div className="flex items-center gap-[1vw]">
            <span
              className="text-[3rem] font-bold"
              style={{ color: NEON_YELLOW, textShadow: YELLOW_GLOW }}
            >
              Contagem total:
            </span>

            <span
              className="text-[5rem] font-black"
              style={{ color: NEON_RED, textShadow: RED_GLOW }}
            >
              {formatarValor(totalVendido)}
            </span>
          </div>

          <div className="w-[60%] h-[40px] rounded-full bg-black/60 shadow-[0_0_14px_rgba(255,255,255,0.12)] relative">
            <div
              className="h-full rounded-full"
              style={{
                width: `${metaProgress * 100}%`,
                background: `linear-gradient(90deg, ${NEON_YELLOW}, #fff6cc)`,
                boxShadow: YELLOW_GLOW,
                transition: "0.4s ease-out",
              }}
            />
          </div>
        </div>

        {/* TABELA + PROJEÇÃO */}
        <div className="flex h-[24vh] gap-[1.6vw]">
          {/* TABELA */}
          <div
            className="flex flex-[2] rounded-[32px] overflow-hidden"
            style={CARD_FULL}
          >
            <table className="w-full h-full text-center text-white">
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.45)" }}>
                  {["Lead", "Empresa", "Vendedor", "Pipeline", "Valor"].map(
                    (label, idx) => (
                      <th
                        key={label}
                        className={`text-[1.5rem] py-[0.9vh] ${
                          idx === 4 ? "text-right pr-[1vw]" : "text-center"
                        }`}
                        style={{ color: NEON_RED, textShadow: RED_GLOW }}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="text-[1.7rem]">
                {dados.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        i % 2 === 0
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <td
                      className="py-[0.6vh]"
                      style={{ color: NEON_WHITE_GLOW }}
                    >
                      {item.lead_id}
                    </td>
                    <td style={{ color: NEON_WHITE_GLOW }}>{item.empresa}</td>
                    <td style={{ color: NEON_WHITE_GLOW }}>{item.assigned}</td>
                    <td style={{ color: NEON_WHITE_GLOW }}>{item.pipeline}</td>
                    <td
                      className="text-right pr-[1vw] "
                      style={{ color: NEON_WHITE_GLOW }}
                    >
                      {formatarValor(item.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PROJEÇÃO */}
          <div
            className="flex flex-col flex-1 items-center justify-center rounded-[32px] text-center"
            style={{
              ...CARD_STYLE,
              background:
                "radial-gradient(circle at center, rgba(255,38,38,0.20), transparent 70%), #000",
            }}
          >
            <span
              className="text-[2.5rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: NEON_YELLOW, textShadow: YELLOW_GLOW }}
            >
              Projeção Geral
            </span>

            <span
              className="text-[6rem] font-black"
              style={{ color: NEON_RED, textShadow: RED_GLOW }}
            >
              {formatarValor(somaOpen)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
