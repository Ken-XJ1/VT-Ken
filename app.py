"""
Vigilancia Tropical — API Flask
Conexión PostgreSQL: usuario kenneth_dev, base vigilancia_tropical
"""

import os
from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
from functools import wraps

import bcrypt
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-cambiar-en-produccion")
JWT_EXPIRY_HOURS = 24

DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "vigilancia_tropical"),
    "user": os.environ.get("PGUSER", "kenneth_dev"),
}
if os.environ.get("PGHOST"):
    DB_CONFIG["host"] = os.environ["PGHOST"]
if os.environ.get("PGPORT"):
    DB_CONFIG["port"] = os.environ["PGPORT"]
if os.environ.get("PGPASSWORD"):
    DB_CONFIG["password"] = os.environ["PGPASSWORD"]


def get_db():
    return psycopg2.connect(
        **DB_CONFIG,
        cursor_factory=RealDictCursor,
        options="-c search_path=vt,public",
    )


def serialize_row(row):
    if row is None:
        return None
    out = {}
    for key, value in row.items():
        if isinstance(value, Decimal):
            out[key] = float(value)
        elif isinstance(value, (date, datetime)):
            out[key] = value.isoformat()
        else:
            out[key] = value
    return out


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def create_token(user_id, nombre, email, rol):
    payload = {
        "sub": user_id,
        "nombre": nombre,
        "email": email,
        "rol": rol,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


def require_auth(roles=None):
    """Decorador que verifica JWT y opcionalmente restringe por rol."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Token requerido"}), 401
            token = auth_header.split(" ", 1)[1]
            try:
                payload = decode_token(token)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expirado"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Token inválido"}), 401

            if roles and payload.get("rol") not in roles:
                return jsonify({"error": "Acceso no autorizado"}), 403

            request.current_user = payload
            return f(*args, **kwargs)
        return wrapper
    return decorator


# ---------------------------------------------------------------------------
# Rutas HTML legacy (conservadas para compatibilidad)
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/mapa.html")
def mapa_page():
    return send_from_directory(".", "mapa.html")


@app.route("/prediccion.html")
def prediccion_page():
    return send_from_directory(".", "prediccion.html")


@app.route("/enfermedades.html")
def enfermedades_page():
    return send_from_directory(".", "enfermedades.html")


# ---------------------------------------------------------------------------
# Endpoints públicos existentes
# ---------------------------------------------------------------------------

@app.get("/api/municipios")
def list_municipios():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, nombre, habitantes, lat, lng FROM municipios ORDER BY nombre"
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/brotes")
def list_brotes():
    municipio_id = request.args.get("municipio_id", type=int)
    enfermedad_id = request.args.get("enfermedad_id", type=int)

    query = """
        SELECT b.id, b.municipio_id, b.enfermedad_id, b.fecha,
               b.numero_casos, b.fuente, b.lat, b.lng,
               m.nombre AS municipio, e.nombre AS enfermedad
        FROM brotes b
        JOIN municipios m ON m.id = b.municipio_id
        JOIN enfermedades e ON e.id = b.enfermedad_id
        WHERE 1=1
    """
    params = []

    if municipio_id is not None:
        query += " AND b.municipio_id = %s"
        params.append(municipio_id)
    if enfermedad_id is not None:
        query += " AND b.enfermedad_id = %s"
        params.append(enfermedad_id)

    query += " ORDER BY b.fecha DESC, b.numero_casos DESC"

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, params)
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/prediccion")
def prediccion():
    municipio_id = request.args.get("municipio_id", type=int)
    if not municipio_id:
        return jsonify({"error": "municipio_id es requerido"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT p.id, p.municipio_id, p.enfermedad_id,
                           p.fecha_prediccion, p.probabilidad, p.nivel_riesgo,
                           e.nombre AS enfermedad, m.nombre AS municipio
                    FROM predicciones p
                    JOIN enfermedades e ON e.id = p.enfermedad_id
                    JOIN municipios m ON m.id = p.municipio_id
                    WHERE p.municipio_id = %s
                      AND p.fecha_prediccion = (
                          SELECT MAX(fecha_prediccion)
                          FROM predicciones
                          WHERE municipio_id = %s
                      )
                    ORDER BY p.probabilidad DESC
                    """,
                    (municipio_id, municipio_id),
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        if not rows:
            return jsonify({"error": "Sin predicciones para este municipio"}), 404
        return jsonify({"municipio_id": municipio_id, "predicciones": rows})
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/clima")
def clima():
    municipio_id = request.args.get("municipio_id", type=int)
    if not municipio_id:
        return jsonify({"error": "municipio_id es requerido"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT d.id, d.municipio_id, d.fecha,
                           d.temperatura, d.humedad, d.precipitacion,
                           m.nombre AS municipio
                    FROM datos_climaticos d
                    JOIN municipios m ON m.id = d.municipio_id
                    WHERE d.municipio_id = %s
                    ORDER BY d.fecha DESC
                    LIMIT 14
                    """,
                    (municipio_id,),
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/enfermedades")
def list_enfermedades():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, nombre, descripcion, sintomas, transmision, prevencion
                    FROM enfermedades ORDER BY nombre
                    """
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/health")
def health():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return jsonify({"status": "ok", "database": "connected"})
    except psycopg2.Error as e:
        return jsonify({"status": "error", "database": str(e)}), 503


@app.get("/api/admin/reset-password")
def admin_reset_password():
    """Endpoint temporal de desarrollo para generar hash de contraseña"""
    password = "Tropical2026"
    hash_generated = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
    return jsonify({
        "password": password,
        "hash": hash_generated,
        "note": "Usar este hash en schema.sql o ejecutar UPDATE directo en BD"
    })


# ---------------------------------------------------------------------------
# Autenticación
# ---------------------------------------------------------------------------

@app.post("/api/auth/registro")
def auth_registro():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not nombre or not email or not password:
        return jsonify({"error": "nombre, email y password son requeridos"}), 400
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO usuarios (nombre, email, password_hash, rol)
                    VALUES (%s, %s, %s, 'ciudadano')
                    RETURNING id, nombre, email, rol
                    """,
                    (nombre, email, password_hash),
                )
                user = serialize_row(cur.fetchone())
            conn.commit()
        token = create_token(user["id"], user["nombre"], user["email"], user["rol"])
        return jsonify({"token": token, "user": user}), 201
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "El email ya está registrado"}), 409
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.post("/api/auth/login")
def auth_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email y password son requeridos"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, nombre, email, rol, password_hash, activo FROM usuarios WHERE email = %s",
                    (email,),
                )
                user = cur.fetchone()
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500

    if not user:
        return jsonify({"error": "Credenciales incorrectas"}), 401
    if not user["activo"]:
        return jsonify({"error": "Cuenta desactivada. Contacta al administrador"}), 403
    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    token = create_token(user["id"], user["nombre"], user["email"], user["rol"])
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "nombre": user["nombre"],
            "email": user["email"],
            "rol": user["rol"],
        },
    })


@app.get("/api/auth/me")
@require_auth()
def auth_me():
    u = request.current_user
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, nombre, email, rol, activo, fecha_registro FROM usuarios WHERE id = %s",
                    (u["sub"],),
                )
                user = serialize_row(cur.fetchone())
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify(user)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Reportes de síntomas
# ---------------------------------------------------------------------------

@app.post("/api/reportes")
@require_auth(roles=["ciudadano", "admin"])
def crear_reporte():
    data = request.get_json(silent=True) or {}
    sintomas = (data.get("sintomas") or "").strip()
    if not sintomas:
        return jsonify({"error": "El campo sintomas es requerido"}), 400

    municipio_id = data.get("municipio_id")
    enfermedad_sospechosa = (data.get("enfermedad_sospechosa") or "").strip() or None
    nivel_urgencia = data.get("nivel_urgencia", "normal")
    nombre_reporte = (data.get("nombre_reporte") or "").strip() or None
    
    # Nuevos campos
    nombre_paciente = (data.get("nombre_paciente") or "").strip() or None
    direccion = (data.get("direccion") or "").strip() or None
    barrio = (data.get("barrio") or "").strip() or None
    telefono = (data.get("telefono") or "").strip() or None

    if nivel_urgencia not in ("normal", "urgente", "critico"):
        nivel_urgencia = "normal"

    usuario_id = request.current_user["sub"]

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO reportes_sintomas
                        (usuario_id, nombre_reporte, municipio_id, sintomas,
                         enfermedad_sospechosa, nivel_urgencia,
                         nombre_paciente, direccion, barrio, telefono)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, fecha_reporte, estado
                    """,
                    (usuario_id, nombre_reporte, municipio_id, sintomas,
                     enfermedad_sospechosa, nivel_urgencia,
                     nombre_paciente, direccion, barrio, telefono),
                )
                row = serialize_row(cur.fetchone())
            conn.commit()
        return jsonify({"mensaje": "Reporte enviado correctamente", "reporte": row}), 201
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/reportes")
@require_auth(roles=["ciudadano", "admin"])
def list_reportes():
    u = request.current_user
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                if u["rol"] == "admin":
                    cur.execute(
                        """
                        SELECT r.id, r.nombre_reporte, r.sintomas, r.enfermedad_sospechosa,
                               r.nivel_urgencia, r.estado, r.respuesta_admin,
                               r.fecha_reporte, r.fecha_respuesta,
                               r.municipio_id, m.nombre AS municipio,
                               r.usuario_id, us.nombre AS usuario, us.email AS usuario_email,
                               r.nombre_paciente, r.direccion, r.barrio, r.telefono,
                               r.enfermedad_confirmada, r.fecha_estimada_atencion
                        FROM reportes_sintomas r
                        LEFT JOIN municipios m ON m.id = r.municipio_id
                        LEFT JOIN usuarios us ON us.id = r.usuario_id
                        ORDER BY r.fecha_reporte DESC
                        """
                    )
                else:
                    cur.execute(
                        """
                        SELECT r.id, r.nombre_reporte, r.sintomas, r.enfermedad_sospechosa,
                               r.nivel_urgencia, r.estado, r.respuesta_admin,
                               r.fecha_reporte, r.fecha_respuesta,
                               r.municipio_id, m.nombre AS municipio,
                               r.nombre_paciente, r.direccion, r.barrio, r.telefono,
                               r.enfermedad_confirmada, r.fecha_estimada_atencion
                        FROM reportes_sintomas r
                        LEFT JOIN municipios m ON m.id = r.municipio_id
                        WHERE r.usuario_id = %s
                        ORDER BY r.fecha_reporte DESC
                        """,
                        (u["sub"],),
                    )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/reportes/<int:reporte_id>/responder")
@require_auth(roles=["admin"])
def responder_reporte(reporte_id):
    data = request.get_json(silent=True) or {}
    respuesta = (data.get("respuesta_admin") or "").strip()
    estado = data.get("estado", "revisado")
    enfermedad_confirmada = (data.get("enfermedad_confirmada") or "").strip() or None
    fecha_estimada_atencion = data.get("fecha_estimada_atencion") or None

    if estado not in ("pendiente", "revisado", "cerrado"):
        estado = "revisado"

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # Actualizar el reporte
                cur.execute(
                    """
                    UPDATE reportes_sintomas
                    SET respuesta_admin = %s, estado = %s, fecha_respuesta = NOW(),
                        enfermedad_confirmada = %s, fecha_estimada_atencion = %s
                    WHERE id = %s
                    RETURNING id, estado, fecha_respuesta, municipio_id, enfermedad_confirmada
                    """,
                    (respuesta, estado, enfermedad_confirmada, fecha_estimada_atencion, reporte_id),
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "Reporte no encontrado"}), 404
                result = serialize_row(row)
                
                # Si se confirmó una enfermedad específica, crear brote y actualizar predicción
                enfermedades_validas = ['Dengue', 'Malaria', 'Zika', 'Chikungunya']
                if enfermedad_confirmada and enfermedad_confirmada in enfermedades_validas:
                    municipio_id = row["municipio_id"]
                    
                    if municipio_id:
                        # Obtener enfermedad_id
                        cur.execute(
                            "SELECT id FROM enfermedades WHERE nombre = %s",
                            (enfermedad_confirmada,)
                        )
                        enfermedad_row = cur.fetchone()
                        
                        if enfermedad_row:
                            enfermedad_id = enfermedad_row["id"]
                            
                            # Obtener coordenadas del municipio
                            cur.execute(
                                "SELECT lat, lng FROM municipios WHERE id = %s",
                                (municipio_id,)
                            )
                            municipio_coords = cur.fetchone()
                            
                            if municipio_coords:
                                # Insertar brote
                                cur.execute(
                                    """
                                    INSERT INTO brotes (municipio_id, enfermedad_id, fecha, numero_casos, fuente, lat, lng)
                                    VALUES (%s, %s, CURRENT_DATE, 1, %s, %s, %s)
                                    """,
                                    (municipio_id, enfermedad_id, f"Reporte ciudadano confirmado — VT-{reporte_id}",
                                     municipio_coords["lat"], municipio_coords["lng"])
                                )
                                
                                print(f"[INFO] Brote creado: {enfermedad_confirmada} en municipio {municipio_id} (VT-{reporte_id})")
                                
                                # Actualizar o insertar predicción
                                cur.execute(
                                    """
                                    SELECT id, probabilidad FROM predicciones 
                                    WHERE municipio_id = %s AND enfermedad_id = %s 
                                    AND fecha_prediccion = CURRENT_DATE
                                    """,
                                    (municipio_id, enfermedad_id)
                                )
                                pred_existente = cur.fetchone()
                                
                                if pred_existente:
                                    # Actualizar predicción existente
                                    nueva_prob = min(pred_existente["probabilidad"] + 5, 100)
                                    if nueva_prob >= 70:
                                        nivel = 'alto'
                                    elif nueva_prob >= 40:
                                        nivel = 'medio'
                                    else:
                                        nivel = 'bajo'
                                    
                                    cur.execute(
                                        """
                                        UPDATE predicciones 
                                        SET probabilidad = %s, nivel_riesgo = %s
                                        WHERE id = %s
                                        """,
                                        (nueva_prob, nivel, pred_existente["id"])
                                    )
                                    print(f"[INFO] Predicción actualizada: probabilidad {nueva_prob}%, nivel {nivel}")
                                else:
                                    # Insertar nueva predicción
                                    cur.execute(
                                        """
                                        INSERT INTO predicciones (municipio_id, enfermedad_id, fecha_prediccion, probabilidad, nivel_riesgo)
                                        VALUES (%s, %s, CURRENT_DATE, 5, 'bajo')
                                        """,
                                        (municipio_id, enfermedad_id)
                                    )
                                    print(f"[INFO] Predicción creada: probabilidad 5%, nivel bajo")
                
            conn.commit()
            print(f"[INFO] Respuesta guardada para reporte VT-{reporte_id}")
        return jsonify({"mensaje": "Respuesta guardada", "reporte": result})
    except psycopg2.Error as e:
        print(f"[ERROR] Error en responder_reporte: {str(e)}")
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Mensajes
# ---------------------------------------------------------------------------

@app.post("/api/mensajes")
@require_auth(roles=["ciudadano", "admin"])
def enviar_mensaje():
    data = request.get_json(silent=True) or {}
    asunto = (data.get("asunto") or "").strip()
    mensaje = (data.get("mensaje") or "").strip()

    if not asunto or not mensaje:
        return jsonify({"error": "asunto y mensaje son requeridos"}), 400

    usuario_id = request.current_user["sub"]

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO mensajes (usuario_id, asunto, mensaje)
                    VALUES (%s, %s, %s)
                    RETURNING id, fecha_mensaje
                    """,
                    (usuario_id, asunto, mensaje),
                )
                row = serialize_row(cur.fetchone())
            conn.commit()
        return jsonify({"mensaje": "Mensaje enviado correctamente", "data": row}), 201
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/mensajes")
@require_auth(roles=["ciudadano", "admin"])
def list_mensajes():
    u = request.current_user
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                if u["rol"] == "admin":
                    cur.execute(
                        """
                        SELECT m.id, m.asunto, m.mensaje, m.leido,
                               m.respuesta_admin, m.fecha_mensaje, m.fecha_respuesta,
                               m.usuario_id, u.nombre AS usuario, u.email AS usuario_email
                        FROM mensajes m
                        JOIN usuarios u ON u.id = m.usuario_id
                        ORDER BY m.fecha_mensaje DESC
                        """
                    )
                else:
                    cur.execute(
                        """
                        SELECT id, asunto, mensaje, leido,
                               respuesta_admin, fecha_mensaje, fecha_respuesta
                        FROM mensajes
                        WHERE usuario_id = %s
                        ORDER BY fecha_mensaje DESC
                        """,
                        (u["sub"],),
                    )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/mensajes/<int:mensaje_id>/responder")
@require_auth(roles=["admin"])
def responder_mensaje(mensaje_id):
    data = request.get_json(silent=True) or {}
    respuesta = (data.get("respuesta_admin") or "").strip()
    if not respuesta:
        return jsonify({"error": "respuesta_admin es requerido"}), 400

    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE mensajes
                    SET respuesta_admin = %s, leido = true, fecha_respuesta = NOW()
                    WHERE id = %s
                    RETURNING id, fecha_respuesta
                    """,
                    (respuesta, mensaje_id),
                )
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "Mensaje no encontrado"}), 404
                result = serialize_row(row)
            conn.commit()
        return jsonify({"mensaje": "Respuesta enviada", "data": result})
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/mensajes/<int:mensaje_id>/leer")
@require_auth(roles=["admin"])
def marcar_leido(mensaje_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE mensajes SET leido = true WHERE id = %s RETURNING id",
                    (mensaje_id,),
                )
                if not cur.fetchone():
                    return jsonify({"error": "Mensaje no encontrado"}), 404
            conn.commit()
        return jsonify({"mensaje": "Marcado como leido"})
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Panel admin — estadísticas
# ---------------------------------------------------------------------------

