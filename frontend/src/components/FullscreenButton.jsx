import React, { useEffect, useState } from "react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  function openFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) elem.requestFullscreen().catch(console.error);
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }

  if (isFullscreen) return null;

  return (
    <button
      onClick={openFullscreen}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "26px 60px",
        background: "rgba(0,0,0,0.7)",
        border: "4px solid #e6c068",
        color: "#e6c068",
        fontFamily: "Cinzel, serif",
        fontSize: "40px",
        fontWeight: "700",
        borderRadius: "12px",
        cursor: "pointer",
        zIndex: 999999999,
        letterSpacing: "3px",
        boxShadow: "0 0 25px rgba(230,192,104,0.55)",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = "0 0 40px rgba(230,192,104,0.9)";
        e.target.style.transform = "translate(-50%, -50%) scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = "0 0 25px rgba(230,192,104,0.55)";
        e.target.style.transform = "translate(-50%, -50%) scale(1)";
      }}
    >
      ENTRAR EM TELA CHEIA
    </button>
  );
}
