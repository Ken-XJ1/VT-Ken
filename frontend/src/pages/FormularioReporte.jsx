import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMunicipios, crearReporte } from '../api/api';

const SINTOMAS_LISTA = [
  'Fiebre alta',
  'Dolor de cabeza',
  'Dolor articular',
  'Dolor muscular',
  'Sarpullido en la piel',
  'Escalofríos',
  'Náuseas o vómitos',
  'Dolor detrás de los ojos',
  'Sangrado inusual',
  'Fatiga extrema',
];

const ENFERMEDADES_OPCIONES = ['Dengue', 'Malaria', 'Zika', 'Chikungunya', 'No sé'];

const URGENCIA_OPCIONES = [
  { value: 'normal', label: 'Normal', desc: 'Síntomas leves, no urgente' },
  { value: 'urgente', label: 'Urgente', desc: 'Síntomas moderados, requiere atención pronto' },
  { value: 'critico', label: 'Crítico', desc: 'Síntomas graves, busca atención inmediata' },
];

export default function FormularioReporte() {
  const navigate = useNavigate();
  const [municipios, setMunicipios] = useState([]);
  const [sintomasCheck, setSintomasCheck] = useState([]);
  const [form, setForm] = useState({
    municipio_id: '',
    nombre_reporte: '',
    enfermedad_sospechosa: '',
    sintomas_detalle: '',
    nivel_urgencia: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  useEffect(() => {
    getMunicipios().then(setMunicipios).catch(() => {});
  }, []);

  function toggleSintoma(s) {
    setSintomasCheck((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const sintomasTexto = [
      ...sintomasCheck,
      form.sintomas_detalle.trim() ? `Detalle: ${form.sintomas_detalle.trim()}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    if (!sintomasTexto) {
      setError('Selecciona al menos un síntoma o describe tus síntomas');
      return;
    }

    setLoading(true);
    try {
      await crearReporte({
        municipio_id: form.municipio_id ? Number(form.municipio_id) : null,
        nombre_reporte: form.nombre_reporte || null,
        enfermedad_sospechosa: form.enfermedad_sospechosa || null,
        sintomas: sintomasTexto,
        nivel_urgencia: form.nivel_urgencia,
      });
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl border border-green-700 p-8 text-center">
          <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Reporte enviado</h2>
          <p className="text-gray-400 text-sm mb-6">
            Tu reporte fue recibido. El equipo de salud lo revisará pronto.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setExito(false); setSintomasCheck([]); setForm({ municipio_id: '', nombre_reporte: '', enfermedad_sospechosa: '', sintomas_detalle: '', nivel_urgencia: 'normal' }); }}
              className="border border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Enviar otro
            </button>
            <button
              onClick={() => navigate('/mis-reportes')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Ver mis reportes
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reportar síntomas</h1>
        <p className="text-gray-400 mb-8">
          Tu reporte ayuda al sistema de vigilancia epidemiológica del Chocó.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Municipio */}
          <div>
            <label htmlFor="municipio_id" className="block text-sm font-medium text-gray-300 mb-1">
              Municipio
            </label>
            <select
              id="municipio_id"
              name="municipio_id"
              value={form.municipio_id}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Selecciona un municipio</option>
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Nombre del reporte */}
          <div>
            <label htmlFor="nombre_reporte" className="block text-sm font-medium text-gray-300 mb-1">
              Nombre o alias del reporte <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              id="nombre_reporte"
              name="nombre_reporte"
              type="text"
              value={form.nombre_reporte}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
              placeholder="Ej: Síntomas semana del 20 de mayo"
            />
          </div>

          {/* Enfermedad sospechosa */}
          <div>
            <label htmlFor="enfermedad_sospechosa" className="block text-sm font-medium text-gray-300 mb-1">
              Enfermedad sospechosa
            </label>
            <select
              id="enfermedad_sospechosa"
              name="enfermedad_sospechosa"
              value={form.enfermedad_sospechosa}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Selecciona una opción</option>
              {ENFERMEDADES_OPCIONES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Síntomas checkboxes */}
          <div>
            <p className="block text-sm font-medium text-gray-300 mb-3">
              Síntomas presentes <span className="text-gray-500">(selecciona todos los que apliquen)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SINTOMAS_LISTA.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sintomasCheck.includes(s)}
                    onChange={() => toggleSintoma(s)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Descripción libre */}
          <div>
            <label htmlFor="sintomas_detalle" className="block text-sm font-medium text-gray-300 mb-1">
              Describe tus síntomas con más detalle
            </label>
            <textarea
              id="sintomas_detalle"
              name="sintomas_detalle"
              rows={4}
              value={form.sintomas_detalle}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 resize-none"
              placeholder="Describe cuándo empezaron, intensidad, otros síntomas..."
            />
          </div>

          {/* Urgencia */}
          <div>
            <p className="block text-sm font-medium text-gray-300 mb-3">Nivel de urgencia</p>
            <div className="grid grid-cols-3 gap-3">
              {URGENCIA_OPCIONES.map((op) => (
                <label
                  key={op.value}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    form.nivel_urgencia === op.value
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="nivel_urgencia"
                    value={op.value}
                    checked={form.nivel_urgencia === op.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-white">{op.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{op.desc}</p>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Enviando reporte...' : 'Enviar reporte'}
          </button>
        </form>
      </div>
    </main>
  );
}
