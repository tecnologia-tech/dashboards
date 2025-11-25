import { useEffect, useState, useRef } from "react";
import logolastdance from "../../assets/LastDance/lastdance.png";

const META_MENSAL = 1300000;
const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;900&display=swap");

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

export default function LastDance() {
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

function formatarDiaChave(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function isMesmaData(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ehDiaUtilConsiderandoFeriados(date, feriados = []) {
  const dia = date.getDay();
  const ehFeriado = feriados.some((f) => isMesmaData(f, date));
  return dia !== 0 && dia !== 6 && !ehFeriado;
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
      if (dia !== 0 && dia !== 6 && !ehFeriado) dias += 1;
      data.setDate(data.getDate() + 1);
    }

  return dias;
}

function listarDiasUteisComFeriados(inicio, fim, feriados = []) {
  const dias = [];
  const data = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate()
  );
  const limite = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());

  while (data <= limite) {
    if (ehDiaUtilConsiderandoFeriados(data, feriados)) {
      dias.push(new Date(data));
    }
    data.setDate(data.getDate() + 1);
  }
  return dias;
}

function calcularMetaPlanejadaHoje(
  valoresPorDia,
  diasUteis,
  hojeChave,
  metaMensal
) {
  let restante = metaMensal;
  let sobra = 0;

  for (let i = 0; i < diasUteis.length; i++) {
    const dia = diasUteis[i];
    const chave = formatarDiaChave(dia);
    const diasRestantes = diasUteis.length - i;
    const baseDia = diasRestantes > 0 ? restante / diasRestantes : 0;
    const metaDia = baseDia + sobra;
    const realizadoDia = valoresPorDia[chave] || 0;

    if (chave === hojeChave) {
      return metaDia;
    }

    const deficit = Math.max(metaDia - realizadoDia, 0);
    sobra = deficit;
    restante = Math.max(restante - realizadoDia, 0);
  }

  return Math.max(restante, 0);
}

  // LIBERA ÁUDIO
  useEffect(() => {
    const audio = new Audio("/audios/comemora.mp3");
    audio.loop = false;
    audioRef.current = audio;

    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    });

    const salvos = localStorage.getItem("lastdance_leads");
    if (salvos) idsAntigosRef.current = JSON.parse(salvos);
  }, []);

  // FETCH PRINCIPAL
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
          0,
          0
        );
        const fimMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        const pipelineIds = ["71", "23", "47", "59", "35", "63"];

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

        const ultimoDia = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const feriados = [new Date(hojeBR.getFullYear(), 10, 20)];

        const somaHoje = filtradosMes.reduce((acc, i) => {
          const dt = new Date(i.data);
          const mesmoDia =
            dt.getFullYear() === hojeBR.getFullYear() &&
            dt.getMonth() === hojeBR.getMonth() &&
            dt.getDate() === hojeBR.getDate();
          return mesmoDia ? acc + Number(i.valor || 0) : acc;
        }, 0);

        const valoresPorDia = filtradosMes.reduce((acc, item) => {
          const chave = formatarDiaChave(new Date(item.data));
          acc[chave] = (acc[chave] || 0) + Number(item.valor || 0);
          return acc;
        }, {});

        const diasUteisMes = listarDiasUteisComFeriados(
          inicioMes,
          ultimoDia,
          feriados
        );
        const hojeChave = formatarDiaChave(hojeBR);
        const metaPlanejadaHoje = calcularMetaPlanejadaHoje(
          valoresPorDia,
          diasUteisMes,
          hojeChave,
          META_MENSAL
        );
        setValorDiario(Math.max(metaPlanejadaHoje - somaHoje, 0));
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

  // ALERTA
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
        {/* BLOCO 1 - HEADER */}
        <div className="h-[16vh] w-full overflow-hidden rounded-b-[26px] border-[3px] border-[#cad003] border-t-0">
          <img
            src={logolastdance}
            className="h-full w-full object-cover"
            alt="Last Dance"
          />
        </div>

        {/* BLOCO 2 - META DIÁRIA */}
        <div
          className="relative flex h-[32vh] flex-col items-center justify-center overflow-hidden rounded-[32px] border-[4px] border-[#cad003] px-[1.5vw] py-[1.8vh] shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          style={{ backgroundImage: BLOCO2_BACKGROUND }}
        >
          <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[3px] border-dashed border-[rgba(255,255,255,0.25)]" />
          {mostrarVideo ? (
            <video
              className="relative z-[1] h-full w-full rounded-[26px] object-cover"
              src="/videos/comemora.mp4"
              autoPlay
              loop
              playsInline
            />
          ) : (
            <div className="relative z-[1] flex items-center gap-[2vw]">
              <div className="flex h-[12rem] w-[12rem] items-center justify-center rounded-full border-[3px] border-dashed border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.08)] shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
                <span className="text-[10rem] leading-none text-[#cad003] drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]">
                  ↓
                </span>
              </div>

              <div
                className="text-[12rem] font-black leading-none text-white"
                style={{
                  textShadow:
                    "0 18px 40px rgba(0,0,0,0.55), 0 0 40px rgba(202,208,3,0.85)",
                }}
              >
                {formatarValor(valorDiario)}
              </div>
            </div>
          )}
        </div>

        {/* BLOCO 3 - CONTAGEM TOTAL */}
        <div
          className="relative flex h-[20vh] flex-col justify-center overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#cad003] px-[1.5vw] py-[1.8vh] shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          style={{ background: "rgba(221,4,78,0.75)" }}
        >
          <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[3px] border-dashed border-[rgba(255,255,255,0.25)]" />
          <div className="relative z-[1] flex flex-col items-center gap-[2vh]">
            <div className="flex items-center justify-center gap-[1vw]">
              <span className="text-[2.2rem] font-bold text-white">
                Contagem total:
              </span>
              <span className="text-[4.5rem] font-black text-[#cad003]">
                {formatarValor(totalVendido)}
              </span>
            </div>

            <div className="relative h-[26px] w-[55%] rounded-full border-[3px] border-[#cad003] bg-[rgba(255,255,255,0.2)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${metaProgress * 100}%`,
                  background:
                    "linear-gradient(90deg, #cad003, #fffaa5, #ffffff)",
                  transition: "width 0.6s ease-out",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: PROGRESS_SPARKLES,
                  backgroundSize: "140% 100%",
                  animation: "progressShimmer 3s linear infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* BLOCO 4 + BLOCO 5 LADO A LADO */}
        <div className="flex h-[26vh] gap-[1.5vw]">
          {/* TABELA */}
          <div
            className="relative flex flex-[2] overflow-hidden rounded-[32px] border-[4px] border-[#cad003] px-[1.5vw] py-[1.8vh] shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            style={{ backgroundImage: BLOCO4_BACKGROUND }}
          >
            <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[3px] border-dashed border-[rgba(255,255,255,0.25)]" />
            <table className="relative z-[1] h-full w-full border-collapse text-center text-white">
              <thead>
                <tr>
                  <th
                    className="px-[1vw] py-[0.8vh] text-[1.5rem] font-bold"
                    style={{
                      backgroundColor: TABLE_HEADER_BG,
                      width: "12%",
                    }}
                  >
                    Lead
                  </th>
                  <th
                    className="px-[1vw] py-[0.8vh] text-[1.5rem] font-bold"
                    style={{
                      backgroundColor: TABLE_HEADER_BG,
                      width: "32%",
                    }}
                  >
                    Empresa
                  </th>
                  <th
                    className="px-[1vw] py-[0.8vh] text-[1.5rem] font-bold"
                    style={{
                      backgroundColor: TABLE_HEADER_BG,
                      width: "18%",
                    }}
                  >
                    Vendedor
                  </th>
                  <th
                    className="px-[1vw] py-[0.8vh] text-[1.5rem] font-bold"
                    style={{
                      backgroundColor: TABLE_HEADER_BG,
                      width: "18%",
                    }}
                  >
                    Pipeline
                  </th>
                  <th
                    className="px-[1vw] py-[0.8vh] text-[1.5rem] font-bold text-right"
                    style={{
                      backgroundColor: TABLE_HEADER_BG,
                      width: "20%",
                    }}
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="text-[1.2rem]">
                {dados.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? TABLE_ROW_ODD_BG : TABLE_ROW_EVEN_BG,
                    }}
                  >
                    <td className="px-[1vw] py-[0.4vh] align-middle font-semibold text-center">
                      {item.lead_id}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center">
                      {item.empresa}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center">
                      {item.assigned}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-center">
                      {item.pipeline}
                    </td>
                    <td className="px-[1vw] py-[0.4vh] align-middle text-right font-semibold">
                      {formatarValor(item.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PROJEÇÃO */}
          <div
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[32px] border-[3px] border-dashed border-[#cad003] px-[1.5vw] py-[1.8vh] text-center shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            style={{ background: "rgba(221,4,78,0.7)" }}
          >
            <div className="pointer-events-none absolute inset-[12px] rounded-[22px] border-[3px] border-dashed border-[rgba(255,255,255,0.25)]" />
            <div className="relative z-[1] text-[2rem] text-white">
              Projeção Geral
            </div>
            <div className="relative z-[1] text-[3.8rem] font-black text-[#cad003]">
              {formatarValor(somaOpen)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
