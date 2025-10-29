import stephany from "../../assets/stephany.png";
import dozeP from "../../assets/dozeP.png";
import "./dashConsultoria.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="header">
        <p>Dólar: $5,36</p>
        <p>NPS: 3,69</p>
        <p>BHAG 12P: 1/100</p>
        <p>
          <img src={dozeP} alt="Logo Doze Pê" className="logoDozeP" />
        </p>
      </div>

      <div className="ltda">
        <h2 className="titulo">LTDA</h2>
        <div className="valor-meta">
          <span className="valor">R$ 15.742,00</span>
          <span className="meta">55.87% do 60% da meta</span>
        </div>
        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "55.87%" }}></div>
        </div>
        <div className="porcentagem">55.87%</div>
        <div className="estornos">
          Estornos: <strong>R$ 0,00</strong>
        </div>
      </div>

      <div className="cs">
        <h2 className="titulo">CS</h2>
        <div className="valor-meta">
          <span className="valor">R$ 5.440,00</span>
          <span className="meta">55.87% do 60% da meta</span>
        </div>
        <div className="barra-container">
          <div className="barra-preenchida" style={{ width: "55.87%" }}></div>
        </div>
        <div className="porcentagem">55.87%</div>
        <div className="estornos">
          Estornos: <strong>R$ 0,00</strong>
        </div>
      </div>

      <div className="bonus">
        <h2 className="titulo">Bônus</h2>
        <p className="valor">R$ 6.160,00</p>
      </div>

      <div className="repedidos">
        <h2 className="titulo">Repetidos</h2>
        <p className="valor">R$ 1.540,00</p>
      </div>

      <div className="onboarding">
        <h2 className="titulo-onboarding">Onboarding</h2>
        <div className="onboarding-total">36 Clientes</div>
        <div className="onboarding-lista">
          <div className="linha">
            <img src={stephany} alt="Stephany Moura" className="foto" />
            <div className="info">
              <span className="nome">Jaqueline Quintino</span>
              <span className="quantidade">25 Clientes</span>
            </div>
          </div>
          <div className="linha">
            <div className="info">
              <span className="nome">Jordan Martins</span>
              <span className="quantidade">7 Clientes</span>
            </div>
          </div>
          <div className="linha">
            <div className="info">
              <span className="nome">Shagson Moura</span>
              <span className="quantidade">4 Clientes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="compras">
        ACCOUNT N4: 65 tickets
        <br />
        Simulações: Em andamento
        <br />
        Testes: Em andamento
      </div>
      <div className="dozep">
        I2P
        <br />
        1.000 Clientes
      </div>
      <div className="importacao">
        Clientes: 116 | Brasil: 86
        <br />
        Em andamento: 6 | Cancelados: 7
      </div>
      <div className="csat">
        CSAT
        <br />
        100 (10, 10, 10, 20, 40, 43, 43)
      </div>
      <div className="reputacao12p">
        Reputação I2P
        <br />
        Faturamento: R$ 10.000,00
        <br />
        Clientes: 1000
        <br />
        NPS: 91.58
        <br />
        Reclame Aqui: 9.50%
      </div>
    </div>
  );
}
