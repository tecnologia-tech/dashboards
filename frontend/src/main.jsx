import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ExternalApp from "./App";
import InternalApp from "./InternalApp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ExternalApp />} />
      <Route path="/app/*" element={<InternalApp />} />
    </Routes>
  </BrowserRouter>
);
