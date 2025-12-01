// =============================================================
//  AVISOS – TELA DE CONSTRUÇÃO (TEMA NEON BLACK)
// =============================================================
import { useEffect } from "react";

const NEON_YELLOW = "#ffd83b";
const NEON_RED = "#ff2626";

const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;900&display=swap");

@keyframes faixaMove {
  0% { background-position: 0 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseText {
  0%, 100% { opacity: 1; text-shadow: 0 0 16px ${NEON_YELLOW}; }
  50% { opacity: 0.55; text-shadow: 0 0 32px ${NEON_YELLOW}; }
}
`;

const ROOT_BG = `
radial-gradient(circle, #000 0%, #000 100%)
`;

export default function Avisos() {
  useEffect(() => {}, []);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="flex h-screen w-full flex-col items-center justify-center text-white"
        style={{
          backgroundImage: ROOT_BG,
          backgroundSize: "cover",
          fontFamily: "'Baloo 2'",
          padding: "2vh 2vw",
          gap: "6vh",
        }}
      >
        {/* FAIXA SUPERIOR */}
        <div
          className="w-[90%] h-[7vh] rounded-[16px]"
          style={{
            background: `
              repeating-linear-gradient(
                45deg,
                ${NEON_YELLOW} 0 32px,
                ${NEON_RED} 32px 64px
              )
            `,
            animation: "faixaMove 8s linear infinite", // 🔥 velocidade reduzida
            backgroundSize: "200% 200%",
            boxShadow: `0 0 28px ${NEON_YELLOW}`,
          }}
        ></div>

        {/* TEXTO */}
        <div className="flex flex-col items-center justify-center">
          <span
            className="text-[5rem] font-extrabold uppercase tracking-[0.18em]"
            style={{
              color: NEON_YELLOW,
              textShadow: `0 0 22px ${NEON_YELLOW}`,
              animation: "pulseText 2s ease-in-out infinite",
            }}
          >
            AVISOS
          </span>

          <span
            className="text-[2.6rem] font-bold uppercase tracking-[0.14em]"
            style={{
              marginTop: "0.8vh",
              color: "white",
              textShadow: `0 0 18px white`,
              opacity: 0.9,
            }}
          >
            EM CONSTRUÇÃO
          </span>
        </div>

        {/* FAIXA INFERIOR */}
        <div
          className="w-[90%] h-[7vh] rounded-[16px]"
          style={{
            background: `
              repeating-linear-gradient(
                45deg,
                ${NEON_RED} 0 32px,
                ${NEON_YELLOW} 32px 64px
              )
            `,
            animation: "faixaMove 8s linear infinite reverse", // 🔥 lento e invertido
            backgroundSize: "200% 200%",
            boxShadow: `0 0 28px ${NEON_RED}`,
          }}
        ></div>
      </div>
    </>
  );
}
