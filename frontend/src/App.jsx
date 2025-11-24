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
   TEMPOS CONFIGURÁVEIS (em minutos)
============================================================ */
const TEMPO_ROTACAO = 3; // troca de rota
const TEMPO_RELOAD = 1; // reload sem perder fullscreen

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
   AUTO-ROTAÇÃO DAS ROTAS
============================================================ */
function AutoRotateRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const rotas = ["/blackfriday"]; // adicione mais aqui se quiser

  useEffect(() => {
    let indexAtual = rotas.indexOf(location.pathname);
    if (indexAtual === -1) indexAtual = 0;

    const id = setInterval(() => {
      indexAtual = (indexAtual + 1) % rotas.length;
      navigate(rotas[indexAtual], { replace: true });
    }, TEMPO_ROTACAO * 60 * 1000);

    return () => clearInterval(id);
  }, [location.pathname, navigate]);
}

/* ============================================================
   COMPONENTE APP
============================================================ */
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  usePreloadImages();

  // 🔄 RELOAD SUAVE SEM SAIR DO FULLSCREEN
  useEffect(() => {
    const id = setInterval(() => {
      navigate(location.pathname, { replace: true });
      // recria o componente → dispara fetch de dados
    }, TEMPO_RELOAD * 60 * 1000);

    return () => clearInterval(id);
  }, [location.pathname, navigate]);

  return (
    <>
      <AutoRotateRoutes />

      <FullscreenButton />

      <Suspense fallback={<LoaderPadrao />}>
        <Routes>
          <Route path="/" element={<Navigate to="/hunters" replace />} />

          {/* 🔥 COMPONENTES COM KEY PARA RECRIAR E RECARREGAR DADOS */}
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

/* ============================================================
   BROWSER ROUTER WRAPPER (necessário para navigate e location)
============================================================ */
export default function AppWrapper() {
  const [key, setKey] = React.useState(Date.now());

  useEffect(() => {
    // RELOAD DO IFRAME SEM SAIR DO FULLSCREEN
    const id = setInterval(() => {
      setKey(Date.now()); // força recarregar o iframe
    }, TEMPO_RELOAD * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <iframe
        key={key}
        src="/"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
}
