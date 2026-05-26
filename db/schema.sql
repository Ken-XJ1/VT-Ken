-- Vigilancia Tropical — Esquema PostgreSQL
-- Crear la base de datos (como superusuario):
--   createdb -U kenneth_dev vigilancia_tropical
-- Cargar este archivo:
--   psql -U kenneth_dev -d vigilancia_tropical -f db/schema.sql

CREATE SCHEMA IF NOT EXISTS vt AUTHORIZATION kenneth_dev;
SET search_path TO vt;

DROP TABLE IF EXISTS predicciones CASCADE;
DROP TABLE IF EXISTS datos_climaticos CASCADE;
DROP TABLE IF EXISTS brotes CASCADE;
DROP TABLE IF EXISTS enfermedades CASCADE;
DROP TABLE IF EXISTS municipios CASCADE;

-- Municipios del Chocó
CREATE TABLE municipios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    habitantes INTEGER NOT NULL,
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL
);

CREATE TABLE enfermedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    sintomas TEXT NOT NULL,
    transmision TEXT NOT NULL,
    prevencion TEXT NOT NULL
);

CREATE TABLE brotes (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    enfermedad_id INTEGER NOT NULL REFERENCES enfermedades(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    numero_casos INTEGER NOT NULL CHECK (numero_casos >= 0),
    fuente VARCHAR(200) NOT NULL,
    lat DECIMAL(9, 6) NOT NULL,
    lng DECIMAL(9, 6) NOT NULL
);

CREATE TABLE datos_climaticos (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    temperatura DECIMAL(4, 1) NOT NULL,
    humedad DECIMAL(5, 2) NOT NULL,
    precipitacion DECIMAL(6, 2) NOT NULL DEFAULT 0
);

CREATE TABLE predicciones (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    enfermedad_id INTEGER NOT NULL REFERENCES enfermedades(id) ON DELETE CASCADE,
    fecha_prediccion DATE NOT NULL,
    probabilidad DECIMAL(5, 2) NOT NULL CHECK (probabilidad >= 0 AND probabilidad <= 100),
    nivel_riesgo VARCHAR(20) NOT NULL CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto', 'critico'))
);

CREATE INDEX idx_brotes_municipio ON brotes(municipio_id);
CREATE INDEX idx_brotes_enfermedad ON brotes(enfermedad_id);
CREATE INDEX idx_brotes_fecha ON brotes(fecha DESC);
CREATE INDEX idx_clima_municipio_fecha ON datos_climaticos(municipio_id, fecha DESC);
CREATE INDEX idx_predicciones_municipio ON predicciones(municipio_id, fecha_prediccion DESC);

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20),
    direccion VARCHAR(250),
    barrio VARCHAR(100),
    municipio_id INTEGER REFERENCES municipios(id),
    ocupacion VARCHAR(100),
    rol VARCHAR(20) NOT NULL DEFAULT 'ciudadano' CHECK (rol IN ('ciudadano', 'admin')),
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reportes de síntomas enviados por ciudadanos
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
    fecha_respuesta TIMESTAMP,
    nombre_paciente VARCHAR(150),
    direccion VARCHAR(250),
    barrio VARCHAR(100),
    telefono VARCHAR(20),
    enfermedad_confirmada VARCHAR(80),
    fecha_estimada_atencion DATE
);

-- Mensajes de ciudadanos al administrador
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

-- Auditoría de acciones del sistema
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    detalles TEXT,
    ip_address VARCHAR(45),
    fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_sintomas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_sintomas(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario ON mensajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha DESC);

-- Usuario admin por defecto (password: Tropical2026)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Admin', 'admin@vt.co',
 '$2b$12$vw3396fZhLzKN81f1/O9R.aQaNaborb2WDvnELjTGHnCMOnBz6mMi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Municipios: Quibdó e Istmina
INSERT INTO municipios (nombre, habitantes, lat, lng) VALUES
    ('Quibdó', 129237, 5.694700, -76.661100),
    ('Istmina', 14396, 5.157500, -76.686900);

-- Enfermedades tropicales
INSERT INTO enfermedades (nombre, descripcion, sintomas, transmision, prevencion) VALUES
(
    'Dengue',
    'Enfermedad viral transmitida por mosquitos del género Aedes, endémica en el Pacífico colombiano. En Quibdó e Istmina la incidencia aumenta en épocas de lluvia por la proliferación de criaderos.',
    'Fiebre alta súbita, dolor retroocular, mialgias, artralgias, rash cutáneo, náuseas. Formas graves: dolor abdominal, sangrado, shock.',
    'Picadura de mosquitos Aedes aegypti y Aedes albopictus infectados. No hay transmisión directa persona a persona.',
    'Eliminar criaderos de agua estancada, usar repelente y mosquiteros, fumigación comunitaria, monitoreo larvario en barrios del Atrato.'
),
(
    'Malaria',
    'Enfermedad parasitaria causada por Plasmodium. En el Chocó predomina P. vivax con brotes asociados a zonas ribereñas y minería informal.',
    'Fiebre intermitente, escalofríos, sudoración, cefalea, anemia. P. falciparum puede causar complicaciones neurológicas.',
    'Picadura de mosquitos Anopheles infectados, principalmente de noche. Riesgo en zonas rurales y periurbanas.',
    'Uso de mosquiteros impregnados con insecticida, rociado intradomiciliario, quimioprofilaxis en viajeros, diagnóstico y tratamiento oportuno.'
),
(
    'Zika',
    'Infección viral leve en adultos pero con riesgo de microcefalia congénita y síndrome de Guillain-Barré. Presente en el bajo Atrato desde 2015.',
    'Fiebre baja, exantema maculopapular, conjuntivitis no purulenta, artralgias leves. Muchos casos son asintomáticos.',
    'Transmisión por Aedes aegypti. También transmisión sexual, vertical y por transfusión sanguínea.',
    'Control del vector igual que dengue, protección en embarazadas, reporte de casos sospechosos a la Secretaría de Salud.'
),
(
    'Chikungunya',
    'Arbovirosis que causa fiebre y artritis debilitante prolongada. Endémica en el Pacífico con brotes cíclicos en municipios del Chocó.',
    'Fiebre alta, dolor articular intenso bilateral, edema articular, cefalea, mialgias. Artralgias pueden persistir meses.',
    'Picadura de Aedes aegypti y Aedes albopictus. Brotes urbanos en mercados y barrios densos.',
    'Control de vectores, evitar picaduras en horas de mayor actividad del mosquito, educación comunitaria en Istmina y Quibdó.'
);

