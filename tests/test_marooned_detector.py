import sys
import json
import unittest
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from core.marooned_detector import MaroonedSettlementDetector, SettlementStatus
from backend.main import app

DATA_DIR = ROOT / "data" / "assam_scenario"


def load_dataset(filename: str):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


class TestMaroonedDetector(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        settlements = load_dataset("settlements.geojson")
        roads = load_dataset("road_network.geojson")
        floods = load_dataset("flood_zones.geojson")
        camps = load_dataset("rescue_camps.geojson")

        cls.detector = MaroonedSettlementDetector(
            settlements_geojson=settlements,
            road_network_geojson=roads,
            flood_zones_geojson=floods,
            rescue_camps_geojson=camps,
            threat_buffer_meters=150.0
        )
        cls.results = cls.detector.detect_all()
        cls.client = TestClient(app)

    def test_village_a_accessible(self):
        """
        Village A (Dhingra Gaon) has an intact, unflooded road connection
        to Camp Alpha (Kaliabor Relief Center).
        Must be classified as 'Accessible'.
        """
        v_a = next((s for s in self.results["settlements"] if s["settlement_id"] == "SETTLE-VIL-A"), None)
        self.assertIsNotNone(v_a, "Village A should exist in results")
        self.assertEqual(v_a["status"], SettlementStatus.ACCESSIBLE.value)
        self.assertFalse(v_a["is_inundated"])
        self.assertGreaterEqual(v_a["reachable_camps_count"], 1)
        self.assertIsNotNone(v_a["nearest_camp"])
        self.assertIn("Kaliabor", v_a["nearest_camp"]["camp_name"])
        self.assertEqual(v_a["submerged_connecting_roads"], 0)

    def test_village_b_access_severed(self):
        """
        Village B (Majortop) has two connecting roads, but BOTH cross
        the Brahmaputra flood polygon and are submerged.
        Must be classified as 'Access severed' (Marooned).
        """
        v_b = next((s for s in self.results["settlements"] if s["settlement_id"] == "SETTLE-VIL-B"), None)
        self.assertIsNotNone(v_b, "Village B should exist in results")
        self.assertEqual(v_b["status"], SettlementStatus.ACCESS_SEVERED.value)
        self.assertEqual(v_b["reachable_camps_count"], 0)
        self.assertIsNone(v_b["nearest_camp"])
        self.assertIn(v_b["evacuation_priority"], ["HIGH", "CRITICAL"])
        self.assertTrue("SEVERED" in v_b["isolation_reason"] or "MAROONED" in v_b["isolation_reason"])

    def test_village_c_at_risk(self):
        """
        Village C (Borghop) has Road C-1 submerged, but Road C-2 is accessible.
        Because Road C-1 is submerged and Village C is within proximity of floodwaters,
        it must be classified as 'At risk'.
        """
        v_c = next((s for s in self.results["settlements"] if s["settlement_id"] == "SETTLE-VIL-C"), None)
        self.assertIsNotNone(v_c, "Village C should exist in results")
        self.assertEqual(v_c["status"], SettlementStatus.AT_RISK.value)
        self.assertGreaterEqual(v_c["reachable_camps_count"], 1)
        self.assertIsNotNone(v_c["nearest_camp"])
        self.assertGreaterEqual(v_c["submerged_connecting_roads"], 1)

    def test_submerged_roads_count(self):
        """
        Verify that the road graph identifies submerged segments
        and generates valid severed road GeoJSON.
        """
        blocked = self.results["blocked_roads_geojson"]
        self.assertEqual(blocked["type"], "FeatureCollection")
        self.assertGreater(len(blocked["features"]), 0)

        cut_road_names = [f["properties"]["road_name"] for f in blocked["features"]]
        self.assertTrue(any("Village B West" in name for name in cut_road_names))
        self.assertTrue(any("Village B South" in name for name in cut_road_names))
        self.assertTrue(any("Borghop North" in name for name in cut_road_names))

    def test_sitrep_summary_metrics(self):
        """
        Verify SITREP summary numbers match expectations.
        """
        summary = self.results["summary"]
        counts = summary["status_counts"]
        pops = summary["population_summary"]

        self.assertEqual(summary["total_settlements"], 6)
        self.assertGreaterEqual(counts["access_severed"], 2)  # Village B and Village D
        self.assertGreaterEqual(counts["accessible"], 2)      # Village A and Village E
        self.assertGreaterEqual(counts["at_risk"], 1)         # Village C
        self.assertGreater(pops["marooned_population"], 0)
        self.assertGreater(summary["road_infrastructure"]["submerged_network_km"], 0)

    def test_api_endpoints(self):
        """
        Verify backend FastAPI endpoints work correctly.
        """
        # Health check
        r_health = self.client.get("/api/health")
        self.assertEqual(r_health.status_code, 200)
        self.assertEqual(r_health.json()["status"], "online")

        # Settlements list endpoint
        r_settlements = self.client.get("/api/settlements")
        self.assertEqual(r_settlements.status_code, 200)
        self.assertEqual(r_settlements.json()["type"], "FeatureCollection")

        # Marooned analysis endpoint
        r_marooned = self.client.get("/api/analysis/marooned")
        self.assertEqual(r_marooned.status_code, 200)
        data = r_marooned.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 4)

        # Full marooned analysis with SITREP summary
        r_full = self.client.get("/api/analysis/marooned/full")
        self.assertEqual(r_full.status_code, 200)
        full_data = r_full.json()
        self.assertIn("summary", full_data)
        self.assertIn("settlements", full_data)

        # Blocked roads endpoint
        r_blocked = self.client.get("/api/analysis/marooned/blocked-roads")
        self.assertEqual(r_blocked.status_code, 200)
        self.assertEqual(r_blocked.json()["type"], "FeatureCollection")

        # SITREP metrics endpoint
        r_sitrep = self.client.get("/api/analysis/marooned/sitrep")
        self.assertEqual(r_sitrep.status_code, 200)
        self.assertIn("status_counts", r_sitrep.json())


if __name__ == "__main__":
    unittest.main()
