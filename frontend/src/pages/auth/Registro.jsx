import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registro as apiRegistro } from '../../api/api';

export default function Registro() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const data = await apiRegistro({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      });
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mb-6">Regístrate para reportar síntomas y recibir alertas</p>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
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
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="confirmar" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmar"
                name="confirmar"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmar}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Repite tu contraseña"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
