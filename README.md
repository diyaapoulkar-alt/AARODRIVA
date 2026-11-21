# AARODRIVA AI 🛰️🌊
### Satellite-to-Rescue Intelligence Platform for Flood Disaster Management
**Tagline:** *Detect. Locate. Rescue. Protect.*

---

## 🚀 Overview
**AARODRIVA AI** is an integrated geospatial emergency intelligence platform built for flood disaster response. It connects Indian Earth Observation data (**ISRO Bhuvan, MOSDAC, Bhoonidhi**) with ground-level rescue coordination:
1. **Detect (Satellite GIS):** Real-time flood inundation layers derived from satellite SAR imagery & rainfall overlays.
2. **Locate (Settlement & Distress Analysis):** Automated detection of marooned settlements with severed road access and a NavIC-compatible citizen SOS distress beacon.
3. **Rescue (RescueRoute AI):** Intelligent graph-based pathfinding (Dijkstra algorithm) that calculates safe evacuation paths bypassing submerged bridges and flooded roads.
4. **Report (EOC SITREP):** Automated generation of Emergency Operations Centre situation reports for district administrators and NDRF/SDRF commanders.

---

## 🏛️ System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      DATA INGESTION                         │
│  Bhuvan (ISRO) · MOSDAC (Precipitation) · Bhoonidhi (SAR)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FASTAPI GEOSPATIAL BACKEND                  │
│  • Flood Inundation & Buffer Engine                         │
│  • Marooned Village Connectivity Analysis                   │
│  • RescueRoute AI (Dijkstra Flood-Avoidance Routing)        │
│  • Citizen SOS Queue & SQLite Event Store                   │
│  • Automated SITREP Generator                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs (JSON / GeoJSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          AARODRIVA COMMAND CENTER (REACT + LEAFLET)         │
│  • Tactical Dark-Mode GIS Map with Layer Toggles            │
│  • Live Incident Queue with Priority Dispatch               │
│  • Simulated Citizen NavIC SOS Mobile Modal (Offline PWA)   │
│  • Real-time Rescue Route Visualizer (Green Safe / Red Cut) │
│  • Executive Situation Briefing & PDF/TXT Exporter          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Quick Start Guide

### 1. Backend (FastAPI + Python)
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
* Backend API runs at: `http://localhost:8000`
* Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend (React + Vite + Leaflet)
```bash
cd frontend
npm install
npm run dev
```
* Command Dashboard opens at: `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/flood-zones` | Returns flood inundation polygon GeoJSON (Bhuvan/Bhoonidhi) |
| `GET` | `/api/settlements` | Returns village list with population & risk status |
| `GET` | `/api/analysis/marooned` | Identifies cut-off villages with severed road access |
| `POST` | `/api/routes` | Calculates alternative safe rescue routes avoiding flooded roads |
| `GET` | `/api/sos` | Retrieves active citizen SOS distress calls |
| `POST` | `/api/sos` | Submits a new citizen SOS distress call |
| `PATCH`| `/api/sos/{id}` | Updates dispatch status of an incident |
| `GET` | `/api/metrics` | Returns overall EOC threat and operation counters |
| `GET` | `/api/reports/sitrep` | Generates complete operational Situation Report |

---

## 👥 3-Member Hackathon Team Responsibilities
* **Person 1 (GIS & Routing Engine):** Spatial intersection, NetworkX/Dijkstra road graph bypass, GeoJSON processors.
* **Person 2 (Frontend & Tactical Map):** React Leaflet map layers, dark EOC layout, dynamic route visualization.
* **Person 3 (Citizen SOS, Database & Reports):** Citizen SOS modal with NavIC indicator, SQLite event store, SITREP export.
