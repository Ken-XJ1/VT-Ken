const API_BASE = import.meta.env.VITE_API_URL || '';

// ---------------------------------------------------------------------------
// Helpers base
// ---------------------------------------------------------------------------

function getToken() {
  return localStorage.getItem('vt_token');
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

// Helpers autenticados (incluyen JWT automáticamente)
async function getAuth(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

async function postAuth(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

async function putAuth(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Error ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Endpoints públicos
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------

export function login(data) {
  return apiPost('/api/auth/login', data);
}

export function registro(data) {
  return apiPost('/api/auth/registro', data);
}

export function getMe() {
  return getAuth('/api/auth/me');
}

// ---------------------------------------------------------------------------
// Reportes
// ---------------------------------------------------------------------------

export function crearReporte(data) {
  return postAuth('/api/reportes', data);
}

export function getMisReportes() {
  return getAuth('/api/reportes');
}

export function responderReporte(id, data) {
  return putAuth(`/api/reportes/${id}/responder`, data);
}

// ---------------------------------------------------------------------------
// Mensajes
// ---------------------------------------------------------------------------

export function enviarMensaje(data) {
  return postAuth('/api/mensajes', data);
}

export function getMisMensajes() {
  return getAuth('/api/mensajes');
}

export function responderMensaje(id, data) {
  return putAuth(`/api/mensajes/${id}/responder`, data);
}

export function marcarMensajeLeido(id) {
  return putAuth(`/api/mensajes/${id}/leer`, {});
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export function getAdminStats() {
  return getAuth('/api/admin/stats');
}

export function getTodosReportes() {
  return getAuth('/api/reportes');
}

export function getTodosMensajes() {
  return getAuth('/api/mensajes');
}

export function getAdminUsuarios() {
  return getAuth('/api/admin/usuarios');
}

export function toggleUsuario(id) {
  return putAuth(`/api/admin/usuarios/${id}/toggle`, {});
}

export function editarUsuario(id, data) {
  return putAuth(`/api/admin/usuarios/${id}`, data);
}

export function getAuditoria(limite = 100) {
  return getAuth(`/api/admin/auditoria?limite=${limite}`);
}

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------

export function getPerfil() {
  return getAuth('/api/perfil');
}

export function actualizarPerfil(data) {
  return putAuth('/api/perfil', data);
}
