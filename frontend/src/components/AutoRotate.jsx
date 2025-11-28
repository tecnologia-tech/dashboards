import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FullscreenButton from "./FullscreenButton";

export default function AutoRotate({
  rotas,
  tempoRotacao = null,
  tempoRefresh,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // ============================
  // 🔄 LOOP INFINITO DE ROTAÇÃO
  // ============================
  useEffect(() => {
    if (!tempoRotacao || rotas.length <= 1) return;

    const timer = setTimeout(() => {
      const indexAtual = rotas.findIndex((r) => r.path === location.pathname);

      // Se não encontrou, vai pro primeiro
      const proximoIndex =
        indexAtual === -1 ? 0 : (indexAtual + 1) % rotas.length;

      navigate(rotas[proximoIndex].path);
    }, tempoRotacao);

    return () => clearTimeout(timer);
  }, [location.pathname, rotas, navigate, tempoRotacao]);

  // ============================
  // 🔁 REFRESH INTERNO
  // ============================
  useEffect(() => {
    if (!tempoRefresh) return;

    const interval = setInterval(() => {
      document.dispatchEvent(new Event("refreshTela"));
    }, tempoRefresh);

    return () => clearInterval(interval);
  }, [tempoRefresh]);

  return <FullscreenButton />;
}
