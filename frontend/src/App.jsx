import { HashRouter, Routes, Route } from "react-router-dom";
import DashLastDance from "./pages/dashLastDance/dashLastDance";
import DashLastDanceBlack from "./pages/dashLastDanceBlack/dashLastDanceBlack";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/lastdance" element={<DashLastDance />} />
        <Route path="/lastdanceblack" element={<DashLastDanceBlack />} />
        <Route path="/" element={<DashLastDanceBlack />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
