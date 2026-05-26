SET search_path TO vt, public;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'ciudadano' CHECK (rol IN ('ciudadano', 'admin')),
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reportes_sintomas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_reporte VARCHAR(100),
    municipio_id INTEGER REFERENCES municipios(id),
    sintomas TEXT NOT NULL,
    enfermedad_sospechosa VARCHAR(80),
    nivel_urgencia VARCHAR(20) DEFAULT 'normal' CHECK (nivel_urgencia IN ('normal', 'urgente', 'critico')),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisado', 'cerrado')),
    respuesta_admin TEXT,
    fecha_reporte TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_respuesta TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    asunto VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    respuesta_admin TEXT,
    fecha_mensaje TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_respuesta TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_sintomas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_sintomas(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario ON mensajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);

-- Insertar o actualizar admin
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Admin', 'admin@vt.co', '$2b$12$qeIUTVke8tyfJhmflDM6se/f.4H6E20a6LdqN6QWlvANq9NlvkrAy', 'admin')
ON CONFLICT (email) DO UPDATE
  SET nombre = 'Admin',
      password_hash = '$2b$12$qeIUTVke8tyfJhmflDM6se/f.4H6E20a6LdqN6QWlvANq9NlvkrAy';

-- Si existía el admin con el email viejo, actualizarlo también
UPDATE usuarios
SET email = 'admin@vt.co',
    password_hash = '$2b$12$qeIUTVke8tyfJhmflDM6se/f.4H6E20a6LdqN6QWlvANq9NlvkrAy',
    nombre = 'Admin'
WHERE rol = 'admin' AND email != 'admin@vt.co';
