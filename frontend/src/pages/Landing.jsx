import { Link } from 'react-router-dom';
import './Landing.css';

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

export default function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-badge">Chocó, Colombia</span>
            <h1>
              Monitoreo epidemiológico de <em>enfermedades tropicales</em>
            </h1>
            <p className="hero-lead">
              Vigilancia en tiempo real para dengue, malaria, zika y chikungunya en
              Quibdó e Istmina. Datos SIVIGILA, clima y predicción de riesgo.
            </p>
            <div className="hero-actions">
              <Link to="/mapa" className="btn btn-primary">
                Ver mapa de brotes
              </Link>
              <Link to="/prediccion" className="btn btn-outline">
                Indicador de riesgo
              </Link>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-value">4</span>
              <span className="stat-label">Enfermedades vigiladas</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">2</span>
              <span className="stat-label">Municipios monitoreados</span>
            </div>
            <div className="stat-card stat-highlight">
              <span className="stat-value">85%</span>
              <span className="stat-label">Precisión del modelo</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Actualización continua</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Herramientas de vigilancia</h2>
            <p>
              Explora brotes, predicciones y fichas para la toma de decisiones en
              salud pública.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <Link key={f.to} to={f.to} className="feature-card">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section municipios-section">
        <div className="container">
          <div className="section-header">
            <h2>Municipios en vigilancia</h2>
            <p>Cobertura epidemiológica en el Pacífico colombiano.</p>
          </div>
          <div className="municipios-grid">
            {MUNICIPIOS.map((m) => (
              <article key={m.name} className="municipio-card">
                <h3>{m.name}</h3>
                <p className="municipio-pop">{m.pop}</p>
                <p className="municipio-desc">{m.desc}</p>
                <span className="municipio-coords">{m.coords}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-box">
          <h2>¿Listo para explorar los datos?</h2>
          <p>Accede al mapa interactivo y las predicciones de riesgo actualizadas.</p>
          <Link to="/mapa" className="btn btn-primary">
            Abrir mapa epidemiológico
          </Link>
        </div>
      </section>
    </main>
  );
}
