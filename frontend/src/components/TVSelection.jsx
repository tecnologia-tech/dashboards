import { useNavigate } from "react-router-dom";
import ButtonPrincipal from "./ButtonPrincipal";

export default function TVSelection() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        gap: "150px",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
      }}
    >
      <ButtonPrincipal label="TV 1" onClick={() => navigate("/tv1")} />
      <ButtonPrincipal label="TV 2" onClick={() => navigate("/tv2")} />
      <ButtonPrincipal label="TV 3" onClick={() => navigate("/tv3")} />
    </div>
  );
}
