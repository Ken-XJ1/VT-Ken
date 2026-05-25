/**
 * Gauge — gráfico circular SVG de riesgo global
 * @param {number} porcentaje - 0 a 100
 * @param {string} nivel - "bajo" | "medio" | "alto" | "critico"
 */
const NIVEL_COLORS = {
  bajo: '#27ae60',
  medio: '#f39c12',
  alto: '#e74c3c',
  critico: '#c0392b',
};

const NIVEL_LABELS = {
  bajo: 'BAJO',
  medio: 'MEDIO',
  alto: 'ALTO',
  critico: 'CRÍTICO',
};

export default function Gauge({ porcentaje = 0, nivel = 'bajo' }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(porcentaje, 100) / 100) * circumference;
  const color = NIVEL_COLORS[nivel] || NIVEL_COLORS.bajo;
  const label = NIVEL_LABELS[nivel] || nivel.toUpperCase();

  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{porcentaje.toFixed(1)}%</span>
        <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
