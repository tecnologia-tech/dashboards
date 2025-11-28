import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Cell, Label, Pie, PieChart } from "recharts";
import jayanneImg from "../../assets/Geral/Jayanne.png";
import jeniferImg from "../../assets/Geral/Jenifer.png";
import raissaImg from "../../assets/Geral/Raissa.png";

const FONT_IMPORT = `
  @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");

  @keyframes goldenTextBreath {
    0% { text-shadow: 0 0 4px rgba(230,192,104,0.25), 0 0 9px rgba(255,190,111,0.18); }
    50% { text-shadow: 0 0 8px rgba(230,192,104,0.35), 0 0 14px rgba(255,190,111,0.26); }
    100% { text-shadow: 0 0 5px rgba(230,192,104,0.28), 0 0 10px rgba(255,190,111,0.2); }
  }
`;

const ANIMATION_STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap");

@keyframes heatShimmer {
  0% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(230,192,104,0.15)); }
  50% { transform: translate3d(0.5px,-0.3px,0) skewX(-0.6deg); filter: drop-shadow(0 0 2px rgba(255,190,111,0.25)); }
  100% { transform: translate3d(0,0,0) skewX(0deg); filter: drop-shadow(0 0 1px rgba(230,192,104,0.18)); }
}

@keyframes goldParticleRise {
  0% { transform: translateY(0) translateX(0) scale(0.7); opacity: 0.2; }
  50% { opacity: 0.55; }
  100% { transform: translateY(-80px) translateX(10px) scale(1); opacity: 0; }
}

