import sqlite3
import os
from pathlib import Path

default_path = Path(__file__).resolve().parent.parent / "aarodriva.db"
DB_PATH = Path(os.getenv("AARODRIVA_DB_PATH", str(default_path)))

def get_db_connection():
    """Establish and return a SQLite database connection with row dictionary access."""
    # Ensure parent dir exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn
