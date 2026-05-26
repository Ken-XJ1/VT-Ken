-- Migración v3 — Sincronizar predicciones con brotes reales
-- Borra predicciones desactualizadas y recalcula desde brotes de los últimos 90 días
-- Ejecutar: psql $DATABASE_URL -f migrate_v3_predicciones.sql

SET search_path TO vt, public;

-- Borrar predicciones antiguas (las del seed con fecha fija que ya no coinciden)
DELETE FROM predicciones
WHERE fecha_prediccion < CURRENT_DATE;

-- Insertar predicciones calculadas desde brotes reales (últimos 90 días)
-- Una fila por municipio+enfermedad con la fecha de hoy
INSERT INTO predicciones (municipio_id, enfermedad_id, fecha_prediccion, probabilidad, nivel_riesgo)
SELECT
    b.municipio_id,
    b.enfermedad_id,
    CURRENT_DATE AS fecha_prediccion,
    LEAST(ROUND(CAST(SUM(b.numero_casos) * 1.5 AS numeric), 1), 95) AS probabilidad,
    CASE
        WHEN SUM(b.numero_casos) * 1.5 >= 70 THEN 'alto'
        WHEN SUM(b.numero_casos) * 1.5 >= 40 THEN 'medio'
        ELSE 'bajo'
    END AS nivel_riesgo
FROM brotes b
WHERE b.fecha >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY b.municipio_id, b.enfermedad_id
ON CONFLICT DO NOTHING;

-- Para enfermedades sin brotes recientes, insertar con probabilidad baja
INSERT INTO predicciones (municipio_id, enfermedad_id, fecha_prediccion, probabilidad, nivel_riesgo)
SELECT
    m.id AS municipio_id,
    e.id AS enfermedad_id,
    CURRENT_DATE,
    5.0,
    'bajo'
FROM municipios m
CROSS JOIN enfermedades e
WHERE NOT EXISTS (
    SELECT 1 FROM predicciones p
    WHERE p.municipio_id = m.id
      AND p.enfermedad_id = e.id
      AND p.fecha_prediccion = CURRENT_DATE
)
ON CONFLICT DO NOTHING;
