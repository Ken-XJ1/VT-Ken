import { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Iconos SVG
function HomeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function MapIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ChartIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function BookIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
    </svg>
  );
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ListIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function InboxIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#healthGradient)" opacity="0.2" />
      <circle cx="16" cy="16" r="12" fill="url(#healthGradient)" opacity="0.3" />
      <path d="M16 8v8m0 0v8m0-8h8m-8 0H8" stroke="url(#healthGradient)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function MainLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setSidebarOpen(false);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // Navegación principal (siempre visible)
  const publicLinks = [
    { to: '/', label: 'Inicio', icon: HomeIcon },
    { to: '/mapa', label: 'Mapa interactivo', icon: MapIcon },
    { to: '/prediccion', label: 'Predicción de riesgo', icon: ChartIcon },
    { to: '/enfermedades', label: 'Enfermedades', icon: BookIcon },
    { to: '/chatbot', label: 'Asistente', icon: ChatIcon },
  ];

  // Navegación de usuario autenticado
  const userLinks = [
    { to: '/dashboard', label: 'Mi panel', icon: DashboardIcon },
    { to: '/reportar', label: 'Reportar síntomas', icon: ClipboardIcon },
    { to: '/mis-reportes', label: 'Mis reportes', icon: ListIcon },
    { to: '/mensajes', label: 'Mensajes', icon: MailIcon, badge: 0 }, // TODO: implementar contador real
  ];

  // Navegación de admin
  const adminLinks = [
    { to: '/admin', label: 'Panel admin', icon: ChartIcon },
    { to: '/admin/reportes', label: 'Reportes', icon: DocumentIcon },
    { to: '/admin/mensajes', label: 'Mensajes', icon: InboxIcon },
    { to: '/admin/usuarios', label: 'Usuarios', icon: UsersIcon },
  ];

  // Función para obtener el color del avatar basado en el nombre
  function getAvatarColor(nombre) {
    const colors = [
      'bg-emerald-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    const index = nombre ? nombre.charCodeAt(0) % colors.length : 0;
    return colors[index];
  }

  return (
    <div className="flex h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 bg-[#0d1117] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo y marca */}
        <div className="px-6 py-5 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3" onClick={closeSidebar}>
            <HealthIcon />
            <div>
              <div className="text-base font-bold leading-tight">
                <span className="text-white">Vigilancia</span>{' '}
                <span className="text-emerald-400">Tropical</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Chocó, Colombia</div>
            </div>
          </Link>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {publicLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-3 border-l-emerald-500'
                        : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Navegación de usuario */}
          {isAuthenticated && !isAdmin && (
            <>
              <div className="mt-6 mb-3 px-3">
                <div className="h-px bg-gray-800 mb-2" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Mi cuenta
                </p>
              </div>
              <div className="space-y-1">
                {userLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-3 border-l-emerald-500'
                            : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      {link.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}

          {/* Navegación de admin */}
          {isAdmin && (
            <>
              <div className="mt-6 mb-3 px-3">
                <div className="h-px bg-gray-800 mb-2" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                  Administración
                </p>
              </div>
              <div className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/admin'}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-red-500/20 to-transparent text-red-400 border-l-3 border-l-red-500'
                            : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Usuario / Auth */}
        <div className="p-3 border-t border-gray-800">
          {!isAuthenticated ? (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeSidebar}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                onClick={closeSidebar}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                    user?.nombre
                  )}`}
                >
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1f2937] rounded-lg transition-colors text-left"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg transition-colors"
          aria-label="Abrir menú"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
