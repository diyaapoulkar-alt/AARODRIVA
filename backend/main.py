import sys
from pathlib import Path

# Add project root to path for imports
current_dir = Path(__file__).resolve().parent
project_root = current_dir.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.init_db import initialize_database
from backend.routers import flood, settlements, rescue, sos, metrics, reports

app = FastAPI(
    title="AARODRIVA AI — Disaster Intelligence Engine",
    description="Satellite-to-Rescue Intelligence Platform connecting ISRO EO data, NavIC SOS and Dijkstra Flood Bypass Routing",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    print("[AARODRIVA] Initializing SQLite database...")
    initialize_database()
    print("[AARODRIVA] Database ready. Ready to serve disaster response.")

# Mount Routers
app.include_router(flood.router)
app.include_router(settlements.router)
app.include_router(rescue.router)
app.include_router(sos.router)
app.include_router(metrics.router)
app.include_router(reports.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "AARODRIVA AI Command Server",
        "region": "Assam Brahmaputra Basin",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
