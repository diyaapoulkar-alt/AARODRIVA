# AARODRIVA AI — System Architecture

## Architecture Diagram

```
[ISRO Space Intelligence]
• Bhoonidhi: RISAT-1A SAR Inundation
• Bhuvan: Flood Hazard & Base Tiles
• MOSDAC: INSAT-3DR Precipitation
         │
         ▼
[Python Geospatial Backend (FastAPI)]
• Flood Buffer Analysis (GeoPandas / Shapely)
• Marooned Settlement Detection (Accessibility & Isolation)
• RescueRoute AI (Dijkstra Flood-Avoidance Graph)
• Citizen SOS Incident Queue & Priority Engine
         │
         ▼ (REST APIs)
[Tactical Emergency Operations Centre (React + Leaflet)]
• Layer Toggles (SAR, Roads, Settlements, Camps)
• Real-time Incident Queue
• Citizen SOS PWA (NavIC-compatible)
• Safe Route Visualizer (Green Bypass vs. Red Submerged)
```

## Module Ownership
- **Person 1:** `backend/routers/rescue.py`, `backend/routers/flood.py`, `backend/routers/settlements.py`, `backend/services/routing.py`, `data/`
- **Person 2:** `frontend/src/components/`, `frontend/src/map/`, `frontend/src/pages/`
- **Person 3:** `frontend/src/sos/`, `frontend/src/reports/`, `backend/routers/sos.py`, `backend/routers/reports.py`, `backend/database/`
