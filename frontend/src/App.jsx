import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Hunters = lazy(() => import("./pages/Hunters/Hunters"));
const Farmers = lazy(() => import("./pages/Farmers/Farmers"));
const LastDance = lazy(() => import("./pages/LastDance/LastDance"));
const BlackFriday = lazy(() => import("./pages/BlackFriday/BlackFriday"));

function App() {
  return (
    <BrowserRouter>
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
