-- Actualizar credenciales del admin sin borrar datos
-- Ejecutar con: psql -U kenneth_dev -d vigilancia_tropical -f update_admin.sql

SET search_path TO vt;

UPDATE usuarios 
SET email = 'admin@vt.co', 
    password_hash = '$2b$12$vw3396fZhLzKN81f1/O9R.aQaNaborb2WDvnELjTGHnCMOnBz6mMi',
    nombre = 'Admin'
WHERE rol = 'admin';
