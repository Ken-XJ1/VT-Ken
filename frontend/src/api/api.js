const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

export function getMunicipios() {
  return apiGet('/api/municipios');
}

export function getBrotes(params = {}) {
  const qs = new URLSearchParams();
  if (params.municipio_id) qs.set('municipio_id', params.municipio_id);
  if (params.enfermedad_id) qs.set('enfermedad_id', params.enfermedad_id);
  const query = qs.toString();
  return apiGet(`/api/brotes${query ? `?${query}` : ''}`);
}

export function getPrediccion(municipioId) {
  return apiGet(`/api/prediccion?municipio_id=${municipioId}`);
}

export function getClima(municipioId) {
  return apiGet(`/api/clima?municipio_id=${municipioId}`);
}

export function getEnfermedades() {
  return apiGet('/api/enfermedades');
}
