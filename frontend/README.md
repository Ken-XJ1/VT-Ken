# Vigilancia Tropical — Frontend (React)

Frontend en React + Vite para la plataforma de monitoreo epidemiológico de Quibdó e Istmina, Chocó.

El backend Flask (`../app.py`) **no se modifica**. Este proyecto consume la API REST.

## Requisitos

- Node.js 18+
- Backend Flask corriendo en `http://127.0.0.1:5000`
- PostgreSQL con datos cargados (`db/schema.sql`)

## Desarrollo local

### 1. Encender el backend

```bash
cd ..
sudo systemctl start postgresql
python app.py
```

### 2. Encender el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:3000**

Las peticiones a `/api/*` se redirigen automáticamente a Flask (ver `vite.config.js`).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa del build |

## Estructura

```
src/
  api.js           # getMunicipios, getBrotes, getPrediccion, getClima, getEnfermedades
  App.jsx          # React Router
  components/      # Navbar, Footer
  pages/           # Landing, Mapa, Prediccion, Enfermedades
```

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Landing |
| `/mapa` | Mapa interactivo (react-leaflet) |
| `/prediccion` | Predicción de riesgo + clima |
| `/enfermedades` | Fichas informativas |

## Despliegue en Vercel

### 1. Subir el repositorio a GitHub

El frontend debe estar en la carpeta `frontend/` del monorepo (o solo este repo).

### 2. Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repositorio
3. **Root Directory:** `frontend`
4. **Framework Preset:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`

### 3. Variable de entorno (API en producción)

En Vercel → **Settings → Environment Variables**:

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | URL pública de tu Flask, ej. `https://api-vigilancia.railway.app` |

Sin barra final. En desarrollo déjala vacía (usa el proxy).

> El backend Flask debe estar desplegado por separado (Railway, Render, VPS, etc.) con CORS habilitado (ya está en `app.py`).

### 4. SPA (`vercel.json`)

El archivo `vercel.json` redirige todas las rutas a `index.html` para que React Router funcione al recargar `/mapa`, `/prediccion`, etc.

### 5. Deploy

Cada push a `main` puede desplegar automáticamente si activas Git Integration.

## Producción local (probar build)

```bash
npm run build
npm run preview
```

Configura `VITE_API_URL=http://127.0.0.1:5000` en `.env` si Flask corre en local.

## Diseño

Variables CSS en `src/App.css`:

- `--red`, `--dark`, `--text`, `--muted`, etc.
- Fuentes: Syne (títulos), DM Sans (cuerpo)

Sin Tailwind ni Material UI.
