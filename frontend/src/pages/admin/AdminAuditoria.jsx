import { useEffect, useState } from 'react';
import { getAuditoria, getMiIP } from '../../api/api';
import BackButton from '../../components/BackButton';

const ACCION_COLORS = {
  login:             'bg-blue-900/40 text-blue-300 border-blue-700',
  registro:          'bg-green-900/40 text-green-300 border-green-700',
  actualizar_perfil: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  actualizar_email:  'bg-yellow-900/40 text-yellow-300 border-yellow-700',
  actualizar_password: 'bg-orange-900/40 text-orange-300 border-orange-700',
  toggle_usuario:    'bg-orange-900/40 text-orange-300 border-orange-700',
  editar_usuario:    'bg-purple-900/40 text-purple-300 border-purple-700',
  crear_reporte:     'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  responder_reporte: 'bg-teal-900/40 text-teal-300 border-teal-700',
  default:           'bg-gray-700/60 text-gray-300 border-gray-600',
};

const ACCION_LABELS = {
  login:               'Inicio de sesión',
  registro:            'Registro',
  actualizar_perfil:   'Actualizar perfil',
  actualizar_email:    'Cambio de correo',
  actualizar_password: 'Cambio de contraseña',
  toggle_usuario:      'Activar / Desactivar usuario',
  editar_usuario:      'Editar usuario',
  crear_reporte:       'Crear reporte',
  responder_reporte:   'Responder reporte',
};

const FILTROS_ACCION = [
  { value: '', label: 'Todas las acciones' },
  { value: 'login', label: 'Inicios de sesión' },
  { value: 'registro', label: 'Registros' },
  { value: 'actualizar_perfil', label: 'Cambios de perfil' },
  { value: 'actualizar_password', label: 'Cambios de contraseña' },
  { value: 'crear_reporte', label: 'Reportes creados' },
  { value: 'responder_reporte', label: 'Reportes respondidos' },
  { value: 'toggle_usuario', label: 'Activaciones' },
  { value: 'editar_usuario', label: 'Ediciones de usuario' },
];

export default function AdminAuditoria() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limite, setLimite] = useState(200);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [miIP, setMiIP] = useState('');

  function cargar() {
    setLoading(true);
    getAuditoria(limite)
      .then(setRegistros)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
    getMiIP().then((data) => setMiIP(data.ip)).catch(() => {});
  }, [limite]);

  function formatearFecha(fecha) {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  const filtrados = registros.filter((r) => {
    if (filtroAccion && r.accion !== filtroAccion) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        (r.usuario_nombre || '').toLowerCase().includes(q) ||
        (r.usuario_email || '').toLowerCase().includes(q) ||
        (r.detalles || '').toLowerCase().includes(q) ||
        (r.ip_address || '').includes(q)
      );
    }
    return true;
  });

  // Conteo rápido de logins
  const totalLogins = registros.filter((r) => r.accion === 'login').length;
  const totalRegistros = registros.filter((r) => r.accion === 'registro').length;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Auditoría del sistema</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Control de accesos y acciones de todos los usuarios
            </p>
          </div>
          <div className="flex items-center gap-3">
            {miIP && (
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Tu IP</span>
                <span className="text-sm font-mono text-emerald-400 font-semibold">{miIP}</span>
              </div>
            )}
            <select
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
            >
              <option value={100}>Últimos 100</option>
              <option value={200}>Últimos 200</option>
              <option value={500}>Últimos 500</option>
              <option value={1000}>Últimos 1000</option>
            </select>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Registros totales', valor: registros.length, color: 'text-white' },
            { label: 'Inicios de sesión', valor: totalLogins, color: 'text-blue-400' },
            { label: 'Nuevos usuarios', valor: totalRegistros, color: 'text-green-400' },
            { label: 'Mostrando', valor: filtrados.length, color: 'text-gray-300' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <span className={`block text-2xl font-bold ${s.color}`}>{s.valor}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            {FILTROS_ACCION.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por usuario, email, IP o detalle..."
            className="flex-1 min-w-48 bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 placeholder-gray-600"
          />

          {(filtroAccion || busqueda) && (
            <button
              onClick={() => { setFiltroAccion(''); setBusqueda(''); }}
              className="text-sm text-gray-400 hover:text-white border border-gray-600 px-3 py-2 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {loading && <p className="text-gray-400 animate-pulse text-sm">Cargando registros...</p>}
        {error && (
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm">{error}</p>
        )}

        {!loading && !error && registros.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400 text-sm">No hay registros de auditoría todavía.</p>
            <p className="text-gray-600 text-xs mt-1">Los inicios de sesión y acciones se registrarán aquí automáticamente.</p>
          </div>
        )}

        {!loading && filtrados.length === 0 && registros.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <p className="text-gray-400 text-sm">Sin resultados para los filtros aplicados.</p>
          </div>
        )}

        {filtrados.length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Fecha y hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      IP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/60">
                  {filtrados.map((r) => {
                    const colorClass = ACCION_COLORS[r.accion] || ACCION_COLORS.default;
                    const esLogin = r.accion === 'login';
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${esLogin ? 'hover:bg-blue-900/10' : 'hover:bg-gray-700/30'}`}
                      >
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">
                          {formatearFecha(r.fecha)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-white font-medium">
                            {r.usuario_nombre || <span className="text-gray-600 italic">Sistema</span>}
                          </div>
                          <div className="text-xs text-gray-500">{r.usuario_email || '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colorClass}`}>
                            {ACCION_LABELS[r.accion] || r.accion.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500 font-mono">
                            {r.ip_address || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 max-w-xs xl:max-w-md truncate">
                          {r.detalles || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && filtrados.length > 0 && (
          <p className="text-center text-xs text-gray-600 mt-4">
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''} mostrado{filtrados.length !== 1 ? 's' : ''}
            {filtrados.length < registros.length && ` (de ${registros.length} totales)`}
          </p>
        )}
      </div>
    </main>
  );
}
