import bcrypt
h = bcrypt.hashpw('Tropical2026'.encode(), bcrypt.gensalt(12)).decode()
with open('/home/kenneth_dev/vigilancia-tropical/hash_output.txt', 'w') as f:
    f.write(h)
