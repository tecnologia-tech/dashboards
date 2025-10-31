import { useEffect, useState, useRef } from "react";
import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

export default function DashLastDance() {
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [loopInfinito, setLoopInfinito] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const idsAntigosRef = useRef([]);

  const hojeBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === "") return "R$0,00";
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    if (isNaN(numero)) return "R$0,00";
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  useEffect(() => {
    const audio = new Audio("/audios/comemora.mp3");
    audio.loop = false;
    audio.volume = 1.0;
    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔊 Som já liberado automaticamente");
      })
      .catch(() => {
        console.log("🔒 Som bloqueado, mas sem overlay de clique");
      });

    const salvos = localStorage.getItem("lastdance_leads");
    if (salvos) {
      idsAntigosRef.current = JSON.parse(salvos);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await response.json();
        if (!Array.isArray(rawData) || rawData.length === 0) return;

        // ajusta data UTC -> BR (-3h)
        const data = rawData.map((item) => {
          const d = new Date(item.data);
          const br = new Date(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            d.getUTCHours() - 3,
            d.getUTCMinutes(),
            d.getUTCSeconds()
          );
          return { ...item, data: br };
        });

        const pipelines = [
          "IMPORTAÇÃO CONJUNTA 🧩",
          "CONSULTORIA LANNISTER 🦁",
          "REPEDIDO 🏆",
          "GANHO PRODUTO 🧸",
          "GANHO FRETE 🚢",
        ];

        const filtrados = data.filter((i) => pipelines.includes(i.pipeline));
        const recentes = [...filtrados]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(recentes);

        // --- DETECÇÃO DE NOVA VENDA ---
        const novosIds = recentes.map((r) => String(r.lead_id));
        const idsAntigos = idsAntigosRef.current;
        const idsQueSaoNovos = novosIds.filter(
          (id) => !idsAntigos.includes(id)
        );

        if (idsQueSaoNovos.length > 0 && !loopInfinito) {
          console.log("🎉 NOVA VENDA:", idsQueSaoNovos);
          idsAntigosRef.current = novosIds;
          localStorage.setItem("lastdance_leads", JSON.stringify(novosIds));
          tocarAlertaTemporario();
        } else if (idsAntigos.length === 0) {
          idsAntigosRef.current = novosIds;
          localStorage.setItem("lastdance_leads", JSON.stringify(novosIds));
        }

        // --- CÁLCULOS ---
        const soma = recentes.reduce(
          (acc, i) => acc + (parseFloat(i.valor) || 0),
          0
        );
        setTotal(soma);

        const hojeZ = new Date(hojeBR);
        hojeZ.setHours(0, 0, 0, 0);

        const somaHoje = filtrados
          .filter((i) => {
            const di = new Date(i.data);
            di.setHours(0, 0, 0, 0);
            return di.getTime() === hojeZ.getTime();
          })
          .reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0);

        const somaWons = filtrados
          .filter((i) => {
            const di = new Date(i.data);
            return (
              di.getMonth() === hojeBR.getMonth() &&
              di.getFullYear() === hojeBR.getFullYear()
            );
          })
          .reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        // === CORREÇÃO AQUI ===
        const ultimoDia = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const diasRestantes =
          Math.ceil((ultimoDia - hojeBR) / (1000 * 60 * 60 * 24)) + 1;

        let valorFinal;
        if (diasRestantes <= 1) {
          // Último dia do mês → mostra o restante total
          valorFinal = restante;
        } else {
          // Dias normais → divide proporcionalmente
          const valorBase = restante / diasRestantes;
          valorFinal = Math.max(valorBase - somaHoje, 0);
        }

        setValorDiario(Number(valorFinal.toFixed(2)));

        if (valorFinal <= 0 && !loopInfinito) {
          console.log("🏁 META BATIDA!");
          setLoopInfinito(true);
          tocarAlertaInfinito();
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    async function fetchSomaOpen() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsopen`
        );
        const data = await r.json();
        const soma = data.reduce(
          (acc, i) => acc + (parseFloat(i.valor) || 0),
          0
        );
        setSomaOpen(soma);
      } catch (e) {
        console.error("Erro ao buscar somaOpen:", e);
      }
    }

    fetchData();
    fetchSomaOpen();
    const int = setInterval(() => {
      fetchData();
      fetchSomaOpen();
    }, 30000);
    return () => clearInterval(int);
  }, [hojeBR, loopInfinito]);

  // ---- ALERTA (VÍDEO + ÁUDIO) ----
  function playSom() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.loop = true;
    audioRef.current
      .play()
      .then(() => console.log("🎶 som tocando"))
      .catch(() => console.warn("🔇 áudio bloqueado"));
  }

  function stopSom() {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.loop = false;
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

  function tocarAlertaInfinito() {
    clearTimeout(timerRef.current);
    setMostrarVideo(true);
    playSom();
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      stopSom();
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <img src={logolastdance} alt="Logo LastDance" />
      </div>

      <div className={styles.dashboard}>
        <div className={styles.valor}>
          {mostrarVideo ? (
            <video
              className={styles.videoLoop}
              src="/videos/comemora.mp4"
              autoPlay
              playsInline
              loop
              muted={false}
              onPlay={(e) => {
                e.target.muted = false;
                e.target.volume = 1.0;
              }}
            />
          ) : (
            <>
              <div className={styles.seta}>↓</div>
              <div className={styles.valorfaltadiario}>
                {formatarValor(valorDiario)}
              </div>
            </>
          )}
        </div>

        <div className={styles.valorfaltamensal}>
          <p>Contagem total:</p>
          <p>{formatarValor(faltamParaMetaMensal)}</p>
        </div>

        <div className={styles.tabelawon}>
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

        <div className={styles.meta}>
          <p className={styles.metaTitulo}>Projeção Geral</p>
          <p className={styles.metaValor}>{formatarValor(somaOpen)}</p>
        </div>
      </div>
    </div>
  );
}
