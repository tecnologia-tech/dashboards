import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import FullscreenButton from "./components/FullscreenButton";
import LoaderPadrao from "./components/LoaderPadrao";

/* ============================================================
   PRELOAD DOS MÓDULOS – deixa tudo instantâneo
============================================================ */
import("./pages/Hunters/Hunters");
import("./pages/Farmers/Farmers");
import("./pages/LastDance/LastDance");
import("./pages/BlackFriday/BlackFriday");
import("./pages/Geral/Geral");

/* ============================================================
   ROTAS COM LAZY
============================================================ */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));
/* ============================================================
   PRELOAD DE IMAGENS PRINCIPAIS
============================================================ */
function usePreloadImages() {
  useEffect(() => {
    const preload = (src) => {
      const img = new Image();
      img.src = src;
    };

    const images = [
      "/src/assets/Farmers/Farmers.png",
      "/src/assets/Hunters/Hunters.png",
    ];

    images.forEach(preload);
  }, []);
}

/* ============================================================
   AUTO-ROTAÇÃO DAS ROTAS USANDO MINUTOS DIRETO
============================================================ */
function AutoRotateRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const rotas = ["/blackfriday"];

  // 🔥 DEFINA O TEMPO EM MINUTOS AQUI
  const TEMPO_MINUTOS = 3;

  useEffect(() => {
    let indexAtual = rotas.indexOf(location.pathname);
    if (indexAtual === -1) indexAtual = 0;

    const id = setInterval(() => {
      indexAtual = (indexAtual + 1) % rotas.length;
      navigate(rotas[indexAtual], { replace: true });
    }, TEMPO_MINUTOS * 60 * 1000);
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // transforma minutos → ms automaticamente

    return () => clearInterval(id);
  }, [location.pathname, navigate]);
}

/* ============================================================
   APP
============================================================ */
function App() {
  usePreloadImages(); // acelera troca de rotas

  // 🔄 RELOAD AUTOMÁTICO A CADA 1 MINUTO
  useEffect(() => {
    const id = setInterval(() => {
      window.location.reload();
    }, 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <AutoRotateRoutes />

      <FullscreenButton />

      <Suspense fallback={<LoaderPadrao />}>
        <Routes>
          <Route path="/" element={<Navigate to="/hunters" replace />} />
          <Route path="/hunters" element={<Hunters />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/lastdance" element={<LastDance />} />
          <Route path="/blackfriday" element={<BlackFriday />} />
          <Route path="/geral" element={<Geral />} />
          <Route path="*" element={<Navigate to="/hunters" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
