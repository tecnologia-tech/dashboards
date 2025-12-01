import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AutoRotate from "./components/AutoRotate";
import TVSelection from "./components/TVSelection";

// Lazy pages
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const Avisos = lazy(() => import("./pages/Avisos/Avisos"));

/* ============================================
   WRAPPER PARA FORÇAR REMONTAGEM (REFRESH)
=============================================== */
import { useEffect, useState } from "react";

function TelaComRefresh({ children }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    function refresh() {
      setKey((k) => k + 1); // força re-render
    }

    document.addEventListener("refreshTela", refresh);
    return () => document.removeEventListener("refreshTela", refresh);
  }, []);

  return <div key={key}>{children}</div>;
}

/* ============================================
   APP PRINCIPAL
=============================================== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Seleção de TVs */}
        <Route path="/" element={<TVSelection />} />

        {/* Atalhos */}
        <Route path="/tv1" element={<Navigate to="/geral" replace />} />
        <Route path="/tv2" element={<Navigate to="/Avisos" replace />} />
        <Route path="/tv3" element={<Navigate to="/farmers" replace />} />

        {/* =====================================================
            TV1 — Geral fixa com refresh
        ===================================================== */}
        <Route
          path="/geral"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/geral" }]}
                tempoRefresh={5 * 60 * 1000}
              />

              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <Geral />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        {/* =====================================================
            TV2 — BlackFriday fixa
        ===================================================== */}
        <Route
          path="/Avisos"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/Avisos" }]}
                tempoRotacao={2 * 60 * 1000}
                tempoRefresh={1 * 60 * 1000}
              />

              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <Avisos />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        {/* =====================================================
            TV3 — Farmers ↔ Hunters (15s)
        ===================================================== */}
        <Route
          path="/farmers"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/farmers" }, { path: "/hunters" }]}
                tempoRotacao={15 * 1000}
                tempoRefresh={1 * 60 * 1000}
              />

              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <Farmers />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        <Route
          path="/hunters"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/farmers" }, { path: "/hunters" }]}
                tempoRotacao={15 * 1000}
                tempoRefresh={1 * 60 * 1000}
              />

              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <Hunters />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        {/* Página isolada */}
        <Route
          path="/lastdance"
          element={
            <Suspense
              fallback={<div style={{ color: "white" }}>Carregando…</div>}
            >
              <LastDance />
            </Suspense>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
