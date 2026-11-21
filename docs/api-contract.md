# AARODRIVA AI — API Contract & Data Dictionary

All team members must integrate against these standardized schemas.

---

## 1. Endpoints

### 1.1 `GET /api/metrics`
Returns high-level threat indicators for the top command cards.
```json
{
  "inundation_area_sqkm": 142.8,
  "satellite_source": "Bhoonidhi RISAT-1A SAR",
  "total_settlements_monitored": 5,
  "marooned_settlements_count": 2,
  "marooned_population": 1020,
  "active_sos_count": 3,
  "total_stranded_count": 24,
  "dispatched_missions_count": 1,
  "navic_satellites_locked": 7,
  "navic_signal_status": "STRONG (L5/S-Band Assisted)"
}
```

### 1.2 `GET /api/flood-zones`
Returns GeoJSON FeatureCollection of satellite-derived flood inundation polygons.
- Coordinates format: `[longitude, latitude]` (Standard GeoJSON).

### 1.3 `GET /api/settlements`
Returns GeoJSON FeatureCollection of settlements.
- Properties include: `population`, `vulnerability`, `access_status`, `is_marooned`, `isolation_reason`.

### 1.4 `GET /api/camps`
Returns GeoJSON FeatureCollection of NDRF and SDRF rescue bases.
- Properties include: `available_boats`, `commanding_agency`, `radio_frequency_vhf`.

### 1.5 `POST /api/routes`
Calculates optimal evacuation / response path using Dijkstra's algorithm.

**Request Body:**
```json
{
  "rescue_camp_id": "CAMP_01",
  "destination_node_or_id": "VIL_01",
  "avoid_flooded_roads": true
}
```

**Response Body:**
```json
{
  "status": "route_found",
  "algorithm": "Dijkstra Flood-Avoidance",
  "start_node": "CAMP_01",
  "target_node": "VIL_01",
  "total_distance_km": 30.9,
  "avoided_flooded_roads_count": 1,
  "node_path": ["CAMP_01", "INT_01", "INT_03", "INT_04", "INT_05", "VIL_01"],
  "route_coordinates": [
    [26.575, 93.045],
    [26.585, 93.060],
    [26.595, 93.075],
    [26.580, 93.105],
    [26.585, 93.145],
    [26.590, 93.175],
    [26.600, 93.195],
    [26.640, 93.210],
    [26.675, 93.195],
    [26.685, 93.160],
    [26.680, 93.140],
    [26.670, 93.120]
  ]
}
```

### 1.6 `GET /api/sos`
Returns list of active citizen SOS distress beacons with calculated priority triage scores.

### 1.7 `POST /api/sos`
Creates new distress beacon from citizen PWA.

**Request Body:**
```json
{
  "village_id": "VIL_01",
  "village_name": "Dhansiri Riverbank",
  "latitude": 26.6715,
  "longitude": 93.1218,
  "people_count": 4,
  "urgency": "critical",
  "needs": ["medical", "drinking_water"],
  "message": "Water rising above plinth level, waiting on rooftop.",
  "gnss_source": "NavIC-compatible L5/S-Band (Simulated)",
  "offline_queued": false
}
```
