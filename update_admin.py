import psycopg2, os

conn = psycopg2.connect(
    dbname=os.environ.get("PGDATABASE", "vigilancia_tropical"),
    user=os.environ.get("PGUSER", "kenneth_dev"),
    options="-c search_path=vt,public"
)
cur = conn.cursor()
cur.execute(
    "UPDATE usuarios SET email=%s, password_hash=%s, nombre=%s WHERE rol='admin'",
    (
        'admin@vt.co',
        '$2b$12$qeIUTVke8tyfJhmflDM6se/f.4H6E20a6LdqN6QWlvANq9NlvkrAy',
        'Admin'
    )
)
conn.commit()
cur.execute("SELECT id, nombre, email, rol FROM usuarios WHERE rol='admin'")
row = cur.fetchone()
with open('/home/kenneth_dev/vigilancia-tropical/update_result.txt', 'w') as f:
    f.write(str(row))
conn.close()
