import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-red-400' : 'text-gray-300 hover:text-white'
  }`;

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg shrink-0">
          <VirusIcon />
          <span className="hidden sm:inline">
            Vigilancia <span className="text-red-400 italic">Tropical</span>
          </span>
        </Link>

        {/* Nav links — varían según estado de auth */}
        <nav aria-label="Navegación principal" className="flex-1">
          <ul className="hidden md:flex items-center gap-5">
            <li><NavLink to="/" end className={linkClass}>Inicio</NavLink></li>
            <li><NavLink to="/mapa" className={linkClass}>Mapa</NavLink></li>
            <li><NavLink to="/prediccion" className={linkClass}>Predicción</NavLink></li>
            <li><NavLink to="/enfermedades" className={linkClass}>Enfermedades</NavLink></li>
            <li><NavLink to="/chatbot" className={linkClass}>Asistente</NavLink></li>

            {isAuthenticated && !isAdmin && (
              <>
                <li><NavLink to="/dashboard" className={linkClass}>Mi panel</NavLink></li>
                <li><NavLink to="/reportar" className={linkClass}>Reportar</NavLink></li>
                <li><NavLink to="/mensajes" className={linkClass}>Mensajes</NavLink></li>
              </>
            )}

            {isAdmin && (
              <>
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `text-sm font-bold transition-colors ${isActive ? 'text-red-300' : 'text-red-400 hover:text-red-300'}`
                    }
                  >
                    Panel Admin
                  </NavLink>
                </li>
                <li><NavLink to="/admin/reportes" className={linkClass}>Reportes</NavLink></li>
                <li><NavLink to="/admin/mensajes" className={linkClass}>Mensajes</NavLink></li>
                <li><NavLink to="/admin/usuarios" className={linkClass}>Usuarios</NavLink></li>
              </>
            )}
          </ul>
        </nav>

        {/* Acciones de sesión */}
        <div className="flex items-center gap-2 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <span className="hidden sm:block text-sm text-gray-400 max-w-32 truncate">
                {user?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
