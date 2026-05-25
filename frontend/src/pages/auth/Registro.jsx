import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registro as apiRegistro } from '../../api/api';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await apiRegistro({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      });
      setExito(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mb-6">Regístrate para reportar síntomas y recibir alertas</p>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {exito && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3 mb-4">
              Cuenta creada exitosamente. Inicia sesión para continuar.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                autoComplete="name"
                value={form.nombre}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmar" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmar"
                  name="confirmar"
                  type={showConfirmar ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirmar}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmar ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || exito}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando cuenta...' : exito ? 'Redirigiendo...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
