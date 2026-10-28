# Manual de inicio — Vigilancia Tropical

Esta guía corresponde a la aplicación actual: frontend React/Vite, API Flask y base de datos PostgreSQL. En desarrollo local se ejecutan el backend y el frontend por separado, en dos terminales.

## Requisitos

- Python 3.11 (ver `runtime.txt`).
- Node.js 18+ con npm.
- PostgreSQL instalado y en ejecución.

## Primera instalación en Windows

### 1. Preparar PostgreSQL

Inicia el servicio de PostgreSQL desde **Servicios** de Windows o desde el programa con el que lo instalaste. Verifica desde PowerShell:

```powershell
Get-Service *postgres*
```

La aplicación espera, por defecto, la base `vigilancia_tropical` y el usuario `kenneth_dev`. Crea la base y el usuario si todavía no existen, o usa los valores de conexión que ya tengas.

Si tienes acceso al administrador `postgres` y el usuario aún no existe, créalo una sola vez (reemplaza la contraseña de ejemplo). Luego crea la base vacía:

```powershell
psql -U postgres -c "CREATE ROLE kenneth_dev WITH LOGIN PASSWORD 'elige-una-clave-local';"
createdb -U postgres -O kenneth_dev vigilancia_tropical
```

Para cargar tablas y datos de muestra en una base **nueva y vacía**, desde la carpeta raíz del proyecto:

```powershell
psql -U kenneth_dev -d vigilancia_tropical -f db/schema.sql
```

> **Cuidado:** el esquema elimina y recrea las tablas principales de datos. No lo ejecutes sobre una base existente que tenga información que debas conservar.

### 2. Preparar Python e iniciar la API

Desde la carpeta raíz del proyecto:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

En esa misma terminal, configura las credenciales de PostgreSQL y arranca Flask:

```powershell
$env:PGDATABASE = "vigilancia_tropical"
$env:PGUSER = "kenneth_dev"
$env:PGPASSWORD = "tu contraseña local"
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
python app.py
```

Deja esa terminal abierta mientras trabajas. La API estará en `http://127.0.0.1:5000`.

### 3. Preparar e iniciar React

Abre una segunda terminal:

```powershell
Set-Location "C:\ruta\al\proyecto\frontend"
npm ci
npm run dev
```

Abre la dirección que muestre Vite, normalmente `http://localhost:3000`. El servidor de desarrollo reenvía las peticiones `/api` al backend Flask.

## Uso diario (recomendado)

Haz doble clic en `iniciar-desarrollo.bat` desde la carpeta del proyecto. Se abrirá una ventana para el frontend y la ventana del lanzador ejecutará Flask. Cuando lo solicite, escribe la contraseña local de `kenneth_dev` en el prompt oculto. No se guarda en el proyecto.

Abre `http://localhost:3000`. Mantén las ventanas abiertas mientras uses la aplicación. Para detener el backend, presiona **Ctrl+C** en la ventana del lanzador; luego puedes cerrar la ventana de Vite.

El servidor Flask de desarrollo queda limitado a `127.0.0.1`, por lo que no se expone a otros dispositivos de la red local.

## Inicio manual (alternativa)

1. Inicia PostgreSQL.
2. En la primera terminal, ve a la carpeta raíz, activa el entorno virtual y ejecuta `python app.py`.
3. En la segunda terminal, entra a `frontend` y ejecuta `npm run dev`.
4. Abre `http://localhost:3000`.

Para detener los servidores, presiona **Ctrl+C** en cada terminal.

## Comprobación del backend

Con Flask en ejecución, abre otra terminal y ejecuta:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

La respuesta correcta debe indicar que el estado es `ok` y la base de datos está `connected`.

## Ejecutar pruebas unitarias

Desde la carpeta raíz del proyecto:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Estas pruebas usan el cliente de prueba de Flask y no leen ni modifican la base local.

## Linux/Fedora

El proceso es el mismo, pero los comandos cambian:

```bash
sudo systemctl start postgresql
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

En la terminal del backend, exporta `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGHOST` y `PGPORT` según la instalación, y ejecuta `python app.py`. En otra terminal:

```bash
cd frontend
npm ci
npm run dev
```

Abre `http://localhost:3000`.

## Problemas frecuentes

### No se puede conectar a PostgreSQL

- Comprueba que el servicio esté en ejecución.
- Verifica que `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGHOST` y `PGPORT` sean correctos en la terminal donde arrancas Flask.
- Comprueba que la base tenga el esquema `vt` y las tablas creadas.

### Falta Flask u otra dependencia Python

Activa `.venv` y vuelve a instalar:

```powershell
python -m pip install -r requirements.txt
```

### `py -3.11` no encuentra Python

Instala Python 3.11 y vuelve a abrir PowerShell. No se recomienda usar una versión distinta sin comprobar compatibilidad con las dependencias.

### `npm` no se reconoce

Instala Node.js 18 o posterior, que incluye npm, y abre una terminal nueva.

### El frontend abre pero no carga datos

- Comprueba que Flask esté activo y que `/api/health` responda correctamente.
- En desarrollo, abre el frontend desde Vite (`http://localhost:3000`), no abriendo `index.html` directamente ni usando las rutas HTML antiguas del puerto 5000.

## Notas

- `python app.py` es para desarrollo local. En producción el proyecto configura Gunicorn.
- En Render, crea un Blueprint desde `render.yaml` para generar servicios de prueba independientes. Configura los secretos de PostgreSQL, `SECRET_KEY`, `CORS_ORIGINS` y `VITE_API_URL` en el panel; no los guardes en el repositorio.
- El Blueprint no crea una base PostgreSQL. Revisa el costo y la conectividad antes de conectar o provisionar la base.
- El esquema carga datos de demostración con fechas fijas; no son datos en vivo.
- `db/schema.sql` es destructivo para ciertas tablas. Para una base que ya tenga información, revisa las migraciones y haz una copia de seguridad antes de cualquier cambio.

---

Vigilancia Tropical — Quibdó e Istmina, Chocó
