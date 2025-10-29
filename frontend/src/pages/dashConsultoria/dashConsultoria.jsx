import stephany from "../../assets/stephany.png";
import jenifer from "../../assets/jenifer.png";
import jayanne from "../../assets/jayanne.png";
import dozeP from "../../assets/dozeP.png";
import styles from "./dashConsultoria.module.css";

export default function Dashboard() {
  return (
    <div className={styles.root}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <p>Dólar: $5,36</p>
          <p>NPS: 3,69</p>
          <p>BHAG 12P: 1/100</p>
          <p>
            <img src={dozeP} alt="Logo Doze Pê" className={styles.logoDozeP} />
          </p>
        </div>

        <div
          className={`${styles.dashboardItem} ${styles.ltda} ${styles.bloco}`}
        >
          <p className={styles.titulo}>LTDA</p>
          <div className={styles.valorMeta}>
            <span className={styles.valor}>R$ 1,242 mi</span>
            <span className={styles.meta}>R$ 1,4 mi</span>
          </div>
          <div className={styles.barraContainer}>
            <div
              className={styles.barraPreenchida}
              style={{ width: "88.7%" }}
            ></div>
          </div>
          <div className={styles.porcentagem}>88.7% da meta batida</div>
          <div className={styles.estornos}>
            Meta sugerida: <strong>R$ 1,3 mi</strong>
          </div>
          <div className={styles.rodape}>
            <div className={styles.estornos}>
              Estornos: <strong>R$ 99.626,45</strong>
            </div>
          </div>
        </div>

        <div className={`${styles.dashboardItem} ${styles.cs} ${styles.bloco}`}>
          <p className={styles.titulo}>CS</p>
          <div className={styles.valorMeta}>
            <span className={styles.valor}>R$ 500,4 mil</span>
            <span className={styles.meta}>R$ 850 mil</span>
          </div>
          <div className={styles.barraContainer}>
            <div
              className={styles.barraPreenchida}
              style={{ width: "58.9%" }}
            ></div>
          </div>
          <div className={styles.porcentagem}>58.9% da meta batida</div>
          <div className={styles.sugerida}>
            Meta sugerida: <strong>R$ 1,3 mi</strong>
          </div>
          <div className={styles.rodape}>
            <div className={styles.estornos}>
              Estornos: <strong>R$ 99.626,45</strong>
            </div>
          </div>
        </div>

        <div
          className={`${styles.dashboardItem} ${styles.bonus} ${styles.bloco}`}
        >
          <p className={styles.titulo}>Bônus</p>
          <div className={styles.valorMeta}>
            <span className={styles.valor}>R$ 100,1 mil</span>
            <span className={styles.meta}>R$ 150 mil</span>
          </div>
          <div className={styles.barraContainer}>
            <div
              className={styles.barraPreenchida}
              style={{ width: "66.8%" }}
            ></div>
          </div>
          <div className={styles.porcentagem}>66,8% da meta batida</div>
          <div className={styles.estornos}>
            Meta sugerida: <strong>R$ 1,3 mi</strong>
          </div>
          <div className={styles.rodape}>
            <div className={styles.estornos}>
              Estornos: <strong>R$ 99.626,45</strong>
            </div>
          </div>
        </div>

        <div
          className={`${styles.dashboardItem} ${styles.repedidos} ${styles.bloco}`}
        >
          <p className={styles.titulo}>Repedidos</p>
          <div className={styles.valorMeta}>
            <span className={styles.valor}>R$ 54,4 mil</span>
            <span className={styles.meta}>R$ 300 mil</span>
          </div>
          <div className={styles.barraContainer}>
            <div
              className={styles.barraPreenchida}
              style={{ width: "18.1%" }}
            ></div>
          </div>
          <div className={styles.porcentagem}>18,1% da meta batida</div>
          <div className={styles.sugerida}>
            Meta sugerida: <strong>R$ 1,3 mi</strong>
          </div>
          <div className={styles.rodape}>
            <div className={styles.estornos}>
              Estornos: <strong>R$ 99.626,45</strong>
            </div>
          </div>
        </div>

        <div className={styles.onboarding}>
          <h2 className={styles.tituloOnboarding}>Onboarding</h2>
          <div className={styles.onboardingTotal}>36 Clientes</div>
          <div className={styles.onboardingLista}>
            <div className={styles.linha}>
              <img
                src={stephany}
                alt="Stephany Moura"
                className={styles.foto}
              />
              <div className={styles.info}>
                <span className={styles.nome}>Stephany Moura</span>
                <span className={styles.quantidade}>18 Clientes</span>
              </div>
            </div>
            <div className={styles.linha}>
              <img
                src={jenifer}
                alt="Jenifer Martins"
                className={styles.foto}
              />
              <div className={styles.info}>
                <span className={styles.nome}>Jenifer Martins</span>
                <span className={styles.quantidade}>21 Clientes</span>
              </div>
            </div>
            <div className={styles.linha}>
              <img
                src={jayanne}
                alt="Jayanne Queiroz"
                className={styles.foto}
              />
              <div className={styles.info}>
                <span className={styles.nome}>Jayanne Queiroz</span>
                <span className={styles.quantidade}>29 Clientes</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.compras}>
          ACCOUNT N4: 65 tickets
          <br />
          Simulações: Em andamento
          <br />
          Testes: Em andamento
        </div>
        <div className={styles.dozep}>
          I2P
          <br />
          1.000 Clientes
        </div>
        <div className={styles.importacao}>
          Clientes: 116 | Brasil: 86
          <br />
          Em andamento: 6 | Cancelados: 7
        </div>
        <div className={styles.csat}>
          CSAT
          <br />
          100 (10, 10, 10, 20, 40, 43, 43)
        </div>
        <div className={styles.reputacao12p}>
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
      </div>{" "}
    </div>
  );
}
