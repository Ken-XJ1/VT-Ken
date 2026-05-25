import { useCallback, useEffect, useMemo, useState } from 'react';
import { getClima, getMunicipios, getPrediccion } from '../api/api';
import Gauge from '../components/Gauge';
import RiskCard from '../components/RiskCard';

function nivelScore(nivel) {
  return { bajo: 1, medio: 2, alto: 3, critico: 4 }[nivel] || 1;
}

export default function Prediccion() {
  const [municipios, setMunicipios] = useState([]);
  const [municipioId, setMunicipioId] = useState('');
  const [predicciones, setPredicciones] = useState([]);
  const [clima, setClima] = useState([]);
  const [meta, setMeta] = useState({ municipio: '', fecha: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMunicipios()
      .then((data) => {
        setMunicipios(data);
        if (data.length) setMunicipioId(String(data[0].id));
      })
      .catch((e) => setError(e.message));
  }, []);

  const loadData = useCallback(() => {
    if (!municipioId) return;
    setLoading(true);
    setError('');
    Promise.all([getPrediccion(municipioId), getClima(municipioId)])
      .then(([predData, climaData]) => {
        const preds = predData.predicciones || [];
        setPredicciones(preds);
        setClima(climaData);
        if (preds.length) {
          setMeta({ municipio: preds[0].municipio, fecha: preds[0].fecha_prediccion });
        }
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [municipioId]);

  useEffect(() => { loadData(); }, [loadData]);

  const { promedio, nivelDominante } = useMemo(() => {
    if (!predicciones.length) return { promedio: 0, nivelDominante: 'bajo' };
    const prom = predicciones.reduce((s, p) => s + p.probabilidad, 0) / predicciones.length;
    const nivel = predicciones.reduce(
      (best, p) => (nivelScore(p.nivel_riesgo) > nivelScore(best) ? p.nivel_riesgo : best),
      predicciones[0].nivel_riesgo
    );
    return { promedio: prom, nivelDominante: nivel };
  }, [predicciones]);

  const climaResumen = useMemo(() => {
    if (!clima.length) return null;
    const ultimo = clima[0];
    const slice7 = clima.slice(0, 7);
    const promTemp = slice7.reduce((s, r) => s + r.temperatura, 0) / slice7.length;
    const promHum = slice7.reduce((s, r) => s + r.humedad, 0) / slice7.length;
    const sumPrecip = slice7.reduce((s, r) => s + r.precipitacion, 0);
    return { ultimo, promTemp, promHum, sumPrecip };
  }, [clima]);

  return (
    <main className="pt-16 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Predicción de riesgo</h1>
        <p className="text-gray-400">
          Probabilidad de brotes por enfermedad y condiciones climáticas recientes.
        </p>
      </div>

      {/* Municipio selector */}
      <div className="px-4 pb-6 max-w-7xl mx-auto">
        <label htmlFor="pred-municipio" className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1">
          Municipio
        </label>
        <select
          id="pred-municipio"
          value={municipioId}
          onChange={(e) => setMunicipioId(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
        >
          {municipios.map((m) => (
            <option key={m.id} value={String(m.id)}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="px-4 max-w-7xl mx-auto">
          <p className="text-gray-400 animate-pulse">Cargando predicciones…</p>
        </div>
      )}
      {error && (
        <div className="px-4 max-w-7xl mx-auto">
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="px-4 pb-8 max-w-7xl mx-auto space-y-6">
          {/* Dashboard row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gauge panel */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Riesgo global
              </h3>
              <Gauge porcentaje={promedio} nivel={nivelDominante} />
              <p className="text-xs text-gray-500 mt-4 text-center">
                {meta.municipio} · {meta.fecha}
              </p>
            </div>

            {/* Risk cards */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Por enfermedad
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {predicciones.map((p) => (
                  <RiskCard key={p.id} item={p} />
                ))}
              </div>
            </div>
          </div>

          {/* Climate panel */}
          {climaResumen && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Clima reciente
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Temperatura, humedad y precipitación — variables asociadas a vectores.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { valor: `${climaResumen.ultimo.temperatura}°`, label: 'Temp. hoy' },
                  { valor: `${climaResumen.ultimo.humedad}%`, label: 'Humedad hoy' },
                  { valor: `${climaResumen.ultimo.precipitacion} mm`, label: 'Precip. hoy' },
                  { valor: `${climaResumen.promTemp.toFixed(1)}°`, label: 'Temp. prom. (7d)' },
                  { valor: `${climaResumen.promHum.toFixed(0)}%`, label: 'Humedad prom.' },
                  { valor: `${climaResumen.sumPrecip.toFixed(1)} mm`, label: 'Acum. (7d)' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-900 rounded-lg p-4 text-center">
                    <span className="block text-2xl font-bold text-white">{item.valor}</span>
                    <span className="block text-xs text-gray-400 mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
