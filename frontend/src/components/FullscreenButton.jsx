import React, { useEffect, useState } from "react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Detecta entrada/saída do modo tela cheia
  useEffect(() => {
    function handleFullscreenChange() {
      const isFull =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(!!isFull);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  function openFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(console.error);
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else {
      alert("Modo tela cheia não suportado neste navegador.");
    }
  }

  // Se estiver em tela cheia, não renderiza o botão
  if (isFullscreen) return null;

  return (
    <button
      id="fullscreenBtn"
      onClick={openFullscreen}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 18px",
        background: "#000",
        border: "2px solid #e6c068",
        color: "#e6c068",
        fontFamily: "Cinzel, serif",
        fontSize: "16px",
        borderRadius: "8px",
        cursor: "pointer",
        zIndex: 999999,
      }}
    >
      Tela Cheia
    </button>
  );
}
