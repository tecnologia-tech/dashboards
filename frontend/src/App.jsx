import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import FullscreenButton from "./components/FullscreenButton";
import TVSelection from "./components/TVSelection";
import { rotasTV1, rotasTV2, rotasTV3 } from "./tvRoutes";

/* =====================================================
   LAZY LOAD DAS PÁGINAS
===================================================== */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));

/* =====================================================
   COMPONENTE DE ROTAÇÃO (SIMPLIFICADO)
===================================================== */
function AutoRotate({ rotas }) {
  return (
    <>
      <FullscreenButton />
      {/* As rotas abaixo já estão no navegador */}
    </>
  );
}

/* =====================================================
   APP PRINCIPAL
===================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ color: "white" }}>Carregando…</div>}>
        <Routes>
          {/* Tela inicial com os botões */}
          <Route path="/" element={<TVSelection />} />

          {/* TVs */}
          <Route
            path="/tv1"
            element={<Navigate to={rotasTV1[0].path} replace />}
          />
          <Route
            path="/tv2"
            element={<Navigate to={rotasTV2[0].path} replace />}
          />
          <Route
            path="/tv3"
            element={<Navigate to={rotasTV3[0].path} replace />}
          />

          {/* GRUPOS DE ROTAS */}
          {rotasTV1.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <>
                  <AutoRotate rotas={rotasTV1} />
                  <Geral />
                </>
              }
            />
          ))}

          {rotasTV2.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <>
                  <AutoRotate rotas={rotasTV2} />
                  <BlackFriday />
                </>
              }
            />
          ))}

          {rotasTV3.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <>
                  <AutoRotate rotas={rotasTV3} />
                  {r.path === "/hunters" ? <Hunters /> : <Farmers />}
                </>
              }
            />
          ))}

          {/* Página LastDance fora das TVs */}
          <Route
            path="/lastdance"
            element={
              <>
                <FullscreenButton />
                <LastDance />
              </>
            }
          />

          {/* Qualquer erro → volta à Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
