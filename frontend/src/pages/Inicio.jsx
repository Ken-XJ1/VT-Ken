import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Mapa interactivo',
    desc: 'Brotes georreferenciados con filtros por municipio y enfermedad en el Chocó.',
    to: '/mapa',
  },
  {
    icon: '📊',
    title: 'Predicción de riesgo',
    desc: 'Probabilidad por enfermedad y panel climático integrado al modelo.',
    to: '/prediccion',
  },
  {
    icon: '🦟',
    title: 'Fichas clínicas',
    desc: 'Síntomas, transmisión y prevención de dengue, malaria, zika y chikungunya.',
    to: '/enfermedades',
  },
];

const STATS = [
  { valor: '4', etiqueta: 'Enfermedades vigiladas' },
  { valor: '2', etiqueta: 'Municipios monitoreados' },
  { valor: '85%', etiqueta: 'Precisión del modelo', descripcion: 'Modelo predictivo basado en datos SIVIGILA y clima' },
  { valor: '24/7', etiqueta: 'Actualización continua' },
];

const MUNICIPIOS = [
  {
    name: 'Quibdó',
    pop: '129.237 hab.',
    desc: 'Capital del Chocó. Mayor carga de dengue en época de lluvias.',
    coords: '5.69°N, 76.66°W',
  },
  {
    name: 'Istmina',
    pop: '14.396 hab.',
    desc: 'Municipio del medio San Juan. Riesgo elevado de malaria en zonas mineras.',
    coords: '5.16°N, 76.69°W',
  },
];

export default function Inicio() {
  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700 mb-4">
              Chocó, Colombia
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Monitoreo epidemiológico de{' '}
              <em className="text-red-400 not-italic">enfermedades tropicales</em>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Vigilancia en tiempo real para dengue, malaria, zika y chikungunya en
              Quibdó e Istmina. Datos SIVIGILA, clima y predicción de riesgo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/mapa"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Ver mapa de brotes
              </Link>
              <Link
                to="/prediccion"
                className="border border-gray-500 hover:border-gray-300 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Indicador de riesgo
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <StatCard key={s.etiqueta} valor={s.valor} etiqueta={s.etiqueta} descripcion={s.descripcion} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Herramientas de vigilancia</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Explora brotes, predicciones y fichas para la toma de decisiones en salud pública.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-red-600 rounded-xl p-6 transition-all group"
              >
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Municipios */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Municipios en vigilancia</h2>
            <p className="text-gray-400">Cobertura epidemiológica en el Pacífico colombiano.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {MUNICIPIOS.map((m) => (
              <article key={m.name} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                <p className="text-red-400 text-sm font-medium mb-3">{m.pop}</p>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{m.desc}</p>
                <span className="text-xs text-gray-500 font-mono">{m.coords}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center bg-gray-800 rounded-2xl p-10 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-3">¿Listo para explorar los datos?</h2>
          <p className="text-gray-400 mb-6">
            Accede al mapa interactivo y las predicciones de riesgo actualizadas.
          </p>
          <Link
            to="/mapa"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-block"
          >
            Abrir mapa epidemiológico
          </Link>
        </div>
      </section>
    </main>
  );
}
