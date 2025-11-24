import React, { useEffect, useState } from "react";

const TEMPO_RELOAD = 1; // minutos

export default function ExternalApp() {
  const [key, setKey] = useState(Date.now());

  // Reload REAL do iframe sem perder fullscreen
  useEffect(() => {
    const id = setInterval(() => {
      setKey(Date.now()); // recria o iframe
    }, TEMPO_RELOAD * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "black",
      }}
    >
      <iframe
        key={key}
        src="/app"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
}
