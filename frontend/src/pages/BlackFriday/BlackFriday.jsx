import { useEffect, useState, useRef } from "react";
import logoblackfriday from "../../assets/Black/black.png";

const META_MENSAL = 1300000;
const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;900&display=swap");
`;
const ROOT_BACKGROUND =
  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 55%), #000000";
const BLOCK_BACKGROUND = ROOT_BACKGROUND;
const HERO_ARROW_SHADOW =
  "0 0 12px rgba(255, 227, 90, 0.55), 0 0 22px rgba(255, 227, 90, 0.35)";
const HERO_VALUE_SHADOW =
  "0 0 10px rgba(255, 38, 38, 0.55), 0 0 22px rgba(255, 38, 38, 0.35)";
const COUNTER_LABEL_SHADOW = "0 0 10px rgba(255, 227, 90, 0.55)";
const COUNTER_VALUE_SHADOW = "0 0 12px rgba(255, 38, 38, 0.55)";
const PROJECTION_LABEL_SHADOW = "0 0 10px rgba(255, 227, 90, 0.55)";
const PROJECTION_VALUE_SHADOW = "0 0 12px rgba(255, 38, 38, 0.55)";
const TABLE_HEADER_BG = "#0f0f0f";

export default function BlackFriday() {
  const [dados, setDados] = useState([]);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);
  const [totalVendido, setTotalVendido] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const idsAntigosRef = useRef([]);

  const hojeBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  function formatarValor(valor) {
    if (!valor) return "R$ 0,00";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function isMesmaData(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function contarDiasUteis(inicio, fim, feriados = []) {
    const data = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate()
    );
    const limite = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
    let dias = 0;

    while (data <= limite) {
      const dia = data.getDay();
      const ehFeriado = feriados.some((f) => isMesmaData(f, data));
      if (dia !== 0 && dia !== 6 && !ehFeriado) dias++;
      data.setDate(data.getDate() + 1);
    }
    return dias;
  }

  useEffect(() => {
    const audio = new Audio("/audios/comemora.mp3");
    audioRef.current = audio;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    });

    const salvos = localStorage.getItem("blackfriday_leads");
    if (salvos) idsAntigosRef.current = JSON.parse(salvos);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await r.json();
        if (!Array.isArray(rawData)) return;

        const inicioMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth(),
          1,
          0,
          0,
          0
        );
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

        const filtrados = rawData.filter((i) => pipelines.includes(i.pipeline));
        const filtradosMes = filtrados.filter((i) => {
          const dt = new Date(i.data);
          return dt >= inicioMes && dt <= fimMes;
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

        const ultimoDia = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const feriados = [new Date(hojeBR.getFullYear(), 10, 20)];

        const diasRestantesUteis =
          contarDiasUteis(hojeBR, ultimoDia, feriados) || 1;

        const somaHoje = filtradosMes.reduce((acc, i) => {
          const dt = new Date(i.data);
          const mesmoDia =
            dt.getDate() === hojeBR.getDate() &&
            dt.getMonth() === hojeBR.getMonth() &&
            dt.getFullYear() === hojeBR.getFullYear();
          return mesmoDia ? acc + Number(i.valor || 0) : acc;
        }, 0);

        const valorBase = restante / diasRestantesUteis;
        setValorDiario(Math.max(valorBase - somaHoje, 0));
      } catch {}
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
    audioRef.current.loop = true;
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
    }, 15000);
  }

  const metaProgress = Math.min(
    1,
    Math.max(0, 1 - faltamParaMetaMensal / META_MENSAL)
  );

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="flex h-screen w-full flex-col overflow-hidden text-white"
        style={{
          backgroundImage: ROOT_BACKGROUND,
          fontFamily: "'Baloo 2', sans-serif",
          padding: "0 1.5vw 1vh 1.5vw",
          gap: "1.8vh",
        }}
      >
        {/* BLOCO 1 */}
        <div className="h-[16vh] w-full overflow-hidden rounded-b-[26px] border border-dashed border-[#0a0a0a] border-t-0 shadow-[0_0_18px_rgba(255,38,38,0.35)]">
          <img
            src={logoblackfriday}
            className="h-full w-full object-cover"
            alt="Black Friday"
          />
        </div>

        {/* BLOCO 2 */}
        <div
          className="relative flex h-[40vh] flex-col items-center justify-center overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#0a0a0a] px-[1.5vw] py-[1.8vh] shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
          style={{ backgroundImage: BLOCK_BACKGROUND }}
        >
          <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[2px] border-dashed border-[rgba(255,230,90,0.22)]" />
          {mostrarVideo ? (
            <video
              className="relative z-[1] h-full w-full rounded-[28px] object-cover"
              src="/videos/comemora.mp4"
              autoPlay
              loop
              playsInline
            />
          ) : (
            <div className="relative z-[1] flex items-center gap-[2vw]">
              <div className="flex h-[12rem] w-[12rem] items-center justify-center rounded-full border-[3px] border-dashed border-[rgba(255,230,90,0.4)] bg-[rgba(255,255,255,0.05)]">
                <span
                  className="text-[10rem] leading-none text-[#ffe35a]"
                  style={{ textShadow: HERO_ARROW_SHADOW }}
                >
                  ↓
                </span>
              </div>
              <div
                className="text-[12rem] font-black leading-none text-[#ff2626]"
                style={{ textShadow: HERO_VALUE_SHADOW }}
              >
                {formatarValor(valorDiario)}
              </div>
            </div>
          )}
        </div>

        {/* BLOCO 3 */}
        <div
          className="relative flex h-[21vh] flex-col justify-center overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#0a0a0a] px-[1.5vw] py-[1.8vh] shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
          style={{ backgroundImage: BLOCK_BACKGROUND }}
        >
          <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[2px] border-dashed border-[rgba(255,230,90,0.22)]" />
          <div className="relative z-[1] flex flex-col items-center gap-[2vh]">
            <div className="flex items-center justify-center gap-[1vw]">
              <span
                className="text-[2.2rem] font-bold text-[#ffe35a]"
                style={{ textShadow: COUNTER_LABEL_SHADOW }}
              >
                Contagem total:
              </span>
              <span
                className="text-[4.5rem] font-black text-[#ff2626]"
                style={{ textShadow: COUNTER_VALUE_SHADOW }}
              >
                {formatarValor(totalVendido)}
              </span>
            </div>

            <div className="relative h-[26px] w-[55%] rounded-full border-[3px] border-[#ffe35a] bg-[rgba(255,227,90,0.15)] shadow-[0_0_14px_rgba(255,227,90,0.35)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${metaProgress * 100}%`,
                  background: "linear-gradient(90deg, #ffe35a, #fff2a0)",
                  transition: "width 0.6s ease-out",
                }}
              />
            </div>
          </div>
        </div>

        {/* BLOCO 4 + BLOCO 5 */}
        <div className="flex h-[23vh] gap-[1.5vw]">
          <div
            className="relative flex flex-[2] overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#0a0a0a] px-[1.5vw] py-[1.8vh] shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
            style={{ backgroundImage: BLOCK_BACKGROUND }}
          >
            <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[2px] border-dashed border-[rgba(255,230,90,0.22)]" />
            <table className="relative z-[1] h-full w-full border-collapse text-center text-white">
              <thead>
                <tr>
                  {["Lead", "Empresa", "Vendedor", "Pipeline", "Valor"].map(
                    (label, idx) => (
                      <th
                        key={label}
                        className={`px-[1vw] py-[0.8vh] text-[1.5rem] font-bold ${
                          idx === 4 ? "text-right" : ""
                        }`}
                        style={{
                          backgroundColor: TABLE_HEADER_BG,
                          color: "#ff2626",
                          textShadow: "0 0 10px rgba(255,38,38,0.45)",
                        }}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="text-[1.2rem]">
                {dados.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor:
                        i % 2 === 0
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center text-[#fff2a0]">
                      {item.lead_id}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center text-[#fff2a0]">
                      {item.empresa}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center text-[#fff2a0]">
                      {item.assigned}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center text-[#fff2a0]">
                      {item.pipeline}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-right text-[#fff2a0]">
                      {formatarValor(item.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#0a0a0a] px-[1.5vw] py-[1.8vh] text-center shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
            style={{ backgroundImage: BLOCK_BACKGROUND }}
          >
            <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[2px] border-dashed border-[rgba(255,230,90,0.22)]" />
            <div
              className="relative z-[1] text-[2rem] text-[#ffe35a]"
              style={{ textShadow: PROJECTION_LABEL_SHADOW }}
            >
              Projeção Geral
            </div>
            <div
              className="relative z-[1] text-[3.8rem] font-black text-[#ff2626]"
              style={{ textShadow: PROJECTION_VALUE_SHADOW }}
            >
              {formatarValor(somaOpen)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
