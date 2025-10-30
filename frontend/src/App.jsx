import { HashRouter, Routes, Route } from "react-router-dom";
import DashLastDance from "./pages/dashLastDance/dashLastDance";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/lastdance" element={<DashLastDance />} />
        <Route path="/" element={<DashLastDance />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
