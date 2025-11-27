export default function ButtonPrincipal({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "32px 80px",
        background: "rgba(0,0,0,0.75)",
        border: "4px solid #e6c068",
        color: "#e6c068",
        fontFamily: "Cinzel, serif",
        fontSize: "150px",
        fontWeight: "700",
        borderRadius: "16px",
        cursor: "pointer",
        letterSpacing: "3px",
        boxShadow: "0 0 25px rgba(230,192,104,0.55)",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = "0 0 40px rgba(230,192,104,0.9)";
        e.target.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = "0 0 25px rgba(230,192,104,0.55)";
        e.target.style.transform = "scale(1)";
      }}
    >
      {label}
    </button>
  );
}
