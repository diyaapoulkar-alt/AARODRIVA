import sys
import unittest
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.flood_analysis import flood_analysis_service


class TestFloodAnalysis(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_flood_zones_loaded(self):
        """Verify satellite-derived flood inundation layers are loaded."""
        data = flood_analysis_service.get_flood_zones()
        self.assertEqual(data.get("type"), "FeatureCollection")
        self.assertGreater(len(data.get("features", [])), 0)

        for feat in data["features"]:
            self.assertIn("id", feat["properties"])
            self.assertEqual(feat["geometry"]["type"], "Polygon")

    def test_flood_zones_endpoints(self):
        """Verify GET /api/flood-zones and GeoJSON endpoints."""
        r = self.client.get("/api/flood-zones")
        self.assertEqual(r.status_code, 200)
        zones = r.json()
        self.assertGreaterEqual(len(zones), 2)
        self.assertIn("coordinates", zones[0])

        r_geo = self.client.get("/api/flood-zones/geojson")
        self.assertEqual(r_geo.status_code, 200)
        self.assertEqual(r_geo.json()["type"], "FeatureCollection")

    def test_flood_metrics(self):
        """Verify satellite observation metrics."""
        r = self.client.get("/api/flood-zones/metrics")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertGreater(data["total_inundated_sqkm"], 50.0)
        self.assertIn("ISRO", data["primary_sensor"])

    def test_point_check_inundation(self):
        """Verify point inundation test endpoint."""
        # Point inside Flood Zone 1 [93.125, 26.685]
        payload = {"latitude": 26.685, "longitude": 93.125, "threat_buffer_meters": 150.0}
        r = self.client.post("/api/flood-zones/check-point", json=payload)
        self.assertEqual(r.status_code, 200)
        res = r.json()
        self.assertTrue(res["is_inundated"])
        self.assertEqual(res["status"], "SUBMERGED")


if __name__ == "__main__":
    unittest.main()
