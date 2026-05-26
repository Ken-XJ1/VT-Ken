import { useEffect, useState } from 'react';
import { getAdminUsuarios, toggleUsuario, editarUsuario } from '../../api/api';
import BackButton from '../../components/BackButton';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(null);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombre: '', email: '', rol: 'ciudadano' });
  const [guardando, setGuardando] = useState(false);
  const [mensajeEdit, setMensajeEdit] = useState('');

  function cargar() {
    setLoading(true);
    getAdminUsuarios()
      .then(setUsuarios)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  async function handleToggle(u) {
    if (u.email === 'admin@vigilanciatropical.co') return;
    setToggling(u.id);
    try {
      const result = await toggleUsuario(u.id);
      setUsuarios((prev) => prev.map((x) => x.id === u.id ? { ...x, activo: result.activo } : x));
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(null);
    }
  }

  function abrirEdicion(u) {
    setEditando(u.id);
    setFormEdit({ nombre: u.nombre, email: u.email, rol: u.rol });
    setMensajeEdit('');
  }

  function cerrarEdicion() {
    setEditando(null);
    setFormEdit({ nombre: '', email: '', rol: 'ciudadano' });
    setMensajeEdit('');
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setGuardando(true);
    setMensajeEdit('');
    try {
      const result = await editarUsuario(editando, formEdit);
      setUsuarios((prev) => prev.map((x) => x.id === editando ? result : x));
      setMensajeEdit('Usuario actualizado correctamente');
      setTimeout(() => {
        cerrarEdicion();
      }, 1500);
    } catch (err) {
      setMensajeEdit(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-2xl font-bold text-white mb-2">Usuarios registrados</h1>
        <p className="text-gray-400 text-sm mb-6">Gestiona las cuentas de ciudadanos del sistema.</p>

        {loading && <p className="text-gray-400 animate-pulse">Cargando usuarios...</p>}
        {error && <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 mb-4">{error}</p>}

        {!loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Nombre</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell whitespace-nowrap">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Rol</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell whitespace-nowrap">Registro</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esAdmin = u.email === 'admin@vigilanciatropical.co';
                  return (
                    <tr key={u.id} className="border-b border-gray-700 last:border-0 hover:bg-gray-750">
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{u.nombre}</td>
                      <td className="px-4 py-3 text-gray-300 hidden md:table-cell">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.rol === 'admin' ? 'bg-red-900/40 text-red-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">
                        {u.fecha_registro?.slice(0, 10)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.activo ? 'bg-green-900/40 text-green-300' : 'bg-gray-700 text-gray-500'
                        }`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        {!esAdmin && (
                          <>
                            <button
                              onClick={() => abrirEdicion(u)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-700 text-blue-400 hover:bg-blue-900/20 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggle(u)}
                              disabled={toggling === u.id}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                                u.activo
                                  ? 'border-red-700 text-red-400 hover:bg-red-900/20'
                                  : 'border-green-700 text-green-400 hover:bg-green-900/20'
                              }`}
                            >
                              {toggling === u.id ? '...' : u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Sin usuarios registrados.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {editando && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Editar usuario</h2>
            
            {mensajeEdit && (
              <div className={`text-sm rounded-lg px-4 py-3 mb-4 ${
                mensajeEdit.includes('correctamente') 
                  ? 'bg-green-900/30 border border-green-700 text-green-300'
                  : 'bg-red-900/30 border border-red-700 text-red-300'
              }`}>
                {mensajeEdit}
              </div>
            )}

            <form onSubmit={guardarEdicion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formEdit.nombre}
                  onChange={(e) => setFormEdit((f) => ({ ...f, nombre: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formEdit.email}
                  onChange={(e) => setFormEdit((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                <select
                  value={formEdit.rol}
                  onChange={(e) => setFormEdit((f) => ({ ...f, rol: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                >
                  <option value="ciudadano">Ciudadano</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarEdicion}
                  className="flex-1 border border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