.gold-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.gold-particles span {
  position: absolute;
  bottom: -10px;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(255,190,111,0.9), rgba(230,192,104,0.35));
  border-radius: 999px;
  filter: blur(1px);
  opacity: 0.6;
  animation: goldParticleRise 4.5s linear infinite;
}
`;

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2slujbc-3UGhQxk1GJD5v0Yp_CKgZJNE4_71R-gpHC2YsrHgwqIpG6oIgVjdKTQysBHxjeAUD_i2s/pub?gid=339080800&single=true&output=csv";

// fundo listrado da tela inteira
const STRIPED_BACKGROUND =
  "repeating-linear-gradient(115deg, #18120c 0 3px, #050302 3px 11px)";

const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(15,12,9,0.96), rgba(6,5,4,0.92))";

const RUNE_BACKGROUND =
  "radial-gradient(2px 6px at 12% 90%, rgba(230,192,104,0.12), transparent 60%), radial-gradient(2px 7px at 32% 95%, rgba(255,190,111,0.10), transparent 60%), radial-gradient(3px 8px at 54% 92%, rgba(255,214,170,0.08), transparent 60%), radial-gradient(2px 6px at 76% 94%, rgba(230,192,104,0.10), transparent 60%), radial-gradient(3px 9px at 88% 90%, rgba(255,190,111,0.10), transparent 60%), repeating-linear-gradient(110deg, rgba(230,192,104,0.05) 0 2px, transparent 2px 12px), radial-gradient(120% 140% at 50% 50%, rgba(230,192,104,0.05), transparent 65%)";

const agora = new Date();
const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
const fimMes = new Date(
  agora.getFullYear(),
  agora.getMonth() + 1,
  0,
  23,
  59,
  59
);

// ====================== FUNÇÕES AUXILIARES ======================
async function contarOnboard(nome) {
  const res = await fetch(
    "https://dashboards-exur.onrender.com/api/dash_onboarding"
  );
  const dados = await res.json();

  const filtrados = dados.filter(
    (i) => i.Onboard === nome && i.grupo === "✅ Clientes Ativos"
  );

  return filtrados.length;
}

async function totalOnboarding() {
  const res = await fetch(
    "https://dashboards-exur.onrender.com/api/dash_onboarding"
  );
  const dados = await res.json();

  return dados.filter((i) => i.grupo === "✅ Clientes Ativos").length;
}

function parseDataBR(d) {
  // transforma "2025-11-18 09:55:21" em "2025-11-18T09:55:21"
  return new Date(d.replace(" ", "T"));
}

function formatarValor(n) {
  if (!n) return "0";

  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(3).replace(".", ",") + " mi";

  if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + " mil";

  return n.toString().replace(".", ",");
}

// ====================== COMPONENTE PRINCIPAL ======================
export default function Geral() {
  const [f9, setF9] = useState(null);
  const [g9, setG9] = useState(null);

  // 🔥 ESTADOS DO RING LTDA
  const [valueLTDA, setValueLTDA] = useState(0);
  const [estornosLTDA, setEstornosLTDA] = useState(0);
  const metaLTDA = 1500000;
  const percentLTDA = ((valueLTDA / metaLTDA) * 100).toFixed(1);

  // CS — último mês com dados
  const [valueCS, setValueCS] = useState(0);
  const [estornosCS, setEstornosCS] = useState(0);
  const metaCS = 800000;

  // REPEDITOS
  const [valueRepedidos, setValueRepedidos] = useState(0);
  const [estornosRepedidos, setEstornosRepedidos] = useState(0);
  const metaRepedidos = 200000;

  // BÔNUS
  const [valueBonus, setValueBonus] = useState(0);
  const metaBonus = 300000;

  // 12P
  const [value12P, setValue12P] = useState(0);
  const [estornos12P, setEstornos12P] = useState(0);
  const meta12P = 2700000;

  // PEDIDOS (CHINA / LOG / DESEMBARAÇO)
  const [pedidosChina, setPedidosChina] = useState(0);
  const [pedidosLogistica, setPedidosLogistica] = useState(0);
  const [pedidosDesembaraco, setPedidosDesembaraco] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [atracamMes, setAtracamMes] = useState(0);

  const [fat12p, setFat12p] = useState(0);
  const [estorno12p, setEstorno12p] = useState(0);
  const [reembolso12p, setReembolso12p] = useState(0);
  const [reclameAqui, setReclameAqui] = useState(0);

  const [handoverDocAtivos, setHandoverDocAtivos] = useState(0);
  const [handoverDocFinalizados, setHandoverDocFinalizados] = useState(0);

  const [handoverPricingAtivos, setHandoverPricingAtivos] = useState(0);
  const [handoverPricingFinalizados, setHandoverPricingFinalizados] =
    useState(0);

  // ============================ EFEITOS ============================
  useEffect(() => {
    async function loadSheet() {
      try {
        const res = await fetch(CSV_URL);
        const text = await res.text();

        const rows = text.split("\\n");
        const linha9 = rows[8] || ""; // linha onde está F9 / G9

        // Pega todos os valores no formato 9.999,99
        const matches = linha9.match(/\\d{1,3}(?:\\.\\d{3})*,\\d{2}/g) || [];

        const valorDolar = matches[0] || "";
        const valorReal = matches[1] || "";

        setF9(valorDolar);
        setG9(valorReal);
      } catch (err) {
        console.error("Erro ao carregar CSV:", err);
      }
    }

    loadSheet();
  }, []);

  useEffect(() => {
    async function loadCompras() {
      const res = await fetch(
        "https://dashboards-exur.onrender.com/api/dash_comprasdoc"
      );
      const rows = await res.json();

      setHandoverDocAtivos(
        rows.filter(
          (i) =>
            ["HANDOVER", "CORREÇÃO HANDOVER"].includes(i.Task) &&
            i.grupo === "ATIVOS" &&
            i.STATUS !== "PAUSADO"
        ).length
      );

      setHandoverDocFinalizados(
        rows.filter(
          (i) =>
            ["HANDOVER", "CORREÇÃO HANDOVER"].includes(i.Task) &&
            i.grupo === "Finalizados"
        ).length
      );
    }

    loadCompras();
  }, []);

  useEffect(() => {
    async function loadAtracam() {
      try {
        const res = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_ixlogcomex"
        );
        const data = await res.json();

        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fimMes = new Date(
          agora.getFullYear(),
          agora.getMonth() + 1,
          0,
          23,
          59,
          59
        );

        const total = data.filter((i) => {
          if (i.grupo !== "⭐Em Andamento") return false;
          if (!i.ETA) return false;

          const eta = new Date(i.ETA.replace(" ", "T"));

          return eta >= inicioMes && eta <= fimMes;
        }).length;

        setAtracamMes(total);
      } catch (err) {
        console.error("Erro ao calcular Atracam esse mês:", err);
      }
    }

    loadAtracam();
  }, []);

  useEffect(() => {
    async function loadReembolso() {
      try {
        const res = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_reembolso"
        );
        const dados = await res.json();

        const filtroMes = dados.filter((i) => {
          const d = new Date(i.Data_de_Devolucao.replace(" ", "T"));
          return d >= inicioMes && d <= fimMes;
        });

        // Faturamento = value12P que você já calcula
        setFat12p(value12P);

        // Estorno no mês
        const totalEstorno = filtroMes.reduce(
          (acc, cur) => acc + (Number(cur.Estorno_R) || 0),
          0
        );
        setEstorno12p(totalEstorno);

        // Reembolso no mês
        const totalReembolso = filtroMes.reduce(
          (acc, cur) => acc + (Number(cur.Reembolso_R) || 0),
          0
        );
        setReembolso12p(totalReembolso);

        // Reclame Aqui = "Sim"
        const totalRA = filtroMes.filter(
          (i) => i.Reclame_Aqui === "Sim"
        ).length;
        setReclameAqui(totalRA);
      } catch (err) {
        console.error("Erro ao carregar reembolso:", err);
      }
    }

    loadReembolso();
  }, [value12P]);

  // LTDA — último mês com dados
  useEffect(() => {
    async function loadDataLTDA() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        const resEst = await fetch(
          "https://dashboards-exur.onrender.com/api/estornos_nutshell"
        );
        const est = await resEst.json();

        // PEGAR TODAS AS DATAS DO LTDA
        const datasLTDA = geral
          .filter((i) => ["15", "75"].includes(String(i.pipeline_id)))
          .map((i) => parseDataBR(i.data));

        if (datasLTDA.length === 0) {
          setValueLTDA(0);
          setEstornosLTDA(0);
          return;
        }

        // ÚLTIMO MÊS COM DADOS
        const ultima = new Date(Math.max(...datasLTDA.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        // VALOR LTDA
        const totalLTDA = geral
          .filter(
            (i) =>
              ["15", "75"].includes(String(i.pipeline_id)) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueLTDA(totalLTDA);

        // ESTORNOS
        const permitidos = [
          "DISNEYLEADS 🟡⚫️",
          "IMPORTAÇÃO CONJUNTA 12PXP 🟠🧩",
        ];

        const totalEst = est
          .filter(
            (i) =>
              permitidos.includes(i.pipeline) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setEstornosLTDA(totalEst);
      } catch (err) {
        console.error("Erro LTDA:", err);
      }
    }

    loadDataLTDA();
  }, []);

  // CS — último mês com dados
  useEffect(() => {
    async function loadCS() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        const resEst = await fetch(
          "https://dashboards-exur.onrender.com/api/estornos_nutshell"
        );
        const estornos = await resEst.json();

        const CS_RESP = [
          "Monique Moreira",
          "Fernando Finatto",
          "Thiago Cardoso",
          "Alan Esteves",
        ];

        const datasCS = geral
          .filter((i) => CS_RESP.includes(i.assigned))
          .map((i) => parseDataBR(i.data));

        if (datasCS.length === 0) {
          setValueCS(0);
          setEstornosCS(0);
          return;
        }

        const ultima = new Date(Math.max(...datasCS.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        const totalCS = geral
          .filter(
            (i) =>
              CS_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueCS(totalCS);

        const totalEstCS = estornos
          .filter(
            (i) =>
              CS_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setEstornosCS(totalEstCS);
      } catch (err) {
        console.error("Erro CS:", err);
      }
    }

    loadCS();
  }, []);

  // Bônus — último mês com dados
  useEffect(() => {
    async function loadBonus() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        const BONUS_PIPELINES = ["63", "35", "59"];

        const datasBonus = geral
          .filter((i) => BONUS_PIPELINES.includes(String(i.pipeline_id)))
          .map((i) => parseDataBR(i.data));

        if (datasBonus.length === 0) {
          setValueBonus(0);
          return;
        }

        const ultima = new Date(
          Math.max(...datasBonus.map((d) => d.getTime()))
        );
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        const totalBonus = geral
          .filter(
            (i) =>
              BONUS_PIPELINES.includes(String(i.pipeline_id)) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueBonus(totalBonus);
      } catch (err) {
        console.error("Erro Bonus:", err);
      }
    }

    loadBonus();
  }, []);

  // Repedidos — último mês com dados
  useEffect(() => {
    async function loadRepedidos() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        const resEst = await fetch(
          "https://dashboards-exur.onrender.com/api/estornos_nutshell"
        );
        const estornos = await resEst.json();

        const REP_RESP = ["Victor Biselli", "Raul Cruz", "Cleyton Cruz"];

        const datasRep = geral
          .filter((i) => REP_RESP.includes(i.assigned))
          .map((i) => parseDataBR(i.data));

        if (datasRep.length === 0) {
          setValueRepedidos(0);
          setEstornosRepedidos(0);
          return;
        }

        const ultima = new Date(Math.max(...datasRep.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        const totalRep = geral
          .filter(
            (i) =>
              REP_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueRepedidos(totalRep);

        const totalEstRep = estornos
          .filter(
            (i) =>
              REP_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setEstornosRepedidos(totalEstRep);
      } catch (err) {
        console.error("Erro Repedidos:", err);
      }
    }

    loadRepedidos();
  }, []);

  // 12P — último mês com dados
  useEffect(() => {
    async function load12P() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        const resEst = await fetch(
          "https://dashboards-exur.onrender.com/api/estornos_nutshell"
        );
        const estornos = await resEst.json();

        const datas12P = geral.map((i) => parseDataBR(i.data));

        if (datas12P.length === 0) {
          setValue12P(0);
          setEstornos12P(0);
          return;
        }

        const ultima = new Date(Math.max(...datas12P.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        const total12P = geral
          .filter(
            (i) => parseDataBR(i.data) >= inicio && parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValue12P(total12P);

        const totalEst12P = estornos
          .filter(
            (i) => parseDataBR(i.data) >= inicio && parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setEstornos12P(totalEst12P);
      } catch (err) {
        console.error("Erro 12P:", err);
      }
    }

    load12P();
  }, []);

  // PEDIDOS NA CHINA / LOG / DESEMBARAÇO — dash_ixdelivery
  useEffect(() => {
    async function loadPedidosChina() {
      try {
        const res = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_ixdelivery"
        );
        const data = await res.json();

        const totalChina = data.filter((i) =>
          (i.grupo || "").includes("China")
        ).length;

        const totalLog = data.filter((i) =>
          (i.grupo || "").includes("Logística")
        ).length;

        const totalDes = data.filter((i) =>
          (i.grupo || "").includes("Desembaraço")
        ).length;

        setPedidosChina(totalChina);
        setPedidosLogistica(totalLog);
        setPedidosDesembaraco(totalDes);
      } catch (err) {
        console.error("Erro Pedidos China/Log/Desembaraço:", err);
      }
    }

    loadPedidosChina();
  }, []);

  useEffect(() => {
    async function loadImportacao() {
      try {
        // 1) dash_ixdelivery → Pedidos na China
        const deliveryRes = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_ixdelivery"
        );
        const deliveryData = await deliveryRes.json();

        const chinaCount = deliveryData.filter(
          (i) => i.grupo === "⭐ Pedidos em andamento"
        ).length;

        // 2) dash_ixlogcomex → Logística & Desembaraço
        const logRes = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_ixlogcomex"
        );
        const logData = await logRes.json();

        const logisticaCount = logData.filter(
          (i) =>
            i.grupo === "⭐Em Andamento" &&
            ["Aguardando Embarque", "Navegando"].includes(i.Stage_Logistica)
        ).length;

        const desembCount = logData.filter(
          (i) =>
            i.grupo === "⭐Em Andamento" &&
            !["Aguardando Embarque", "Navegando"].includes(i.Stage_Logistica)
        ).length;

        // TOTAL = soma dos 3
        const total = chinaCount + logisticaCount + desembCount;

        // Aplicar estados
        setPedidosChina(chinaCount);
        setPedidosLogistica(logisticaCount);
        setPedidosDesembaraco(desembCount);
        setTotalPedidos(total);
      } catch (error) {
        console.error("Erro ao carregar dados de importação:", error);
      }
    }

    loadImportacao();
  }, []);

  // 🔥 TELA
  return (
    <div
      className="w-full h-screen grid grid-rows-[35%_30%_31%_4%] bg-black text-white overflow-hidden font-['Cinzel']"
      style={{
        backgroundImage: `
          ${STRIPED_BACKGROUND},
          radial-gradient(220% 140% at 10% 0%, rgba(255,190,111,0.12), transparent 55%),
          radial-gradient(220% 140% at 90% 40%, rgba(230,192,104,0.10), transparent 55%)
        `,
        backgroundBlendMode: "normal, overlay, overlay",
        backgroundSize: "cover",
        "--gold-light": "#F2C572",
        "--gold-mid": "#E5A844",
        "--gold-dark": "#C38A28",
        "--black-main": "#050505",
      }}
    >
      <style>{FONT_IMPORT + "\\n" + ANIMATION_STYLES}</style>

      <style>{`
        .titulo-card {
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
          font-size: 42px;
          font-weight: 800;
          font-family: 'Cinzel', serif;
          color: var(--gold-light);
          text-shadow: 0 0 6px rgba(230,192,104,0.35);
          animation: goldenTextBreath 6s ease-in-out infinite;
          white-space: nowrap;
        }

        .numero-branco,
        .numero-branco * {
          font-family: 'Roboto', sans-serif !important;
          color: #ffffff !important;
          text-shadow: none !important;
        }
      `}</style>

      {/* ================= RINGS ================= */}
      <div className="flex justify-around items-center overflow-hidden gap-[1px]">
        <Ring
          title="LTDA"
          value={formatarValor(valueLTDA)}
          estornos={formatarValor(estornosLTDA)}
          meta="R$ 1,5 mi"
          percent={percentLTDA}
        />

        <Ring
          title="Hunters"
          value={formatarValor(valueCS)}
          estornos={formatarValor(estornosCS)}
          meta="R$ 800 mil"
          percent={((valueCS / metaCS) * 100).toFixed(1)}
        />
        <Ring
          title="Farmers"
          value={formatarValor(valueRepedidos)}
          estornos={formatarValor(estornosRepedidos)}
          meta="R$ 200 mil"
          percent={((valueRepedidos / metaRepedidos) * 100).toFixed(1)}
        />
        <Ring
          title="Bônus"
          value={formatarValor(valueBonus)}
          estornos=" "
          meta="R$ 300 mil"
          percent={((valueBonus / metaBonus) * 100).toFixed(1)}
        />
        <Ring
          title="12P"
          value={formatarValor(value12P)}
          estornos={formatarValor(estornos12P)}
          meta="R$ 2,7 mi"
          percent={((value12P / meta12P) * 100).toFixed(1)}
        />
      </div>

      {/* ================= CARDS DO MEIO ================= */}
      <div className="grid grid-cols-3 gap-[1px] pb-2 px-[2px] auto-rows-fr">
        <OnboardingCard />
        <ComprasCard
          f9={f9}
          g9={g9}
          handoverDocAtivos={handoverDocAtivos}
          handoverDocFinalizados={handoverDocFinalizados}
          handoverPricingAtivos={handoverPricingAtivos}
          handoverPricingFinalizados={handoverPricingFinalizados}
        />

        <ImportacaoCard
          pedidosChina={pedidosChina}
          pedidosLogistica={pedidosLogistica}
          pedidosDesembaraco={pedidosDesembaraco}
          totalPedidos={totalPedidos}
          atracamMes={atracamMes}
        />
      </div>

      {/* ================= CSAT + REPUTAÇÃO ================= */}
      <div className="grid grid-cols-2 gap-[1px] overflow-hidden px-[2px]">
        <CSATCard />
        <ReputacaoCard
          fat12p={fat12p}
          estorno12p={estorno12p}
          reembolso12p={reembolso12p}
          reclameAqui={reclameAqui}
        />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="overflow-hidden px-[2px]">
        <DNBCard />
      </div>
    </div>
  );
}

// =====================================================================
// RINGS
// =====================================================================
function Ring({ title, value, estornos, meta, percent }) {
  const size = 300;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;
  const isMetaBatida = Number(percent) >= 100;
  const deveFicarVerde = (title === "LTDA" || title === "12P") && isMetaBatida;
  return (
    <div className="flex flex-col items-center overflow-visible">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          background: "transparent",
        }}
      >
        {/* partículas */}
        <div className="gold-particles">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${8 + ((i * 7.5) % 84)}%`,
                animationDelay: `${i * 0.28}s`,
                animationDuration: `${4 + (i % 4) * 0.45}s`,
                width: `${4 + (i % 3)}px`,
                height: `${4 + (i % 3)}px`,
              }}
            />
          ))}
        </div>

        <svg width={size} height={size}>
          <defs>
            <linearGradient id="goldLux" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8C6B29" />
              <stop offset="50%" stopColor="#F2D788" />
              <stop offset="100%" stopColor="#8C6B29" />
            </linearGradient>
          </defs>

          {/* trilho */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(20,20,20,0.85)"
            strokeWidth={stroke}
            fill="none"
          />

          {/* ativo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={deveFicarVerde ? "#4CF26D" : "url(#goldLux)"}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              filter: deveFicarVerde
                ? "drop-shadow(0 0 16px rgba(76,242,109,0.75))"
                : "drop-shadow(0 0 14px rgba(230,192,104,0.55))",
            }}
          />
        </svg>

        {/* centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div
            className="text-5xl font-extrabold tracking-wide whitespace-nowrap"
            style={{
              color: "#f2d788",
              textShadow: "0 0 6px rgba(230,192,104,0.35)",
              animation:
                "goldenTextBreath 6s ease-in-out infinite, heatShimmer 18s ease-in-out infinite",
            }}
          >
            {title}
          </div>

          <div
            className="text-6xl font-extrabold whitespace-nowrap numero-branco"
            style={{
              WebkitTextStroke: "0.5px #000",
              textShadow: `
                0 0 18px rgba(0,0,0,0.85),
                0 0 32px rgba(0,0,0,0.6),
                0 0 12px rgba(255,255,255,0.15)
              `,
            }}
          >
            {value}
          </div>

          <div
            className="text-3xl font-bold mt-1"
            style={{
              color: "var(--gold-light)",
              textShadow: "0 0 6px rgba(230,192,104,0.35)",
            }}
          >
            de{" "}
            <span className="numero-branco" style={{ textShadow: "none" }}>
              {meta}
            </span>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 text-6xl font-extrabold numero-branco"
          style={{
            bottom: -6,
            color: deveFicarVerde ? "#4CF26D" : "#fff",
            WebkitTextStroke: "1px #000",
            textShadow: deveFicarVerde
              ? "0 0 16px rgba(76,242,109,0.75)"
              : `
      0 0 18px rgba(0,0,0,0.85),
      0 0 32px rgba(0,0,0,0.6),
      0 0 12px rgba(255,255,255,0.15)
    `,
          }}
        >
          {percent}%
        </div>
      </div>

      <div
        className="text-2xl font-bold mt-1"
        style={{
          color: "#e6c068",
          textShadow: "0 0 6px rgba(230,192,104,0.3)",
        }}
      >
        Estornos:{" "}
        <span className="numero-branco" style={{ textShadow: "none" }}>
          {estornos}
        </span>
      </div>
    </div>
  );
}

// =====================================================================
// ONBOARDING
// =====================================================================
function OnboardingCard() {
  const [jayanne, setJayanne] = useState(0);
  const [jenifer, setJenifer] = useState(0);
  const [raissa, setRaissa] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      const j = await contarOnboard("Jayanne Queiroz");
      const je = await contarOnboard("Jenifer Martins");
      const r = await contarOnboard("Raissa Veloso");

      setJayanne(j);
      setJenifer(je);
      setRaissa(r);
      setTotal(j + je + r);
    }
    load();
  }, []);

  return (
    <div
      className="flex flex-col rounded-xl px-3 py-0"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "160% 160%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <h2 className="titulo-card">Onboarding</h2>

      <div className="flex-1 pt-2 flex items-center justify-around overflow-hidden">
        <div className="flex flex-col justify-center items-center">
          <div className="text-[96px] font-extrabold leading-none numero-branco">
            {total}
          </div>
          <div className="text-3xl" style={{ color: "#e6c068" }}>
            Clientes
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <Person name="Jayanne" avatar={jayanneImg} count={jayanne} />
          <Person name="Jenifer" avatar={jeniferImg} count={jenifer} />
          <Person name="Raissa" avatar={raissaImg} count={raissa} />
        </div>
      </div>
    </div>
  );
}

function Person({ name, count, avatar }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 relative"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #f2d788, #4a3a2a 60%, #120f0b 100%)",
          boxShadow: "0 0 14px rgba(230,192,104,0.55)",
          border: "2px solid rgba(242,215,136,0.7)",
        }}
      >
        <img
          src={avatar}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover z-20"
        />

        <div
          className="absolute inset-0 rounded-full z-30"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
          }}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <div
          className="text-3xl font-bold"
          style={{
            color: "#f2d788",
            textShadow: "0 0 6px rgba(230,192,104,0.3)",
          }}
        >
          {name}
        </div>

        <div className="text-2xl">
          <span className="numero-branco">{count}</span> Clientes
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// COMPRAS
// =====================================================================
function ComprasCard({
  f9,
  g9,
  handoverDocAtivos,
  handoverDocFinalizados,
  handoverPricingAtivos,
  handoverPricingFinalizados,
}) {
  const percentualDoc = ((handoverDocFinalizados / 310) * 100).toFixed(1);
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-0"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "160% 160%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <h2 className="titulo-card">Compras</h2>

      <div className="flex-1 pt-2 flex flex-col">
        <div className="flex justify-between px-4 mb-2">
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Simulações
            </div>
            <div className="text-[58px] font-extrabold leading-none mt-1 numero-branco">
              {handoverDocAtivos}
            </div>

            <div className="text-xl" style={{ color: "#d0c3a4" }}>
              Em andamento
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Entregues
            </div>
            <div className="text-[58px] font-extrabold leading-none mt-1 numero-branco">
              {handoverDocFinalizados}
            </div>
            <div className="text-xl font-bold">
              <span style={{ color: "#ff7a7a" }}>{percentualDoc}%</span>
              <span className="text-lg" style={{ color: "#f5f0e4" }}>
                de 310
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-3xl font-bold text-[var(--gold-light)] mb-1">
          Handovers
        </div>

        <div className="flex justify-center items-center gap-10 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ color: "#d0c3a4" }}>
              Em andamento
            </span>
            <span className="text-[50px] font-extrabold leading-none numero-branco">
              {handoverPricingAtivos}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[50px] font-extrabold leading-none numero-branco">
              {handoverPricingFinalizados}
            </span>

            <span className="text-xl" style={{ color: "#d0c3a4" }}>
              Entregues
            </span>
          </div>
        </div>

        <div
          className="my-1"
          style={{ borderTop: "1px solid rgba(230,192,104,0.4)" }}
        />

        <div className="flex items-center gap-3 justify-center mt-auto pb-2 whitespace-nowrap">
          <ReactCountryFlag
            countryCode="CN"
            svg
            style={{
              width: "1.5em",
              height: "1.5em",
              borderRadius: "6px",
              boxShadow: "0 0 6px rgba(230,192,104,0.45)",
            }}
            title="China"
          />

          <span className="text-2xl font-bold text-[var(--gold-light)]">
            ACCOUNT (MÊS):
          </span>

          <span className="text-2xl font-semibold numero-branco">$ {f9}</span>

          <span className="text-2xl font-semibold numero-branco">/</span>

          <span className="text-2xl font-semibold numero-branco">R$ {g9}</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// IMPORTAÇÃO
// =====================================================================
function ImportacaoCard({
  pedidosChina,
  pedidosLogistica,
  pedidosDesembaraco,
  totalPedidos,
  atracamMes,
}) {
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-0 h-full overflow-hidden"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "160% 160%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <h2 className="titulo-card">Importação</h2>

      <div className="flex-1 pt-2 flex flex-col px-3 overflow-hidden">
        <div className="flex justify-between flex-1 mb-3">
          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Total Pedidos
            </div>
            <div className="text-[64px] font-extrabold leading-none mt-1 numero-branco">
              {totalPedidos}
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Atracam esse mês
            </div>
            <div className="text-[60px] font-extrabold leading-none mt-1 numero-branco">
              {atracamMes}
            </div>
          </div>
        </div>

        <div className="text-2xl leading-snug text-center space-y-1 mb-12">
          <p style={{ color: "#d0c3a4" }}>
            Pedidos na China:{" "}
            <span className="font-bold numero-branco">{pedidosChina}</span>
          </p>

          <p style={{ color: "#d0c3a4" }}>
            Pedidos em Logística:{" "}
            <span className="font-bold numero-branco">{pedidosLogistica}</span>
          </p>
          <p style={{ color: "#d0c3a4" }}>
            Pedidos no Desembaraço:{" "}
            <span className="font-bold numero-branco">
              {pedidosDesembaraco}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// CSAT
// =====================================================================
function CSATCard() {
  const [csatData, setCsatData] = useState({
    muitoBoa: 0,
    excelente: 0,
    boa: 0,
    regular: 0,
    ruim: 0,
  });

  useEffect(() => {
    async function loadCSAT() {
      try {
        const res = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_csat"
        );
        const dados = await res.json();

        setCsatData({
          muitoBoa: dados.filter(
            (i) =>
              i.Como_voce_avalia_sua_experiencia_com_o_CS_ate_aqui ===
              "Muito boa"
          ).length,
          excelente: dados.filter(
            (i) =>
              i.Como_voce_avalia_sua_experiencia_com_o_CS_ate_aqui ===
              "Excelente"
          ).length,
          boa: dados.filter(
            (i) =>
              i.Como_voce_avalia_sua_experiencia_com_o_CS_ate_aqui === "Boa"
          ).length,
          regular: dados.filter(
            (i) =>
              i.Como_voce_avalia_sua_experiencia_com_o_CS_ate_aqui === "Regular"
          ).length,
          ruim: dados.filter(
            (i) =>
              i.Como_voce_avalia_sua_experiencia_com_o_CS_ate_aqui === "Ruim"
          ).length,
        });
      } catch (err) {
        console.error("Erro CSAT:", err);
      }
    }

    loadCSAT();
  }, []);

  const data = [
    { label: "Muito boa", value: csatData.muitoBoa, color: "#5FA6E8" },
    { label: "Excelente", value: csatData.excelente, color: "#8BCF7A" },
    { label: "Boa", value: csatData.boa, color: "#E6A347" },
    { label: "Regular", value: csatData.regular, color: "#E6A347" },
    { label: "Ruim", value: csatData.ruim, color: "#E85B5B" },
  ];

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className="px-4 py-0 flex flex-col rounded-xl"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "160% 160%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <h2 className="titulo-card">CSAT</h2>

      <div className="pt-0 flex flex-col justify-center flex-1 gap-1">
        {data.map((i) => {
          const percent = (i.value / max) * 100;

          return (
            <div key={i.label} className="flex items-center gap-4">
              <div className="w-[170px] text-2xl" style={{ color: "#f5e7c8" }}>
                {i.label}
              </div>

              <div
                className="flex-1 h-9 rounded-lg overflow-hidden border shadow-[inset_0_0_8px_rgba(0,0,0,0.65)]"
                style={{
                  borderColor: "#111",
                  background:
                    "linear-gradient(90deg, #181818, #101010, #181818)",
                }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: i.color,
                    boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                  }}
                />
              </div>

              <div
                className="text-3xl font-bold w-[60px] text-right numero-branco"
                style={{ textShadow: "0 0 6px rgba(0,0,0,0.6)" }}
              >
                {i.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// REPUTAÇÃO 12P
// =====================================================================
function ReputacaoCard({ fat12p, estorno12p, reembolso12p, reclameAqui }) {
  const data = [
    { name: "Faturamento", value: fat12p, color: "#8BCF7A" },
    { name: "Estorno", value: estorno12p, color: "#E85B5B" },
    { name: "Reembolso", value: reembolso12p, color: "#E6A347" },
  ];

  const COLORS = ["#8BCF7A", "#E85B5B", "#E6A347"];
  const percentualReembolso =
    fat12p > 0
      ? ((reembolso12p / fat12p) * 100).toFixed(2).replace(".", ",")
      : "0,00";
  const percentualNumero = Number(percentualReembolso.replace(",", "."));
  const corPercentual = percentualNumero <= 4 ? "#8BCF7A" : "#E85B5B";

  return (
    <div
      className="flex flex-col rounded-xl px-1 py-0"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "160% 160%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <h2 className="titulo-card">Reputação 12P</h2>

      <div className="flex-1 pt-0 grid grid-cols-[2fr_1fr_1fr] gap-1 items-center">
        <div className="flex flex-col text-2xl leading-tight space-y-2 pl-2">
          <div>
            <span className="font-bold" style={{ color: "#8BCF7A" }}>
              FATURAMENTO:
            </span>
            <span className="text-gray-200"> R$ {formatarValor(fat12p)}</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "var(--gold-mid)" }}>
              ESTORNO:
            </span>
            <span className="text-gray-200">
              {" "}
              R$ {formatarValor(estorno12p)}
            </span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "#E85B5B" }}>
              REEMBOLSO:
            </span>
            <span className="text-gray-200">
              {" "}
              R$ {formatarValor(reembolso12p)}
            </span>
          </div>
          <div className="pt-2">
            <span className="font-bold" style={{ color: "var(--gold-light)" }}>
              RECLAME AQUI:
            </span>
            <span className="text-3xl font-extrabold numero-branco">
              {reclameAqui}
            </span>
          </div>
        </div>

        <div
          className="text-8xl font-extrabold"
          style={{
            color: corPercentual,
            WebkitTextStroke: "1px black",
            textShadow: `0 0 12px ${corPercentual}55`,
            animation: "goldenTextBreath 6s ease-in-out infinite",
          }}
        >
          {percentualReembolso}%
        </div>

        <div className="flex justify-center items-center">
          <PieChart width={240} height={240}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
              paddingAngle={4}
              stroke="#111"
              strokeWidth={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}

              {/* FATURAMENTO */}
              <Label
                value={`R$ ${formatarValor(fat12p)}`}
                position="outside"
                fill="#8BCF7A"
                fontSize={18}
                fontWeight="bold"
                offset={20}
              />

              {/* ESTORNO */}
              <Label
                value={`R$ ${formatarValor(estorno12p)}`}
                position="outside"
                fill="#E6A347"
                fontSize={18}
                fontWeight="bold"
                offset={40}
              />

              {/* REEMBOLSO */}
              <Label
                value={`R$ ${formatarValor(reembolso12p)}`}
                position="outside"
                fill="#E85B5B"
                fontSize={18}
                fontWeight="bold"
                offset={60}
              />
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// FOOTER – DNB
// =====================================================================
function DNBCard() {
  return (
    <div
      className="h-full flex items-center justify-around text-2xl rounded-xl"
      style={{
        backgroundImage: `${CARD_BACKGROUND}, ${RUNE_BACKGROUND}`,
        backgroundBlendMode: "overlay, normal",
        backgroundSize: "180% 180%, 120% 120%",
        border: "1px solid rgba(230,192,104,0.40)",
      }}
    >
      <div>
        <span className="font-bold underline" style={{ color: "#8BCF7A" }}>
          Dólar
        </span>{" "}
        <span className="numero-branco">$5,34</span>
      </div>
      <div>
        <span className="font-bold underline" style={{ color: "#E6A347" }}>
          NPS
        </span>{" "}
        <span className="numero-branco">3,63</span>
      </div>
      <div>
        <span className="font-bold underline" style={{ color: "#F2C572" }}>
          BHAG 12P
        </span>{" "}
        <span className="numero-branco">1 / 100</span>
      </div>
    </div>
  );
}
