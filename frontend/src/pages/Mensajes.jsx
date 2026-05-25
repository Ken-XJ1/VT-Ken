import { useEffect, useState } from 'react';
import { getMisMensajes, enviarMensaje } from '../api/api';

export default function Mensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [formError, setFormError] = useState('');

  function cargar() {
    setLoading(true);
    getMisMensajes()
      .then(setMensajes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setExito('');
    if (!form.asunto.trim() || !form.mensaje.trim()) {
      setFormError('El asunto y el mensaje son requeridos');
      return;
    }
    setEnviando(true);
    try {
      await enviarMensaje(form);
      setExito('Mensaje enviado correctamente');
      setForm({ asunto: '', mensaje: '' });
      cargar();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mensajes</h1>
        <p className="text-gray-400 mb-8">Comunícate con el equipo de salud de Vigilancia Tropical.</p>

        {/* Formulario nuevo mensaje */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Nuevo mensaje</h2>

          {formError && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
              {formError}
            </div>
          )}
          {exito && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm rounded-lg px-4 py-3 mb-4">
              {exito}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="asunto" className="block text-sm font-medium text-gray-300 mb-1">Asunto</label>
              <input
                id="asunto"
                name="asunto"
                type="text"
                value={form.asunto}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                placeholder="Asunto del mensaje"
              />
            </div>
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300 mb-1">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={4}
                value={form.mensaje}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 resize-none"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>

        {/* Lista de mensajes */}
        <h2 className="text-lg font-semibold text-white mb-4">Mensajes enviados</h2>

        {loading && <p className="text-gray-400 animate-pulse">Cargando mensajes...</p>}
        {error && <p className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error}</p>}

        {!loading && mensajes.length === 0 && (
          <p className="text-gray-400 text-sm">No has enviado mensajes todavía.</p>
        )}

        <div className="space-y-4">
          {mensajes.map((m) => (
            <article key={m.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-white">{m.asunto}</p>
                  <span className="text-xs text-gray-500 shrink-0">{m.fecha_mensaje?.slice(0, 10)}</span>
                </div>
                <p className="text-sm text-gray-300">{m.mensaje}</p>
              </div>

              {m.respuesta_admin && (
                <div className="border-t border-gray-700 bg-blue-900/10 px-4 py-3">
                  <p className="text-xs font-semibold text-blue-400 mb-1">
                    Respuesta del equipo · {m.fecha_respuesta?.slice(0, 10)}
                  </p>
                  <p className="text-sm text-gray-300">{m.respuesta_admin}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
