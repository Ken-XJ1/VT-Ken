import psycopg2, bcrypt, os

conn = psycopg2.connect(
    dbname=os.environ.get("PGDATABASE", "vigilancia_tropical"),
    user=os.environ.get("PGUSER", "kenneth_dev"),
    options="-c search_path=vt,public"
)
cur = conn.cursor()
cur.execute("SELECT id, nombre, email, rol, password_hash FROM usuarios WHERE rol='admin'")
rows = cur.fetchall()
result_lines = []
for row in rows:
    uid, nombre, email, rol, ph = row
    ok = bcrypt.checkpw(b'Tropical2026', ph.encode())
    result_lines.append(f"id={uid} nombre={nombre} email={email} rol={rol} pw_ok={ok}")
conn.close()
with open('/home/kenneth_dev/vigilancia-tropical/verify_result.txt', 'w') as f:
    f.write('\n'.join(result_lines) if result_lines else 'NO ADMIN FOUND')
