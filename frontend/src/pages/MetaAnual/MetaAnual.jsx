import { useEffect, useState } from "react";

const META_ANUAL = 23183400;

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
  const [metaBatida, setMetaBatida] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const r = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dash_geralcsWon`
      );
      const rawData = await r.json();
      if (!Array.isArray(rawData)) return;

      const hoje = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Sao_Paulo",
        })
      );

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

      if (somaAno >= META_ANUAL) {
        setMetaBatida(true);
        setFaltaMetaAnual(0);
      } else {
        setMetaBatida(false);
        setFaltaMetaAnual(META_ANUAL - somaAno);
      }
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
          "radial-gradient(circle at 50% 35%, rgba(255,200,0,0.12), transparent 40%), linear-gradient(140deg, #0b0b0f 0%, #070707 55%, #0e0e0e 100%)",
      }}
    >
      {/* ARTBOARD */}
      <div className="relative w-full max-w-[1700px] h-[92vh] rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-[2px] shadow-[0_32px_140px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-400/10 via-transparent to-transparent" />

        {/* BLOCO CENTRAL */}
        <div className="relative flex flex-col items-center justify-center gap-[3vh]">
          {/* TOPO */}
          <div>
            <div
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(42px, 6vh, 64px)" }}
            >
              <span className="text-amber-400">12</span>
              <span className="text-white">P</span>
            </div>

            <div
              className="uppercase text-white/55"
              style={{
                fontSize: "clamp(14px, 2vh, 22px)",
                letterSpacing: "0.5em",
                marginTop: "0.5vh",
              }}
            >
              Meta anual
            </div>
          </div>

          {/* CONTEÚDO */}
          {!metaBatida ? (
            <>
              <div
                className="uppercase text-white/60"
                style={{
                  fontSize: "clamp(20px, 3vh, 36px)",
                  letterSpacing: "0.45em",
                }}
              >
                Ainda faltam
              </div>

              <div className="flex items-end justify-center gap-[2vh]">
                <span
                  className="font-extrabold text-amber-200/90"
                  style={{
                    fontSize: "clamp(64px, 8vh, 120px)",
                    marginBottom: "2vh",
                  }}
                >
                  R$
                </span>

                <span
                  className="font-extrabold tracking-tight bg-gradient-to-br from-[#fff4c7] via-[#f5c86b] to-[#d88d2a] bg-clip-text text-transparent leading-none"
                  style={{
                    fontSize: "clamp(140px, 22vh, 260px)",
                    filter: "drop-shadow(0 32px 100px rgba(216,141,42,0.55))",
                  }}
                >
                  {numberFormatter.format(faltaMetaAnual)}
                </span>
              </div>

              <div
                className="flex items-center gap-[2vh] uppercase text-white/65"
                style={{
                  fontSize: "clamp(22px, 3.5vh, 48px)",
                  letterSpacing: "0.3em",
                }}
              >
                <span className="h-px w-[6vh] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                de R$ 23 milhões
                <span className="h-px w-[6vh] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              </div>
            </>
          ) : (
            <>
              {/* META BATIDA */}
              <div
                className="uppercase text-white/65 flex items-center gap-4"
                style={{
                  fontSize: "clamp(26px, 4vh, 48px)",
                  letterSpacing: "0.35em",
                }}
              >
                <span>Meta anual batida</span>
                <span className="text-[1.2em]">🏆</span>
              </div>

              {/* VALOR DA META */}
              <div className="flex items-end justify-center gap-[2vh]">
                <span
                  className="font-extrabold text-amber-200/90"
                  style={{
                    fontSize: "clamp(64px, 8vh, 120px)",
                    marginBottom: "2vh",
                  }}
                ></span>

                <span
                  className="font-extrabold tracking-tight bg-gradient-to-br from-[#fff4c7] via-[#f5c86b] to-[#d88d2a] bg-clip-text text-transparent leading-none"
                  style={{
                    fontSize: "clamp(160px, 24vh, 280px)",
                    filter: "drop-shadow(0 36px 120px rgba(216,141,42,0.6))",
                  }}
                >
                  23 milhões
                </span>
              </div>

              {/* PARABÉNS */}
              <div
                className="uppercase text-white/70 flex items-center gap-3"
                style={{
                  fontSize: "clamp(24px, 4vh, 52px)",
                  letterSpacing: "0.3em",
                }}
              >
                <span>Parabéns</span>
                <span className="text-[1.4em]">👏</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
