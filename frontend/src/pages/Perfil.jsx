import { useEffect, useState } from 'react';
import { getPerfil, actualizarPerfil, actualizarEmail, actualizarPassword, getMunicipios } from '../api/api';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

function formatFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-componentes de UI
// ---------------------------------------------------------------------------

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700 bg-gray-800/80">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-gray-700/50 last:border-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-gray-200">{value || <span className="text-gray-600 italic">Sin registrar</span>}</span>
    </div>
  );
}

function Alert({ type, message, onClose }) {
  if (!message) return null;
  const styles = {
    error: 'bg-red-900/30 border-red-700 text-red-300',
    success: 'bg-green-900/30 border-green-700 text-green-300',
  };
  return (
    <div className={`flex items-start justify-between gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <XIcon />
        </button>
      )}
    </div>
  );
}

function FieldGroup({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, id, children, span2 }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label htmlFor={id} className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-colors placeholder-gray-600';

const selectClass =
  'w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-colors';

function SaveButton({ loading, label = 'Guardar cambios' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
    >
      {loading ? 'Guardando...' : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sección: Resumen del perfil (solo lectura)
// ---------------------------------------------------------------------------

function ResumenPerfil({ perfil }) {
  const edad = calcularEdad(perfil?.fecha_nacimiento);
  const inicial = perfil?.nombre?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shrink-0 select-none">
          {inicial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">
            {perfil?.nombre} {perfil?.apellido}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{perfil?.email}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-gray-700 px-2.5 py-1 rounded-full">
              <ShieldIcon />
              {perfil?.rol === 'admin' ? 'Administrador' : 'Ciudadano'}
            </span>
            {edad !== null && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-gray-700 px-2.5 py-1 rounded-full">
                <CalendarIcon />
                {edad} años
              </span>
            )}
            {perfil?.municipio_nombre && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 bg-gray-700 px-2.5 py-1 rounded-full">
                <LocationIcon />
                {perfil.municipio_nombre}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500">Miembro desde</p>
          <p className="text-sm text-gray-300 mt-0.5">{formatFecha(perfil?.fecha_registro)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <InfoRow label="Teléfono" value={perfil?.telefono} />
        <InfoRow label="Ocupación" value={perfil?.ocupacion} />
        <InfoRow label="Género" value={perfil?.genero} />
        <InfoRow label="Barrio / Vereda" value={perfil?.barrio} />
        <InfoRow label="Dirección" value={perfil?.direccion} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sección: Editar información personal
// ---------------------------------------------------------------------------

function EditarInfoPersonal({ perfil, municipios, onUpdate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    nombre: perfil?.nombre || '',
    apellido: perfil?.apellido || '',
    telefono: perfil?.telefono || '',
    fecha_nacimiento: perfil?.fecha_nacimiento || '',
    genero: perfil?.genero || '',
    direccion: perfil?.direccion || '',
    barrio: perfil?.barrio || '',
    municipio_id: perfil?.municipio_id || '',
    ocupacion: perfil?.ocupacion || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    setLoading(true);
    setError('');
    setExito('');
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || null,
        telefono: form.telefono.trim() || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        genero: form.genero || null,
        direccion: form.direccion.trim() || null,
        barrio: form.barrio.trim() || null,
        municipio_id: form.municipio_id ? parseInt(form.municipio_id) : null,
        ocupacion: form.ocupacion.trim() || null,
      };
      const response = await actualizarPerfil(payload);
      login(response.token, response.user);
      onUpdate(response.user);
      setExito('Información personal actualizada correctamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Información personal" icon={<UserIcon />}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={exito} onClose={() => setExito('')} />

          <FieldGroup>
            <Field label="Nombre" id="nombre">
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Apellido" id="apellido">
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Fecha de nacimiento" id="fecha_nacimiento">
              <input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Género" id="genero">
              <select id="genero" name="genero" value={form.genero} onChange={handleChange} className={selectClass}>
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
              </select>
            </Field>

            <Field label="Teléfono" id="telefono">
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={handleChange}
                className={inputClass}
                placeholder="3001234567"
              />
            </Field>

            <Field label="Ocupación" id="ocupacion">
              <input
                id="ocupacion"
                name="ocupacion"
                type="text"
                value={form.ocupacion}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ej: Estudiante, Docente, Comerciante"
              />
            </Field>

            <Field label="Municipio" id="municipio_id">
              <select
                id="municipio_id"
                name="municipio_id"
                value={form.municipio_id}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Seleccionar municipio</option>
                {municipios.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Barrio / Vereda" id="barrio">
              <input
                id="barrio"
                name="barrio"
                type="text"
                value={form.barrio}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nombre del barrio"
              />
            </Field>

            <Field label="Dirección" id="direccion" span2>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={form.direccion}
                onChange={handleChange}
                className={inputClass}
                placeholder="Calle, carrera, número"
              />
            </Field>
          </FieldGroup>
        </div>

        <SaveButton loading={loading} />
      </form>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Sección: Cambiar correo
// ---------------------------------------------------------------------------

function CambiarEmail({ perfilEmail, onUpdate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: perfilEmail || '', password_actual: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email) { setError('El correo es requerido'); return; }
    if (!form.password_actual) { setError('Debes confirmar tu contraseña actual'); return; }
    if (email === perfilEmail) { setError('El correo nuevo es igual al actual'); return; }

    setLoading(true);
    setError('');
    setExito('');
    try {
      const response = await actualizarEmail({ email, password_actual: form.password_actual });
      login(response.token, response.user);
      onUpdate(response.user);
      setExito('Correo actualizado correctamente');
      setForm((f) => ({ ...f, password_actual: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Cambiar correo" icon={<MailIcon />}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={exito} onClose={() => setExito('')} />

          <FieldGroup>
            <Field label="Nuevo correo" id="email">
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Contraseña actual" id="password_actual_email">
              <input
                id="password_actual_email"
                name="password_actual"
                type="password"
                value={form.password_actual}
                onChange={handleChange}
                className={inputClass}
                placeholder="Confirma tu identidad"
                autoComplete="current-password"
              />
            </Field>
          </FieldGroup>

          <p className="text-xs text-gray-500">
            Se requiere tu contraseña actual para verificar el cambio de correo.
          </p>
        </div>

        <SaveButton loading={loading} label="Actualizar correo" />
      </form>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Sección: Cambiar contraseña
// ---------------------------------------------------------------------------

function CambiarPassword() {
  const [form, setForm] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setExito('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.password_actual) { setError('Ingresa tu contraseña actual'); return; }
    if (!form.password_nueva) { setError('Ingresa la nueva contraseña'); return; }
    if (form.password_nueva.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (form.password_nueva !== form.password_confirmar) { setError('Las contraseñas nuevas no coinciden'); return; }

    setLoading(true);
    setError('');
    setExito('');
    try {
      await actualizarPassword({
        password_actual: form.password_actual,
        password_nueva: form.password_nueva,
      });
      setExito('Contraseña actualizada correctamente');
      setForm({ password_actual: '', password_nueva: '', password_confirmar: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Cambiar contraseña" icon={<LockIcon />}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={exito} onClose={() => setExito('')} />

          <FieldGroup>
            <Field label="Contraseña actual" id="password_actual">
              <input
                id="password_actual"
                name="password_actual"
                type="password"
                value={form.password_actual}
                onChange={handleChange}
                className={inputClass}
                placeholder="Tu contraseña actual"
                autoComplete="current-password"
              />
            </Field>

            <div /> {/* spacer */}

            <Field label="Nueva contraseña" id="password_nueva">
              <input
                id="password_nueva"
                name="password_nueva"
                type="password"
                value={form.password_nueva}
                onChange={handleChange}
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </Field>

            <Field label="Confirmar nueva contraseña" id="password_confirmar">
              <input
                id="password_confirmar"
                name="password_confirmar"
                type="password"
                value={form.password_confirmar}
                onChange={handleChange}
                className={inputClass}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </Field>
          </FieldGroup>

          <p className="text-xs text-gray-500">
            Usa al menos 6 caracteres. Combina letras y números para mayor seguridad.
          </p>
        </div>

        <SaveButton loading={loading} label="Actualizar contraseña" />
      </form>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPerfil(), getMunicipios()])
      .then(([perfilData, municipiosData]) => {
        setPerfil(perfilData);
        setMunicipios(municipiosData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(updatedUser) {
    setPerfil((prev) => ({ ...prev, ...updatedUser }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-sm">Cargando perfil...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <BackButton />

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {/* Resumen */}
        <ResumenPerfil perfil={perfil} />

        {/* Editar info personal */}
        <EditarInfoPersonal
          perfil={perfil}
          municipios={municipios}
          onUpdate={handleUpdate}
        />

        {/* Cambiar correo */}
        <CambiarEmail
          perfilEmail={perfil?.email}
          onUpdate={handleUpdate}
        />

        {/* Cambiar contraseña */}
        <CambiarPassword />
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Iconos SVG
// ---------------------------------------------------------------------------

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
