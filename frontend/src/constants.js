/** Colores de marcadores en mapa (especificación React) */
export const DISEASE_COLORS = {
  Dengue: '#c0392b',
  Malaria: '#e67e22',
  Zika: '#3498db',
  Chikungunya: '#27ae60',
};

export const DISEASE_SLUG = {
  Dengue: 'dengue',
  Malaria: 'malaria',
  Zika: 'zika',
  Chikungunya: 'chikungunya',
};

export const CHOCO_CENTER = [5.42, -76.67];
export const DEFAULT_ZOOM = 9;

export const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const RIESGO_COLORS = {
  bajo: '#27ae60',
  medio: '#f39c12',
  alto: '#e74c3c',
  critico: '#c0392b',
};

export function nivelLabel(nivel) {
  const labels = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', critico: 'Crítico' };
  return labels[nivel] || nivel;
}

export function diseaseColor(name) {
  return DISEASE_COLORS[name] || '#c0392b';
}
