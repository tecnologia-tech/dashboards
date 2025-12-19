import { useEffect, useState } from "react";
import logodozepe from "../../assets/MetaAnual/dozepe.png";

const META_ANUAL = 23250000;

const numberFont =
  "Inter, 'Manrope', 'Satoshi', 'Helvetica Neue', Arial, sans-serif";
const numberFormatter = new Intl.NumberFormat("pt-BR");

function toNumber(valor) {
  if (valor == null) return 0;
  const v = String(valor).trim();
  if (v.includes(",") && v.includes(".")) {
    return Number(v.replace(/\./g, "").replace(",", "."));
  }
  if (v.includes(",")) {
    return Number(v.replace(",", "."));
  }
  return Number(v);
}

export default function MetaAnual() {
  const [faltaMetaAnual, setFaltaMetaAnual] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
      );
      const rawData = await r.json();
      if (!Array.isArray(rawData)) return;

      const hoje = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );

      // 🔴 MESMOS FILTROS DO LASTDANCE
      const pipelineIdsAno = ["15", "71", "23", "47", "59", "63", "35", "75"];

      const inicioAno = new Date(hoje.getFullYear(), 0, 1);
      const fimAno = new Date(hoje.getFullYear(), 11, 31);

      const filtradosAno = rawData.filter((i) => {
        const dt = new Date(i.data);
        return (
          pipelineIdsAno.includes(String(i.pipeline_id)) &&
          dt >= inicioAno &&
          dt <= fimAno
        );
      });

      const somaAno = filtradosAno.reduce(
        (acc, i) => acc + toNumber(i.valor),
        0
      );

      setFaltaMetaAnual(Math.max(META_ANUAL - somaAno, 0));
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-screen h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        fontFamily: numberFont,
        background:
          "radial-gradient(circle at 50% 30%, rgba(255,200,0,0.08), transparent 38%), linear-gradient(140deg, #0b0b0f 0%, #070707 55%, #0e0e0e 100%)",
      }}
    >
      {/* ARTBOARD */}
      <div className="relative w-full max-w-[1480px] h-[88vh] rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-[2px] px-16 py-10 grid grid-rows-[auto_1fr] gap-10 shadow-[0_32px_100px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Micro-gradientes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(255,220,120,0.06), transparent 30%), radial-gradient(circle at 85% 80%, rgba(255,170,40,0.05), transparent 35%)",
          }}
        />

        {/* HEADER */}
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
              <img
                src={logodozepe}
                alt="12P"
                className="h-6 w-auto opacity-80"
                draggable={false}
              />
            </div>
            <div className="leading-tight">
              <p className="text-[16px] uppercase tracking-[0.34em] text-white/55">
                Ainda faltam
              </p>
              <p className="text-[15px] uppercase tracking-[0.26em] text-amber-200/80">
                Meta anual 12P
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT — AGORA CENTRALIZADO */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
              Saldo para atingir
            </p>

            <div className="space-y-3 leading-none">
              <div className="text-lg font-semibold text-white/70 text-[40px]">
                Meta anual 12P
              </div>

              <div className="text-[150px] 2xl:text-[170px] font-black bg-gradient-to-br from-[#f9e7a3] via-[#f5c86b] to-[#d88d2a] bg-clip-text text-transparent drop-shadow-[0_12px_44px_rgba(216,141,42,0.35)]">
                R$ {numberFormatter.format(faltaMetaAnual)}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[40px] uppercase tracking-[0.18em] text-white/60">
              <span className="h-px w-14 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              de R$ 23 milhões
              <span className="h-px w-14 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* 
        ==================================
        TABELA COMENTADA (OPÇÃO 1)
        ==================================
        */}
        {/*
        <div className="flex flex-col h-full">
          ... tabela inteira aqui ...
        </div>
        */}
      </div>
    </div>
  );
}
