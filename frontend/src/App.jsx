import { HashRouter, Routes, Route } from "react-router-dom";
import DashConsultoria from "./pages/dashConsultoria/dashConsultoria";
import DashLastDance from "./pages/dashLastDance/dashLastDance";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/consultoria" element={<DashConsultoria />} />
        <Route path="/lastdance" element={<DashLastDance />} />
        <Route path="/" element={<DashConsultoria />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
