import { NavLink, Link } from 'react-router-dom';

function VirusIcon() {
  return (
    <svg
      className="w-7 h-7 text-red-500"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      <circle cx="16" cy="4" r="2.5" fill="currentColor" />
      <circle cx="16" cy="28" r="2.5" fill="currentColor" />
      <circle cx="4" cy="16" r="2.5" fill="currentColor" />
      <circle cx="28" cy="16" r="2.5" fill="currentColor" />
      <circle cx="7.5" cy="7.5" r="2" fill="currentColor" />
      <circle cx="24.5" cy="7.5" r="2" fill="currentColor" />
      <circle cx="7.5" cy="24.5" r="2" fill="currentColor" />
      <circle cx="24.5" cy="24.5" r="2" fill="currentColor" />
      <line x1="16" y1="10" x2="16" y2="6.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="22" x2="16" y2="25.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="10" y1="16" x2="6.5" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="22" y1="16" x2="25.5" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9.3" y1="9.3" x2="7.8" y2="7.8" stroke="currentColor" strokeWidth="1" />
      <line x1="22.7" y1="9.3" x2="24.2" y2="7.8" stroke="currentColor" strokeWidth="1" />
      <line x1="9.3" y1="22.7" x2="7.8" y2="24.2" stroke="currentColor" strokeWidth="1" />
      <line x1="22.7" y1="22.7" x2="24.2" y2="24.2" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-red-400' : 'text-gray-300 hover:text-white'
  }`;

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <VirusIcon />
          <span>
            Vigilancia <span className="text-red-400 italic">Tropical</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav aria-label="Navegación principal">
          <ul className="hidden md:flex items-center gap-6">
            <li><NavLink to="/" end className={navLinkClass}>Inicio</NavLink></li>
            <li><NavLink to="/mapa" className={navLinkClass}>Mapa</NavLink></li>
            <li><NavLink to="/prediccion" className={navLinkClass}>Predicción</NavLink></li>
            <li><NavLink to="/enfermedades" className={navLinkClass}>Enfermedades</NavLink></li>
          </ul>
        </nav>

        {/* Badge + CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
            Chocó, Colombia
          </span>
          <Link
            to="/mapa"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ver mapa
          </Link>
        </div>
      </div>
    </header>
  );
}
