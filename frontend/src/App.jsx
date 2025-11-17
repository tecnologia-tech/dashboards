import { HashRouter, Routes, Route } from "react-router-dom";
import LastDance from "./pages/LastDance/LastDance";
import BlackFriday from "./pages/BlackFriday/BlackFriday";
import Hunters from "./pages/Hunters/Hunters";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Hunters />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
