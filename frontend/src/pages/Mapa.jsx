import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { getBrotes, getMunicipios } from '../api/api';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CHOCO_CENTER = [5.42, -76.67];
const DEFAULT_ZOOM = 9;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const DISEASE_COLORS = {
  Dengue: '#ef4444',
  Malaria: '#f97316',
  Zika: '#3b82f6',
  Chikungunya: '#22c55e',
};

const ENFERMEDADES = [
  { id: '', label: 'Todas', slug: 'all' },
  { id: '1', label: 'Dengue', slug: 'dengue' },
  { id: '2', label: 'Malaria', slug: 'malaria' },
  { id: '3', label: 'Zika', slug: 'zika' },
  { id: '4', label: 'Chikungunya', slug: 'chikungunya' },
];

function diseaseColor(name) {
  return DISEASE_COLORS[name] || '#ef4444';
}

function createIcon(color) {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;width:14px;height:14px;
      background:${color};border:2px solid #fff;
      border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);
    "></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ brotes }) {
  const map = useMap();
  useEffect(() => {
    if (!brotes.length) {
      map.setView(CHOCO_CENTER, DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(brotes.map((b) => [b.lat, b.lng]));
    map.fitBounds(bounds.pad(0.15));
  }, [brotes, map]);
  return null;
}

function HeatmapLayer({ brotes, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !brotes.length) return undefined;
    const maxCasos = Math.max(...brotes.map((b) => b.numero_casos), 1);
    const points = brotes.map((b) => [b.lat, b.lng, b.numero_casos / maxCasos]);
    const layer = L.heatLayer(points, {
      radius: 28,
      blur: 22,
      maxZoom: 14,
      gradient: { 0.4: '#f97316', 0.7: '#ef4444', 1.0: '#7f1d1d' },
    });
    layer.addTo(map);
    return () => { map.removeLayer(layer); };
  }, [brotes, enabled, map]);
  return null;
}

export default function Mapa() {
  const [municipios, setMunicipios] = useState([]);
  const [municipioId, setMunicipioId] = useState('');
  const [enfermedadId, setEnfermedadId] = useState('');
  const [brotes, setBrotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heatEnabled, setHeatEnabled] = useState(false);

  useEffect(() => {
    getMunicipios().then(setMunicipios).catch(() => {});
  }, []);

  const loadBrotes = useCallback(() => {
    setLoading(true);
    setError('');
    getBrotes({
      municipio_id: municipioId || undefined,
      enfermedad_id: enfermedadId || undefined,
    })
      .then((data) => { setBrotes(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [municipioId, enfermedadId]);

  useEffect(() => { loadBrotes(); }, [loadBrotes]);

  const totalCasos = useMemo(
    () => brotes.reduce((s, b) => s + b.numero_casos, 0),
    [brotes]
  );

  return (
    <main className="pt-16 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Mapa de brotes</h1>
        <p className="text-gray-400">
          Brotes georreferenciados en Quibdó, Istmina y el Chocó. Filtra por municipio y enfermedad.
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 max-w-7xl mx-auto flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label htmlFor="municipio-select" className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Municipio
          </label>
          <select
            id="municipio-select"
            value={municipioId}
            onChange={(e) => setMunicipioId(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">Todo el Chocó</option>
            {municipios.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Enfermedad</span>
          <div className="flex flex-wrap gap-2">
            {ENFERMEDADES.map((e) => (
              <button
                key={e.slug}
                type="button"
                onClick={() => setEnfermedadId(e.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  enfermedadId === e.id
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Capa</span>
          <button
            type="button"
            onClick={() => setHeatEnabled((on) => !on)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              heatEnabled
                ? 'bg-orange-600 border-orange-600 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400'
            }`}
          >
            Capa de calor: {heatEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="px-4 pb-8 max-w-7xl mx-auto flex gap-4">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-700" style={{ height: '560px' }}>
          <MapContainer
            center={CHOCO_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer attribution="&copy; OSM &copy; CARTO" url={TILE_URL} />
            <FitBounds brotes={brotes} />
            <HeatmapLayer brotes={brotes} enabled={heatEnabled} />
            {brotes.map((b) => (
              <Marker
                key={b.id}
                position={[b.lat, b.lng]}
                icon={createIcon(diseaseColor(b.enfermedad))}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{b.enfermedad}</strong><br />
                    {b.municipio}<br />
                    <strong>{b.numero_casos}</strong> casos<br />
                    Fecha: {b.fecha}<br />
                    <small className="text-gray-500">{b.fuente}</small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Leyenda</h3>
          <ul className="space-y-2">
            {[
              { label: 'Dengue', color: '#ef4444' },
              { label: 'Malaria', color: '#f97316' },
              { label: 'Zika', color: '#3b82f6' },
              { label: 'Chikungunya', color: '#22c55e' },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-gray-300">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                {item.label}
              </li>
            ))}
          </ul>

          <hr className="border-gray-700" />

          {loading && <p className="text-xs text-gray-400">Cargando brotes…</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {!loading && !error && (
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="text-white font-semibold">{brotes.length}</span> brotes</p>
              <p><span className="text-white font-semibold">{totalCasos}</span> casos reportados</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
