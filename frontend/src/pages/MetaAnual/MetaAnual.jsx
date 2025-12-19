import { useEffect, useState } from "react";
import logodozepe from "../../assets/MetaAnual/dozepe.png";

const META_ANUAL = 23000000;

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
  const [rows, setRows] = useState([]);

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

      // 🔴 EXATAMENTE IGUAL AO LASTDANCE
      const pipelineIdsMes = ["15", "71", "23", "47", "59", "63", "35", "75"];

      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const filtradosMes = rawData.filter((i) => {
        const dt = new Date(i.data);
        return (
          pipelineIdsMes.includes(String(i.pipeline_id)) &&
          dt >= inicioMes &&
          dt <= fimMes
        );
      });

      // 🔥 TABELA = MESMA COISA DO LASTDANCE
      const top5 = [...filtradosMes]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5)
        .map((i) => ({
          lead: i.lead_id,
          empresa: i.empresa, // ⚠️ SEM FALLBACK
          vendedor: i.assigned,
          pipeline: i.pipeline,
          valor: toNumber(i.valor),
        }));

      setRows(top5);

      // 🔥 META ANUAL (AQUI SIM É ANUAL)
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
      <div className="relative w-full max-w-[1480px] h-[88vh] rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-[2px] px-16 py-10 grid grid-rows-[auto_1fr] gap-8 shadow-[0_32px_100px_rgba(0,0,0,0.7)] overflow-hidden">
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
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/55">
                Ainda faltam
              </p>
              <p className="text-[11px] uppercase tracking-[0.26em] text-amber-200/80">
                Meta anual 12P
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-white/45"></div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-[1.2fr_1fr] items-center gap-10 relative">
          {/* HERO */}
          <div className="flex flex-col gap-5 justify-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
              Saldo para atingir
            </p>

            <div className="space-y-3 leading-none">
              <div className="text-lg font-semibold text-white/70">
                Meta anual 12P
              </div>

              <div className="text-[148px] 2xl:text-[160px] font-black bg-gradient-to-br from-[#f9e7a3] via-[#f5c86b] to-[#d88d2a] bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(216,141,42,0.35)]">
                R$ {numberFormatter.format(faltaMetaAnual)}
              </div>
            </div>
          </div>

          {/* TABELA */}
          <div className="flex flex-col h-full">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/55 mb-3">
              Últimos wons
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-black/45 backdrop-blur-xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.85)]">
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(255,220,120,0.05), transparent 45%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.55), transparent 60%)",
                }}
              />

              <div className="relative grid gap-3">
                {rows.map((r) => (
                  <div
                    key={r.lead}
                    className="relative overflow-hidden rounded-2xl border border-amber-100/10 bg-gradient-to-br from-[#121212] via-[#0e0e0e] to-[#0a0a0a] px-5 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.5)]"
                  >
                    {/* Overlay contido — SEM FAIXA */}
                    <div
                      className="absolute inset-[1px] rounded-2xl pointer-events-none opacity-40"
                      style={{
                        background:
                          "linear-gradient(120deg, rgba(255,185,65,0.05), transparent 45%)",
                      }}
                    />

                    <div className="relative grid grid-cols-[96px_1fr] gap-3 items-center">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                          Lead
                        </span>
                        <span className="text-base font-semibold text-amber-100">
                          {r.lead}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[12px] font-semibold uppercase leading-tight text-white/90">
                            {r.empresa}
                          </span>

                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">
                              Valor
                            </div>
                            <div className="text-lg font-bold text-amber-200">
                              R$ {numberFormatter.format(r.valor)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-white/70">
                          <span className="font-medium">{r.vendedor}</span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-white/5 px-3 py-[3px] text-[10px] uppercase tracking-[0.16em] text-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(244,193,94,0.7)]" />
                            {r.pipeline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
