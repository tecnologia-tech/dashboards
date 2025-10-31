import { useEffect, useState } from "react";
import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

export default function DashLastDance() {
  const [dados, setDados] = useState([]);
  const [setTotal] = useState(0);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);

  // ✅ Garante que o cálculo use o horário do Brasil (UTC-3)
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
        console.log(
          "🕒 Data local (Brasil):",
          hojeBR.toLocaleDateString("pt-BR")
        );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const rawData = await response.json();

        // 🧭 Corrige datas vindas do Nutshell (Canadá → Brasil)
        const data = rawData.map((item) => {
          const dataOriginal = new Date(item.data); // Ex: 2025-10-31T00:00:00-04:00
          const dataBrasil = new Date(
            dataOriginal.getTime() + 3 * 60 * 60 * 1000
          ); // converte para UTC-3
          return { ...item, data: dataBrasil };
        });

        // Pega os 3 últimos registros
        const dadosFiltrados = [...data]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);
        setDados(dadosFiltrados);

        // Soma dos 3 últimos
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

        // 🧮 Soma de Wons de hoje (com data ajustada)
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

        console.log("💵 Soma hoje:", somaHoje);

        // 🧮 Soma total de outubro (com datas BR)
        const somaWons = data
          .filter((item) => {
            const dataItem = new Date(item.data);
            const dentroDeOutubro =
              dataItem >= new Date("2025-10-01T00:00:00-03:00") &&
              dataItem <= new Date("2025-10-31T23:59:59-03:00");
            return (
              pipelinesParaDescontar.includes(item.pipeline) && dentroDeOutubro
            );
          })
          .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        // 🔢 Cálculo do valor diário
        const ultimoDiaDoMes = new Date(
          hojeBR.getFullYear(),
          hojeBR.getMonth() + 1,
          0
        );
        const diferencaDias =
          Math.ceil((ultimoDiaDoMes - hojeBR) / (1000 * 60 * 60 * 24)) + 1;
        const diasRestantesCorrigido = Math.max(diferencaDias, 1);

        console.log("📆 Dias restantes:", diasRestantesCorrigido);

        const valorBaseDiario =
          diasRestantesCorrigido === 1
            ? restante
            : restante / diasRestantesCorrigido;

        const valorFinalDiario = Math.max(valorBaseDiario - somaHoje, 0);

        console.log("💰 Valor restante:", restante);
        console.log("📊 Valor base diário:", valorBaseDiario);
        console.log("💵 Soma hoje:", somaHoje);
        console.log("🏁 Valor final diário:", valorFinalDiario);

        setValorDiario(Number(valorFinalDiario.toFixed(2)));
        setMostrarVideo(valorFinalDiario <= 0);
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
