import json
from pathlib import Path
from backend.database.connection import get_db_connection

def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    # SOS incidents table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sos_incidents (
        id TEXT PRIMARY KEY,
        village_id TEXT,
        village_name TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        people_count INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        needs TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        gnss_source TEXT,
        offline_queued INTEGER DEFAULT 0
    )
    """)

    # Rescue missions log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rescue_missions (
        id TEXT PRIMARY KEY,
        sos_id TEXT,
        camp_id TEXT,
        route_geojson TEXT,
        distance_km REAL,
        blocked_avoided INTEGER,
        status TEXT DEFAULT 'en_route',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Check if SOS incidents exist, if not populate from sample_sos.json
    cursor.execute("SELECT COUNT(*) as count FROM sos_incidents")
    count = cursor.fetchone()["count"]

    if count == 0:
        sample_path = Path(__file__).resolve().parent.parent.parent / "data" / "sample" / "sample_sos.json"
        if sample_path.exists():
            with open(sample_path, "r", encoding="utf-8") as f:
                samples = json.load(f)
                for item in samples:
                    cursor.execute("""
                    INSERT INTO sos_incidents 
                    (id, village_id, village_name, latitude, longitude, people_count, urgency, needs, message, status, timestamp, gnss_source, offline_queued)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item.get("id"),
                        item.get("village_id"),
                        item.get("village_name"),
                        item.get("latitude"),
                        item.get("longitude"),
                        item.get("people_count"),
                        item.get("urgency"),
                        json.dumps(item.get("needs", [])),
                        item.get("message"),
                        item.get("status", "pending"),
                        item.get("timestamp"),
                        item.get("gnss_source"),
                        1 if item.get("offline_queued") else 0
                    ))
            conn.commit()
            print(f"[DB] Initialized database and seeded {len(samples)} sample SOS incidents.")
    
    conn.close()

if __name__ == "__main__":
    initialize_database()
