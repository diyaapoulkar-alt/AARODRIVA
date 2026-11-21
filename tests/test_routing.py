import sys
from pathlib import Path

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.services.routing import rescue_route_engine
from backend.services.flood_analysis import flood_analysis_service
from backend.services.priority import calculate_incident_priority
from backend.services.sitrep import generate_situation_report

def test_rescue_route():
    print("Testing RescueRoute AI Dijkstra solver...")
    # Test 1: Avoid flooded roads
    res_bypass = rescue_route_engine.calculate_route("CAMP_01", "VIL_01", avoid_flooded=True)
    assert res_bypass["status"] == "route_found"
    assert res_bypass["total_distance_km"] > 20.0
    assert "INT_02" not in res_bypass["node_path"]
    print(f"[PASS] Flood bypass route successfully avoided submerged causeway: {res_bypass['total_distance_km']} km")

    # Test 2: Direct route through flooded road
    res_direct = rescue_route_engine.calculate_route("CAMP_01", "VIL_01", avoid_flooded=False)
    assert "INT_02" in res_direct["node_path"]
    print(f"[PASS] Direct flooded route verified: {res_direct['total_distance_km']} km")

def test_flood_analysis():
    print("\nTesting Flood Analysis Service...")
    settlements = flood_analysis_service.analyze_marooned_settlements()
    assert len(settlements) >= 4
    marooned = [v for v in settlements if v["is_marooned"]]
    assert len(marooned) == 2
    print(f"[PASS] Successfully identified {len(marooned)} marooned settlements ({', '.join(v['name'] for v in marooned)})")

def test_priority():
    print("\nTesting Incident Priority scoring...")
    critical_incident = {
        "urgency": "critical",
        "people_count": 6,
        "needs": ["medical", "rescue_boat"]
    }
    p = calculate_incident_priority(critical_incident)
    assert p["priority_score"] >= 80
    assert "PRIORITY 1" in p["triage_tier"]
    print(f"[PASS] Triage calculation verified: score={p['priority_score']} ({p['triage_tier']})")

if __name__ == "__main__":
    test_rescue_route()
    test_flood_analysis()
    test_priority()
    print("\n==========================================")
    print("ALL AARODRIVA AI CORE ENGINES VERIFIED!")
    print("==========================================")
