import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashConsultoria from "./pages/dashConsultoria/dashConsultoria";
import DashLastDance from "./pages/dashLastDance/dashLastDance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/consultoria" element={<DashConsultoria />} />
        <Route path="/lastdance" element={<DashLastDance />} />
        <Route path="/" element={<DashConsultoria />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
