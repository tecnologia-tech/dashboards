import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { Cell, Pie, PieChart } from "recharts";

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

// fundo listrado da tela inteira
const STRIPED_BACKGROUND =
  "repeating-linear-gradient(115deg, #18120c 0 3px, #050302 3px 11px)";

const CARD_BACKGROUND =
  "linear-gradient(145deg, rgba(15,12,9,0.96), rgba(6,5,4,0.92))";

const RUNE_BACKGROUND =
  "radial-gradient(2px 6px at 12% 90%, rgba(230,192,104,0.12), transparent 60%), radial-gradient(2px 7px at 32% 95%, rgba(255,190,111,0.10), transparent 60%), radial-gradient(3px 8px at 54% 92%, rgba(255,214,170,0.08), transparent 60%), radial-gradient(2px 6px at 76% 94%, rgba(230,192,104,0.10), transparent 60%), radial-gradient(3px 9px at 88% 90%, rgba(255,190,111,0.10), transparent 60%), repeating-linear-gradient(110deg, rgba(230,192,104,0.05) 0 2px, transparent 2px 12px), radial-gradient(120% 140% at 50% 50%, rgba(230,192,104,0.05), transparent 65%)";

export default function Geral() {
  // ============================================================
  // 🔥 ESTADOS DO RING LTDA
  // ============================================================
  const [valueLTDA, setValueLTDA] = useState(0);
  const [estornosLTDA, setEstornosLTDA] = useState(0);
  const metaLTDA = 1400000;

  function parseDataBR(d) {
    return new Date(d.replace(" ", "T"));
  }

  function formatarValor(n) {
    if (!n) return "0";
    if (n >= 1_000_000)
      return (n / 1_000_000).toFixed(2).replace(".", ",") + " mi";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + " mil";
    return n.toString().replace(".", ",");
  }
  // CORRIGIR PARSE DE DATA DO BACKEND
  function parseDataBR(d) {
    // transforma "2025-11-18 09:55:21" em "2025-11-18T09:55:21"
    return new Date(d.replace(" ", "T"));
  }

  useEffect(() => {
    async function loadData() {
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

    loadData();
  }, []);

  // ============================
  // CS — último mês com dados
  // ============================

  const [valueCS, setValueCS] = useState(0);
  const [estornosCS, setEstornosCS] = useState(0);
  const metaCS = 1000000; // 800 mil
  const [valueBonus, setValueBonus] = useState(0);
  const [valueRepedidos, setValueRepedidos] = useState(0);
  const [estornosRepedidos, setEstornosRepedidos] = useState(0);
  const metaRepedidos = 200000; // 200 mil
  const metaBonus = 300000;
  const [value12P, setValue12P] = useState(0);
  const [estornos12P, setEstornos12P] = useState(0);
  const meta12P = 2700000; // 2,7 mi
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

        // LISTA DE RESPONSÁVEIS DO CS
        const CS_RESP = [
          "Monique Moreira",
          "Fernando Finatto",
          "Thiago Cardoso",
          "Alan Esteves",
        ];

        // ===================================
        // PEGAR TODAS AS DATAS DO CS
        // ===================================
        const datasCS = geral
          .filter((i) => CS_RESP.includes(i.assigned))
          .map((i) => parseDataBR(i.data));

        if (datasCS.length === 0) {
          setValueCS(0);
          setEstornosCS(0);
          return;
        }

        // ===================================
        // DEFINIR O ÚLTIMO MÊS COM DADOS
        // ===================================
        const ultima = new Date(Math.max(...datasCS.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        // ===================================
        // CS VALUE
        // ===================================
        const totalCS = geral
          .filter(
            (i) =>
              CS_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueCS(totalCS);

        // ===================================
        // CS ESTORNOS (pelo assigned)
        // ===================================
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

  // ============================
  // BÔNUS — último mês com dados
  // ============================

  useEffect(() => {
    async function loadBonus() {
      try {
        const resGeral = await fetch(
          "https://dashboards-exur.onrender.com/api/dash_geralcswon"
        );
        const geral = await resGeral.json();

        // pipelines do bônus
        const BONUS_PIPELINES = ["63", "35", "59"];

        // PEGAR TODAS AS DATAS DO BONUS
        const datasBonus = geral
          .filter((i) => BONUS_PIPELINES.includes(String(i.pipeline_id)))
          .map((i) => parseDataBR(i.data));

        if (datasBonus.length === 0) {
          setValueBonus(0);
          return;
        }

        // ÚLTIMO MÊS COM DADOS
        const ultima = new Date(
          Math.max(...datasBonus.map((d) => d.getTime()))
        );
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        // SOMA DO BÔNUS
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

  // ============================
  // REPEDITOS — último mês com dados
  // ============================

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

        // RESPONSÁVEIS DO REPEDITOS
        const REP_RESP = ["Victor Biselli", "Raul Cruz", "Cleyton Cruz"];

        // PEGAR TODAS AS DATAS DO REPEDITOS
        const datasRep = geral
          .filter((i) => REP_RESP.includes(i.assigned))
          .map((i) => parseDataBR(i.data));

        if (datasRep.length === 0) {
          setValueRepedidos(0);
          setEstornosRepedidos(0);
          return;
        }

        // ÚLTIMO MÊS COM DADOS
        const ultima = new Date(Math.max(...datasRep.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        // VALOR REPEDITOS
        const totalRep = geral
          .filter(
            (i) =>
              REP_RESP.includes(i.assigned) &&
              parseDataBR(i.data) >= inicio &&
              parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValueRepedidos(totalRep);

        // ESTORNOS REPEDITOS
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
  // ============================
  // 12P — último mês com dados
  // ============================

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

        // Pegar TODAS as datas para descobrir o último mês geral
        const datas12P = geral.map((i) => parseDataBR(i.data));

        if (datas12P.length === 0) {
          setValue12P(0);
          setEstornos12P(0);
          return;
        }

        // Último mês com dados
        const ultima = new Date(Math.max(...datas12P.map((d) => d.getTime())));
        const ano = ultima.getFullYear();
        const mes = ultima.getMonth();

        const inicio = new Date(ano, mes, 1, 0, 0, 0);
        const fim = new Date(ano, mes + 1, 0, 23, 59, 59);

        // Soma geral 12P
        const total12P = geral
          .filter(
            (i) => parseDataBR(i.data) >= inicio && parseDataBR(i.data) <= fim
          )
          .reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        setValue12P(total12P);

        // Soma estornos geral
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

  const percentLTDA = ((valueLTDA / metaLTDA) * 100).toFixed(1);

  // ============================================================
  // 🔥 TELA
  // ============================================================
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
      <style>{FONT_IMPORT + "\n" + ANIMATION_STYLES}</style>

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
        {/* 🔥 LTDA DINÂMICO */}
        <Ring
          title="LTDA"
          value={formatarValor(valueLTDA)}
          estornos={formatarValor(estornosLTDA)}
          meta="R$ 1,4 mi"
          percent={((valueLTDA / metaLTDA) * 100).toFixed(1)}
        />

        {/* os outros ficam igual */}
        <Ring
          title="Hunters"
          value={formatarValor(valueCS)}
          estornos={formatarValor(estornosCS)}
          meta="R$ 1 mi"
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

      {/* ================= RESTANTE DA TELA (igual) */}

      {/* ================= CARDS DO MEIO ================= */}
      <div className="grid grid-cols-3 gap-[1px] pb-2 px-[2px] auto-rows-fr">
        <OnboardingCard />
        <ComprasCard />
        <ImportacaoCard />
      </div>

      {/* ================= CSAT + REPUTAÇÃO ================= */}
      <div className="grid grid-cols-2 gap-[1px] overflow-hidden px-[2px]">
        <CSATCard />
        <ReputacaoCard />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="overflow-hidden px-[2px]">
        <DNBCard />
      </div>
    </div>
  );
}

//
// ================================================================
// RINGS — sem borda, fundo listrado global
// ================================================================
function Ring({ title, value, estornos, meta, percent }) {
  const size = 300;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (percent / 100) * circ;

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
            stroke="url(#goldLux)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: "drop-shadow(0 0 14px rgba(230,192,104,0.55))" }}
          />
        </svg>

        {/* centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* título */}
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

          {/* valor */}
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

          {/* META — AGORA AQUI */}
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

        {/* porcentagem */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-6xl font-extrabold numero-branco"
          style={{
            bottom: -6,
            WebkitTextStroke: "1px #000",
            textShadow: `
      0 0 18px rgba(0,0,0,0.85),
      0 0 32px rgba(0,0,0,0.6),
      0 0 12px rgba(255,255,255,0.15)
    `,
          }}
        >
          {percent}%
        </div>
      </div>

      {/* ESTORNOS — agora na parte de baixo */}
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

//
// =====================================================================
// ONBOARDING
// =====================================================================
function OnboardingCard() {
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
            98
          </div>
          <div className="text-3xl" style={{ color: "#e6c068" }}>
            Clientes
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <Person name="Jayanne" count="38" />
          <Person name="Jenifer" count="22" />
          <Person name="Rayssa" count="37" />
        </div>
      </div>
    </div>
  );
}

function Person({ name, count }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-14 h-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #f2d788, #4a3a2a 60%, #120f0b 100%)",
          boxShadow: "0 0 10px rgba(230,192,104,0.35)",
        }}
      />
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

//
// =====================================================================
// COMPRAS
// =====================================================================
function ComprasCard() {
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
              15
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
              177
            </div>
            <div className="text-xl font-bold">
              <span style={{ color: "#ff7a7a" }}>64.4%</span>{" "}
              <span className="text-lg" style={{ color: "#f5f0e4" }}>
                de 275
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
              7
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[50px] font-extrabold leading-none numero-branco">
              42
            </span>
            <span className="text-xl" style={{ color: "#d0c3a4" }}>
              Entregues
            </span>
          </div>
        </div>

        {/* divisor suave */}
        <div
          className="my-1"
          style={{ borderTop: "1px solid rgba(230,192,104,0.4)" }}
        />

        <div className="flex items-center justify-center gap-3 mt-auto pb-2">
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
          <span className="text-2xl font-semibold numero-branco">
            $7.151,90
          </span>
          <span className="text-xl" style={{ color: "#d0c3a4" }}>
            /
          </span>
          <span className="text-2xl font-semibold numero-branco">
            R$ 38.618,82
          </span>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// IMPORTAÇÃO
// =====================================================================
function ImportacaoCard() {
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
              274
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-3xl font-bold text-[var(--gold-light)]">
              Atracam esse mês
            </div>
            <div className="text-[60px] font-extrabold leading-none mt-1 numero-branco">
              26
            </div>
          </div>
        </div>

        <div className="text-2xl leading-snug text-center space-y-1 mb-12">
          <p style={{ color: "#d0c3a4" }}>
            Pedidos na China:{" "}
            <span className="font-bold numero-branco">188</span>
          </p>
          <p style={{ color: "#d0c3a4" }}>
            Pedidos em Logística:{" "}
            <span className="font-bold numero-branco">74</span>
          </p>
          <p style={{ color: "#d0c3a4" }}>
            Pedidos no Desembaraço:{" "}
            <span className="font-bold numero-branco">12</span>
          </p>
        </div>
      </div>
    </div>
  );
}

//
// =====================================================================
// CSAT
// =====================================================================
function CSATCard() {
  const data = [
    { label: "Muito boa", value: 24, color: "#5FA6E8" },
    { label: "Excelente", value: 9, color: "#8BCF7A" },
    { label: "Boa", value: 8, color: "#E6A347" },
    { label: "Regular", value: 1, color: "#E6A347" },
    { label: "Ruim", value: 1, color: "#E85B5B" },
  ];

  const max = Math.max(...data.map((d) => d.value));

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
        {data.map((i) => (
          <div key={i.label} className="flex items-center gap-4">
            <div className="w-[170px] text-2xl" style={{ color: "#f5e7c8" }}>
              {i.label}
            </div>

            <div
              className="flex-1 h-9 rounded-lg overflow-hidden border shadow-[inset_0_0_8px_rgba(0,0,0,0.65)]"
              style={{
                borderColor: "#111",
                background: "linear-gradient(90deg, #181818, #101010, #181818)",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${(i.value / max) * 100}%`,
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
        ))}
      </div>
    </div>
  );
}

//
// =====================================================================
// REPUTAÇÃO 12P
// =====================================================================
function ReputacaoCard() {
  const data = [
    { name: "Faturamento", value: 1278288 },
    { name: "Estorno", value: 113596 },
    { name: "Reembolso", value: 59389 },
  ];

  const COLORS = ["#8BCF7A", "#E85B5B", "#E6A347"];

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
            <span className="font-bold" style={{ color: "var(--gold-light)" }}>
              FATURAMENTO:
            </span>
            <span className="text-gray-200"> R$ 1.290.315,47</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "var(--gold-mid)" }}>
              ESTORNO:
            </span>
            <span className="text-gray-200"> R$ 113.596</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: "#E85B5B" }}>
              REEMBOLSO:
            </span>
            <span className="text-gray-200"> R$ 59.389</span>
          </div>
          <div className="pt-2">
            <span className="font-bold" style={{ color: "var(--gold-light)" }}>
              RECLAME AQUI:
            </span>
            <span className="text-3xl font-extrabold numero-branco"> 0</span>
          </div>
        </div>

        <div className="flex justify-center items-center">
          <div
            className="text-8xl font-extrabold numero-branco"
            style={{
              WebkitTextStroke: "1px black",
              textShadow: "0 0 12px rgba(230,192,104,0.4)",
              animation: "goldenTextBreath 6s ease-in-out infinite",
            }}
          >
            4,60%
          </div>
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
            </Pie>
          </PieChart>
        </div>
      </div>
    </div>
  );
}

//
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
