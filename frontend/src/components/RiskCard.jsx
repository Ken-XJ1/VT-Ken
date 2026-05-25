/**
 * RiskCard — tarjeta de riesgo individual por enfermedad
 * @param {object} item - { enfermedad, nivel_riesgo, probabilidad }
 */
const NIVEL_COLORS = {
  bajo: { bg: 'bg-green-900/40', border: 'border-green-500', text: 'text-green-400', bar: 'bg-green-500' },
  medio: { bg: 'bg-yellow-900/40', border: 'border-yellow-500', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  alto: { bg: 'bg-orange-900/40', border: 'border-orange-500', text: 'text-orange-400', bar: 'bg-orange-500' },
  critico: { bg: 'bg-red-900/40', border: 'border-red-500', text: 'text-red-400', bar: 'bg-red-500' },
};

const NIVEL_LABELS = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  critico: 'Crítico',
};

export default function RiskCard({ item }) {
  const colors = NIVEL_COLORS[item.nivel_riesgo] || NIVEL_COLORS.bajo;
  const label = NIVEL_LABELS[item.nivel_riesgo] || item.nivel_riesgo;
  const pct = Math.min(item.probabilidad, 100);

  return (
    <article className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{item.enfermedad}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.text} ${colors.border} bg-transparent`}>
          {label}
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className={`text-sm ${colors.text}`}>
        Probabilidad: <strong>{pct}%</strong>
      </p>
    </article>
  );
}
