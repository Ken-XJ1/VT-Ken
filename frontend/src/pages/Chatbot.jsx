import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Componente de animación de escritura
// ---------------------------------------------------------------------------

function BurbujaEscribiendo() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-red-400 text-xs font-bold">VT</span>
      </div>
      <div className="bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Árbol de decisiones
// ---------------------------------------------------------------------------

const FICHAS = {
  dengue: {
    nombre: 'Dengue',
    color: 'border-red-500',
    texto: 'Fiebre alta súbita, dolor retroocular, mialgias, rash cutáneo. Transmitido por Aedes aegypti. Busca atención médica si los síntomas son intensos.',
  },
  malaria: {
    nombre: 'Malaria',
    color: 'border-orange-500',
    texto: 'Fiebre intermitente con escalofríos y sudoración. Causada por Plasmodium. Frecuente en zonas ribereñas y mineras del Chocó. Requiere diagnóstico y tratamiento urgente.',
  },
  zika: {
    nombre: 'Zika',
    color: 'border-blue-500',
    texto: 'Fiebre leve, sarpullido, conjuntivitis. Riesgo de microcefalia en embarazadas. Transmitido por Aedes aegypti. Consulta médico si estás embarazada.',
  },
  chikungunya: {
    nombre: 'Chikungunya',
    color: 'border-green-500',
    texto: 'Fiebre alta con dolor articular intenso y prolongado. Transmitido por Aedes. Las artralgias pueden durar semanas o meses.',
  },
};

const NODOS = {
  inicio: {
    bot: '¿Tienes algún síntoma en este momento?',
    opciones: [
      { label: 'Sí, tengo síntomas', next: 'fiebre' },
      { label: 'Solo quiero información', next: 'info_menu' },
      { label: 'No, estoy bien', next: 'bien' },
    ],
  },
  fiebre: {
    bot: '¿Tienes fiebre o sensación de calor?',
    opciones: [
      { label: 'Sí, fiebre alta (más de 38°C)', next: 'articular' },
      { label: 'Fiebre leve', next: 'sarpullido' },
      { label: 'No tengo fiebre', next: 'sin_fiebre' },
    ],
  },
  articular: {
    bot: '¿Sientes dolor intenso en las articulaciones (rodillas, tobillos, muñecas)?',
    opciones: [
      { label: 'Sí, dolor articular muy fuerte', next: 'resultado_chikungunya' },
      { label: 'Dolor leve', next: 'sarpullido' },
      { label: 'No tengo dolor articular', next: 'sarpullido' },
    ],
  },
  sarpullido: {
    bot: '¿Tienes sarpullido o manchas en la piel?',
    opciones: [
      { label: 'Sí, tengo sarpullido', next: 'dolor_ocular' },
      { label: 'No tengo sarpullido', next: 'escalofrios' },
    ],
  },
  dolor_ocular: {
    bot: '¿Tienes también dolor detrás de los ojos o dolor muscular intenso?',
    opciones: [
      { label: 'Sí, dolor detrás de los ojos', next: 'resultado_dengue' },
      { label: 'Más bien dolor muscular', next: 'resultado_dengue' },
      { label: 'Ninguno de esos', next: 'resultado_zika' },
    ],
  },
  escalofrios: {
    bot: '¿Tienes escalofríos fuertes que alternan con sudoración?',
    opciones: [
      { label: 'Sí, escalofríos y sudoración alternados', next: 'resultado_malaria' },
      { label: 'No', next: 'sin_patron' },
    ],
  },
  info_menu: {
    bot: '¿Sobre cuál enfermedad quieres información?',
    opciones: [
      { label: 'Dengue', next: 'info_dengue' },
      { label: 'Malaria', next: 'info_malaria' },
      { label: 'Zika', next: 'info_zika' },
      { label: 'Chikungunya', next: 'info_chikungunya' },
    ],
  },
  info_dengue: { bot: null, ficha: 'dengue', opciones: [{ label: 'Ver otra enfermedad', next: 'info_menu' }] },
  info_malaria: { bot: null, ficha: 'malaria', opciones: [{ label: 'Ver otra enfermedad', next: 'info_menu' }] },
  info_zika: { bot: null, ficha: 'zika', opciones: [{ label: 'Ver otra enfermedad', next: 'info_menu' }] },
  info_chikungunya: { bot: null, ficha: 'chikungunya', opciones: [{ label: 'Ver otra enfermedad', next: 'info_menu' }] },
  resultado_chikungunya: {
    bot: 'Basándome en tus síntomas (fiebre alta + dolor articular intenso), podrías estar experimentando síntomas de Chikungunya. Esto no es un diagnóstico médico.',
    ficha: 'chikungunya',
    opciones: [{ label: 'Tengo otros síntomas también', next: 'sarpullido' }],
    final: true,
  },
  resultado_dengue: {
    bot: 'Tus síntomas se parecen mucho al Dengue. Busca atención médica pronto, especialmente si hay sangrado o dolor abdominal intenso.',
    ficha: 'dengue',
    opciones: [],
    final: true,
  },
  resultado_zika: {
    bot: 'Podría ser Zika. Si estás embarazada o planeas embarazarte, es muy importante que consultes un médico de inmediato.',
    ficha: 'zika',
    opciones: [],
    final: true,
  },
  resultado_malaria: {
    bot: 'La fiebre intermitente con escalofríos es característica de la Malaria, especialmente en zonas como el Chocó. Busca atención médica urgente.',
    ficha: 'malaria',
    opciones: [],
    final: true,
  },
  sin_fiebre: {
    bot: 'Sin fiebre, los síntomas podrían tener otras causas. Si los síntomas persisten o empeoran, consulta un médico.',
    opciones: [],
    final: true,
  },
  sin_patron: {
    bot: 'Tus síntomas no coinciden claramente con un patrón específico. Si persisten más de 48 horas, consulta un médico.',
    opciones: [],
    final: true,
  },
  bien: {
    bot: 'Me alegra que estés bien. Recuerda usar repelente y eliminar criaderos de agua estancada para prevenir enfermedades tropicales.',
    opciones: [],
    final: true,
  },
};

