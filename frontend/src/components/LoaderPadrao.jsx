export default function LoaderPadrao() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "22px",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          border: "6px solid rgba(230,192,104,0.25)",
          borderTopColor: "#e6c068",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      ></div>

      <div
        style={{
          color: "#e6c068",
          fontFamily: "Cinzel, serif",
          fontSize: "20px",
          letterSpacing: "3px",
          opacity: 0.85,
        }}
      >
        CARREGANDO...
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
