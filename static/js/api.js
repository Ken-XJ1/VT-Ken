/**
 * Cliente API — Vigilancia Tropical
 * Ajusta API_BASE si el frontend se sirve en otro puerto que Flask.
 */
/** Misma origen cuando se sirve con Flask (python app.py) */
const API_BASE = '';

async function apiGet(path) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || `Error ${res.status}`);
    }
    return res.json();
}

function getMunicipios() {
    return apiGet('/api/municipios');
}

function getBrotes(params = {}) {
    const q = new URLSearchParams();
    if (params.municipio_id) q.set('municipio_id', params.municipio_id);
    if (params.enfermedad_id) q.set('enfermedad_id', params.enfermedad_id);
    const qs = q.toString();
    return apiGet(`/api/brotes${qs ? `?${qs}` : ''}`);
}

function getPrediccion(municipioId) {
    return apiGet(`/api/prediccion?municipio_id=${municipioId}`);
}

function getClima(municipioId) {
    return apiGet(`/api/clima?municipio_id=${municipioId}`);
}

function getEnfermedades() {
    return apiGet('/api/enfermedades');
}
