import sys
import unittest
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.services.flood_analysis import flood_analysis_service


class TestFloodAnalysis(unittest.TestCase):

    def test_flood_zones_loaded(self):
        """Verify satellite-derived flood inundation layers are loaded."""
        data = flood_analysis_service.get_flood_zones()
        self.assertEqual(data.get("type"), "FeatureCollection")
        self.assertGreater(len(data.get("features", [])), 0)

        for feat in data["features"]:
            self.assertIn("id", feat["properties"])
            self.assertEqual(feat["geometry"]["type"], "Polygon")


if __name__ == "__main__":
    unittest.main()
