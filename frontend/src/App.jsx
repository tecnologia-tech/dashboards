import {
  Suspense,
  createContext,
  lazy,
  useContext,
  useEffect,
  useState,
} from "react";
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
const Conjunta = lazy(() => import("./pages/Conjunta/Conjunta"));

/* ===========================================================
   PRELOAD - Remove delay do lazy
=========================================================== */
import("./pages/Farmers/Farmers");
import("./pages/Hunters/Hunters");
import("./pages/BlackFriday/BlackFriday");
import("./pages/Geral/Geral");
import("./pages/LastDance/LastDance");
import("./pages/Avisos/Avisos");
import("./pages/Conjunta/Conjunta");
/* ===========================================================
   CONTEXTO INTERNO DA TV3 — NÃO EXPORTADO!
=========================================================== */
const TV3Context = createContext(null);

function TV3Provider({ children }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "https://dashboards-exur.onrender.com/api/dash_geralcswon"
      );
      const data = await res.json();
      setDados(data);
    }
    load();
  }, []);

  return <TV3Context.Provider value={dados}>{children}</TV3Context.Provider>;
}

// Hook local (não exportado)
function useTV3() {
  return useContext(TV3Context);
}

/* ===========================================================
   WRAPPER PARA FORÇAR REMONTAGEM
=========================================================== */
function TelaComRefresh({ children }) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    function refresh() {
      setKey((k) => k + 1);
    }
    document.addEventListener("refreshTela", refresh);
    return () => document.removeEventListener("refreshTela", refresh);
  }, []);

  return <div key={key}>{children}</div>;
}

/* ===========================================================
   APP PRINCIPAL
=========================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TVSelection />} />

        <Route path="/tv1" element={<Navigate to="/Conjunta" replace />} />
        <Route path="/tv2" element={<Navigate to="/Lastdance" replace />} />
        <Route path="/tv3" element={<Navigate to="/farmers" replace />} />

        {/* TV1 */}
        <Route
          path="/conjunta"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/conjunta" }, { path: "/geral" }]}
                tempoRotacao={2 * 60 * 1000} // 2 minutos
                tempoRefresh={3 * 60 * 1000} // se quiser continuar usando
              />

              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <Conjunta />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        {/* TV2 */}
        <Route
          path="/Lastdance"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/Lastdance" }]}
                tempoRotacao={2 * 60 * 1000}
                tempoRefresh={1 * 60 * 1000}
              />
              <TelaComRefresh>
                <Suspense
                  fallback={<div style={{ color: "white" }}>Carregando…</div>}
                >
                  <LastDance />
                </Suspense>
              </TelaComRefresh>
            </>
          }
        />

        {/* =====================================================
           TV3 — Provider + Farmers/Hunters sem tela branca
        ===================================================== */}
        <Route
          path="/farmers"
          element={
            <TV3Provider>
              <TV3Wrapper component="farmers" />
            </TV3Provider>
          }
        />

        <Route
          path="/hunters"
          element={
            <TV3Provider>
              <TV3Wrapper component="hunters" />
            </TV3Provider>
          }
        />

        {/* LastDance */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ===========================================================
   WRAPPER DA TV3 — entrega dados como props
=========================================================== */
function TV3Wrapper({ component }) {
  const dados = useTV3();

  // Primeira montagem da TV3 — ainda carregando
  if (!dados) return <div style={{ color: "white" }}>Carregando dados…</div>;

  return (
    <>
      <AutoRotate
        rotas={[{ path: "/farmers" }, { path: "/hunters" }]}
        tempoRotacao={35 * 1000}
        tempoRefresh={1 * 60 * 1000}
      />

      <TelaComRefresh>
        {component === "farmers" ? (
          <Farmers dados={dados} />
        ) : (
          <Hunters dados={dados} />
        )}
      </TelaComRefresh>
    </>
  );
}
