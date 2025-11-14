import { useEffect, useState, useRef } from "react";
import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

const META_MENSAL = 1300000;

export default function DashLastDance() {
  const [dados, setDados] = useState([]);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);

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

        const pipelines = [
          "IMPORTAÇÃO CONJUNTA 🧩",
          "CONSULTORIA LANNISTER 🦁",
          "REPEDIDO 🏆",
          "GANHO PRODUTO 🧸",
          "GANHO FRETE 🚢",
          "FEE MENSAL 🚀",
        ];

        const filtrados = rawData.filter((i) => pipelines.includes(i.pipeline));
        const recentes = [...filtrados]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(recentes);

        const somaMes = filtrados.reduce(
          (acc, i) => acc + Number(i.valor || 0),
          0
        );
        const restante = META_MENSAL - somaMes;
        setFaltamParaMetaMensal(restante);

        const ultimoDia = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const diasRestantes =
          Math.ceil((ultimoDia - hojeBR) / (1000 * 60 * 60 * 24)) + 1;

        const valorBase = restante / diasRestantes;
        setValorDiario(Math.max(valorBase, 0));
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
    <div className={styles.root}>
      {/* BLOCO 1 - HEADER */}
      <div className={styles.bloco1}>
        <img src={logolastdance} className={styles.headerImage} />
      </div>

      {/* BLOCO 2 - META DIÁRIA */}
      <div className={styles.bloco2}>
        {mostrarVideo ? (
          <video
            className={styles.videoLoop}
            src="/videos/comemora.mp4"
            autoPlay
            loop
            playsInline
          />
        ) : (
          <>
            <div className={styles.heroRow}>
              <div className={styles.heroOrbit}>
                <span className={styles.heroArrow}>↓</span>
              </div>

              <div className={styles.heroValue}>
                {formatarValor(valorDiario)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* BLOCO 3 - CONTAGEM TOTAL */}
      <div className={styles.bloco3}>
        <div className={styles.counterRow}>
          <span className={styles.counterLabel}>Contagem total:</span>
          <span className={styles.counterValueBig}>
            {formatarValor(faltamParaMetaMensal)}
          </span>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${metaProgress * 100}%` }}
          />
          <div className={styles.progressSparkles} />
        </div>
      </div>

      {/* BLOCO 4 + BLOCO 5 LADO A LADO */}
      <div className={styles.rowFlex}>
        {/* TABELA */}
        <div className={styles.bloco4}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Empresa</th>
                <th>Vendedor</th>
                <th>Pipeline</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => (
                <tr key={i}>
                  <td>{item.lead_id}</td>
                  <td>{item.empresa}</td>
                  <td>{item.assigned}</td>
                  <td>{item.pipeline}</td>
                  <td>{formatarValor(item.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PROJEÇÃO */}
        <div className={styles.bloco5}>
          <div className={styles.projecaoTitulo}>Projeção Geral</div>
          <div className={styles.projecaoValor}>{formatarValor(somaOpen)}</div>
        </div>
      </div>
    </div>
  );
}
