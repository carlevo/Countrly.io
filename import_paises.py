import psycopg2
import csv

conn_string = "postgresql://postgres.wyzlistwyyuzomgvshix:Cerocuela2026!@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

with psycopg2.connect(conn_string) as conn:
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS paises (
                id SERIAL PRIMARY KEY,
                nombre TEXT NOT NULL
            );
        """)
        cur.execute("TRUNCATE TABLE paises RESTART IDENTITY;")

        with open("paises.csv", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = [(row["nombre"],) for row in reader]

        cur.executemany("INSERT INTO paises (nombre) VALUES (%s);", rows)
        conn.commit()
        print(f"Tabla creada e importados {len(rows)} países.")