@app.get("/api/admin/stats")
@require_auth(roles=["admin"])
def admin_stats():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # Total usuarios ciudadanos activos
                cur.execute("SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'ciudadano' AND activo = true")
                total_usuarios = cur.fetchone()["total"]

                # Total reportes
                cur.execute("SELECT COUNT(*) AS total FROM reportes_sintomas")
                total_reportes = cur.fetchone()["total"]

                # Reportes pendientes
                cur.execute("SELECT COUNT(*) AS total FROM reportes_sintomas WHERE estado = 'pendiente'")
                reportes_pendientes = cur.fetchone()["total"]

                # Total mensajes
                cur.execute("SELECT COUNT(*) AS total FROM mensajes")
                total_mensajes = cur.fetchone()["total"]

                # Mensajes sin leer
                cur.execute("SELECT COUNT(*) AS total FROM mensajes WHERE leido = false")
                mensajes_no_leidos = cur.fetchone()["total"]

                # Brotes este mes
                mes_actual = datetime.now().strftime('%Y-%m')
                cur.execute(
                    "SELECT COUNT(*) AS total FROM brotes WHERE TO_CHAR(fecha, 'YYYY-MM') = %s",
                    (mes_actual,)
                )
                brotes_este_mes = cur.fetchone()["total"]

        return jsonify({
            "total_usuarios": total_usuarios,
            "total_reportes": total_reportes,
            "reportes_pendientes": reportes_pendientes,
            "total_mensajes": total_mensajes,
            "mensajes_no_leidos": mensajes_no_leidos,
            "brotes_este_mes": brotes_este_mes,
        })
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/admin/usuarios")
@require_auth(roles=["admin"])
def admin_list_usuarios():
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, nombre, email, rol, activo, fecha_registro
                    FROM usuarios ORDER BY fecha_registro DESC
                    """
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/admin/usuarios/<int:usuario_id>/toggle")
@require_auth(roles=["admin"])
def toggle_usuario(usuario_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # No permitir desactivar al admin principal
                cur.execute("SELECT email, activo FROM usuarios WHERE id = %s", (usuario_id,))
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "Usuario no encontrado"}), 404
                if user["email"] == "admin@vigilanciatropical.co":
                    return jsonify({"error": "No se puede desactivar al administrador principal"}), 403

                cur.execute(
                    "UPDATE usuarios SET activo = NOT activo WHERE id = %s RETURNING id, activo",
                    (usuario_id,),
                )
                result = serialize_row(cur.fetchone())
                
                # Registrar en auditoría
                cur.execute(
                    """
                    INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (request.current_user["sub"], "toggle_usuario", "usuarios", usuario_id, 
                     f"Usuario {'activado' if result['activo'] else 'desactivado'}")
                )
            conn.commit()
        return jsonify(result)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/admin/usuarios/<int:usuario_id>")
