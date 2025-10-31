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

  const ultimaLeadIdRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

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
    async function fetchData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await response.json();

        if (!Array.isArray(rawData) || rawData.length === 0) return;

        const data = rawData.map((item) => {
          const dataOriginal = new Date(item.data);
          const dataBrasil = new Date(
            dataOriginal.getUTCFullYear(),
            dataOriginal.getUTCMonth(),
            dataOriginal.getUTCDate(),
            dataOriginal.getUTCHours() - 3,
            dataOriginal.getUTCMinutes(),
            dataOriginal.getUTCSeconds()
          );
          return { ...item, data: dataBrasil };
        });

        const dadosFiltrados = [...data]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);
        setDados(dadosFiltrados);

        // 🔍 Detecta nova lead
        const idMaisRecente = String(dadosFiltrados[0]?.lead_id || "");
        const idAnterior = String(ultimaLeadIdRef.current || "");

        if (idMaisRecente && idMaisRecente !== idAnterior && !loopInfinito) {
          ultimaLeadIdRef.current = idMaisRecente;
          tocarVideoEAudioTemporario();
        } else if (!ultimaLeadIdRef.current) {
          ultimaLeadIdRef.current = idMaisRecente;
        }

        // 💰 Cálculos
        const soma = dadosFiltrados.reduce(
          (acc, item) => acc + (parseFloat(item.valor) || 0),
          0
        );
        setTotal(soma);

        const pipelinesParaDescontar = [
          "IMPORTAÇÃO CONJUNTA 🧩",
          "CONSULTORIA LANNISTER 🦁",
          "REPEDIDO 🏆",
          "GANHO PRODUTO 🧸",
          "GANHO FRETE 🚢",
        ];

        const hojeZerado = new Date(hojeBR);
        hojeZerado.setHours(0, 0, 0, 0);

        const somaHoje = data
          .filter((item) => {
            const dataItem = new Date(item.data);
            dataItem.setHours(0, 0, 0, 0);
            return (
              pipelinesParaDescontar.includes(item.pipeline) &&
              dataItem.getTime() === hojeZerado.getTime()
            );
          })
          .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);

        const somaWons = data
          .filter((item) => {
            const dataItem = new Date(item.data);
            return (
              pipelinesParaDescontar.includes(item.pipeline) &&
              dataItem.getMonth() === 9 &&
              dataItem.getFullYear() === 2025
            );
          })
          .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        const ultimoDiaDoMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const diferencaDias =
          Math.ceil((ultimoDiaDoMes - hojeBR) / (1000 * 60 * 60 * 24)) + 1;
        const diasRestantesCorrigido = Math.max(diferencaDias, 1);

        const valorBaseDiario =
          diasRestantesCorrigido === 1
            ? restante
            : restante / diasRestantesCorrigido;

        const valorFinalDiario = Math.max(valorBaseDiario - somaHoje, 0);
        setValorDiario(Number(valorFinalDiario.toFixed(2)));

        // 🏁 Meta batida → vídeo infinito
        if (valorFinalDiario <= 0 && !loopInfinito) {
          setLoopInfinito(true);
          tocarVideoEAudioInfinito();
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    async function fetchSomaOpen() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsopen`
        );
        const data = await response.json();
        const soma = data.reduce(
          (acc, item) => acc + (parseFloat(item.valor) || 0),
          0
        );
        setSomaOpen(soma);
      } catch (error) {
        console.error("Erro ao buscar soma de dash_geralcsopen:", error);
      }
    }

    fetchData();
    fetchSomaOpen();

    const intervalo = setInterval(() => {
      fetchData();
      fetchSomaOpen();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [hojeBR, loopInfinito]);

  // 🟢 Força áudio a poder ser tocado automaticamente
  useEffect(() => {
    const testAudio = new Audio("/audios/comemora.mp3");
    testAudio.muted = true;
    testAudio.play().then(() => {
      testAudio.pause();
      testAudio.currentTime = 0;
      testAudio.muted = false;
    });
  }, []);

  // 🔊 Temporário (15s)
  function tocarVideoEAudioTemporario() {
    setMostrarVideo(true);
    const audio = new Audio("/audios/comemora.mp3");
    audioRef.current = audio;
    audio.muted = false;
    audio
      .play()
      .then(() => console.log("🎵 Áudio tocando (15s)"))
      .catch((err) => console.warn("⚠️ Áudio bloqueado:", err));

    timerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setMostrarVideo(false);
    }, 15000);
  }

  // 🔁 Loop infinito
  function tocarVideoEAudioInfinito() {
    clearTimeout(timerRef.current);
    setMostrarVideo(true);
    const audio = new Audio("/audios/comemora.mp3");
    audio.loop = true;
    audioRef.current = audio;
    audio.muted = false;
    audio
      .play()
      .then(() => console.log("🎵 Áudio infinito tocando"))
      .catch((err) => console.warn("⚠️ Áudio bloqueado:", err));
  }

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      clearTimeout(timerRef.current);
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
              muted
              playsInline
              loop={loopInfinito}
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
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, index) => (
                <tr key={index}>
                  <td>{item.lead_id}</td>
                  <td>{item.empresa}</td>
                  <td>{item.assigned}</td>
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
