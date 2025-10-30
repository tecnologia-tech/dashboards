import { useEffect, useState } from "react";
import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

export default function DashLastDance() {
  const [dados, setDados] = useState([]);
  const [total, setTotal] = useState(0);
  const [faltamParaMetaMensal, setFaltamParaMetaMensal] = useState(0);
  const [valorDiario, setValorDiario] = useState(0);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const [somaOpen, setSomaOpen] = useState(0);

  const dataSimulada = "2025-10-31";
  const hoje = dataSimulada ? new Date(dataSimulada) : new Date();

  function formatarValor(valor) {
    if (valor === null || valor === undefined || valor === "") return "R$0,00";
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    if (isNaN(numero)) return "R$0,00";
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarValorAbreviado(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return "0K";
    const numero = typeof valor === "string" ? parseFloat(valor) : valor;
    if (numero >= 1000000) {
      return (numero / 1000000).toFixed(1).replace(".0", "") + "M";
    }
    return (numero / 1000).toFixed(0) + "K";
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
        );
        const data = await response.json();

        const dadosFiltrados = [...data]
          .sort((a, b) => new Date(b.data) - new Date(a.data))
          .slice(0, 3);

        setDados(dadosFiltrados);

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

        const hojeZerado = new Date(hoje);
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
            const dentroDeOutubro =
              dataItem >= new Date("2025-10-01") &&
              dataItem <= new Date("2025-10-31");

            return (
              pipelinesParaDescontar.includes(item.pipeline) && dentroDeOutubro
            );
          })
          .reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);

        const restante = 1300000 - somaWons;
        setFaltamParaMetaMensal(restante);

        const ultimoDiaMes = new Date(
          hoje.getFullYear(),
          hoje.getMonth() + 1,
          0
        );
        const diasRestantes = ultimoDiaMes.getDate() - hoje.getDate() + 1;

        const valorBaseDiario = restante / diasRestantes;
        const valorFinalDiario = valorBaseDiario - somaHoje;
        const valorCorrigido = isNaN(valorFinalDiario) ? 0 : valorFinalDiario;

        // 🧪 Logs para teste
        console.log("Data simulada:", hoje.toLocaleDateString());
        console.log("Dias restantes:", diasRestantes);
        console.log("Valor restante para meta:", restante);
        console.log("Valor base diário:", valorBaseDiario);
        console.log("Soma hoje:", somaHoje);
        console.log("Valor final diário:", valorFinalDiario);

        setValorDiario(valorCorrigido);
        setMostrarVideo(valorCorrigido <= 0);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    //teste
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
  }, [hoje]);

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
                {formatarValorAbreviado(valorDiario)}
              </div>
            </>
          )}
        </div>
        <div className={styles.valorfaltamensal}>
          <p>Contagem total:</p>
          <p>{formatarValorAbreviado(faltamParaMetaMensal)}</p>
        </div>
        <div className={styles.tabelawon}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Empresa</th>
                <th>Assigned</th>
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
