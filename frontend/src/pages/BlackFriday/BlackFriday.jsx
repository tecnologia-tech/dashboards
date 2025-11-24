// pages/BlackFriday/BlackFriday.jsx

import videoFile from "../Video/video.mp4";
import React, { useRef, useEffect } from "react";

export default function BlackFriday() {
  const videoRef = useRef(null);

  // desbloqueia o áudio ao primeiro clique
  function habilitarAudio() {
    if (!videoRef.current) return;

    videoRef.current.muted = false;

    // tenta tocar
    videoRef.current.play().catch(() => {});

    // remove listener depois do primeiro clique
    window.removeEventListener("click", habilitarAudio);
  }

  useEffect(() => {
    // adiciona o listener para o primeiro clique
    window.addEventListener("click", habilitarAudio);

    return () => {
      window.removeEventListener("click", habilitarAudio);
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <video
        ref={videoRef}
        src={videoFile}
        autoPlay
        loop
        muted // obrigatório para autoplay inicial
        playsInline
        style={{
          height: "100vh",
          width: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
