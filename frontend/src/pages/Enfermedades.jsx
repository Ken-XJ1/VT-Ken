import { useEffect, useState } from 'react';
import { getEnfermedades } from '../api/api';

const DISEASE_STYLES = {
  Dengue: { 
    border: 'border-red-500', 
    accent: 'bg-red-500', 
    badge: 'bg-red-900/40 text-red-300',
    gradient: 'from-red-900/20 to-transparent',
    icon: '🦟'
  },
  Malaria: { 
    border: 'border-orange-500', 
    accent: 'bg-orange-500', 
    badge: 'bg-orange-900/40 text-orange-300',
    gradient: 'from-orange-900/20 to-transparent',
    icon: '🦟'
  },
  Zika: { 
    border: 'border-blue-500', 
    accent: 'bg-blue-500', 
    badge: 'bg-blue-900/40 text-blue-300',
    gradient: 'from-blue-900/20 to-transparent',
    icon: '🦟'
  },
  Chikungunya: { 
    border: 'border-green-500', 
    accent: 'bg-green-500', 
    badge: 'bg-green-900/40 text-green-300',
    gradient: 'from-green-900/20 to-transparent',
    icon: '🦟'
  },
};

// Información adicional por enfermedad
const DISEASE_EXTRA_INFO = {
  Dengue: {
    periodo_incubacion: '4-10 días',
    duracion: '2-7 días (fase aguda)',
    gravedad: 'Puede ser mortal en casos graves (dengue hemorrágico)',
    poblacion_riesgo: 'Todas las edades, especialmente niños y adultos mayores',
    diagnostico: 'Prueba NS1, IgM/IgG, PCR',
    tratamiento: 'No hay tratamiento específico. Hidratación, reposo, paracetamol. NO usar aspirina.',
    complicaciones: 'Dengue grave: shock, hemorragias, fallo orgánico',
    estadisticas: 'Principal enfermedad viral transmitida por mosquitos en el Chocó',
  },
  Malaria: {
    periodo_incubacion: '7-30 días (varía según especie)',
    duracion: 'Variable, puede ser crónica sin tratamiento',
    gravedad: 'Potencialmente mortal, especialmente P. falciparum',
    poblacion_riesgo: 'Zonas rurales, mineros, comunidades ribereñas',
    diagnostico: 'Gota gruesa, extendido de sangre, prueba rápida',
    tratamiento: 'Antimaláricos específicos según especie (cloroquina, primaquina, artemisina)',
    complicaciones: 'Malaria cerebral, anemia severa, insuficiencia renal',
    estadisticas: 'Endémica en zonas mineras y rurales del Chocó',
  },
  Zika: {
    periodo_incubacion: '3-12 días',
    duracion: '2-7 días (síntomas leves)',
    gravedad: 'Generalmente leve, riesgo en embarazadas',
    poblacion_riesgo: 'Mujeres embarazadas (riesgo de microcefalia fetal)',
    diagnostico: 'PCR, serología IgM',
    tratamiento: 'Sintomático: reposo, hidratación, analgésicos',
    complicaciones: 'Microcefalia en bebés, síndrome de Guillain-Barré',
    estadisticas: 'Casos esporádicos desde 2015 en el Pacífico',
  },
  Chikungunya: {
    periodo_incubacion: '3-7 días',
    duracion: 'Fase aguda 3-10 días, artralgias pueden durar meses',
    gravedad: 'Raramente mortal, pero muy debilitante',
    poblacion_riesgo: 'Todas las edades, mayor impacto en adultos',
    diagnostico: 'PCR, serología IgM/IgG',
    tratamiento: 'Sintomático: analgésicos, antiinflamatorios, fisioterapia',
    complicaciones: 'Artritis crónica, dolor articular prolongado',
    estadisticas: 'Brotes cíclicos en áreas urbanas del Chocó',
  },
};

function getStyle(nombre) {
  return DISEASE_STYLES[nombre] || DISEASE_STYLES.Dengue;
}

function getExtraInfo(nombre) {
  return DISEASE_EXTRA_INFO[nombre] || {};
}

// Iconos SVG
function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function BeakerIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

