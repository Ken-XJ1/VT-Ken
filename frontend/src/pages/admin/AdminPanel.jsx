import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getTodosReportes, getTodosMensajes } from '../../api/api';

const ESTADO_STYLES = {
  pendiente: 'bg-orange-900/40 text-orange-300',
  revisado: 'bg-blue-900/40 text-blue-300',
  cerrado: 'bg-green-900/40 text-green-300',
};

const URGENCIA_STYLES = {
  normal: 'bg-gray-700 text-gray-300',
  urgente: 'bg-yellow-900/40 text-yellow-300',
  critico: 'bg-red-900/40 text-red-300',
};

// Gráfico de barras simple con SVG
function BarChart({ data }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.valor), 1);
  return (
    <div className="flex items-end gap-3 h-24">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs text-gray-400">{d.valor}</span>
          <div
            className="w-full rounded-t"
            style={{
              height: `${(d.valor / max) * 72}px`,
              background: d.color || '#ef4444',
              minHeight: d.valor > 0 ? '4px' : '0',
            }}
          />
          <span className="text-xs text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getTodosReportes(), getTodosMensajes()])
      .then(([s, r, m]) => {
        setStats(s);
        setReportes(r);
        setMensajes(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Conteo de reportes por enfermedad para el gráfico
  const porEnfermedad = ['Dengue', 'Malaria', 'Zika', 'Chikungunya'].map((e) => ({
    label: e,
    valor: reportes.filter((r) => r.enfermedad_sospechosa === e).length,
    color: { Dengue: '#ef4444', Malaria: '#f97316', Zika: '#3b82f6', Chikungunya: '#22c55e' }[e],
  }));

  const statCards = stats
    ? [
        { label: 'Usuarios registrados', valor: stats.total_usuarios },
        { label: 'Reportes pendientes', valor: stats.reportes_pendientes, alert: stats.reportes_pendientes > 0 },
        { label: 'Mensajes sin leer', valor: stats.mensajes_no_leidos, alert: stats.mensajes_no_leidos > 0 },
        { label: 'Brotes este mes', valor: stats.brotes_este_mes },
      ]
    : [];

  return (
    <main className="pt-16 min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de administrador</h1>
        <p className="text-gray-400 mb-8">Resumen del sistema de vigilancia epidemiológica.</p>

        {loading ? (
          <p className="text-gray-400 animate-pulse">Cargando estadísticas...</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className={`bg-gray-800 rounded-xl border p-4 text-center ${s.alert ? 'border-red-700' : 'border-gray-700'}`}
                >
                  <span className={`block text-3xl font-bold ${s.alert ? 'text-red-400' : 'text-white'}`}>
                    {s.valor}
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Últimos reportes pendientes */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Reportes pendientes</h2>
                  <Link to="/admin/reportes" className="text-xs text-red-400 hover:text-red-300">Ver todos</Link>
                </div>
                {reportes.filter((r) => r.estado === 'pendiente').length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin reportes pendientes.</p>
                ) : (
                  <div className="space-y-2">
                    {reportes.filter((r) => r.estado === 'pendiente').slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-700 last:border-0">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{r.usuario || 'Anónimo'}</p>
                          <p className="text-xs text-gray-400">{r.enfermedad_sospechosa || 'Sin especificar'} · {r.fecha_reporte?.slice(0, 10)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${URGENCIA_STYLES[r.nivel_urgencia]}`}>
                          {r.nivel_urgencia}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Últimos mensajes sin leer */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Mensajes sin leer</h2>
                  <Link to="/admin/mensajes" className="text-xs text-red-400 hover:text-red-300">Ver todos</Link>
                </div>
                {mensajes.filter((m) => !m.leido).length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin mensajes nuevos.</p>
                ) : (
                  <div className="space-y-2">
                    {mensajes.filter((m) => !m.leido).slice(0, 5).map((m) => (
                      <div key={m.id} className="py-2 border-b border-gray-700 last:border-0">
                        <p className="text-sm text-white truncate">{m.asunto}</p>
                        <p className="text-xs text-gray-400">{m.usuario} · {m.fecha_mensaje?.slice(0, 10)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico reportes por enfermedad */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <h2 className="font-semibold text-white mb-4">Reportes por enfermedad sospechosa</h2>
              <BarChart data={porEnfermedad} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
