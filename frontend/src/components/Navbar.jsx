import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VirusIcon() {
  return (
    <svg
      className="w-7 h-7 text-emerald-500"
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
    isActive ? 'text-emerald-400' : 'text-[#9ca3af] hover:text-[#f9fafb]'
  }`;

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg shrink-0">
          <VirusIcon />
          <span className="hidden sm:inline">
            Vigilancia <span className="text-emerald-400 italic">Tropical</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Navegación principal" className="hidden md:flex flex-1">
          <ul className="flex items-center gap-5">
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#9ca3af] hover:text-[#f9fafb] transition-colors px-3 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-[#9ca3af] max-w-32 truncate">
                {user?.nombre}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-[#9ca3af] hover:text-[#f9fafb] border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#f9fafb] p-2"
          aria-label="Menú"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-md">
          <nav className="px-4 py-4 space-y-2">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Inicio</NavLink>
            <NavLink to="/mapa" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Mapa</NavLink>
            <NavLink to="/prediccion" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Predicción</NavLink>
            <NavLink to="/enfermedades" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Enfermedades</NavLink>
            <NavLink to="/chatbot" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Asistente</NavLink>
            
            {isAuthenticated && !isAdmin && (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Mi panel</NavLink>
                <NavLink to="/reportar" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Reportar</NavLink>
                <NavLink to="/mensajes" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Mensajes</NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-red-400 font-bold">Panel Admin</NavLink>
                <NavLink to="/admin/reportes" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Reportes</NavLink>
                <NavLink to="/admin/mensajes" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Mensajes</NavLink>
                <NavLink to="/admin/usuarios" onClick={() => setMobileOpen(false)} className="block py-2 text-[#9ca3af] hover:text-[#f9fafb]">Usuarios</NavLink>
              </>
            )}

            {!isAuthenticated ? (
              <div className="pt-4 space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-center border border-gray-600 rounded-lg text-[#f9fafb]">
                  Iniciar sesión
                </Link>
                <Link to="/registro" onClick={() => setMobileOpen(false)} className="block py-2 text-center bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white font-medium">
                  Registrarse
                </Link>
              </div>
            ) : (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full py-2 text-left text-[#9ca3af] hover:text-[#f9fafb] mt-4"
              >
                Cerrar sesión
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
