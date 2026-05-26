import { useEffect, useState } from 'react';
import { getMisReportes } from '../api/api';
import BackButton from '../components/BackButton';

const ESTADO_STYLES = {
  pendiente: { badge: 'bg-orange-900/40 text-orange-300 border-orange-700', label: 'Pendiente' },
  revisado: { badge: 'bg-blue-900/40 text-blue-300 border-blue-700', label: 'Revisado' },
  cerrado: { badge: 'bg-green-900/40 text-green-300 border-green-700', label: 'Cerrado' },
};

const URGENCIA_STYLES = {
  normal: 'bg-gray-700 text-gray-300',
  urgente: 'bg-yellow-900/40 text-yellow-300',
  critico: 'bg-red-900/40 text-red-300',
};

export default function MisReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    getMisReportes()
      .then(setReportes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-2">Mis reportes</h1>
        <p className="text-gray-400 mb-8">Historial de reportes de síntomas enviados.</p>

        {loading && <p className="text-gray-400 animate-pulse">Cargando reportes...</p>}
        {error && (
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>
        )}

        {!loading && !error && reportes.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400">No has enviado reportes todavía.</p>
          </div>
        )}

        <div className="space-y-4">
          {reportes.map((r) => {
            const estado = ESTADO_STYLES[r.estado] || ESTADO_STYLES.pendiente;
            const abierto = expandido === r.id;
            const tieneOrden = r.enfermedad_confirmada && r.estado !== 'pendiente';
            
            return (
              <article key={r.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {r.nombre_reporte || r.enfermedad_sospechosa || 'Reporte de síntomas'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.municipio || 'Sin municipio'} · {r.fecha_reporte?.slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCIA_STYLES[r.nivel_urgencia]}`}>
                        {r.nivel_urgencia}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${estado.badge}`}>
                        {estado.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mt-3 line-clamp-2">{r.sintomas}</p>

                  {(r.respuesta_admin || tieneOrden) && (
                    <button
                      onClick={() => setExpandido(abierto ? null : r.id)}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      {abierto ? 'Ocultar respuesta' : tieneOrden ? 'Ver orden de atención' : 'Ver respuesta del equipo de salud'}
                    </button>
                  )}
                </div>

                {abierto && tieneOrden && (
                  <div className="border-t border-gray-700 bg-gray-900 px-6 py-5 font-mono text-xs">
                    <div className="text-emerald-400 font-bold text-sm mb-2">
                      ORDEN DE ATENCIÓN — Vigilancia Tropical
                    </div>
                    <div className="text-gray-500 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    
                    <div className="space-y-1 text-gray-300 mb-3">
                      <p><span className="text-gray-500">Paciente:</span> {r.nombre_paciente || 'No especificado'}</p>
                      <p><span className="text-gray-500">Dirección:</span> {r.direccion ? `${r.direccion}${r.barrio ? `, ${r.barrio}` : ''}` : 'No especificada'}</p>
                      <p><span className="text-gray-500">Teléfono:</span> {r.telefono || 'No especificado'}</p>
                      <p><span className="text-gray-500">Municipio:</span> {r.municipio || 'No especificado'}</p>
                    </div>

                    <div className="text-gray-500 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    
                    <div className="space-y-1 text-gray-300 mb-3">
                      <p><span className="text-gray-500">Diagnóstico preliminar:</span> <span className="text-emerald-400 font-semibold">{r.enfermedad_confirmada}</span></p>
                      <p><span className="text-gray-500">Síntomas reportados:</span> {r.sintomas}</p>
                      <p><span className="text-gray-500">Nivel de urgencia:</span> <span className={`font-semibold ${r.nivel_urgencia === 'critico' ? 'text-red-400' : r.nivel_urgencia === 'urgente' ? 'text-yellow-400' : 'text-gray-400'}`}>{r.nivel_urgencia.toUpperCase()}</span></p>
                    </div>

                    <div className="text-gray-500 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    
                    <div className="text-gray-300 mb-3">
                      <p className="text-emerald-400 font-semibold mb-2">PLAN DE ATENCIÓN:</p>
                      <p className="mb-2">Se enviará un equipo de salud a su domicilio en {r.direccion || 'la dirección registrada'}{r.barrio ? `, ${r.barrio}` : ''}.</p>
                      <p className="mb-2"><span className="text-gray-500">Fecha estimada de atención:</span> <span className="text-white font-semibold">{formatearFecha(r.fecha_estimada_atencion)}</span></p>
                      {r.respuesta_admin && (
                        <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-700">
                          <p className="text-gray-400 text-xs mb-1">Instrucciones adicionales:</p>
                          <p className="text-gray-200">{r.respuesta_admin}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-gray-500 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    
                    <div className="text-gray-500 text-xs">
                      <p>Emitido por: Sistema Vigilancia Tropical — Chocó</p>
                      <p>Fecha: {formatearFecha(r.fecha_respuesta)}</p>
                      <p>Folio: <span className="text-emerald-400">VT-{r.id}</span></p>
                    </div>
                  </div>
                )}

                {abierto && r.respuesta_admin && !tieneOrden && (
                  <div className="border-t border-gray-700 bg-blue-900/10 px-4 py-3">
                    <p className="text-xs font-semibold text-blue-400 mb-1">
                      Respuesta del equipo de salud · {r.fecha_respuesta?.slice(0, 10)}
                    </p>
                    <p className="text-sm text-gray-300">{r.respuesta_admin}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
