import sys
import unittest
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.services.settlement_analysis import settlement_analysis_service


class TestWorldMapPrediction(unittest.TestCase):
    """
    Test suite verifying that the geospatial engine and world map integration
    correctly handles coordinates across the entire globe as well as high-precision
    mission theater disaster points.
    """

    def setUp(self):
        self.service = settlement_analysis_service

    def test_global_cities_clear_of_disaster(self):
        """Global cities across all continents should be classified as Accessible with 0 risk score."""
        global_locations = [
            ("Tokyo, Japan", 35.6762, 139.6503),
            ("London, United Kingdom", 51.5074, -0.1278),
            ("New York City, USA", 40.7128, -74.0060),
            ("Paris, France", 48.8566, 2.3522),
            ("Sydney, Australia", -33.8688, 151.2093),
            ("Mumbai, India", 19.0760, 72.8777),
            ("New Delhi, India", 28.6139, 77.2090),
            ("Singapore", 1.3521, 103.8198),
            ("Cairo, Egypt", 30.0444, 31.2357),
            ("Rio de Janeiro, Brazil", -22.9068, -43.1729),
        ]

        for name, lat, lon in global_locations:
            with self.subTest(location=name):
                res = self.service.predict_location(lat, lon, name)
                pred = res["prediction"]
                self.assertEqual(pred["access_status"], "Accessible", f"Failed for {name}")
                self.assertFalse(pred["is_marooned"], f"Failed for {name}")
                self.assertFalse(pred["is_inundated"], f"Failed for {name}")
                self.assertEqual(pred["risk_score"], 0.0, f"Failed for {name}")
                self.assertIn("GLOBAL HIGH GROUND", pred["isolation_reason"], f"Failed for {name}")
                self.assertIn("operating normally", res["recommended_action"], f"Failed for {name}")
                self.assertIsNotNone(res["nearest_rescue_camp"], f"Failed for {name}")

    def test_disaster_epicenter_marooned(self):
        """Points directly in flood polygons should be classified as Access severed / Marooned."""
        flooded_points = [
            ("Kharghuli Submerged Shore", 26.185, 91.745),
            ("Kaziranga North Submerged Hamlet", 26.645, 93.140),
            ("Majuli Flood Corridor", 26.195, 91.765),
        ]

        for name, lat, lon in flooded_points:
            with self.subTest(location=name):
                res = self.service.predict_location(lat, lon, name)
                pred = res["prediction"]
                self.assertEqual(pred["access_status"], "Access severed", f"Failed for {name}")
                self.assertTrue(pred["is_marooned"], f"Failed for {name}")
                self.assertGreaterEqual(pred["risk_score"], 80.0, f"Failed for {name}")

    def test_disaster_epicenter_high_ground_safe(self):
        """Points within the mission theater on elevated ground with open roads should be Accessible."""
        safe_points = [
            ("Dispur Ridge HQ", 26.138, 91.785),
            ("Siljuri Ridge Post", 26.580, 93.180),
        ]

        for name, lat, lon in safe_points:
            with self.subTest(location=name):
                res = self.service.predict_location(lat, lon, name)
                pred = res["prediction"]
                self.assertEqual(pred["access_status"], "Accessible", f"Failed for {name}")
                self.assertFalse(pred["is_marooned"], f"Failed for {name}")
                self.assertFalse(pred["is_inundated"], f"Failed for {name}")
                self.assertLessEqual(pred["risk_score"], 20.0, f"Failed for {name}")

    def test_disaster_buffer_at_risk(self):
        """Points close to flood boundaries or with bottlenecked roads should be At risk."""
        at_risk_points = [
            ("Zoo Road Safe Corridor", 26.165, 91.775),
            ("Bokakhat East Hub", 26.625, 93.015),
        ]

        for name, lat, lon in at_risk_points:
            with self.subTest(location=name):
                res = self.service.predict_location(lat, lon, name)
                pred = res["prediction"]
                self.assertEqual(pred["access_status"], "At risk", f"Failed for {name}")
                self.assertFalse(pred["is_marooned"], f"Failed for {name}")
                self.assertGreaterEqual(pred["risk_score"], 40.0, f"Failed for {name}")


if __name__ == "__main__":
    unittest.main()
