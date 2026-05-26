import { useEffect, useState } from 'react';
import { getTodosMensajes, responderMensaje, marcarMensajeLeido } from '../../api/api';
import BackButton from '../../components/BackButton';

export default function AdminMensajes() {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardadoMsg, setGuardadoMsg] = useState('');

  function cargar() {
    setLoading(true);
    getTodosMensajes()
      .then(setMensajes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  async function abrirMensaje(m) {
    setSeleccionado(m);
    setRespuesta(m.respuesta_admin || '');
    setGuardadoMsg('');
    // Marcar como leído automáticamente
    if (!m.leido) {
      try {
        await marcarMensajeLeido(m.id);
        setMensajes((prev) => prev.map((x) => x.id === m.id ? { ...x, leido: true } : x));
      } catch {
        // silencioso
      }
    }
  }

  async function guardarRespuesta() {
    if (!seleccionado || !respuesta.trim()) {
      setGuardadoMsg('Escribe una respuesta antes de guardar');
      return;
    }
    setGuardando(true);
    setGuardadoMsg('');
    try {
      await responderMensaje(seleccionado.id, { respuesta_admin: respuesta });
      setGuardadoMsg('Respuesta enviada correctamente');
      cargar();
    } catch (err) {
      setGuardadoMsg(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Lista */}
        <div className="flex-1 min-w-0">
          <BackButton />
          <h1 className="text-2xl font-bold text-white mb-2">Mensajes de ciudadanos</h1>
          <p className="text-gray-400 text-sm mb-6">Revisa y responde los mensajes recibidos.</p>

          {loading && <p className="text-gray-400 animate-pulse">Cargando...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="space-y-2">
            {mensajes.map((m) => (
              <button
                key={m.id}
                onClick={() => abrirMensaje(m)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  seleccionado?.id === m.id
                    ? 'bg-gray-700 border-red-600'
                    : m.leido
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-gray-800 border-blue-700 hover:border-blue-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!m.leido && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      )}
                      <p className="text-sm font-medium text-white truncate">{m.asunto}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {m.usuario} · {m.fecha_mensaje?.slice(0, 10)}
                    </p>
                  </div>
                  {m.respuesta_admin && (
                    <span className="text-xs bg-green-900/40 text-green-300 px-2 py-0.5 rounded-full shrink-0">
                      Respondido
                    </span>
                  )}
                </div>
              </button>
            ))}
            {!loading && mensajes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">Sin mensajes.</p>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        {seleccionado && (
          <aside className="w-96 shrink-0 bg-gray-800 rounded-xl border border-gray-700 p-5 self-start sticky top-20">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-semibold text-white">Mensaje</h2>
              <button onClick={() => setSeleccionado(null)} className="text-gray-500 hover:text-white text-lg leading-none">
                &times;
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div><span className="text-gray-400">De:</span> <span className="text-white">{seleccionado.usuario}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="text-white">{seleccionado.usuario_email}</span></div>
              <div><span className="text-gray-400">Fecha:</span> <span className="text-white">{seleccionado.fecha_mensaje?.slice(0, 16).replace('T', ' ')}</span></div>
              <div><span className="text-gray-400 block mb-1">Asunto:</span> <p className="text-white font-medium">{seleccionado.asunto}</p></div>
              <div>
                <span className="text-gray-400 block mb-1">Mensaje:</span>
                <p className="text-gray-300 bg-gray-900 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap">{seleccionado.mensaje}</p>
              </div>
            </div>

            {seleccionado.respuesta_admin && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-green-400 mb-1">Respuesta enviada</p>
                <p className="text-xs text-gray-300">{seleccionado.respuesta_admin}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {seleccionado.respuesta_admin ? 'Actualizar respuesta' : 'Responder'}
                </label>
                <textarea
                  rows={4}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Escribe tu respuesta..."
                />
              </div>
              {guardadoMsg && (
                <p className={`text-xs ${guardadoMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {guardadoMsg}
                </p>
              )}
              <button
                onClick={guardarRespuesta}
                disabled={guardando}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {guardando ? 'Enviando...' : 'Enviar respuesta'}
              </button>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
