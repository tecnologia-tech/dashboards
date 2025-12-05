import { useEffect, useState } from "react";
import fundo from "../../assets/Conjunta/fundo.png";

export default function Conjunta() {
  // ============================
  // ESTILOS
  // ============================

  const textGlow = {
    textShadow: "0 0 6px rgba(0,0,0,0.65)",
  };

  const pageStyle = {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0d1f16",
  };

  const backgroundStyle = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${fundo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.7,
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "none",
    zIndex: 1,
  };

  const contentWrapper = {
    position: "relative",
    zIndex: 10,
    padding: "20px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const grid = {
    display: "grid",
    flex: 1,
    gap: "20px",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridTemplateRows: "repeat(6, 1fr)",
  };

  const glass = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(6px)",
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  };

  // ============================
  // TABELA
  // ============================

  const Table = ({ title, dado2, totalCBM }) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden relative">
      {/* ======== TÍTULO CENTRALIZADO + BADGE DIREITA ======== */}
      <div className="relative mb-6 w-full pb-5">
        {/* Título centralizado */}
        <h2
          className="
          text-4xl font-montserrat font-bold 
          text-emerald-200 text-center w-full
          absolute left-1/2 -translate-x-1/2
        "
          style={textGlow}
        >
          {title}
        </h2>

        {/* Badge (número de itens) */}
        <div
          className="
          absolute right-0 top-1/2 -translate-y-1/2 
          w-10 h-10 flex items-center justify-center 
          rounded-md bg-emerald-300/30 border border-emerald-300/60 
          text-emerald-200 font-montserrat font-bold text-2xl shadow-md
        "
          style={textGlow}
        >
          {dado2.length}
        </div>

        {/* Elemento fantasma só para manter altura */}
        <div className="h-10"></div>
      </div>

      {/* Linha separadora */}
      <div className="w-full h-[1px] bg-white/20 mb-4"></div>

      {/* ======== ÁREA DE SCROLL INFINITO ======== */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {/* Se tiver poucos itens → lista fixa sem scroll */}
        {dado2.length < 10 ? (
          <table className="table-fixed w-full border-collapse">
            <tbody className="text-2xl leading-[3rem]">
              {dado2.map((item, i) => (
                <tr key={i} className="text-center">
                  <td
                    className="py-2 font-montserrat font-semibold text-white"
                    style={textGlow}
                  >
                    {item.dado1}
                  </td>
                  <td
                    className="py-2 font-montserrat text-emerald-300 text-right pr-6"
                    style={{ ...textGlow, width: "120px" }}
                  >
                    {item.dado2}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ======== SCROLL INFINITO ======== */
          <div className="scroll-area">
            {/* Lista normal */}
            <table className="table-fixed w-full border-collapse">
              <tbody className="text-2xl leading-[3rem]">
                {dado2.map((item, i) => (
                  <tr key={i} className="text-center">
                    <td
                      className="py-2 font-montserrat font-semibold text-white"
                      style={textGlow}
                    >
                      {item.dado1}
                    </td>
                    <td
                      className="py-2 font-montserrat text-emerald-300"
                      style={textGlow}
                    >
                      {item.dado2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Lista duplicada → rolagem contínua */}
            <table className="table-fixed w-full border-collapse opacity-80">
              <tbody className="text-2xl leading-[3rem]">
                {dado2.map((item, i) => (
                  <tr key={`clone-${i}`} className="text-center">
                    <td
                      className="py-2 font-montserrat font-semibold text-white"
                      style={textGlow}
                    >
                      {item.dado1}
                    </td>
                    <td
                      className="py-2 font-montserrat text-emerald-300"
                      style={textGlow}
                    >
                      {item.dado2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======== TOTAL CBM — APENAS PARA EMBARQUE ======== */}
      {title === "AGUARDANDO EMBARQUE" && (
        <div className="mt-4">
          <div className="w-full h-[2px] bg-white/25 mb-3"></div>

          <div
            className="text-3xl font-montserrat font-semibold text-emerald-200 text-center"
            style={textGlow}
          >
            TOTAL:{" "}
            <span className="text-emerald-300">
              {totalCBM?.toFixed(2) ?? "0.00"}
            </span>{" "}
            CBM
          </div>
        </div>
      )}
    </div>
  );

  // ============================
  // ESTADOS DINÂMICOS
  // ============================

  const [dadosAuditoria, setDadosAuditoria] = useState([]);
  const [dadosQCdinamico, setDadosQCdinamico] = useState([]);
  const [dadosEmbarqueAPI, setDadosEmbarqueAPI] = useState([]);
  const [totalCBM, setTotalCBM] = useState(0);
  const [dadosProducaoAPI, setDadosProducaoAPI] = useState([]);
  // ============================
  // API — AGUARDANDO EMBARQUE
  // ============================
  useEffect(() => {
    async function carregarProducao() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_ixdelivery`
        );
        const data = await r.json();

        const filtrados = data
          .filter(
            (item) =>
              item.grupo === "⭐ Pedidos em andamento" &&
              item.N_Pedido === "CONJUNTA" &&
              item.Stage_Pedido === "Produção"
          )
          .map((item) => ({
            dado1: item.name,
            dado2: item.Stage_Pedido, // mostra "Produção"
          }));

        setDadosProducaoAPI(filtrados);
      } catch (error) {
        console.error("Erro ao carregar PRODUÇÃO:", error);
      }
    }

    carregarProducao();
  }, []);

  useEffect(() => {
    async function carregarEmbarque() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_ixlogcomex`
        );
        const data = await r.json();

        const filtrados = data.filter(
          (item) =>
            item.grupo === "⭐Em Andamento" && item.N_Pedido === "CONJUNTA"
        );

        const tabela = filtrados.map((item) => ({
          dado1: String(item.name).replace(/\s+/g, " ").trim(), // evita quebras
          dado2: Number(item.CBM) || 0,
        }));

        setDadosEmbarqueAPI(tabela);

        const soma = filtrados.reduce(
          (acc, item) => acc + (Number(item.CBM) || 0),
          0
        );

        setTotalCBM(soma);
      } catch (error) {
        console.error("Erro ao carregar embarque:", error);
      }
    }

    carregarEmbarque();
  }, []);

  // ============================
  // API — QC
  // ============================

  useEffect(() => {
    async function carregarQC() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_ixdelivery`
        );
        const data = await r.json();

        const allowedStages = ["QC", "Pagamento 70%", "Pagamento 30%"];

        const filtrados = data
          .filter(
            (item) =>
              item.grupo === "⭐ Pedidos em andamento" &&
              item.N_Pedido === "CONJUNTA" &&
              allowedStages.includes(item.Stage_Pedido)
          )
          .map((item) => ({
            dado1: item.name,
            dado2: item.Stage_Pedido,
          }));

        setDadosQCdinamico(filtrados);
      } catch (error) {
        console.error("Erro ao carregar QC:", error);
      }
    }

    carregarQC();
  }, []);

  // ============================
  // API — AUDITORIA
  // ============================

  useEffect(() => {
    async function carregarAuditoria() {
      try {
        const r = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dash_ixdelivery`
        );
        const data = await r.json();

        const allowedStages = [
          "Certificação/Amostra",
          "Auditoria",
          "Câmbio 30%",
          "Pagamento 30%",
        ];

        const filtrados = data
          .filter(
            (item) =>
              item.grupo === "⭐ Pedidos em andamento" &&
              item.N_Pedido === "CONJUNTA" &&
              allowedStages.includes(item.Stage_Pedido)
          )
          .map((item) => ({
            dado1: item.name,
            dado2: item.Stage_Pedido,
          }));

        setDadosAuditoria(filtrados);
      } catch (error) {
        console.error("Erro ao carregar Auditoria:", error);
      }
    }

    carregarAuditoria();
  }, []);

  // ============================
  // RENDER
  // ============================

  return (
    <div style={pageStyle} className="font-sans min-h-0 text-white">
      <div style={backgroundStyle} />
      <div style={overlayStyle} />

      <div style={contentWrapper} className="min-h-0">
        <div
          className="inline-block mx-auto text-center rounded-xl border-white/20 bg-white/10 
                     backdrop-blur-xl shadow-[0_4px_18px_rgba(0,0,0,0.3)] 
                     py-6 px-10 text-6xl font-montserrat font-bold tracking-wide text-emerald-200"
          style={textGlow}
        >
          IMPORTAÇÃO CONJUNTA
        </div>

        <div style={grid} className="h-full min-h-0 overflow-hidden">
          {/* Produção */}
          <div
            style={{ ...glass, gridColumn: "span 3", gridRow: "span 6" }}
            className="border rounded-xl p-4 overflow-hidden"
          >
            <Table title="PRODUÇÃO" dado2={dadosProducaoAPI} />
          </div>

          {/* Bloco central */}
          <div
            style={{
              gridColumn: "span 6",
              gridRow: "span 6",
              display: "grid",
              gridTemplateRows: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Auditoria */}
            <div
              style={{ ...glass, height: "100%" }}
              className="border rounded-xl p-4 overflow-hidden"
            >
              <Table
                title="AUDITORIA E CÂMBIO INICIAL"
                dado2={dadosAuditoria}
              />
            </div>

            {/* QC */}
            <div
              style={{ ...glass, height: "100%" }}
              className="border rounded-xl p-4 overflow-hidden"
            >
              <Table title="QC E CÂMBIO FINAL" dado2={dadosQCdinamico} />
            </div>
          </div>

          {/* Embarque */}
          <div
            style={{ ...glass, gridColumn: "span 3", gridRow: "span 6" }}
            className="border rounded-xl p-4 overflow-hidden"
          >
            <Table
              title="AGUARDANDO EMBARQUE"
              dado2={dadosEmbarqueAPI}
              totalCBM={totalCBM}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
