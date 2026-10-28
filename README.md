# Vigilancia Tropical

Plataforma web de vigilancia epidemiológica para consultar brotes, riesgo y datos climáticos de enfermedades tropicales en Quibdó e Istmina, Chocó. Incluye herramientas para reportes ciudadanos y administración.

> **Estado de los datos:** los datos cargados por el esquema son de demostración y tienen fechas fijas. No representan una fuente epidemiológica en tiempo real ni deben utilizarse para tomar decisiones clínicas o de salud pública.

## Arquitectura actual

- **Frontend:** React 18, React Router y Vite, en `frontend/`.
- **Backend/API:** Flask y PostgreSQL, en `app.py`.
- **Persistencia:** esquema `vt` de PostgreSQL, definido en `db/schema.sql`; las migraciones posteriores están en `db/migrate_*.sql`.
- **Despliegue configurado:** servicio Flask y sitio estático en Render (`render.yaml`); también hay configuración de Vercel para el frontend.

Los archivos de `static/` y las rutas HTML en Flask corresponden a una interfaz anterior. La aplicación actual se abre desde Vite en desarrollo; Flask sirve la API en el puerto 5000.

## Requisitos

- Python 3.11 (versión indicada en `runtime.txt`).
- Node.js 18 o posterior y npm.
- PostgreSQL con una base de datos configurada.

## Desarrollo local en Windows

Después de completar la primera instalación, puedes iniciar los servidores con doble clic en `iniciar-desarrollo.bat`. Se abrirá una ventana para Vite y otra para Flask; el lanzador te pedirá la contraseña local de PostgreSQL de forma oculta. Abre `http://localhost:3000` y deja ambas ventanas abiertas. Para detenerlos, presiona `Ctrl+C` en la ventana de Flask y cierra la ventana de Vite.

El backend de desarrollo escucha solo en `127.0.0.1`; no queda expuesto a otros dispositivos de la red local.

### Instalación manual (primera vez)

Abre dos terminales de PowerShell desde la carpeta del proyecto.

### 1. Configura PostgreSQL

Configura PostgreSQL y crea una base vacía llamada `vigilancia_tropical`, con un usuario que pueda crear el esquema `vt`. La configuración predeterminada de la API espera el usuario `kenneth_dev`; puedes cambiarla usando las variables de entorno indicadas abajo.

Si tienes acceso al usuario administrador `postgres` y aún no existen el usuario y la base, puedes crearlos una sola vez (cambia la contraseña de ejemplo):

```powershell
psql -U postgres -c "CREATE ROLE kenneth_dev WITH LOGIN PASSWORD 'elige-una-clave-local';"
createdb -U postgres -O kenneth_dev vigilancia_tropical
```

**Solo para una base nueva y vacía:** carga el esquema y los datos de demostración:

```powershell
psql -U kenneth_dev -d vigilancia_tropical -f db/schema.sql
```

> **Importante:** `db/schema.sql` elimina y vuelve a crear las tablas de municipios, enfermedades, brotes, clima y predicciones. No lo ejecutes sobre una base de datos que contenga información que quieras conservar.

### 2. Instala e inicia el backend

En la primera terminal:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Configura la conexión PostgreSQL en esa misma terminal. Usa los valores correspondientes a tu instalación:

```powershell
$env:PGDATABASE = "vigilancia_tropical"
$env:PGUSER = "kenneth_dev"
$env:PGPASSWORD = "tu contraseña local"
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
python app.py
```

La API debe responder en `http://127.0.0.1:5000`. Comprueba la conexión a la base de datos en otra terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

La respuesta correcta indica `"status": "ok"` y `"database": "connected"`.

### 3. Instala e inicia el frontend

En la segunda terminal:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Abre la dirección que Vite indique, normalmente `http://localhost:3000`. El proxy de desarrollo envía `/api/*` a Flask en `http://127.0.0.1:5000`.

Para generar una compilación de producción del frontend:

```powershell
npm run build
```

## Rutas principales

| Ruta | Acceso |
|---|---|
| `/` | Inicio |
| `/mapa` | Mapa de brotes |
| `/prediccion` | Riesgo y clima |
| `/enfermedades` | Fichas informativas |
| `/chatbot` | Asistente basado en reglas |
| `/login`, `/registro` | Autenticación |
| `/dashboard`, `/reportar`, `/mis-reportes`, `/mensajes` | Ciudadanos autenticados |
| `/admin` y subrutas | Administración |

## API principal

- `GET /api/health`
- `GET /api/municipios`, `/api/brotes`, `/api/enfermedades`
- `GET /api/prediccion?municipio_id=...`, `/api/clima?municipio_id=...`
- `POST /api/auth/registro`, `POST /api/auth/login`, `GET /api/auth/me`
- `/api/reportes`, `/api/mensajes`, `/api/perfil`
- `/api/admin/*` (requiere rol administrador)

Las rutas protegidas requieren un JWT en `Authorization: Bearer <token>`.

## Pruebas automáticas de la API

Las pruebas unitarias no requieren conectarse a PostgreSQL:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Cubren validación de registro y mensajes, inicio de sesión, autorización por rol, expiración de JWT, aislamiento del historial de reportes y respuesta de salud ante errores de base de datos.

## Sobre las predicciones y el modelo

La pantalla `/prediccion` obtiene sus resultados de PostgreSQL. El endpoint de Flask usa predicciones almacenadas y, cuando faltan, aplica una regla basada en casos recientes; no invoca el modelo de `model/predictive_model.py`. Ese módulo es un prototipo separado y no forma parte del flujo de la aplicación actual.

## Despliegue y configuración

Para crear un entorno de prueba separado, conecta en Render el repositorio GitHub que contiene este proyecto y crea un **Blueprint** a partir de `render.yaml`. El blueprint crea servicios con nombres `*-staging`, separados de los servicios publicados anteriormente.

El backend requiere `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT` y `SECRET_KEY`; guárdalos como variables del servicio, no en el repositorio. Genera un valor secreto único para `SECRET_KEY`. Configura `CORS_ORIGINS` con el dominio HTTPS exacto del frontend de prueba. En el frontend configura `VITE_API_URL` con la URL HTTPS del backend de prueba, sin barra final; como es una variable de compilación, vuelve a desplegar el frontend después de cambiarla.

La base PostgreSQL no se crea en `render.yaml`: conecta una base existente o provisiona una explícitamente tras revisar su costo y disponibilidad de red. No publiques los endpoints hasta verificar que la base y las variables estén correctas. Consulta `frontend/README.md` para los detalles del frontend.

No uses los valores de desarrollo en producción. La ejecución `python app.py` es únicamente para desarrollo local; para despliegue se define Gunicorn en `Procfile`.

## Estructura

```text
app.py                  API Flask
db/                     Esquema y migraciones PostgreSQL
frontend/               Aplicación React/Vite
model/                  Prototipo de procesamiento y predicción
data/                   Datos JSON de demostración heredados
static/                 Recursos de la interfaz anterior
```
