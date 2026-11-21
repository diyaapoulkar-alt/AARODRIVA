import sys
import unittest
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from backend.main import app
from backend.services.settlement_analysis import (
    settlement_analysis_service,
    MaroonedSettlementDetector
)
from backend.services.flood_analysis import flood_analysis_service
from backend.schemas.settlement import SettlementStatus


class TestSettlementAnalysis(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.full_analysis = settlement_analysis_service.get_full_analysis()

    def test_marooned_detection_on_processed_data(self):
        """
        Verify that the marooned settlement detector correctly identifies
        cut-off settlements (VIL_01 Dhansiri and VIL_02 Kaziranga) in Golaghat floodplain.
        """
        settlements = settlement_analysis_service.analyze_marooned()
        self.assertGreaterEqual(len(settlements), 4)

        vil_01 = next((v for v in settlements if v["village_id"] == "VIL_01"), None)
        self.assertIsNotNone(vil_01)
        self.assertTrue(vil_01["is_marooned"])
        self.assertEqual(vil_01["access_status"], SettlementStatus.ACCESS_SEVERED.value)

        vil_02 = next((v for v in settlements if v["village_id"] == "VIL_02"), None)
        self.assertIsNotNone(vil_02)
        self.assertTrue(vil_02["is_marooned"])

        marooned = [v for v in settlements if v["is_marooned"]]
        self.assertGreaterEqual(len(marooned), 2)
        print(f"\n[PASS] Successfully detected {len(marooned)} marooned settlements: {', '.join(v['name'] for v in marooned)}")

    def test_accessible_settlements_identified(self):
        """Verify that villages with intact high-ground connections are classified as Accessible."""
        settlements = settlement_analysis_service.analyze_marooned()
        accessible = [v for v in settlements if v["access_status"] == SettlementStatus.ACCESSIBLE.value]
        self.assertGreaterEqual(len(accessible), 1)
        print(f"[PASS] Successfully verified accessible high-ground settlements ({len(accessible)} villages)")

    def test_blocked_roads_geojson(self):
        """Verify that flooded/submerged road segments are generated in standard GeoJSON format."""
        blocked = settlement_analysis_service.get_blocked_roads()
        self.assertEqual(blocked["type"], "FeatureCollection")
        self.assertGreater(len(blocked["features"]), 0)
        for feat in blocked["features"]:
            self.assertEqual(feat["properties"]["status"], "IMPASSABLE")
            self.assertGreater(feat["properties"]["submerged_length_m"], 0)
        print(f"[PASS] Successfully verified {len(blocked['features'])} severed road segments")

    def test_sitrep_metrics(self):
        """Verify SITREP aggregated indicators match summary data."""
        sitrep = settlement_analysis_service.get_sitrep_summary()
        self.assertIn("status_counts", sitrep)
        self.assertIn("population_summary", sitrep)
        self.assertIn("road_infrastructure", sitrep)
        self.assertGreater(sitrep["population_summary"]["marooned_population"], 0)
        print(f"[PASS] SITREP summary verified: {sitrep['population_summary']['marooned_population']} residents marooned")

    def test_api_endpoints(self):
        """Verify all FastAPI REST endpoints in backend/routers/settlements.py."""
        # 1. GeoJSON of all settlements
        r1 = self.client.get("/api/settlements")
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.json()["type"], "FeatureCollection")

        # 2. Marooned settlements analysis list
        r2 = self.client.get("/api/settlements/marooned")
        self.assertEqual(r2.status_code, 200)
        self.assertIsInstance(r2.json(), list)

        # 3. Full analysis with SITREP summary
        r3 = self.client.get("/api/settlements/marooned/full")
        self.assertEqual(r3.status_code, 200)
        self.assertIn("summary", r3.json())
        self.assertIn("settlements", r3.json())

        # 4. Blocked roads GeoJSON
        r4 = self.client.get("/api/settlements/marooned/blocked-roads")
        self.assertEqual(r4.status_code, 200)
        self.assertEqual(r4.json()["type"], "FeatureCollection")

        # 5. SITREP summary metrics
        r5 = self.client.get("/api/settlements/marooned/sitrep")
        self.assertEqual(r5.status_code, 200)
        self.assertIn("status_counts", r5.json())

        # 6. Specific settlement diagnosis
        r6 = self.client.get("/api/settlements/VIL_01")
        self.assertEqual(r6.status_code, 200)
        self.assertEqual(r6.json()["settlement_id"], "VIL_01")
        self.assertEqual(r6.json()["status"], "Access severed")

        # 7. Simulation of flood water rise
        r7 = self.client.post("/api/settlements/simulate", json={"buffer_expansion_meters": 50.0, "threat_buffer_meters": 200.0})
        self.assertEqual(r7.status_code, 200)
        self.assertIn("delta", r7.json())

        # 8. Backward compatibility alias /api/analysis/marooned
        r8 = self.client.get("/api/analysis/marooned")
        self.assertEqual(r8.status_code, 200)
        print("[PASS] All settlement REST API endpoints verified")


if __name__ == "__main__":
    unittest.main()
