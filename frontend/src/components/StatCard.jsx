/**
 * StatCard — tarjeta de estadística numérica
 * @param {string} valor - Valor principal (ej: "85%")
 * @param {string} etiqueta - Etiqueta descriptiva
 * @param {string} [descripcion] - Descripción opcional
 */
export default function StatCard({ valor, etiqueta, descripcion }) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:border-emerald-500/50 transition-all transform hover:scale-105">
      <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-1">{valor}</span>
      <span className="text-sm font-semibold text-[#f9fafb] uppercase tracking-wide">{etiqueta}</span>
      {descripcion && (
        <p className="text-xs text-[#9ca3af] mt-2">{descripcion}</p>
      )}
    </div>
  );
}
