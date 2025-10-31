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

  // 🔊 cria um único elemento de áudio reutilizável
  useEffect(() => {
    const audio = new Audio("/audios/comemora.mp3");
    audio.loop = false;
    audio.volume = 1.0;
    audio.muted = true;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audioRef.current = audio;
      console.log("🎧 Autoplay de áudio desbloqueado");
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await response.json();
        if (!Array.isArray(rawData) || rawData.length === 0) return;

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

        // Filtra os dados apenas dos pipelines relevantes
        const filtrados = data.filter((i) => pipelines.includes(i.pipeline));

        // Ordena e pega os 3 mais recentes
        const recentes = [...filtrados]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(recentes);

        // Detecta lead nova
        const nova = String(recentes[0]?.lead_id || "");
        const anterior = String(ultimaLeadIdRef.current || "");
        if (nova && nova !== anterior && !loopInfinito) {
          ultimaLeadIdRef.current = nova;
          console.log("🎉 Nova lead detectada:", nova);
          tocarVideoEAudioTemporario();
        } else if (!ultimaLeadIdRef.current) {
          ultimaLeadIdRef.current = nova;
        }

        // Cálculos
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
            return di.getMonth() === 9 && di.getFullYear() === 2025;
          })
          .reduce((acc, i) => acc + (parseFloat(i.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        const ultimoDia = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const diasRestantes =
          Math.ceil((ultimoDia - hojeBR) / (1000 * 60 * 60 * 24)) + 1;

        const valorBase =
          diasRestantes <= 1 ? restante : restante / diasRestantes;
        const valorFinal = Math.max(valorBase - somaHoje, 0);
        setValorDiario(Number(valorFinal.toFixed(2)));

        if (valorFinal <= 0 && !loopInfinito) {
          console.log("🏁 Meta batida! Loop infinito ativado");
          setLoopInfinito(true);
          tocarVideoEAudioInfinito();
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

  // --- FUNÇÕES DE ÁUDIO/VÍDEO ---
  function tocarVideoEAudioTemporario() {
    setMostrarVideo(true);
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.warn("Áudio bloqueado:", e));
    }

    timerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.loop = false;
      }
      setMostrarVideo(false);
    }, 15000);
  }

  function tocarVideoEAudioInfinito() {
    clearTimeout(timerRef.current);
    setMostrarVideo(true);
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.warn("Áudio bloqueado:", e));
    }
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
              loop
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
                <th>Pipeline</th> {/* ✅ nova coluna */}
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => (
                <tr key={i}>
                  <td>{item.lead_id}</td>
                  <td>{item.empresa}</td>
                  <td>{item.assigned}</td>
                  <td>{item.pipeline}</td> {/* ✅ mostra pipeline */}
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
