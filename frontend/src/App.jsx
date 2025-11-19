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

const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));

/* ============================================================
   AUTO-ROTAÇÃO DE ROTAS A CADA 2 MINUTOS
============================================================ */
function AutoRotateRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // DEFINA AQUI A ORDEM DAS TELAS
  const rotas = ["/farmers", "/hunters"];

  useEffect(() => {
    // Qual o índice da rota atual na lista?
    let indexAtual = rotas.indexOf(location.pathname);

    // Se a rota atual não estiver na lista (ex: "/"), começa na primeira
    if (indexAtual === -1) indexAtual = 0;

    const id = setInterval(() => {
      indexAtual = (indexAtual + 1) % rotas.length;
      navigate(rotas[indexAtual], { replace: true });
    }, 60 * 3000);

    return () => clearInterval(id);
  }, [location.pathname, navigate, rotas]);

  return null;
}

/* ============================================================
   APP
============================================================ */
function App() {
  return (
    <BrowserRouter>
      <AutoRotateRoutes />

      {/* BOTÃO DE FULLSCREEN SEMPRE NO TOPO, NO CENTRO */}
      <FullscreenButton />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/hunters" replace />} />
          <Route path="/hunters" element={<Hunters />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/lastdance" element={<LastDance />} />
          <Route path="/blackfriday" element={<BlackFriday />} />

          <Route path="*" element={<Navigate to="/hunters" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
