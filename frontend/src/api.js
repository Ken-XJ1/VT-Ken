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

export function getBrotes(municipioId, enfermedadId) {
  const params = new URLSearchParams();
  if (municipioId) params.set('municipio_id', municipioId);
  if (enfermedadId) params.set('enfermedad_id', enfermedadId);
  const qs = params.toString();
  return apiGet(`/api/brotes${qs ? `?${qs}` : ''}`);
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
