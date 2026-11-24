import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "https://aarodriva.onrender.com"

endpoints_to_test = [
    ("GET", "/api/health", None),
    ("GET", "/api/metrics", None),
    ("GET", "/api/flood-zones", None),
    ("GET", "/api/settlements", None),
    ("GET", "/api/analysis/marooned", None),
    ("GET", "/api/analysis/marooned/full", None),
    ("GET", "/api/analysis/marooned/blocked-roads", None),
    ("GET", "/api/analysis/marooned/sitrep", None),
    ("GET", "/api/sos", None),
    ("GET", "/api/reports/sitrep", None),
    ("POST", "/api/predict/location", {
        "latitude": 26.158,
        "longitude": 91.738,
        "place_name": "Guwahati Kamrup Metro"
    }),
    ("POST", "/api/predict/location", {
        "latitude": 35.6762,
        "longitude": 139.6503,
        "place_name": "Tokyo, Japan"
    }),
    ("POST", "/api/routes", {
        "start": "CAMP_NDRF_01",
        "destination": "VIL_KHARGHULI_01",
        "avoid_flooded": True
    }),
]

print("=" * 80)
print(f"TESTING LIVE RENDER BACKEND: {BASE_URL}")
print("=" * 80)

passed = 0
failed = 0

for method, path, payload in endpoints_to_test:
    url = f"{BASE_URL}{path}"
    try:
        data = None
        headers = {
            "User-Agent": "AarodrivaHealthCheck/1.0",
            "Accept": "application/json",
        }
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=15) as res:
            status = res.getcode()
            body = res.read().decode("utf-8")
            parsed = json.loads(body)
            preview = body[:70].replace("\n", " ") + "..." if len(body) > 70 else body
            print(f"[PASS] {status} {method:4} {path:35} -> {preview}")
            passed += 1
    except Exception as e:
        print(f"[FAIL] ---- {method:4} {path:35} -> Error: {e}")
        failed += 1

print("=" * 80)
print(f"SUMMARY: {passed} PASSED, {failed} FAILED OUT OF {len(endpoints_to_test)} ENDPOINTS")
print("=" * 80)

sys.exit(0 if failed == 0 else 1)
