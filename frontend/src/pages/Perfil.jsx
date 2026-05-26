import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil, actualizarPerfil, getMunicipios } from '../api/api';
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
  const [municipios, setMunicipios] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',
    barrio: '',
    municipio_id: '',
    ocupacion: '',
    password_actual: '',
    password_nueva: '',
    password_confirmar: '',
  });

  useEffect(() => {
    Promise.all([getPerfil(), getMunicipios()])
      .then(([perfilData, municipiosData]) => {
        setPerfil(perfilData);
        setMunicipios(municipiosData);
        setForm((f) => ({
          ...f,
          nombre: perfilData.nombre || '',
          apellido: perfilData.apellido || '',
          email: perfilData.email || '',
          telefono: perfilData.telefono || '',
          fecha_nacimiento: perfilData.fecha_nacimiento || '',
          genero: perfilData.genero || '',
          direccion: perfilData.direccion || '',
          barrio: perfilData.barrio || '',
          municipio_id: perfilData.municipio_id || '',
          ocupacion: perfilData.ocupacion || '',
        }));
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
        apellido: form.apellido.trim() || null,
        email: form.email.trim(),
        telefono: form.telefono.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        genero: form.genero || null,
        direccion: form.direccion.trim() || null,
        barrio: form.barrio.trim() || null,
        municipio_id: form.municipio_id ? parseInt(form.municipio_id) : null,
        ocupacion: form.ocupacion.trim() || null,
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

  // Calcular edad si hay fecha de nacimiento
  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Cargando perfil...</p>
      </main>
    );
  }

  const edad = perfil?.fecha_nacimiento ? calcularEdad(perfil.fecha_nacimiento) : null;

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton />
        
        {/* Header del perfil */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
              {perfil?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {perfil?.nombre} {perfil?.apellido}
              </h1>
              <p className="text-gray-400">
                {perfil?.rol === 'admin' ? 'Administrador' : 'Ciudadano'} · {perfil?.email}
              </p>
              {edad && (
                <p className="text-gray-500 text-sm mt-1">{edad} años</p>
              )}
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Miembro desde {perfil?.fecha_registro ? new Date(perfil.fecha_registro).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </p>
        </div>

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
          {/* Información Personal */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <UserIcon />
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre
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
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-300 mb-1">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-300 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label htmlFor="genero" className="block text-sm font-medium text-gray-300 mb-1">
                  Género
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="ocupacion" className="block text-sm font-medium text-gray-300 mb-1">
                  Ocupación
                </label>
                <input
                  id="ocupacion"
                  name="ocupacion"
                  type="text"
                  value={form.ocupacion}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Ej: Estudiante, Docente, Comerciante"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <PhoneIcon />
              Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="3001234567"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <LocationIcon />
              Ubicación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="municipio_id" className="block text-sm font-medium text-gray-300 mb-1">
                  Municipio
                </label>
                <select
                  id="municipio_id"
                  name="municipio_id"
                  value={form.municipio_id}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="">Seleccionar municipio</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="barrio" className="block text-sm font-medium text-gray-300 mb-1">
                  Barrio / Vereda
                </label>
                <input
                  id="barrio"
                  name="barrio"
                  type="text"
                  value={form.barrio}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Nombre del barrio"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-300 mb-1">
                  Dirección
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={form.direccion}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Calle, carrera, número"
                />
              </div>
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
              <LockIcon />
              Cambiar contraseña
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Actual"
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
                  Confirmar nueva
                </label>
                <input
                  id="password_confirmar"
                  name="password_confirmar"
                  type="password"
                  value={form.password_confirmar}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Repetir"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Deja estos campos en blanco si no deseas cambiar tu contraseña
            </p>
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

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
