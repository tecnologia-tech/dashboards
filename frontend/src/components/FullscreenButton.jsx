import { useEffect, useState } from "react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // =============================
  // 🔥 AJUDA A VOLTAR PRA FULLSCREEN
  //     AUTOMATICAMENTE APÓS RELOAD
  // =============================
  function entrarFullscreen() {
    const el = document.documentElement;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }

  // Se a página recarregou e devemos voltar ao fullscreen
  useEffect(() => {
    if (localStorage.getItem("forcar_fullscreen") === "1") {
      entrarFullscreen();
      localStorage.removeItem("forcar_fullscreen");
    }
  }, []);

  // Detecta quando o fullscreen entra/sai
  useEffect(() => {
    function onChange() {
      const full =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(!!full);
    }

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("msfullscreenchange", onChange);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("msfullscreenchange", onChange);
    };
  }, []);

  function openFullscreen() {
    entrarFullscreen(); // usa a função nova
  }

  // =============================
  // 🔥 IMPORTANTE
  // Se já está fullscreen, NÃO mostra nada
  // =============================
  if (isFullscreen) return null;

  // =============================
  // 🔥 Se NÃO está fullscreen → mostra o botão + overlay
  // =============================
  return (
    <>
      {/* ----------- OVERLAY COM BLUR ----------- */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          background: "rgba(0,0,0,0.15)",
          zIndex: 999999998,
          pointerEvents: "none",
        }}
      />

      {/* ----------- BOTÃO ----------- */}
      <button
        onClick={openFullscreen}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "65px 180px",
          background: "rgba(0,0,0,0.35)",
          border: "6px solid #e6c068",
          color: "#e6c068",
          fontFamily: "Cinzel, serif",
          fontSize: "100px",
          fontWeight: "700",
          borderRadius: "24px",
          cursor: "pointer",
          zIndex: 999999999,
          letterSpacing: "8px",
          boxShadow: "0 0 65px rgba(230,192,104,0.75)",
          transition: "0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = "0 0 110px rgba(230,192,104,1)";
          e.target.style.transform = "translate(-50%, -50%) scale(1.06)";
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = "0 0 65px rgba(230,192,104,0.75)";
          e.target.style.transform = "translate(-50%, -50%) scale(1)";
        }}
      >
        TELA CHEIA
      </button>
    </>
  );
}
