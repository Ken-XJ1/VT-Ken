# Manual de inicio — Vigilancia Tropical

Guía para encender la página cada vez que prendes tu PC (Fedora).

---

## Resumen rápido (cada día)

Abre una terminal y ejecuta **en este orden**:

```bash
# 1. Encender PostgreSQL
sudo systemctl start postgresql

# 2. Ir al proyecto
cd ~/vigilancia-tropical

# 3. Encender la aplicación
python app.py
```

Luego abre el navegador en:

**http://127.0.0.1:5000**

Para apagar la página: en la terminal donde corre `python app.py`, presiona **Ctrl + C**.

---

## Paso a paso detallado

### Paso 1 — Abrir la terminal

- Atajo: `Ctrl + Alt + T`
- O busca **Terminal** en el menú de aplicaciones

### Paso 2 — Verificar que PostgreSQL esté activo

PostgreSQL es la base de datos donde están municipios, brotes, clima y predicciones.

```bash
sudo systemctl start postgresql
```

Comprobar que está corriendo:

```bash
systemctl is-active postgresql
```

Debe decir: `active`

> **Opcional (una sola vez):** para que PostgreSQL arranque solo al prender el PC:
>
> ```bash
> sudo systemctl enable postgresql
> ```

### Paso 3 — Ir a la carpeta del proyecto

```bash
cd ~/vigilancia-tropical
```

### Paso 4 — (Solo la primera vez o si cambiaste de PC) Instalar dependencias

Si nunca instalaste las librerías de Python del proyecto:

```bash
pip install -r requirements-flask.txt
```

O, si usas `pip3`:

```bash
pip3 install -r requirements-flask.txt
```

### Paso 5 — Encender el servidor web (Flask)

```bash
python app.py
```

Verás algo parecido a:

```
 * Running on http://127.0.0.1:5000
```

**No cierres esa terminal** mientras uses la página. Si la cierras, la web deja de funcionar.

### Paso 6 — Abrir la página en el navegador

| Página        | Dirección                          |
|---------------|-------------------------------------|
| Inicio        | http://127.0.0.1:5000               |
| Mapa          | http://127.0.0.1:5000/mapa.html     |
| Predicción    | http://127.0.0.1:5000/prediccion.html |
| Enfermedades  | http://127.0.0.1:5000/enfermedades.html |

También puedes hacer clic en los enlaces del menú desde la página de inicio.

### Paso 7 — Comprobar que todo está bien (opcional)

En **otra** terminal (deja la primera con `python app.py` corriendo):

```bash
curl http://127.0.0.1:5000/api/health
```

Respuesta correcta:

```json
{"status": "ok", "database": "connected"}
```

---

## Cómo apagar la página

1. Ve a la terminal donde está `python app.py`
2. Presiona **Ctrl + C**
3. (Opcional) Si no vas a usar la base de datos:
   ```bash
   sudo systemctl stop postgresql
   ```

---

## Primera instalación en un PC nuevo (solo una vez)

Si clonaste el proyecto desde GitHub y nunca configuraste la base de datos:

```bash
# Clonar (si aún no lo tienes)
git clone git@github.com:Ken-XJ1/vigilancia-tropical.git
cd vigilancia-tropical

# Dependencias Python
pip install -r requirements-flask.txt

# PostgreSQL encendido
sudo systemctl start postgresql

# Crear base de datos (si no existe)
createdb -U kenneth_dev vigilancia_tropical

# Cargar tablas y datos de ejemplo
psql -U kenneth_dev -d vigilancia_tropical -f db/schema.sql

# Arrancar la app
python app.py
```

> Si `createdb` da error de permisos, pide a alguien con acceso admin que cree la base, o usa:
> `sudo -u postgres createdb -O kenneth_dev vigilancia_tropical`

---

## Problemas frecuentes

### La página no carga / “No se puede conectar”

- ¿Está corriendo `python app.py`? Revisa la terminal.
- ¿Usas `http://127.0.0.1:5000` y no abres el archivo `index.html` directamente desde el explorador de archivos?

### Error de base de datos al abrir mapa o predicción

```bash
sudo systemctl start postgresql
```

Luego reinicia la app (**Ctrl + C** y otra vez `python app.py`).

### `python: command not found`

Prueba:

```bash
python3 app.py
```

### `ModuleNotFoundError: No module named 'flask'`

```bash
cd ~/vigilancia-tropical
pip install -r requirements-flask.txt
```

### Puerto 5000 ocupado

Cierra la otra instancia con **Ctrl + C**, o mata el proceso:

```bash
pkill -f "python app.py"
```

---

## Orden de lo que enciendes (diagrama)

```
PC encendido
    ↓
PostgreSQL  (sudo systemctl start postgresql)
    ↓
python app.py  (en ~/vigilancia-tropical)
    ↓
Navegador → http://127.0.0.1:5000
```

---

## Archivo que debes recordar

| Qué              | Dónde / comando              |
|------------------|------------------------------|
| Carpeta proyecto | `~/vigilancia-tropical`      |
| Arrancar web     | `python app.py`              |
| URL principal    | http://127.0.0.1:5000        |
| Base de datos    | PostgreSQL, usuario `kenneth_dev`, BD `vigilancia_tropical` |

---

*Vigilancia Tropical — Quibdó e Istmina, Chocó*
