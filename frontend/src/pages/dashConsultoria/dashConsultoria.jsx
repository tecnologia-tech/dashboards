import { useEffect, useState } from "react";
import { getDashGeralCS, getDashOnboarding } from "../../api/dashboards";
import jayanne from "../../assets/jayanne.png";
import jenifer from "../../assets/jenifer.png";
import stephany from "../../assets/stephany.png";

import "./dashConsultoria.css";

export default function Dashboards() {
  const [geralCS, setGeralCS] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dadosGeralCS, dadosOnboarding] = await Promise.all([
          getDashGeralCS(),
          getDashOnboarding(),
        ]);
        setGeralCS(dadosGeralCS);
        setOnboarding(dadosOnboarding);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="dashboard">
      <div className="header">HEADER</div>
      <div className="ltda">
        <h2 className="titulo">LTDA</h2>

        <div className="valor-meta">
          <span className="valor">R$ 1.160.000</span>
          <span className="meta">de R$ 1.400.000</span>
        </div>

        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "82.8%" }}></div>
        </div>

        <div className="porcentagem">82.8%</div>

        <div className="estornos">
          Estornos: <strong>R$ 99.626,45</strong>
        </div>
      </div>
      <div className="cs">
        <h2 className="titulo">CS</h2>

        <div className="valor-meta">
          <span className="valor">R$ 500.400</span>
          <span className="meta">de R$ 850.000</span>
        </div>

        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "58.9%" }}></div>
        </div>

        <div className="porcentagem">58.9%</div>

        <div className="estornos">
          Estornos: <strong>R$ 0,00</strong>
        </div>
      </div>

      <div className="bonus">
        <h2 className="titulo">BÔNUS</h2>

        <div className="valor-meta">
          <span className="valor">R$ 99.900</span>
          <span className="meta">de R$ 150.000</span>
        </div>

        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "66.6%" }}></div>
        </div>

        <div className="porcentagem">66.6%</div>

        <div className="estornos">
          Estornos: <strong>R$ 0,00</strong>
        </div>
      </div>

      <div className="repedidos">
        <h2 className="titulo">REPEDIDOS</h2>

        <div className="valor-meta">
          <span className="valor">R$ 54.400</span>
          <span className="meta">de R$ 300.000</span>
        </div>

        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "18.1%" }}></div>
        </div>

        <div className="porcentagem">18.1%</div>

        <div className="estornos">
          Estornos: <strong>R$ 0,00</strong>
        </div>
      </div>

      <div className="onboarding">
        <h2 className="titulo-onboarding">ONBOARDING</h2>

        <div className="onboarding-total">66 Clientes</div>

        <div className="onboarding-lista">
          <div className="linha">
            <img src={jayanne} alt="Jayanne Queiroz" className="foto" />
            <div className="info">
              <span className="nome">Jayanne Queiroz</span>
              <span className="quantidade">27 Clientes</span>
            </div>
          </div>
          <div className="linha">
            <img src={jenifer} alt="Jenifer Martins" className="foto" />
            <div className="info">
              <span className="nome">Jenifer Martins</span>
              <span className="quantidade">21 Clientes</span>
            </div>
          </div>
          <div className="linha">
            <img src={stephany} alt="Stephany Moura" className="foto" />
            <div className="info">
              <span className="nome">Stephany Moura</span>
              <span className="quantidade">18 Clientes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="compras">COMPRAS</div>
      <div className="dozep">12P</div>
      <div className="importacao">IMPORTAÇÃO</div>
      <div className="csat">CSAT</div>
      <div className="reputacao12p">REPUTAÇÃO12P</div>
    </div>
  );
}
