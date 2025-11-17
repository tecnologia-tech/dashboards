import { HashRouter, Routes, Route } from "react-router-dom";
import DashLastDance from "./pages/dashLastDance/dashLastDance";
import BlackFriday from "./pages/BlackFriday/BlackFriday";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashLastDance />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
