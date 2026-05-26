import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil, actualizarPerfil } from '../api/api';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

export default function Perfil() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password_actual: '',
    password_nueva: '',
    password_confirmar: '',
  });

  useEffect(() => {
    getPerfil()
      .then((data) => {
        setPerfil(data);
        setForm((f) => ({ ...f, nombre: data.nombre, email: data.email }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y email son requeridos');
      return;
    }

    // Validar contraseñas si se quiere cambiar
    if (form.password_nueva) {
      if (!form.password_actual) {
        setError('Debes ingresar tu contraseña actual para cambiarla');
        return;
      }
      if (form.password_nueva.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (form.password_nueva !== form.password_confirmar) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }
    }

    setGuardando(true);
    try {
      const data = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
      };
      
      if (form.password_nueva) {
        data.password_actual = form.password_actual;
        data.password_nueva = form.password_nueva;
      }

      const response = await actualizarPerfil(data);
      
      // Actualizar token y usuario en el contexto
      login(response.token, response.user);
      
      setExito('Perfil actualizado correctamente');
      setPerfil(response.user);
      
      // Limpiar campos de contraseña
      setForm((f) => ({
        ...f,
        password_actual: '',
        password_nueva: '',
        password_confirmar: '',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Cargando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-white mb-2">Mi perfil</h1>
        <p className="text-gray-400 mb-8">Actualiza tu información personal</p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {exito && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3 mb-6">
            {exito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de cuenta */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Información de cuenta
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Rol:</span> {perfil?.rol === 'admin' ? 'Administrador' : 'Ciudadano'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">Miembro desde:</span>{' '}
                  {perfil?.fecha_registro ? new Date(perfil.fecha_registro).toLocaleDateString('es-CO') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
              Cambiar contraseña
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="password_actual" className="block text-sm font-medium text-gray-300 mb-1">
                  Contraseña actual
                </label>
                <input
                  id="password_actual"
                  name="password_actual"
                  type="password"
                  value={form.password_actual}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div>
                <label htmlFor="password_nueva" className="block text-sm font-medium text-gray-300 mb-1">
                  Nueva contraseña
                </label>
                <input
                  id="password_nueva"
                  name="password_nueva"
                  type="password"
                  value={form.password_nueva}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label htmlFor="password_confirmar" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="password_confirmar"
                  name="password_confirmar"
                  type="password"
                  value={form.password_confirmar}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Repetir nueva contraseña"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {guardando ? 'Guardando cambios...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}
