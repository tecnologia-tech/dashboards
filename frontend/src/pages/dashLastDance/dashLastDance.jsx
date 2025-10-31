import { useEffect, useState, useRef } from "react";
import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

export default function DashLastDance() {
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);

  // Guarda os IDs das leads antigas pra comparar
  const leadsAnterioresRef = useRef([]);

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

        // Converte UTC → Brasil
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

        // Ordena por data e pega os 3 mais recentes
        const dadosFiltrados = [...data]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        // ⚡ Detecta nova lead
        const idsAtuais = dadosFiltrados.map((d) => d.lead_id);
        const idsAntigos = leadsAnterioresRef.current;

        const novaLead = idsAtuais.some((id) => !idsAntigos.includes(id));

        if (novaLead) {
          console.log("🎉 Nova lead detectada! Mostrando vídeo...");
          setMostrarVideo(true);

          // Oculta vídeo depois de 15 segundos
          setTimeout(() => {
            console.log("⏱️ Ocultando vídeo após 15s...");
            setMostrarVideo(false);
          }, 15000);
        }

        leadsAnterioresRef.current = idsAtuais;
        setDados(dadosFiltrados);

        // Soma total
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

        // Soma de hoje
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

        // Soma total do mês
        const somaWons = data
          .filter((item) => {
            const dataItem = new Date(item.data);
            return (
              pipelinesParaDescontar.includes(item.pipeline) &&
              dataItem.getMonth() === hojeBR.getMonth() &&
              dataItem.getFullYear() === hojeBR.getFullYear()
            );
          })
          .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        // Dias restantes do mês
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
    }, 60000);

    return () => clearInterval(intervalo);
  }, [hojeBR]);

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
              loop
              playsInline
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
