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
      <Suspense fallback={<div style={{ color: "white" }}>Carregando…</div>}>
        <Routes>
          {/* Seleção de TVs */}
          <Route path="/" element={<TVSelection />} />

          {/* Atalhos para começar */}
          <Route path="/tv1" element={<Navigate to="/geral" replace />} />
          <Route path="/tv2" element={<Navigate to="/blackfriday" replace />} />
          <Route path="/tv3" element={<Navigate to="/farmers" replace />} />

          {/* =====================================================
              TV1 — Geral fixa, refresh 10s para teste
          ===================================================== */}
          <Route
            path="/geral"
            element={
              <>
                <AutoRotate
                  rotas={[{ path: "/geral" }]}
                  tempoRefresh={10 * 1000} // 10s teste
                />
                <TelaComRefresh>
                  <Geral />
                </TelaComRefresh>
              </>
            }
          />

          {/* =====================================================
              TV2 — BlackFriday fixa, refresh 10s para teste
          ===================================================== */}
          <Route
            path="/blackfriday"
            element={
              <>
                <AutoRotate
                  rotas={[{ path: "/blackfriday" }]}
                  tempoRefresh={10 * 1000} // 10s teste
                />
                <TelaComRefresh>
                  <BlackFriday />
                </TelaComRefresh>
              </>
            }
          />

          {/* =====================================================
              TV3 — Farmers ↔ Hunters infinita
              Rotação a cada 10s (teste)
              Refresh interno a cada 10s
          ===================================================== */}
          <Route
            path="/farmers"
            element={
              <>
                <AutoRotate
                  rotas={[{ path: "/farmers" }, { path: "/hunters" }]}
                  tempoRotacao={10 * 1000}
                  tempoRefresh={10 * 1000}
                />
                <TelaComRefresh>
                  <Farmers />
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
                  tempoRotacao={10 * 1000}
                  tempoRefresh={10 * 1000}
                />
                <TelaComRefresh>
                  <Hunters />
                </TelaComRefresh>
              </>
            }
          />

          {/* Página isolada */}
          <Route path="/lastdance" element={<LastDance />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
