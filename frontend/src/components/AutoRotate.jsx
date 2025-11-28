import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FullscreenButton from "./FullscreenButton";

export default function AutoRotate({
  rotas,
  tempoRotacao = null,
  tempoReload,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  /* ============================
      🔄 ROTAÇÃO ENTRE TELAS
     ============================ */
  useEffect(() => {
    if (!tempoRotacao || rotas.length <= 1) return; // sem rotação

    const indexAtual = rotas.findIndex((r) => r.path === location.pathname);
    const proximoIndex = (indexAtual + 1) % rotas.length;

    const timer = setTimeout(() => {
      navigate(rotas[proximoIndex].path);
    }, tempoRotacao);

    return () => clearTimeout(timer);
  }, [location.pathname, rotas, navigate, tempoRotacao]);

  /* ============================
      🔁 RELOAD AUTOMÁTICO (F5)
     ============================ */
  useEffect(() => {
    if (!tempoReload) return;

    const interval = setInterval(() => {
      window.location.reload();
    }, tempoReload);

    return () => clearInterval(interval);
  }, [tempoReload]);

  return <FullscreenButton />;
}
