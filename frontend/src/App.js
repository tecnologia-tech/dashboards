import { useEffect } from "react";

function App() {
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.backgroundColor = "#000000";
  }, []);

  const parentStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(8, 1fr)",
    padding: "20px",
    gap: "8px",
    backgroundColor: "#000000",
    height: "100vh",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const baseBoxStyle = {
    backgroundColor: "#fece00",
    color: "#9a110e",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    textAlign: "center",
    padding: "8px",
    overflow: "hidden",
    wordBreak: "break-word",
    flexDirection: "column",
  };

  const styles = {
    div1: { ...baseBoxStyle, gridColumn: "span 8 / span 8" },
    div2: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridRowStart: 2,
    },
    div3: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridColumnStart: 3,
      gridRowStart: 2,
    },
    div4: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridColumnStart: 5,
      gridRowStart: 2,
    },
    div5: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridColumnStart: 7,
      gridRowStart: 2,
    },
    div6: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridRowStart: 4,
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      gap: "4px",
    },
    div7: {
      ...baseBoxStyle,
      gridColumn: "span 4 / span 4",
      gridRow: "span 2 / span 2",
      gridColumnStart: 3,
      gridRowStart: 4,
    },
    div8: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 2 / span 2",
      gridColumnStart: 7,
      gridRowStart: 4,
    },
    div9: {
      ...baseBoxStyle,
      gridColumn: "span 3 / span 3",
      gridRow: "span 3 / span 3",
      gridRowStart: 6,
    },
    div10: {
      ...baseBoxStyle,
      gridColumn: "span 3 / span 3",
      gridRow: "span 3 / span 3",
      gridColumnStart: 6,
      gridRowStart: 6,
    },
    div11: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridRow: "span 3 / span 3",
      gridColumnStart: 4,
      gridRowStart: 6,
    },
    div12: { ...baseBoxStyle, gridColumn: "span 3 / span 3" },
    div13: { ...baseBoxStyle, gridRow: "span 3 / span 3", gridRowStart: 2 },
    div14: { ...baseBoxStyle, gridColumn: "span 2 / span 2", gridRowStart: 2 },
    div15: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridColumnStart: 2,
      gridRowStart: 3,
    },
    div16: {
      ...baseBoxStyle,
      gridColumn: "span 2 / span 2",
      gridColumnStart: 2,
      gridRowStart: 4,
    },
  };

  return (
    <div style={parentStyle}>
      <div style={styles.div1}>Dólar R$ 5,38 | NPS 3,69 | BHAG 12P 1/100 </div>
      <div style={styles.div2}>
        LTDA
        <br />
        1,082 mi
        <br />
        77% de R$ 1,4 mi
        <br />
        ==========================
        <br />
        <br />
        Estornos: R$ 90.626,45
      </div>
      <div style={styles.div3}>
        CS
        <br />
        500,4mil
        <br />
        58.9% de R$ 850mil
        <br />
        ==========================
        <br />
        <br />
        Estornos: 0
      </div>
      <div style={styles.div4}>
        Bônus
        <br />
        99,9 mil
        <br />
        66.6% de R$ 150mil
        <br />
        ==========================
        <br />
        <br />
      </div>
      <div style={styles.div5}>
        Repetidos
        <br />
        54,4 mil
        <br />
        18.1% de R$ 300 mil
        <br />
        ==========================
        <br />
        <br />
        Estornos: 0
      </div>
      <div style={styles.div6}>
        <div style={styles.div12}>Onboarding</div>
        <div style={styles.div13}>67</div>
        <div style={styles.div14}>Jayanne Queiroz 26 Clientes</div>
        <div style={styles.div15}>8</div>
        <div style={styles.div16}>9</div>
      </div>
      <div style={styles.div7}>Compras</div>
      <div style={styles.div8}>12P</div>
      <div style={styles.div9}>Importação</div>
      <div style={styles.div10}>CSAT</div>
      <div style={styles.div11}>Reputação 12P</div>
    </div>
  );
}

export default App;