const RECOMENDACIONES = [
  'Visita el centro de salud más cercano',
  'Línea de salud del Chocó: 018000 913018',
  'Mantente hidratado y en reposo',
];

// ---------------------------------------------------------------------------
// Componentes de burbuja
// ---------------------------------------------------------------------------

function BurbujaBot({ texto, ficha, fadeIn }) {
  return (
    <div 
      className="flex gap-3 items-start"
      style={fadeIn ? { animation: 'fadeIn 0.3s ease-in' } : {}}
    >
      <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-700 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-red-400 text-xs font-bold">VT</span>
      </div>
      <div className="max-w-sm">
        {texto && (
          <div className="bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-100 leading-relaxed">
            {texto}
          </div>
        )}
        {ficha && (
          <div className={`mt-2 bg-gray-800 border rounded-xl p-3 text-xs ${FICHAS[ficha].color}`}>
            <p className="font-bold text-white mb-1">{FICHAS[ficha].nombre}</p>
            <p className="text-gray-300 leading-relaxed">{FICHAS[ficha].texto}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BurbujaUsuario({ texto, fadeIn }) {
  return (
    <div 
      className="flex justify-end"
      style={fadeIn ? { animation: 'fadeIn 0.3s ease-in' } : {}}
    >
      <div className="bg-red-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white max-w-xs leading-relaxed">
        {texto}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Chatbot() {
  const { isAuthenticated } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [nodoActual, setNodoActual] = useState('inicio');
  const [finalizado, setFinalizado] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const bottomRef = useRef(null);

  // Función para calcular delay según longitud del mensaje
  function calcularDelay(texto) {
    if (!texto) return 800;
    const longitud = texto.length;
    if (longitud < 100) return 800;
    if (longitud < 200) return 1400;
    return 2000;
  }

  // Función para agregar mensaje del bot con efecto de escritura
  function agregarMensajeBot(texto, ficha) {
    setEscribiendo(true);
    setMostrarOpciones(false);
    
    const delay = calcularDelay(texto || (ficha ? FICHAS[ficha].texto : ''));
    
    setTimeout(() => {
      setMensajes((prev) => [...prev, { tipo: 'bot', texto, ficha, fadeIn: true }]);
      setEscribiendo(false);
      
      // Mostrar opciones con delay adicional
      setTimeout(() => {
        setMostrarOpciones(true);
      }, 300);
    }, delay);
  }

  // Mensaje inicial del bot
  useEffect(() => {
    const nodo = NODOS.inicio;
    
    // Primer mensaje de bienvenida
    setEscribiendo(true);
    setTimeout(() => {
      setMensajes([
        {
          tipo: 'bot',
          texto: 'Hola, soy el asistente de Vigilancia Tropical. Puedo ayudarte a identificar posibles enfermedades tropicales según tus síntomas.',
          fadeIn: true,
        },
      ]);
      setEscribiendo(false);
      
      // Segundo mensaje con la primera pregunta
      setTimeout(() => {
        agregarMensajeBot(nodo.bot, nodo.ficha);
      }, 500);
    }, 1400);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  function elegirOpcion(opcion) {
    const nodoSiguiente = NODOS[opcion.next];
    if (!nodoSiguiente) return;

    // Agregar mensaje del usuario inmediatamente
    setMensajes((prev) => [...prev, { tipo: 'usuario', texto: opcion.label, fadeIn: true }]);
    setMostrarOpciones(false);

    // Actualizar nodo actual
    setNodoActual(opcion.next);

    // Agregar mensaje del bot con efecto de escritura
    setTimeout(() => {
      if (nodoSiguiente.bot) {
        agregarMensajeBot(nodoSiguiente.bot, nodoSiguiente.ficha);
      } else if (nodoSiguiente.ficha) {
        agregarMensajeBot(null, nodoSiguiente.ficha);
      }

      if (nodoSiguiente.final) {
        setTimeout(() => {
          setFinalizado(true);
        }, calcularDelay(nodoSiguiente.bot) + 500);
      }
    }, 100);
  }

  function reiniciar() {
    const nodo = NODOS.inicio;
    setMensajes([]);
    setNodoActual('inicio');
    setFinalizado(false);
    setMostrarOpciones(false);
    
    // Reiniciar con animación
    setEscribiendo(true);
    setTimeout(() => {
      setMensajes([
        { 
          tipo: 'bot', 
          texto: 'Hola, soy el asistente de Vigilancia Tropical. Puedo ayudarte a identificar posibles enfermedades tropicales según tus síntomas.',
          fadeIn: true,
        }
      ]);
      setEscribiendo(false);
      
      setTimeout(() => {
        agregarMensajeBot(nodo.bot, nodo.ficha);
      }, 500);
    }, 1400);
  }

  const nodo = NODOS[nodoActual];
  const opciones = nodo?.opciones || [];

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-screen">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">Asistente de síntomas</h1>
          <p className="text-gray-400 text-sm">Orientación basada en síntomas — no reemplaza la consulta médica</p>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-4 mb-4">
          {mensajes.map((m, i) =>
            m.tipo === 'bot' ? (
              <BurbujaBot key={i} texto={m.texto} ficha={m.ficha} fadeIn={m.fadeIn} />
            ) : (
              <BurbujaUsuario key={i} texto={m.texto} fadeIn={m.fadeIn} />
            )
          )}

          {/* Indicador de escritura */}
          {escribiendo && <BurbujaEscribiendo />}

          {/* Recomendaciones finales */}
          {finalizado && (
            <div 
              className="bg-gray-700/50 rounded-xl p-4 mt-2"
              style={{ animation: 'fadeIn 0.3s ease-in' }}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Recomendaciones</p>
              <ul className="space-y-1.5 mb-4">
                {RECOMENDACIONES.map((r) => (
                  <li key={r} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">-</span>
                    {r}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Link
                  to="/reportar"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Enviar reporte formal
                </Link>
              ) : (
                <Link
                  to="/registro"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse para enviar reporte
                </Link>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Opciones */}
        {!finalizado && opciones.length > 0 && mostrarOpciones && (
          <div 
            className="flex flex-wrap gap-2 mb-3"
            style={{ animation: 'fadeIn 0.3s ease-in' }}
          >
            {opciones.map((op) => (
              <button
                key={op.next}
                onClick={() => elegirOpcion(op)}
                className="bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white text-sm px-4 py-2 rounded-full transition-colors"
              >
                {op.label}
              </button>
            ))}
          </div>
        )}

        {/* Reiniciar */}
        <button
          onClick={reiniciar}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors self-center"
        >
          Reiniciar conversación
        </button>
      </div>
    </main>
  );
}