export default function Enfermedades() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enfermedadSeleccionada, setEnfermedadSeleccionada] = useState(null);

  useEffect(() => {
    getEnfermedades()
      .then((data) => { 
        setLista(data); 
        setLoading(false); 
      })
      .catch((e) => { 
        setError(e.message); 
        setLoading(false); 
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-900/30 via-gray-900 to-blue-900/30 border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative px-4 py-12 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enfermedades Tropicales
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Información epidemiológica completa sobre las principales enfermedades transmitidas por vectores en el Pacífico colombiano
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-emerald-400 text-xl">🦟</span>
                <span className="text-gray-300">Transmisión vectorial</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-emerald-400 text-xl">🏥</span>
                <span className="text-gray-300">Vigilancia activa</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-emerald-400 text-xl">📊</span>
                <span className="text-gray-300">Datos actualizados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 max-w-7xl mx-auto">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-gray-400 mt-4">Cargando información...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl px-6 py-4 flex items-start gap-3">
            <AlertIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">Error al cargar información</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Grid de enfermedades */}
        <div className="grid lg:grid-cols-2 gap-8">
          {lista.map((e) => {
            const style = getStyle(e.nombre);
            const extra = getExtraInfo(e.nombre);
            const isSelected = enfermedadSeleccionada === e.id;
            
            return (
              <article
                key={e.id}
                className={`bg-gray-800 rounded-2xl border-2 ${style.border} shadow-xl overflow-hidden transition-all duration-300 ${
                  isSelected ? 'ring-4 ring-offset-4 ring-offset-gray-900' : ''
                }`}
              >
                {/* Header con gradiente */}
                <div className={`bg-gradient-to-r ${style.gradient} p-6 border-b border-gray-700`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{style.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{e.nombre}</h2>
                        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mt-2 ${style.badge}`}>
                          Enfermedad tropical
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Descripción general */}
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-emerald-400 rounded-full"></span>
                      Descripción general
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{e.descripcion}</p>
                  </div>

                  {/* Información clave en grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-4 h-4 text-blue-400" />
                        <p className="text-xs font-semibold text-gray-400 uppercase">Incubación</p>
                      </div>
                      <p className="text-white font-medium text-sm">{extra.periodo_incubacion}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-4 h-4 text-purple-400" />
                        <p className="text-xs font-semibold text-gray-400 uppercase">Duración</p>
                      </div>
                      <p className="text-white font-medium text-sm">{extra.duracion}</p>
                    </div>
                  </div>

                  {/* Síntomas */}
                  <div className="bg-red-900/10 rounded-lg p-4 border border-red-900/30">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <AlertIcon className="w-4 h-4" />
                      Síntomas principales
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{e.sintomas}</p>
                  </div>

                  {/* Transmisión */}
                  <div className="bg-orange-900/10 rounded-lg p-4 border border-orange-900/30">
                    <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">
                      🦟 Transmisión
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{e.transmision}</p>
                  </div>

                  {/* Prevención */}
                  <div className="bg-green-900/10 rounded-lg p-4 border border-green-900/30">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <HeartIcon className="w-4 h-4" />
                      Prevención
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{e.prevencion}</p>
                  </div>

                  {/* Botón expandir */}
                  <button
                    onClick={() => setEnfermedadSeleccionada(isSelected ? null : e.id)}
                    className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                      isSelected
                        ? 'bg-gray-700 text-white'
                        : `${style.accent} text-white hover:opacity-90`
                    }`}
                  >
                    {isSelected ? 'Ver menos información ▲' : 'Ver información completa ▼'}
                  </button>

                  {/* Información expandida */}
                  {isSelected && (
                    <div className="space-y-4 pt-4 border-t border-gray-700 animate-fadeIn">
                      <div className="grid md:grid-cols-2 gap-4">
                        <InfoBlock
                          icon={<AlertIcon className="w-4 h-4" />}
                          title="Gravedad"
                          content={extra.gravedad}
                          color="text-red-400"
                        />
                        <InfoBlock
                          icon={<span className="text-sm">👥</span>}
                          title="Población en riesgo"
                          content={extra.poblacion_riesgo}
                          color="text-yellow-400"
                        />
                        <InfoBlock
                          icon={<BeakerIcon className="w-4 h-4" />}
                          title="Diagnóstico"
                          content={extra.diagnostico}
                          color="text-blue-400"
                        />
                        <InfoBlock
                          icon={<HeartIcon className="w-4 h-4" />}
                          title="Tratamiento"
                          content={extra.tratamiento}
                          color="text-green-400"
                        />
                      </div>

                      <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700">
                        <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
                          ⚠️ Complicaciones posibles
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">{extra.complicaciones}</p>
                      </div>

                      <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-900/30">
                        <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">
                          📊 Contexto epidemiológico - Chocó
                        </h5>
                        <p className="text-gray-300 text-sm leading-relaxed">{extra.estadisticas}</p>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-900/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recomendaciones generales</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl mb-2">🏥</div>
              <h3 className="text-white font-semibold">Atención médica</h3>
              <p className="text-gray-400 text-sm">
                Ante cualquier síntoma, acude inmediatamente al centro de salud más cercano. El diagnóstico temprano salva vidas.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl mb-2">🦟</div>
              <h3 className="text-white font-semibold">Control de vectores</h3>
              <p className="text-gray-400 text-sm">
                Elimina criaderos de agua estancada, usa mosquiteros y repelente. La prevención es la mejor estrategia.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="text-white font-semibold">Reporta casos</h3>
              <p className="text-gray-400 text-sm">
                Usa nuestro sistema para reportar síntomas. Tu información ayuda a la vigilancia epidemiológica del Chocó.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Componente auxiliar para bloques de información
function InfoBlock({ icon, title, content, color }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <h5 className="text-xs font-semibold text-gray-400 uppercase">{title}</h5>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
