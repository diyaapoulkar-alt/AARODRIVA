import sys
import unittest
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.routing import rescue_route_engine, haversine_km
from backend.services.sitrep import get_sitrep_metrics, generate_situation_report


class TestRescueRouting(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_haversine(self):
        """Verify great-circle haversine distance calculation."""
        d = haversine_km(26.138, 91.785, 26.182, 91.744)
        self.assertTrue(6.0 < d < 7.0, f"Expected ~6.4 km, got {d}")
        print(f"\n[PASS] Great-circle distance verified: {d:.2f} km")

    def test_02_dijkstra_flood_avoidance(self):
        """Verify Dijkstra flood bypass avoids submerged bridges."""
        route_safe = rescue_route_engine.calculate_route(
            start="CAMP_NDRF_01",
            destination="VIL_KHARGHULI",
            avoid_flooded=True,
            use_astar=False
        )
        self.assertEqual(route_safe["status"], "route_found")
        self.assertGreaterEqual(route_safe["avoided_flooded_roads_count"], 1)
        self.assertTrue(route_safe["is_safe_bypass"])
        self.assertNotIn("INT_NH27_BRIDGE_APPROACH", route_safe["node_path"])
        self.assertIn("INT_ZOO_ROAD", route_safe["node_path"])
        self.assertIn("turn_by_turn", route_safe)
        self.assertIn("geojson", route_safe)
        print(f"[PASS] Safe bypass route successfully plotted: {route_safe['total_distance_km']} km (ETA: {route_safe['eta_minutes']} mins)")

    def test_03_dijkstra_direct_flooded_comparison(self):
        """Compare safe bypass with direct submerged path."""
        route_direct = rescue_route_engine.calculate_route(
            start="CAMP_NDRF_01",
            destination="VIL_KHARGHULI",
            avoid_flooded=False
        )
        self.assertEqual(route_direct["status"], "route_found")
        self.assertIn("INT_NH27_BRIDGE_APPROACH", route_direct["node_path"])
        print(f"[PASS] Direct flooded path identified: {route_direct['total_distance_km']} km (bypass is safer).")

    def test_04_astar_optimization(self):
        """Verify A* heuristic pathfinding equivalence with Dijkstra."""
        route_astar = rescue_route_engine.calculate_route(
            start="CAMP_NDRF_01",
            destination="VIL_KHARGHULI",
            avoid_flooded=True,
            use_astar=True
        )
        route_dijkstra = rescue_route_engine.calculate_route(
            start="CAMP_NDRF_01",
            destination="VIL_KHARGHULI",
            avoid_flooded=True,
            use_astar=False
        )
        self.assertEqual(route_astar["status"], "route_found")
        self.assertEqual(route_astar["total_distance_km"], route_dijkstra["total_distance_km"])
        print(f"[PASS] A* search optimal distance verified: {route_astar['total_distance_km']} km")

    def test_05_secondary_incident_routing(self):
        """Verify routing to secondary incidents (Pandu Ghat)."""
        r_pandu = rescue_route_engine.calculate_route(
            start="CAMP_STADIUM_02",
            destination="VIL_PANDU_GHAT",
            avoid_flooded=True
        )
        self.assertEqual(r_pandu["status"], "route_found")
        self.assertGreater(len(r_pandu["route_coordinates"]), 3)
        print(f"[PASS] Pandu Ghat route generated: {r_pandu['total_distance_km']} km | {len(r_pandu['route_coordinates'])} waypoints")

    def test_06_leaflet_full_payload(self):
        """Verify Leaflet visualizer data payload structure."""
        payload = rescue_route_engine.get_all_routes_and_blocked()
        self.assertIn("rescueRoutes", payload)
        self.assertIn("blockedRoads", payload)
        self.assertGreaterEqual(len(payload["rescueRoutes"]), 2)
        self.assertGreaterEqual(len(payload["blockedRoads"]), 2)

        for r in payload["rescueRoutes"]:
            self.assertGreater(len(r["coordinates"]), 0)
            self.assertEqual(len(r["coordinates"][0]), 2)
            self.assertIsInstance(r["coordinates"][0][0], float)
            self.assertIsInstance(r["coordinates"][0][1], float)

        for b in payload["blockedRoads"]:
            self.assertGreater(len(b["coordinates"]), 0)
            self.assertIn("Submerged", b["reason"])

        print(f"[PASS] Full visualizer payload verified: {len(payload['rescueRoutes'])} safe routes, {len(payload['blockedRoads'])} blocked segments")

    def test_07_nearest_node_resolution(self):
        """Verify nearest node GPS coordinate snapping."""
        node = rescue_route_engine.find_nearest_node(26.183, 91.745)
        self.assertEqual(node, "VIL_KHARGHULI")
        print(f"[PASS] GPS coordinate snapping verified: (26.183, 91.745) -> {node}")

    def test_08_rest_endpoints(self):
        """Verify FastAPI REST API endpoints for rescue routes, camps, and SITREP."""
        # 1. GET /api/routes
        res = self.client.get("/api/routes")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("rescueRoutes", data)
        self.assertIn("blockedRoads", data)

        # 2. POST /api/routes
        post_res = self.client.post("/api/routes", json={
            "start": "CAMP_NDRF_01",
            "destination": "VIL_KHARGHULI",
            "avoid_flooded_roads": True
        })
        self.assertEqual(post_res.status_code, 200)
        calc = post_res.json()
        self.assertEqual(calc["status"], "route_found")
        self.assertTrue(calc["is_safe_bypass"])

        # 3. GET /api/camps
        camps_res = self.client.get("/api/camps")
        self.assertEqual(camps_res.status_code, 200)
        self.assertGreaterEqual(len(camps_res.json()), 2)

        # 4. GET /api/reports/sitrep
        sitrep_res = self.client.get("/api/reports/sitrep")
        self.assertEqual(sitrep_res.status_code, 200)
        sitrep = sitrep_res.json()
        self.assertIn("report_id", sitrep)
        self.assertIn("executive_summary", sitrep)

        # 5. GET /api/metrics/sitrep
        metrics_res = self.client.get("/api/metrics/sitrep")
        self.assertEqual(metrics_res.status_code, 200)
        m = metrics_res.json()
        self.assertIn("maroonedSettlementsCount", m)
        self.assertIn("blockedRoadsCount", m)

        print("[PASS] All rescue and SITREP REST endpoints verified successfully!")


if __name__ == "__main__":
    unittest.main()
