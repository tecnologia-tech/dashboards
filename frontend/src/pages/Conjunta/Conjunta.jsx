import fundo from "../../assets/Conjunta/fundo.png";

export default function Conjunta() {
  // ============================
  // DADOS DIFERENTES PARA CADA TABELA
  // ============================

  const dadosProducao = [
    { dado1: "João", dado2: "12/01/2025" },
    { dado1: "Maria", dado2: "14/01/2025" },
    { dado1: "Pedro", dado2: "17/01/2025" },
  ];

  const dadosAuditoria = [
    { dado1: "Lucas", dado2: "08/01/2025" },
    { dado1: "Fernanda", dado2: "10/01/2025" },
  ];

  const dadosEmbarque = [
    { dado1: "Carga 1", dado2: "20/01/2025" },
    { dado1: "Carga 2", dado2: "22/01/2025" },
    { dado1: "Carga 3", dado2: "25/01/2025" },
  ];

  const dadosQC = [
    { dado1: "Lote A", dado2: "05/01/2025" },
    { dado1: "Lote B", dado2: "07/01/2025" },
  ];

  // ============================
  // ESTILOS
  // ============================

  const pageStyle = {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#edf5ed",
  };

  const backgroundStyle = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${fundo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 3,
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    backdropFilter: "blur(12px)",
    background:
      "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.42), transparent 34%), radial-gradient(circle at 78% 12%, rgba(174,211,183,0.32), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.22), rgba(186,219,190,0.25))",
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
    background:
      "linear-gradient(155deg, rgba(255,255,255,0.32), rgba(255,255,255,0.18))",
    backdropFilter: "blur(14px) saturate(1.06)",
    borderColor: "rgba(255,255,255,0.78)",
    boxShadow:
      "0 16px 32px rgba(17,60,36,0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
  };

  const puzzleClip = {
    clipPath:
      "path('M10 0 H38 C44 0 46 8 46 14 C46 20 50 26 56 26 C62 26 66 20 66 14 C66 8 68 0 74 0 H90 Q100 0 100 10 V32 C100 38 94 42 88 42 C80 42 74 48 74 54 C74 60 80 66 88 66 C94 66 100 70 100 76 V90 Q100 100 90 100 H74 C68 100 66 108 66 114 C66 120 62 126 56 126 C50 126 46 120 46 114 C46 108 44 100 38 100 H10 Q0 100 0 90 V76 C0 70 6 66 12 66 C20 66 26 60 26 54 C26 48 20 42 12 42 C6 42 0 38 0 32 V10 Q0 0 10 0 Z')",
    WebkitClipPath:
      "path('M10 0 H38 C44 0 46 8 46 14 C46 20 50 26 56 26 C62 26 66 20 66 14 C66 8 68 0 74 0 H90 Q100 0 100 10 V32 C100 38 94 42 88 42 C80 42 74 48 74 54 C74 60 80 66 88 66 C94 66 100 70 100 76 V90 Q100 100 90 100 H74 C68 100 66 108 66 114 C66 120 62 126 56 126 C50 126 46 120 46 114 C46 108 44 100 38 100 H10 Q0 100 0 90 V76 C0 70 6 66 12 66 C20 66 26 60 26 54 C26 48 20 42 12 42 C6 42 0 38 0 32 V10 Q0 0 10 0 Z')",
  };

  // ============================
  // COMPONENTE REUTILIZÁVEL DE TABELA
  // ============================

  const Table = ({ title, dado2 }) => (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <h2 className="text-5xl font-bold text-center mb-4 shrink-0 text-emerald-950 drop-shadow-[0_1px_3px_rgba(0,0,0,0.16)]">
        {title}
      </h2>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <table className="table-fixed w-full border-collapse scale-[1.25] origin-top text-emerald-950">
          <thead className="text-4xl leading-[4rem] shrink-0 text-emerald-900/85">
            <tr className="border-b border-emerald-100/70 text-center"></tr>
          </thead>

          <tbody className="text-3xl leading-[3.5rem] text-emerald-950/90">
            {dado2.map((item, i) => (
              <tr key={i} className="text-center">
                <td className="py-2">{item.dado1}</td>
                <td className="py-2">{item.dado2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ============================
  // RENDER
  // ============================

  return (
    <div style={pageStyle} className="font-sans min-h-0 text-emerald-950">
      <div style={backgroundStyle} />
      <div style={overlayStyle} />

      <div style={contentWrapper} className="min-h-0">
        {/* HEADER */}
        <div className="w-full text-center rounded-2xl  bg-white/25 backdrop-blur-2xl shadow-[0_16px_32px_rgba(0,0,0,0.15)] ring-1 ring-emerald-100/60 py-6 px-10 text-6xl font-extrabold tracking-wide text-emerald-900/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
          Importação Conjunta 🧩
        </div>

        {/* GRID */}
        <div style={grid} className="h-full min-h-0 overflow-hidden">
          {/* PRODUÇÃO */}
          <div
            style={{ ...glass, gridColumn: "span 3", gridRow: "span 6" }}
            className="border-4 border-white/70 rounded-xl ring-1 ring-emerald-100/60 bg-white/25 backdrop-blur-xl shadow-[0_14px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-shadow duration-150 p-4 overflow-hidden"
          >
            <Table title="Produção" dado2={dadosProducao} />
          </div>

          {/* AUDITORIA E CÂMBIO INICIAL */}
          <div
            style={{ ...glass, gridColumn: "span 5", gridRow: "span 3" }}
            className="border-4 border-white/70 rounded-xl ring-1 ring-emerald-100/60 bg-white/25 backdrop-blur-xl shadow-[0_14px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-shadow duration-150 p-4 overflow-hidden"
          >
            <Table title="Auditoria e Câmbio Inicial" dado2={dadosAuditoria} />
          </div>

          {/* AGUARDANDO EMBARQUE */}
          <div
            style={{ ...glass, gridColumn: "span 4", gridRow: "span 5" }}
            className="border-4 border-white/70 rounded-xl ring-1 ring-emerald-100/60 bg-white/25 backdrop-blur-xl shadow-[0_14px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-shadow duration-150 p-4 overflow-hidden"
          >
            <Table title="Aguardando Embarque" dado2={dadosEmbarque} />
          </div>

          {/* QC E CÂMBIO FINAL */}
          <div
            style={{ ...glass, gridColumn: "span 5", gridRow: "span 3" }}
            className="border-4 border-white/70 rounded-xl ring-1 ring-emerald-100/60 bg-white/25 backdrop-blur-xl shadow-[0_14px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-shadow duration-150 p-4 overflow-hidden"
          >
            <Table title="QC e Câmbio Final" dado2={dadosQC} />
          </div>

          {/* TOTAL / CBM (sem tabela) */}
          <div
            style={{
              ...glass,
              gridColumn: "span 4",
              gridRow: "span 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            className="border-4 border-white/70 rounded-xl ring-1 ring-emerald-100/60 bg-white/25 backdrop-blur-xl shadow-[0_14px_30px_rgba(0,0,0,0.14)] hover:shadow-[0_18px_38px_rgba(0,0,0,0.18)] transition-shadow duration-150 p-4 text-5xl text-emerald-900"
          >
            <span>Total</span>
            <span>CBM</span>
            <div className="w-10 h-10 border-2 border-white/70 rounded-md bg-white/15 shadow-inner backdrop-blur" />
          </div>
        </div>
      </div>
    </div>
  );
}
