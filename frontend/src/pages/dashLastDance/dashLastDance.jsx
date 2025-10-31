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

  // controle do áudio
  const audioRef = useRef(null);
  const [somLiberado, setSomLiberado] = useState(false); // mostra overlay se false

  // controle de timeout do vídeo
  const timerRef = useRef(null);

  // controle de quais leads já vimos
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

  // cria o elemento de áudio e tenta liberar som automaticamente
  useEffect(() => {
    const audio = new Audio("/audios/comemora.mp3");
    audio.loop = false;
    audio.volume = 1.0;
    audioRef.current = audio;

    // tenta autoplay silencioso -> pausa -> marca liberado se funcionar
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        setSomLiberado(true);
        console.log("🔊 Som já liberado automaticamente");
      })
      .catch(() => {
        // não conseguiu tocar sozinho -> vai precisar 1 clique manual
        console.log("🔒 Som bloqueado, aguardando clique para liberar");
      });

    // carrega histórico de leads conhecidas (pra não tocar vídeo/som em F5)
    const salvos = localStorage.getItem("lastdance_leads");
    if (salvos) {
      idsAntigosRef.current = JSON.parse(salvos);
    }
  }, []);

  // função que roda quando o usuário clicar no overlay "Ativar Som"
  function liberarSomManualmente() {
    if (!audioRef.current) return;
    audioRef.current
      .play()
      .then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setSomLiberado(true);
        console.log("✅ Som liberado por interação do usuário");
      })
      .catch((err) => {
        console.warn("Ainda bloqueado:", err);
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

        // ajusta data UTC -> BR -3
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

        // pipelines válidos
        const pipelines = [
          "IMPORTAÇÃO CONJUNTA 🧩",
          "CONSULTORIA LANNISTER 🦁",
          "REPEDIDO 🏆",
          "GANHO PRODUTO 🧸",
          "GANHO FRETE 🚢",
        ];

        const filtrados = data.filter((i) => pipelines.includes(i.pipeline));

        // pega só os 3 mais recentes
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

          // salva novo estado como baseline
          idsAntigosRef.current = novosIds;
          localStorage.setItem(
            "lastdance_leads",
            JSON.stringify(novosIds)
          );

          // dispara alerta visual + som
          tocarAlertaTemporario();
        } else if (idsAntigos.length === 0) {
          // primeira carga da tela, só salva baseline, não toca
          idsAntigosRef.current = novosIds;
          localStorage.setItem(
            "lastdance_leads",
            JSON.stringify(novosIds)
          );
        }

        // --- CÁLCULOS numéricos abaixo ---
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
          console.log("🏁 META BATIDA! loop infinito on");
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
    // tenta tocar o mp3 (vai funcionar se já estiver liberado)
    audioRef.current.currentTime = 0;
    audioRef.current.loop = true; // pra segurar durante o vídeo curto
    audioRef.current
      .play()
      .then(() => {
        console.log("🎶 som tocando");
      })
      .catch((err) => {
        console.warn("🔇 áudio bloqueado:", err);
      });
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
    // sem timeout -> fica tocando/mostrando até você dar refresh manualmente
  }

  // cleanup
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      stopSom();
    };
  }, []);

  return (
    <div className={styles.root}>
      {/* overlay pra liberar som (aparece só se bloqueado) */}
      {!somLiberado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: "600",
            zIndex: 9999,
            textAlign: "center",
            padding: "2rem",
            cursor: "pointer",
          }}
          onClick={liberarSomManualmente}
        >
          <div>🔊 Clique para ativar o som das vendas</div>
          <div style={{ fontSize: "1rem", marginTop: "1rem" }}>
            (Depois disso você pode deixar a TV rodando sozinha)
          </div>
        </div>
      )}

      <div className={styles.header}>
        <img src={logolastdance} alt="Logo LastDance" />
      </div>

      <div className={styles.dashboard}>
        {/* BLOCO DO VÍDEO / VALOR DIÁRIO */}
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
              style={{ width: "100%", height: "auto" }}
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

        {/* FALTAM P/ META MENSAL */}
        <div className={styles.valorfaltamensal}>
          <p>Contagem total:</p>
          <p>{formatarValor(faltamParaMetaMensal)}</p>
        </div>

        {/* TABELA ULTIMAS VENDAS */}
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

        {/* PROJEÇÃO GERAL */}
        <div className={styles.meta}>
          <p className={styles.metaTitulo}>Projeção Geral</p>
          <p className={styles.metaValor}>{formatarValor(somaOpen)}</p>
        </div>
      </div>
    </div>
  );
}
