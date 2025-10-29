import styles from "./dashLastDance.module.css";
import logolastdance from "../../assets/lastdance.png";

export default function DashLastDance() {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <img src={logolastdance} alt="Logo LastDance" />
      </div>
      <div className={styles.dashboard}>
        <div className={styles.valor}>
          <div className={styles.seta}>↓</div>
          <div className={styles.valorfaltadiario}>15K</div>
        </div>
        <div className={styles.valorfaltamensal}>
          <p>Contagem total:</p>
          <p>215K</p>
        </div>
        <div className={styles.ultimoswon}>Últimos Won</div>
        <div className={styles.projecaogeral}>Projeção Geral</div>
        <div className={styles.tabelawon}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company Name</th>
                <th>Assigned</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Linha 1</td>
                <td>Valor</td>
                <td>Valor</td>
                <td>Valor</td>
              </tr>
              <tr>
                <td>Linha 2</td>
                <td>Valor</td>
                <td>Valor</td>
                <td>Valor</td>
              </tr>
              <tr>
                <td>Linha 3</td>
                <td>Valor</td>
                <td>Valor</td>
                <td>Valor</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.meta}>
          <input type="text" defaultValue="250K" className={styles.valorMeta} />
        </div>
      </div>
    </div>
  );
}
