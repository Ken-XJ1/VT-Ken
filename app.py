"""
Vigilancia Tropical — API Flask
Conexión PostgreSQL: usuario kenneth_dev, base vigilancia_tropical
"""

import os
from datetime import date
from decimal import Decimal

import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

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
        elif isinstance(value, date):
            out[key] = value.isoformat()
        else:
            out[key] = value
    return out


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
