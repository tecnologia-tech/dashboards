import React from "react";
import lateralImg from "../../assets/geral/geral.png";

/* =====================================================================
   COMPONENTE PRINCIPAL
===================================================================== */
export default function Geral() {
  return (
    <div className="w-full h-screen bg-black text-white flex overflow-hidden">
      {/* ======================= LATERAL ESQUERDA ======================= */}
      <div className="w-[220px] min-w-[220px] h-full">
        <img
          src={lateralImg}
          alt="Lateral"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ======================= ÁREA DOS DADOS ======================== */}
      <div className="flex-1 flex flex-col overflow-hidden px-6">
        {/* ======================= RINGS ======================= */}
        <div className="w-full flex justify-between mt-4 mb-6">
          <Ring
            title="LTDA"
            value="857,1 mil"
            estornos="0"
            meta="R$ 1,4 mi"
            percent={61.2}
          />
          <Ring
            title="CS"
            value="284,0 mil"
            estornos="103mil"
            meta="R$ 800 mil"
            percent={33.4}
          />
          <Ring
            title="Bônus"
            value="43,5 mil"
            estornos="0"
            meta="R$ 300 mil"
            percent={29}
          />
          <Ring
            title="Repetidos"
            value="108,9 mil"
            estornos="103mil"
            meta="R$ 200 mil"
            percent={54.5}
          />
          <Ring
            title="12P"
            value="1,294 mi"
            estornos="103mil"
            meta="R$ 2,7 mi"
            percent={47.9}
          />
        </div>

        {/* ======================= GRID 2 FILEIRAS ======================= */}
        <div className="grid grid-cols-3 gap-6 flex-1 pb-6">
          {/* ===================== ONBOARDING ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-orange-400 mb-3">
              Onboarding
            </h2>

            <div className="text-6xl font-bold">98</div>
            <div className="text-lg mb-4">Clientes</div>

            <div className="space-y-2">
              <Item nome="Jayanne Queiroz" qtd="38" />
              <Item nome="Jenifer Martins" qtd="22" />
              <Item nome="Rayssa Veloso" qtd="37" />
            </div>
          </Card>

          {/* ===================== COMPRAS ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-blue-400 mb-3">Compras</h2>

            <div className="flex justify-between text-center">
              <div>
                <div className="text-5xl font-bold">15</div>
                <div className="text-sm">Simulações</div>
              </div>

              <div>
                <div className="text-5xl font-bold">177</div>
                <div className="text-sm text-red-400">64.4% de 275</div>
                <div className="text-sm">Entregues</div>
              </div>

              <div>
                <div className="text-5xl font-bold">7</div>
                <div className="text-sm">Handovers</div>
                <div className="text-sm">42 Entregues</div>
              </div>
            </div>

            <div className="mt-4 text-sm">
              ACCOUNT (MÊS):{" "}
              <span className="font-semibold">$3.803,05 / R$ 20.298,02</span>
            </div>
          </Card>

          {/* ===================== IMPORTAÇÃO ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-purple-300 mb-3">
              Importação
            </h2>

            <div className="flex justify-between text-center">
              <div>
                <div className="text-6xl font-bold">274</div>
                <div className="text-sm">Total Pedidos</div>
              </div>

              <div>
                <div className="text-6xl font-bold">26</div>
                <div className="text-sm">Atracam esse mês</div>
              </div>
            </div>

            <div className="mt-4 text-sm space-y-1">
              <div>China: 188</div>
              <div>Logística: 74</div>
              <div>Desembaraço: 12</div>
            </div>
          </Card>

          {/* ===================== CSAT ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-orange-400 mb-3">CSAT</h2>

            <div className="text-sm space-y-1">
              <div>Muito boa: 24</div>
              <div>Excelente: 9</div>
              <div>Boa: 8</div>
              <div>Regular: 1</div>
              <div>Ruim: 1</div>
            </div>
          </Card>

          {/* ===================== REPUTAÇÃO ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-yellow-500 mb-3">
              Reputação 12P
            </h2>

            <div className="text-sm space-y-1">
              <div>Faturamento: R$ 1.278.288,47</div>
              <div>Estorno: R$ 113.596</div>
              <div>Reembolso: R$ 59.389</div>
              <div className="text-3xl font-bold mt-2">4,60%</div>
              <div>Reclame Aqui: 0</div>
            </div>
          </Card>

          {/* ===================== DÓLAR/NPS/BHAG ===================== */}
          <Card>
            <h2 className="text-2xl font-bold text-yellow-300 mb-3">
              Dólar / NPS / BHAG 12P
            </h2>

            <div className="text-sm space-y-1">
              <div>Dólar: R$ 5,34</div>
              <div>NPS: 3,63</div>
              <div>BHAG 12P: 1 / 100</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   CARD COMPONENT
===================================================================== */
function Card({ children }) {
  return (
    <div className="bg-neutral-900 border border-yellow-600 rounded-xl p-5 flex flex-col">
      {children}
    </div>
  );
}

/* =====================================================================
   ITEM ONBOARDING (com o pontinho)
===================================================================== */
function Item({ nome, qtd }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-gray-500 rounded-full" />
      <div className="flex justify-between w-full text-sm">
        <span>{nome}</span>
        <span>{qtd}</span>
      </div>
    </div>
  );
}

/* =====================================================================
   RING (idêntico ao seu atual)
===================================================================== */
function Ring({ title, value, estornos, meta, percent }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="50%" stopColor="#ffd46b" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
        </svg>

        {/* CENTRO */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-yellow-400 font-bold text-xl">{title}</div>
          <div className="text-white text-3xl font-extrabold whitespace-nowrap">
            {value}
          </div>
          <div className="text-sm text-gray-300">Estornos: {estornos}</div>
        </div>

        {/* PORCENTAGEM */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-1 text-2xl font-extrabold text-white">
          {percent}%
        </div>
      </div>

      {/* META */}
      <div className="text-yellow-300 text-lg font-bold mt-2">Meta: {meta}</div>
    </div>
  );
}
