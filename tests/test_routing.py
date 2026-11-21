import sys
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.services.routing import rescue_route_engine, haversine_km

def test_haversine():
    print("[TEST 1] Testing Haversine Distance Function...")
    # Distance between Dispur and Guwahati (~5-6 km)
    d = haversine_km(26.138, 91.785, 26.182, 91.744)
    assert 6.0 < d < 7.0, f"Expected ~6.4 km, got {d}"
    print(f"[PASS] Great-circle distance verified: {d:.2f} km")

def test_dijkstra_flood_avoidance():
    print("\n[TEST 2] Testing Dijkstra Flood Bypass Optimization...")
    # Test safe bypass (avoid_flooded = True)
    route_safe = rescue_route_engine.calculate_route(
        start="CAMP_NDRF_01", 
        destination="VIL_KHARGHULI", 
        avoid_flooded=True,
        use_astar=False
    )
    assert route_safe["status"] == "route_found"
    assert route_safe["avoided_flooded_roads_count"] >= 1
    assert route_safe["is_safe_bypass"] is True

    # The flooded bridge 'INT_NH27_BRIDGE_APPROACH' must NOT be in the safe path!
    assert "INT_NH27_BRIDGE_APPROACH" not in route_safe["node_path"], "Critical failure: route traversed flooded road!"
    assert "INT_ZOO_ROAD" in route_safe["node_path"], "Expected path via Zoo Road elevated ridge"
    print(f"[PASS] Safe bypass route successfully plotted: {route_safe['total_distance_km']} km (ETA: {route_safe['eta_minutes']} mins)")
    print(f"       Node sequence: {' -> '.join(route_safe['node_path'])}")
    print(f"       Avoided submerged hazards: {len(route_safe['avoided_flooded_roads'])}")

def test_dijkstra_direct_flooded_comparison():
    print("\n[TEST 3] Comparing with Direct Flooded Path (avoid_flooded = False)...")
    route_direct = rescue_route_engine.calculate_route(
        start="CAMP_NDRF_01", 
        destination="VIL_KHARGHULI", 
        avoid_flooded=False
    )
    assert route_direct["status"] == "route_found"
    assert "INT_NH27_BRIDGE_APPROACH" in route_direct["node_path"], "Direct route should attempt the direct causeway"
    print(f"[PASS] Direct flooded path identified: {route_direct['total_distance_km']} km")
    print(f"       Demonstrates that safe bypass is intentionally chosen to protect rescue crews.")

def test_astar_optimization():
    print("\n[TEST 4] Testing A* Heuristic Pathfinding...")
    route_astar = rescue_route_engine.calculate_route(
        start="CAMP_NDRF_01", 
        destination="VIL_KHARGHULI", 
        avoid_flooded=True,
        use_astar=True
    )
    assert route_astar["status"] == "route_found"
    assert route_astar["total_distance_km"] == rescue_route_engine.calculate_route(
        start="CAMP_NDRF_01", destination="VIL_KHARGHULI", avoid_flooded=True, use_astar=False
    )["total_distance_km"], "A* and Dijkstra must find equivalent optimal path"
    print(f"[PASS] A* search optimal distance verified: {route_astar['total_distance_km']} km")

def test_secondary_incident_routing():
    print("\n[TEST 5] Testing Multi-Incident Routing (Pandu Ghat & Majuli)...")
    # Route to Pandu Ghat (SOS-112)
    r_pandu = rescue_route_engine.calculate_route(
        start="CAMP_STADIUM_02", 
        destination="VIL_PANDU_GHAT", 
        avoid_flooded=True
    )
    assert r_pandu["status"] == "route_found"
    assert len(r_pandu["route_coordinates"]) > 3
    print(f"[PASS] Pandu Ghat route generated: {r_pandu['total_distance_km']} km | {len(r_pandu['route_coordinates'])} waypoints")

def test_leaflet_full_payload():
    print("\n[TEST 6] Testing Leaflet Visualizer Data Payload (get_all_routes_and_blocked)...")
    payload = rescue_route_engine.get_all_routes_and_blocked()
    assert "rescueRoutes" in payload
    assert "blockedRoads" in payload
    assert len(payload["rescueRoutes"]) >= 2
    assert len(payload["blockedRoads"]) >= 2

    # Check coordinate format: array of [lat, lon]
    for r in payload["rescueRoutes"]:
        assert len(r["coordinates"]) > 0
        assert len(r["coordinates"][0]) == 2
        assert isinstance(r["coordinates"][0][0], float)
        assert isinstance(r["coordinates"][0][1], float)

    for b in payload["blockedRoads"]:
        assert len(b["coordinates"]) > 0
        assert "Submerged" in b["reason"]

    print(f"[PASS] Full visualizer payload verified: {len(payload['rescueRoutes'])} safe routes, {len(payload['blockedRoads'])} blocked segments")

def test_nearest_node_resolution():
    print("\n[TEST 7] Testing Nearest Node GPS Snapping...")
    # Coordinates near Kharghuli [26.182, 91.744]
    node = rescue_route_engine.find_nearest_node(26.183, 91.745)
    assert node == "VIL_KHARGHULI", f"Expected VIL_KHARGHULI, got {node}"
    print(f"[PASS] GPS coordinate snapping verified: ({26.183}, {91.745}) -> {node}")

if __name__ == "__main__":
    test_haversine()
    test_dijkstra_flood_avoidance()
    test_dijkstra_direct_flooded_comparison()
    test_astar_optimization()
    test_secondary_incident_routing()
    test_leaflet_full_payload()
    test_nearest_node_resolution()
    print("\n=======================================================")
    print("ALL RESCUEROUTE AI ENGINE TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================")
