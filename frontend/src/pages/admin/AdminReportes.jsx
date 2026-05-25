import { useEffect, useState } from 'react';
import { getTodosReportes, responderReporte } from '../../api/api';

const ESTADO_STYLES = {
  pendiente: 'bg-orange-900/40 text-orange-300 border-orange-700',
  revisado: 'bg-blue-900/40 text-blue-300 border-blue-700',
  cerrado: 'bg-green-900/40 text-green-300 border-green-700',
};

const URGENCIA_STYLES = {
  normal: 'bg-gray-700 text-gray-300',
  urgente: 'bg-yellow-900/40 text-yellow-300',
  critico: 'bg-red-900/40 text-red-300',
};

export default function AdminReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUrgencia, setFiltroUrgencia] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('revisado');
  const [guardando, setGuardando] = useState(false);
  const [guardadoMsg, setGuardadoMsg] = useState('');

  function cargar() {
    setLoading(true);
    getTodosReportes()
      .then(setReportes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  function abrirReporte(r) {
    setSeleccionado(r);
    setRespuesta(r.respuesta_admin || '');
    setNuevoEstado(r.estado === 'pendiente' ? 'revisado' : r.estado);
    setGuardadoMsg('');
  }

  async function guardarRespuesta() {
    if (!seleccionado) return;
    setGuardando(true);
    setGuardadoMsg('');
    try {
      await responderReporte(seleccionado.id, { respuesta_admin: respuesta, estado: nuevoEstado });
      setGuardadoMsg('Respuesta guardada correctamente');
      cargar();
      setSeleccionado((prev) => ({ ...prev, respuesta_admin: respuesta, estado: nuevoEstado }));
    } catch (err) {
      setGuardadoMsg(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  }

  const filtrados = reportes.filter((r) => {
    if (filtroEstado && r.estado !== filtroEstado) return false;
    if (filtroUrgencia && r.nivel_urgencia !== filtroUrgencia) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Lista */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-2">Reportes de síntomas</h1>
          <p className="text-gray-400 text-sm mb-6">Gestiona y responde los reportes de ciudadanos.</p>

          {/* Filtros */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="revisado">Revisado</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <select
              value={filtroUrgencia}
              onChange={(e) => setFiltroUrgencia(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="">Toda urgencia</option>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
              <option value="critico">Crítico</option>
            </select>
          </div>

          {loading && <p className="text-gray-400 animate-pulse">Cargando...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="space-y-2">
            {filtrados.map((r) => (
              <button
                key={r.id}
                onClick={() => abrirReporte(r)}
                className={`w-full text-left bg-gray-800 hover:bg-gray-750 border rounded-xl p-4 transition-colors ${
                  seleccionado?.id === r.id ? 'border-red-600' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {r.usuario || 'Anónimo'} — {r.enfermedad_sospechosa || 'Sin especificar'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.municipio || 'Sin municipio'} · {r.fecha_reporte?.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCIA_STYLES[r.nivel_urgencia]}`}>
                      {r.nivel_urgencia}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${ESTADO_STYLES[r.estado]}`}>
                      {r.estado}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {!loading && filtrados.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Sin reportes con los filtros seleccionados.</p>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        {seleccionado && (
          <aside className="w-96 shrink-0 bg-gray-800 rounded-xl border border-gray-700 p-5 self-start sticky top-20">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-semibold text-white">Detalle del reporte</h2>
              <button onClick={() => setSeleccionado(null)} className="text-gray-500 hover:text-white text-lg leading-none">
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm mb-5">
              <div><span className="text-gray-400">Usuario:</span> <span className="text-white">{seleccionado.usuario || 'Anónimo'}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="text-white">{seleccionado.usuario_email || '—'}</span></div>
              <div><span className="text-gray-400">Municipio:</span> <span className="text-white">{seleccionado.municipio || '—'}</span></div>
              <div><span className="text-gray-400">Enfermedad:</span> <span className="text-white">{seleccionado.enfermedad_sospechosa || '—'}</span></div>
              <div><span className="text-gray-400">Urgencia:</span> <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${URGENCIA_STYLES[seleccionado.nivel_urgencia]}`}>{seleccionado.nivel_urgencia}</span></div>
              <div><span className="text-gray-400">Fecha:</span> <span className="text-white">{seleccionado.fecha_reporte?.slice(0, 16).replace('T', ' ')}</span></div>
              <div>
                <span className="text-gray-400 block mb-1">Síntomas:</span>
                <p className="text-gray-300 bg-gray-900 rounded-lg p-3 text-xs leading-relaxed">{seleccionado.sintomas}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Respuesta al ciudadano</label>
                <textarea
                  rows={4}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Escribe la respuesta para el ciudadano..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nuevo estado</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="revisado">Revisado</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              {guardadoMsg && (
                <p className={`text-xs ${guardadoMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {guardadoMsg}
                </p>
              )}
              <button
                onClick={guardarRespuesta}
                disabled={guardando}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {guardando ? 'Guardando...' : 'Guardar respuesta'}
              </button>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
