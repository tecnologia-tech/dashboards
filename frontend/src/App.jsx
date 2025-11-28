import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AutoRotate from "./components/AutoRotate";
import TVSelection from "./components/TVSelection";

/* Páginas */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ color: "white" }}>Carregando…</div>}>
        <Routes>
          {/* Tela inicial */}
          <Route path="/" element={<TVSelection />} />

          {/* Atalhos das TVs */}
          <Route path="/tv1" element={<Navigate to="/geral" replace />} />
          <Route path="/tv2" element={<Navigate to="/blackfriday" replace />} />
          <Route path="/tv3" element={<Navigate to="/farmers" replace />} />

          {/* ============================
               TV1 — Geral fixa
               F5 a cada 2 minutos
             ============================ */}
          <Route
            path="/geral"
            element={
              <>
                <AutoRotate
                  rotas={[{ path: "/geral" }]} // fixa
                  tempoReload={2 * 60 * 1000} // 2 min
                />
                <Geral />
              </>
            }
          />

          {/* ============================
               TV2 — BlackFriday fixa
               F5 a cada 1 minuto
             ============================ */}
          <Route
            path="/blackfriday"
            element={
              <>
                <AutoRotate
                  rotas={[{ path: "/blackfriday" }]} // fixa
                  tempoReload={1 * 60 * 1000} // 1 min
                />
                <BlackFriday />
              </>
            }
          />

          {/* ============================
               TV3 — alterna Farmers/Hunters
               Troca a cada 2 min
               F5 a cada 1 min
             ============================ */}
          {[
            { path: "/farmers", element: <Farmers /> },
            { path: "/hunters", element: <Hunters /> },
          ].map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <>
                  <AutoRotate
                    rotas={[{ path: "/farmers" }, { path: "/hunters" }]}
                    tempoRotacao={2 * 60 * 1000} // 2 min
                    tempoReload={1 * 60 * 1000} // 1 min
                  />
                  {r.element}
                </>
              }
            />
          ))}

          <Route path="/lastdance" element={<LastDance />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
