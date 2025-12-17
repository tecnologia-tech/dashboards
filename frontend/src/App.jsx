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

/* ===========================================================
   LAZY PAGES
=========================================================== */
const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));
const Geral = lazy(() => import("./pages/Geral/Geral"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const Conjunta = lazy(() => import("./pages/Conjunta/Conjunta"));

/* ===========================================================
   PRELOAD
=========================================================== */
import("./pages/Farmers/Farmers");
import("./pages/Hunters/Hunters");
import("./pages/BlackFriday/BlackFriday");
import("./pages/Geral/Geral");
import("./pages/LastDance/LastDance");
import("./pages/Conjunta/Conjunta");

/* ===========================================================
   CONTEXTO TV3
=========================================================== */
const TV3Context = createContext(null);

function TV3Provider({ children }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch(
          "https://dashboards-ku14.onrender.com/api/dash_geralcswon"
        );
        const data = await res.json();

        if (isMounted) {
          setDados(data);
        }
      } catch (err) {
        console.error("Erro ao atualizar dados TV3:", err);
      }
    }

    // primeira carga
    load();

    // refresh automático a cada 1 min
    const interval = setInterval(load, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return <TV3Context.Provider value={dados}>{children}</TV3Context.Provider>;
}

// hook interno
function useTV3() {
  return useContext(TV3Context);
}

/* ===========================================================
   WRAPPER DE REFRESH VISUAL
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
   TV1 WRAPPER
=========================================================== */
function TV1Wrapper({ children }) {
  return (
    <>
      <AutoRotate
        rotas={[{ path: "/conjunta" }, { path: "/geral" }]}
        tempoRotacao={2 * 60 * 1000}
        tempoRefresh={3 * 60 * 1000}
      />

      <TelaComRefresh>
        <Suspense fallback={<div style={{ color: "white" }}>Carregando…</div>}>
          {children}
        </Suspense>
      </TelaComRefresh>
    </>
  );
}

/* ===========================================================
   APP
=========================================================== */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TVSelection />} />

        <Route path="/tv1" element={<Navigate to="/conjunta" replace />} />
        <Route path="/tv2" element={<Navigate to="/lastdance" replace />} />
        <Route path="/tv3" element={<Navigate to="/farmers" replace />} />

        {/* ================= TV1 ================= */}
        <Route
          path="/conjunta"
          element={
            <TV1Wrapper>
              <Conjunta />
            </TV1Wrapper>
          }
        />

        <Route
          path="/geral"
          element={
            <TV1Wrapper>
              <Geral />
            </TV1Wrapper>
          }
        />

        {/* ================= TV2 ================= */}
        <Route
          path="/lastdance"
          element={
            <>
              <AutoRotate
                rotas={[{ path: "/lastdance" }]}
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

        {/* ================= TV3 ================= */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ===========================================================
   TV3 WRAPPER
=========================================================== */
function TV3Wrapper({ component }) {
  const dados = useTV3();

  if (!dados) {
    return <div style={{ color: "white" }}>Carregando dados…</div>;
  }

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
