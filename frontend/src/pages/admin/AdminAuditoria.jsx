import { useEffect, useState } from 'react';
import { getAuditoria } from '../../api/api';
import BackButton from '../../components/BackButton';

const ACCION_COLORS = {
  login: 'bg-blue-900/40 text-blue-300',
  registro: 'bg-green-900/40 text-green-300',
  actualizar_perfil: 'bg-yellow-900/40 text-yellow-300',
  toggle_usuario: 'bg-orange-900/40 text-orange-300',
  editar_usuario: 'bg-purple-900/40 text-purple-300',
  crear_reporte: 'bg-emerald-900/40 text-emerald-300',
  responder_reporte: 'bg-teal-900/40 text-teal-300',
  default: 'bg-gray-700 text-gray-300',
};

export default function AdminAuditoria() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limite, setLimite] = useState(100);

  function cargar() {
    setLoading(true);
    getAuditoria(limite)
      .then(setRegistros)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, [limite]);

  function formatearFecha(fecha) {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Auditoría del sistema</h1>
            <p className="text-gray-400 text-sm">Registro de acciones realizadas en el sistema</p>
          </div>
          <select
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value={50}>Últimos 50</option>
            <option value={100}>Últimos 100</option>
            <option value={200}>Últimos 200</option>
            <option value={500}>Últimos 500</option>
          </select>
        </div>

        {loading && <p className="text-gray-400 animate-pulse">Cargando registros...</p>}
        {error && (
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>
        )}

        {!loading && !error && registros.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400">No hay registros de auditoría</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tabla
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {registros.map((r) => {
                  const colorClass = ACCION_COLORS[r.accion] || ACCION_COLORS.default;
                  return (
                    <tr key={r.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {formatearFecha(r.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-white font-medium">{r.usuario_nombre || 'Sistema'}</div>
                        <div className="text-xs text-gray-500">{r.usuario_email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
                          {r.accion.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {r.tabla_afectada || '—'}
                        {r.registro_id && (
                          <span className="text-gray-600 ml-1">#{r.registro_id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-md truncate">
                        {r.detalles || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && registros.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Mostrando {registros.length} registro{registros.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </main>
  );
}