-- Brotes recientes (2025-2026) — datos representativos INS/DANE Chocó
INSERT INTO brotes (municipio_id, enfermedad_id, fecha, numero_casos, fuente, lat, lng) VALUES
-- Quibdó — Dengue
(1, 1, '2026-04-15', 42, 'SIVIGILA — E.S.E. San Francisco de Asís', 5.694700, -76.661100),
(1, 1, '2026-04-10', 28, 'SIVIGILA — Centro de Salud El Coco', 5.702100, -76.648300),
(1, 1, '2026-03-22', 19, 'Notificación voluntaria — Barrio Pueblo Nuevo', 5.688200, -76.670500),
-- Quibdó — Malaria
(1, 2, '2026-04-12', 11, 'Programa malaria — Zona rural Munguía', 5.720000, -76.690000),
(1, 2, '2026-03-18', 7, 'SIVIGILA — Puerto Español', 5.675000, -76.655000),
-- Quibdó — Zika
(1, 3, '2026-02-28', 4, 'Laboratorio municipal Quibdó', 5.691000, -76.658000),
(1, 3, '2026-01-15', 2, 'SIVIGILA', 5.698000, -76.665000),
-- Quibdó — Chikungunya
(1, 4, '2026-04-08', 15, 'SIVIGILA — Mercado del Río Atrato', 5.696500, -76.659800),
(1, 4, '2026-03-05', 9, 'SIVIGILA — Barrio La Playita', 5.701500, -76.672000),
-- Istmina — Dengue
(2, 1, '2026-04-14', 18, 'Hospital San Antonio — Istmina', 5.157500, -76.686900),
(2, 1, '2026-04-01', 12, 'Puesto de salud Condoto vía', 5.165000, -76.680000),
-- Istmina — Malaria
(2, 2, '2026-04-05', 14, 'Programa malaria — Zona minera San Miguel', 5.148000, -76.695000),
(2, 2, '2026-03-20', 8, 'SIVIGILA Istmina', 5.160000, -76.682000),
-- Istmina — Zika
(2, 3, '2026-03-10', 3, 'SIVIGILA', 5.155000, -76.688000),
-- Istmina — Chikungunya
(2, 4, '2026-04-11', 6, 'SIVIGILA — Centro urbano', 5.158000, -76.685500),
(2, 4, '2026-02-20', 4, 'Notificación comunitaria', 5.152000, -76.691000);

-- Datos climáticos recientes (promedios típicos Chocó húmedo tropical)
INSERT INTO datos_climaticos (municipio_id, fecha, temperatura, humedad, precipitacion) VALUES
(1, '2026-05-19', 28.5, 88.0, 12.4),
(1, '2026-05-18', 29.1, 86.5, 8.2),
(1, '2026-05-17', 27.8, 91.0, 24.6),
(1, '2026-05-16', 28.2, 89.5, 15.1),
(1, '2026-05-15', 29.0, 85.0, 6.8),
(1, '2026-05-14', 28.7, 87.2, 11.3),
(1, '2026-05-13', 27.5, 92.0, 32.5),
(2, '2026-05-19', 27.9, 90.5, 18.7),
(2, '2026-05-18', 28.4, 88.0, 10.2),
(2, '2026-05-17', 27.2, 93.0, 28.4),
(2, '2026-05-16', 28.0, 89.0, 14.5),
(2, '2026-05-15', 28.8, 86.5, 7.1),
(2, '2026-05-14', 27.6, 91.5, 22.0),
(2, '2026-05-13', 27.0, 94.0, 35.2);

-- Predicciones de riesgo (semana actual)
INSERT INTO predicciones (municipio_id, enfermedad_id, fecha_prediccion, probabilidad, nivel_riesgo) VALUES
(1, 1, '2026-05-19', 78.5, 'alto'),
(1, 2, '2026-05-19', 42.0, 'medio'),
(1, 3, '2026-05-19', 18.5, 'bajo'),
(1, 4, '2026-05-19', 55.0, 'medio'),
(2, 1, '2026-05-19', 65.0, 'alto'),
(2, 2, '2026-05-19', 71.0, 'alto'),
(2, 3, '2026-05-19', 12.0, 'bajo'),
(2, 4, '2026-05-19', 38.0, 'medio');
