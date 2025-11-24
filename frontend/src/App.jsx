import React, { Suspense, lazy, useEffect, useState } from "react";
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
   TEMPOS CONFIGURÁVEIS
============================================================ */
const TEMPO_ROTACAO = 3; // minutos
const TEMPO_RELOAD = 1; // minutos

/* ============================================================
   PRELOAD DOS MÓDULOS
============================================================ */
import("./pages/Hunters/Hunters");
import("./pages/Farmers/Farmers");
import("./pages/LastDance/LastDance");
import("./pages/BlackFriday/BlackFriday");
import("./pages/Geral/Geral");

/* ============================================================
   LAZY LOAD
============================================================ */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));

/* ============================================================
   AUTO-ROTAÇÃO DAS ROTAS
============================================================ */
function AutoRotateRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const rotas = ["/blackfriday"]; // adicione mais se quiser

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
   APP PRINCIPAL
============================================================ */
export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔄 RELOAD SUAVE (não perde fullscreen)
  useEffect(() => {
    const id = setInterval(() => {
      setRefreshKey((k) => k + 1); // força remount REAL
    }, TEMPO_RELOAD * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <AutoRotateRoutes />

      <FullscreenButton />

      <Suspense fallback={<LoaderPadrao />}>
        {/* key força recriação de TUDO */}
        <Routes key={refreshKey}>
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
