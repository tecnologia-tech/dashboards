import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));

function AutoRotateRoutes() {
  const navigate = useNavigate();

  const rotas = ["/hunters", "/farmers"];

  useEffect(() => {
    let index = 0;
    navigate(rotas[index]);

    const interval = setInterval(() => {
      index = (index + 1) % rotas.length;
      navigate(rotas[index]);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AutoRotateRoutes />

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Hunters />} />
          <Route path="/hunters" element={<Hunters />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/lastdance" element={<LastDance />} />
          <Route path="/blackfriday" element={<BlackFriday />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
