import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMisReportes, getMisMensajes } from '../api/api';
import BackButton from '../components/BackButton';

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

export default function Dashboard() {
  const { user } = useAuth();
  const [reportes, setReportes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMisReportes(), getMisMensajes()])
      .then(([r, m]) => {
        setReportes(r);
        setMensajes(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendientes = reportes.filter((r) => r.estado === 'pendiente').length;
  const conRespuesta = mensajes.filter((m) => m.respuesta_admin).length;

  const accesos = [
    { label: 'Reportar síntomas', desc: 'Envía un nuevo reporte de síntomas', to: '/reportar', color: 'border-red-600 hover:border-red-500' },
    { label: 'Mis reportes', desc: 'Revisa el estado de tus reportes', to: '/mis-reportes', color: 'border-blue-600 hover:border-blue-500' },
    { label: 'Enviar mensaje', desc: 'Escribe al equipo de salud', to: '/mensajes', color: 'border-green-600 hover:border-green-500' },
    { label: 'Asistente de síntomas', desc: 'Identifica posibles enfermedades', to: '/chatbot', color: 'border-yellow-600 hover:border-yellow-500' },
  ];

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BackButton />
        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Bienvenido, {user?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-gray-400 mt-1">Panel de ciudadano — Vigilancia Tropical</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { valor: reportes.length, label: 'Reportes enviados' },
            { valor: pendientes, label: 'Pendientes de respuesta' },
            { valor: mensajes.length, label: 'Mensajes enviados' },
            { valor: conRespuesta, label: 'Mensajes con respuesta' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
              <span className="block text-3xl font-bold text-red-400">{loading ? '—' : item.valor}</span>
              <span className="block text-xs text-gray-400 mt-1">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <h2 className="text-lg font-semibold text-white mb-4">Accesos rápidos</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {accesos.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`bg-gray-800 border rounded-xl p-4 transition-colors ${a.color}`}
            >
              <p className="font-semibold text-white text-sm mb-1">{a.label}</p>
              <p className="text-xs text-gray-400">{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* Últimos 3 reportes */}
        <h2 className="text-lg font-semibold text-white mb-4">Mis últimos reportes</h2>
        {loading ? (
          <p className="text-gray-400 animate-pulse">Cargando...</p>
        ) : reportes.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <p className="text-gray-400 text-sm">No has enviado reportes todavía.</p>
            <Link to="/reportar" className="text-red-400 hover:text-red-300 text-sm font-medium mt-2 inline-block">
              Enviar primer reporte
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reportes.slice(0, 3).map((r) => (
              <div key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {r.nombre_reporte || r.enfermedad_sospechosa || 'Reporte sin título'}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {r.municipio || 'Sin municipio'} · {r.fecha_reporte?.slice(0, 10)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCIA_STYLES[r.nivel_urgencia] || ''}`}>
                    {r.nivel_urgencia}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${ESTADO_STYLES[r.estado] || ''}`}>
                    {r.estado}
                  </span>
                </div>
              </div>
            ))}
            {reportes.length > 3 && (
              <Link to="/mis-reportes" className="text-red-400 hover:text-red-300 text-sm font-medium block text-center mt-2">
                Ver todos los reportes
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
