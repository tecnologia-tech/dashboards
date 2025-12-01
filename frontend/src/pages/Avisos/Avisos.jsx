// =============================================================
//  AVISOS – FULLSCREEN SOMENTE IMAGEM
// =============================================================
import bgImage from "../../assets/Avisos/bg-video-youtube.jpg"; // ajuste o caminho

export default function Avisos() {
  return (
    <div
      className="h-screen w-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    ></div>
  );
}
