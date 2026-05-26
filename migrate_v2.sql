-- Migración v2 — Vigilancia Tropical
-- Agrega columnas faltantes a tablas existentes en producción (Render)
-- Ejecutar: psql $DATABASE_URL -f migrate_v2.sql

SET search_path TO vt, public;

-- ============================================================
-- 1. Columnas faltantes en usuarios
-- ============================================================
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido    VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono    VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS genero      VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion   VARCHAR(250);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS barrio      VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES municipios(id);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ocupacion   VARCHAR(100);

-- ============================================================
-- 2. Columnas faltantes en reportes_sintomas
-- ============================================================
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS nombre_paciente        VARCHAR(150);
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS direccion               VARCHAR(250);
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS barrio                  VARCHAR(100);
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS telefono                VARCHAR(20);
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS enfermedad_confirmada   VARCHAR(80);
ALTER TABLE reportes_sintomas ADD COLUMN IF NOT EXISTS fecha_estimada_atencion DATE;

-- ============================================================
-- 3. Tabla auditoria (si no existe)
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria (
    id           SERIAL PRIMARY KEY,
    usuario_id   INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion       VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id  INTEGER,
    detalles     TEXT,
    ip_address   VARCHAR(45),
    fecha        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha   ON auditoria(fecha DESC);

-- ============================================================
-- 4. Índices adicionales
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_sintomas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado  ON reportes_sintomas(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario ON mensajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido   ON mensajes(leido);
