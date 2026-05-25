/**
 * StatCard — tarjeta de estadística numérica
 * @param {string} valor - Valor principal (ej: "85%")
 * @param {string} etiqueta - Etiqueta descriptiva
 * @param {string} [descripcion] - Descripción opcional
 */
export default function StatCard({ valor, etiqueta, descripcion }) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
      <span className="text-4xl font-bold text-red-400 mb-1">{valor}</span>
      <span className="text-sm font-semibold text-white uppercase tracking-wide">{etiqueta}</span>
      {descripcion && (
        <p className="text-xs text-gray-400 mt-2">{descripcion}</p>
      )}
    </div>
  );
}
