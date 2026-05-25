import { useEffect, useState } from 'react';
import { getEnfermedades } from '../api/api';

const DISEASE_STYLES = {
  Dengue: { border: 'border-red-500', accent: 'bg-red-500', badge: 'bg-red-900/40 text-red-300' },
  Malaria: { border: 'border-orange-500', accent: 'bg-orange-500', badge: 'bg-orange-900/40 text-orange-300' },
  Zika: { border: 'border-blue-500', accent: 'bg-blue-500', badge: 'bg-blue-900/40 text-blue-300' },
  Chikungunya: { border: 'border-green-500', accent: 'bg-green-500', badge: 'bg-green-900/40 text-green-300' },
};

function getStyle(nombre) {
  return DISEASE_STYLES[nombre] || DISEASE_STYLES.Dengue;
}

export default function Enfermedades() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEnfermedades()
      .then((data) => { setLista(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <main className="pt-16 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Fichas de enfermedades</h1>
        <p className="text-gray-400">
          Referencia de vigilancia epidemiológica para dengue, malaria, zika y chikungunya
          en el Pacífico colombiano.
        </p>
      </div>

      <div className="px-4 pb-12 max-w-7xl mx-auto">
        {loading && (
          <p className="text-gray-400 animate-pulse">Cargando fichas…</p>
        )}
        {error && (
          <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>
        )}

        {/* Grid: 2 cols desktop, 1 col mobile */}
        <div className="grid md:grid-cols-2 gap-6">
          {lista.map((e) => {
            const style = getStyle(e.nombre);
            return (
              <article
                key={e.id}
                className={`bg-gray-800 rounded-xl border ${style.border} shadow-lg overflow-hidden`}
              >
                {/* Color bar */}
                <div className={`h-1.5 w-full ${style.accent}`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-white">{e.nombre}</h2>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${style.badge}`}>
                      Enfermedad tropical
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-5">{e.descripcion}</p>

                  {/* Blocks */}
                  <div className="space-y-4">
                    {[
                      { title: 'Síntomas', content: e.sintomas },
                      { title: 'Transmisión', content: e.transmision },
                      { title: 'Prevención', content: e.prevencion },
                    ].map((block) => (
                      <div key={block.title}>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                          {block.title}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{block.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
