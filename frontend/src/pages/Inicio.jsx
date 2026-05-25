import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';

const FEATURES = [
  {
    title: 'Mapa interactivo',
    desc: 'Brotes georreferenciados con filtros por municipio y enfermedad en el Chocó.',
    to: '/mapa',
  },
  {
    title: 'Predicción de riesgo',
    desc: 'Probabilidad por enfermedad y panel climático integrado al modelo.',
    to: '/prediccion',
  },
  {
    title: 'Fichas clínicas',
    desc: 'Síntomas, transmisión y prevención de dengue, malaria, zika y chikungunya.',
    to: '/enfermedades',
  },
  {
    title: 'Asistente de síntomas',
    desc: 'Orientación basada en árbol de decisiones para identificar posibles enfermedades.',
    to: '/chatbot',
  },
];

const STATS = [
  { valor: '4', etiqueta: 'Enfermedades vigiladas' },
  { valor: '2', etiqueta: 'Municipios monitoreados' },
  { valor: '85%', etiqueta: 'Precisión del modelo' },
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

const PASOS = [
  { num: 1, titulo: 'Reporta síntomas', desc: 'Ciudadanos envían reportes de síntomas sospechosos' },
  { num: 2, titulo: 'Análisis predictivo', desc: 'El sistema analiza datos climáticos y epidemiológicos' },
  { num: 3, titulo: 'Alertas tempranas', desc: 'Generamos alertas de riesgo para prevenir brotes' },
];

export default function Inicio() {
  return (
    <main className="pt-16 bg-[#0a0f1e]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900/20 via-transparent to-blue-900/20 py-20 sm:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-700 mb-4">
              Chocó, Colombia
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#f9fafb] leading-tight tracking-tight mb-4">
              Monitoreo epidemiológico de{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                enfermedades tropicales
              </span>
            </h1>
            <p className="text-[#9ca3af] text-lg mb-8 leading-relaxed">
              Vigilancia en tiempo real para dengue, malaria, zika y chikungunya en
              Quibdó e Istmina. Datos SIVIGILA, clima y predicción de riesgo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/mapa"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20"
              >
                Ver mapa de brotes
              </Link>
              <Link
                to="/prediccion"
                className="border-2 border-[#3b82f6] hover:bg-[#3b82f6]/10 text-[#3b82f6] font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Indicador de riesgo
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <StatCard key={s.etiqueta} valor={s.valor} etiqueta={s.etiqueta} />
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16 px-4 bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f9fafb] tracking-tight mb-3">
              ¿Cómo funciona?
            </h2>
            <p className="text-[#9ca3af] max-w-2xl mx-auto">
              Sistema integrado de vigilancia epidemiológica con análisis predictivo
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PASOS.map((p) => (
              <div key={p.num} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  {p.num}
                </div>
                <h3 className="text-lg font-semibold text-[#f9fafb] mb-2">{p.titulo}</h3>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-[#111827]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f9fafb] tracking-tight mb-3">
              Herramientas de vigilancia
            </h2>
            <p className="text-[#9ca3af] max-w-xl mx-auto">
              Explora brotes, predicciones y fichas para la toma de decisiones en salud pública.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className="bg-[#1f2937] hover:bg-[#374151] border border-[#374151] hover:border-emerald-500 rounded-xl p-6 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group"
              >
                <h3 className="text-lg font-semibold text-[#f9fafb] mb-2 group-hover:text-emerald-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Municipios */}
      <section className="py-16 px-4 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f9fafb] tracking-tight mb-3">
              Municipios en vigilancia
            </h2>
            <p className="text-[#9ca3af]">Cobertura epidemiológica en el Pacífico colombiano.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {MUNICIPIOS.map((m) => (
              <article key={m.name} className="bg-[#111827] rounded-xl p-6 border border-[#1f2937] hover:border-emerald-500/50 transition-all">
                <h3 className="text-xl font-bold text-[#f9fafb] mb-1">{m.name}</h3>
                <p className="text-emerald-400 text-sm font-medium mb-3">{m.pop}</p>
                <p className="text-[#9ca3af] text-sm mb-4 leading-relaxed">{m.desc}</p>
                <span className="text-xs text-[#6b7280] font-mono">{m.coords}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#111827]">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-2xl p-10 border border-emerald-700/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f9fafb] tracking-tight mb-3">
            ¿Listo para explorar los datos?
          </h2>
          <p className="text-[#9ca3af] mb-6">
            Accede al mapa interactivo y las predicciones de riesgo actualizadas.
          </p>
          <Link
            to="/mapa"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-all inline-block transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30"
          >
            Abrir mapa epidemiológico
          </Link>
        </div>
      </section>
    </main>
  );
}