@require_auth(roles=["admin"])
def editar_usuario(usuario_id):
    """Editar datos de un usuario (solo admin)"""
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    rol = data.get("rol", "ciudadano")
    
    if not nombre or not email:
        return jsonify({"error": "nombre y email son requeridos"}), 400
    if rol not in ("ciudadano", "admin"):
        return jsonify({"error": "rol debe ser 'ciudadano' o 'admin'"}), 400
    
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # Verificar que el usuario existe
                cur.execute("SELECT email FROM usuarios WHERE id = %s", (usuario_id,))
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "Usuario no encontrado"}), 404
                
                # No permitir cambiar el email del admin principal
                if user["email"] == "admin@vigilanciatropical.co" and email != user["email"]:
                    return jsonify({"error": "No se puede cambiar el email del administrador principal"}), 403
                
                # Actualizar usuario
                cur.execute(
                    """
                    UPDATE usuarios 
                    SET nombre = %s, email = %s, rol = %s
                    WHERE id = %s
                    RETURNING id, nombre, email, rol, activo, fecha_registro
                    """,
                    (nombre, email, rol, usuario_id)
                )
                result = serialize_row(cur.fetchone())
                
                # Registrar en auditoría
                cur.execute(
                    """
                    INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (request.current_user["sub"], "editar_usuario", "usuarios", usuario_id,
                     f"Usuario editado: {nombre} ({email}) - rol: {rol}")
                )
            conn.commit()
        return jsonify(result)
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "El email ya está registrado"}), 409
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/perfil")
@require_auth()
def get_perfil():
    """Obtener perfil del usuario actual"""
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, nombre, email, rol, activo, fecha_registro
                    FROM usuarios WHERE id = %s
                    """,
                    (request.current_user["sub"],)
                )
                user = serialize_row(cur.fetchone())
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify(user)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.put("/api/perfil")
@require_auth()
def actualizar_perfil():
    """Actualizar perfil del usuario actual"""
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password_actual = data.get("password_actual", "")
    password_nueva = data.get("password_nueva", "")
    
    if not nombre or not email:
        return jsonify({"error": "nombre y email son requeridos"}), 400
    
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                # Obtener datos actuales
                cur.execute(
                    "SELECT password_hash FROM usuarios WHERE id = %s",
                    (request.current_user["sub"],)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "Usuario no encontrado"}), 404
                
                # Si quiere cambiar contraseña, verificar la actual
                if password_nueva:
                    if not password_actual:
                        return jsonify({"error": "Debes proporcionar tu contraseña actual"}), 400
                    if not bcrypt.checkpw(password_actual.encode(), user["password_hash"].encode()):
                        return jsonify({"error": "Contraseña actual incorrecta"}), 401
                    if len(password_nueva) < 6:
                        return jsonify({"error": "La nueva contraseña debe tener al menos 6 caracteres"}), 400
                    
                    # Actualizar con nueva contraseña
                    password_hash = bcrypt.hashpw(password_nueva.encode(), bcrypt.gensalt()).decode()
                    cur.execute(
                        """
                        UPDATE usuarios 
                        SET nombre = %s, email = %s, password_hash = %s
                        WHERE id = %s
                        RETURNING id, nombre, email, rol
                        """,
                        (nombre, email, password_hash, request.current_user["sub"])
                    )
                else:
                    # Actualizar sin cambiar contraseña
                    cur.execute(
                        """
                        UPDATE usuarios 
                        SET nombre = %s, email = %s
                        WHERE id = %s
                        RETURNING id, nombre, email, rol
                        """,
                        (nombre, email, request.current_user["sub"])
                    )
                
                result = serialize_row(cur.fetchone())
                
                # Registrar en auditoría
                cur.execute(
                    """
                    INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, detalles)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (request.current_user["sub"], "actualizar_perfil", "usuarios", request.current_user["sub"],
                     f"Perfil actualizado: {nombre} ({email})" + (" - contraseña cambiada" if password_nueva else ""))
                )
            conn.commit()
        
        # Generar nuevo token con datos actualizados
        token = create_token(result["id"], result["nombre"], result["email"], result["rol"])
        return jsonify({"token": token, "user": result})
    except psycopg2.errors.UniqueViolation:
        return jsonify({"error": "El email ya está registrado"}), 409
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


@app.get("/api/admin/auditoria")
@require_auth(roles=["admin"])
def get_auditoria():
    """Obtener registros de auditoría"""
    limite = request.args.get("limite", 100, type=int)
    
    try:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT a.id, a.usuario_id, a.accion, a.tabla_afectada, 
                           a.registro_id, a.detalles, a.ip_address, a.fecha,
                           u.nombre AS usuario_nombre, u.email AS usuario_email
                    FROM auditoria a
                    LEFT JOIN usuarios u ON u.id = a.usuario_id
                    ORDER BY a.fecha DESC
                    LIMIT %s
                    """,
                    (limite,)
                )
                rows = [serialize_row(r) for r in cur.fetchall()]
        return jsonify(rows)
    except psycopg2.Error as e:
        return jsonify({"error": "Error de base de datos", "detail": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
