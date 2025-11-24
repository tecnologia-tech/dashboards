import React, { Suspense, lazy, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import FullscreenButton from "./components/FullscreenButton";
import LoaderPadrao from "./components/LoaderPadrao";

/* TEMPOS */
const TEMPO_ROTACAO = 3; // minutos

/* PRELOAD */
import("./pages/Hunters/Hunters");
import("./pages/Farmers/Farmers");
import("./pages/LastDance/LastDance");
import("./pages/BlackFriday/BlackFriday");
import("./pages/Geral/Geral");

/* LAZY LOAD */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));

/* PRELOAD DE IMAGENS */
function usePreloadImages() {
  useEffect(() => {
    const preload = (src) => {
      const img = new Image();
      img.src = src;
    };

    [
      "/src/assets/Farmers/Farmers.png",
      "/src/assets/Hunters/Hunters.png",
    ].forEach(preload);
  }, []);
}

/* AUTO-ROTAÇÃO INTERNA */
function AutoRotateRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const rotas = ["/blackfriday"]; // adicione mais aqui

  useEffect(() => {
    let indexAtual = rotas.indexOf(location.pathname);
    if (indexAtual === -1) indexAtual = 0;

    const id = setInterval(() => {
      indexAtual = (indexAtual + 1) % rotas.length;
      navigate(rotas[indexAtual], { replace: true });
    }, TEMPO_ROTACAO * 60 * 1000);

    return () => clearInterval(id);
  }, [location.pathname]);
}

/* APP INTERNA (SPA REAL) */
export default function InternalApp() {
  usePreloadImages();

  return (
    <>
      <AutoRotateRoutes />

      <FullscreenButton />

      <Suspense fallback={<LoaderPadrao />}>
        <Routes>
          <Route path="/" element={<Navigate to="/hunters" replace />} />

          <Route path="/hunters" element={<Hunters key="hunters" />} />
          <Route path="/farmers" element={<Farmers key="farmers" />} />
          <Route path="/lastdance" element={<LastDance key="lastdance" />} />
          <Route
            path="/blackfriday"
            element={<BlackFriday key="blackfriday" />}
          />
          <Route path="/geral" element={<Geral key="geral" />} />

          <Route path="*" element={<Navigate to="/hunters" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
