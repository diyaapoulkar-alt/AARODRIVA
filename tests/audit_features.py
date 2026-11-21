import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

endpoints = [
    ("GET", "/api/health", None),
    ("GET", "/api/flood-zones", None),
    ("GET", "/api/flood-zones/geojson", None),
    ("GET", "/api/flood-zones/metrics", None),
    ("POST", "/api/flood-zones/check-point", {"latitude": 26.185, "longitude": 91.720}),
    ("POST", "/api/flood-zones/buffer", {"buffer_meters": 200.0}),
    ("GET", "/api/settlements", None),
    ("GET", "/api/settlements/marooned", None),
    ("GET", "/api/settlements/marooned/full", None),
    ("GET", "/api/settlements/marooned/blocked-roads", None),
    ("GET", "/api/settlements/marooned/sitrep", None),
    ("GET", "/api/settlements/VIL_01", None),
    ("POST", "/api/settlements/simulate", {"threat_buffer_meters": 250.0}),
    ("GET", "/api/routes", None),
    ("POST", "/api/routes", {"start": "CAMP_NDRF_01", "destination": "VIL_KHARGHULI", "avoid_flooded_roads": True}),
    ("POST", "/api/routes/calculate", {"start": "CAMP_STADIUM_02", "destination": "VIL_PANDU_GHAT", "avoid_flooded_roads": True}),
    ("GET", "/api/camps", None),
    ("GET", "/api/roads", None),
    ("GET", "/api/incidents", None),
    ("GET", "/api/sos", None),
    ("POST", "/api/sos", {"name": "Test Citizen", "latitude": 26.18, "longitude": 91.74, "people_count": 4, "medical_emergency": True, "urgency": "critical", "message": "Water level rising"}),
    ("POST", "/api/incidents/SOS-104/dispatch", {}),
    ("GET", "/api/metrics", None),
    ("GET", "/api/metrics/sitrep", None),
    ("GET", "/api/reports/sitrep", None),
    ("GET", "/api/reports/sitrep/metrics", None),
    ("GET", "/api/reports/sitrep/download", None),
    ("POST", "/api/predict/location", {"latitude": 26.182, "longitude": 91.744, "place_name": "Kharghuli Ward 4"}),
    ("GET", "/api/predict/location?lat=26.168&lon=91.725&name=Pandu+Ghat", None),
]

all_passed = True
print("=" * 70)
print("AARODRIVA AI — FULL END-TO-END FEATURE HEALTH AUDIT")
print("=" * 70)

for method, path, payload in endpoints:
    if method == "GET":
        r = client.get(path)
    else:
        r = client.post(path, json=payload)

    status = r.status_code
    ok = (200 <= status < 300)
    tag = "PASS" if ok else "FAIL"
    print(f"[{tag}] {method:<5} {path:<38} -> Status {status}")
    if not ok:
        print(f"       ERROR: {r.text[:300]}")
        all_passed = False

print("=" * 70)
if all_passed:
    print("ALL 29 ENDPOINTS ACROSS ALL 5 FEATURES VERIFIED OPERATIONAL!")
else:
    print("WARNING: Some endpoints failed the audit.")
print("=" * 70)
