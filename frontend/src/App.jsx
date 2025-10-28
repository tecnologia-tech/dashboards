import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashConsultoria from "./pages/dashConsultoria/dashConsultoria"; // nome exato do arquivo

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/consultoria" element={<DashConsultoria />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
