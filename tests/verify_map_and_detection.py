import sys
import json
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.services.settlement_analysis import settlement_analysis_service
from backend.services.routing import rescue_route_engine


def audit_map_and_detection():
    print("=" * 75)
    print("AARODRIVA AI — MAP DETAILS, LOCATION ACCURACY & DETECTION AUDIT")
    print("=" * 75)

    detector = settlement_analysis_service.get_detector(threat_buffer_meters=150.0)

    # 1. AUDIT SETTLEMENT LOCATIONS & GROUND-TRUTH ACCURACY
    print("\n[SECTION 1] SETTLEMENT LOCATION ACCURACY & GIS GROUND TRUTH")
    print("-" * 75)
    full_analysis = detector.detect_all()
    settlements = full_analysis["settlements"]
    summary = full_analysis["summary"]

    print(f"Total Evaluated Settlements: {len(settlements)}")
    print(f"Total Marooned Detected:    {summary['status_counts']['access_severed']}")
    print(f"Total At-Risk Detected:     {summary['status_counts']['at_risk']}")
    print(f"Total Accessible:           {summary['status_counts']['accessible']}")
    print(f"Total Population Cut Off:   {summary['population_summary']['marooned_population']:,}")

    print("\nIndividual Settlement Details:")
    for s in settlements:
        status_tag = f"[{s['status'].upper()}]"
        coords_str = f"Lat: {s['coordinates'][1]:.4f}, Lon: {s['coordinates'][0]:.4f}"
        print(f"\n  * {s['name']} (ID: {s['settlement_id']}) -- {status_tag}")
        print(f"    Coordinates:     {coords_str}")
        print(f"    District:        {s['district']}")
        print(f"    Population:      {s['population']} (Vulnerable: {s['vulnerable_count']})")
        print(f"    Risk Score:      {s['risk_score']:.1f} / 100.0 (Priority: {s['evacuation_priority']})")
        flood_dist = s.get("flood_distance_meters", 0.0)
        flood_status_str = "DIRECTLY SUBMERGED" if s["is_inundated"] else f"Dry ground ({flood_dist}m from water)"
        print(f"    Flood Status:    {flood_status_str}")
        print(f"    Road Network:    {s['open_connecting_roads']}/{s['total_connecting_roads']} links open ({s['submerged_connecting_roads']} severed)")
        if s['nearest_camp']:
            print(f"    Nearest Camp:    {s['nearest_camp']['camp_name']} ({s['nearest_camp']['distance_km']} km)")
        print(f"    Isolation Reason: {s['isolation_reason']}")

    # 2. AUDIT MAP CLICK / SEARCH ACCURACY FOR ARBITRARY COORDINATES
    print("\n[SECTION 2] MAP CLICK / SEARCH POINT PREDICTION ACCURACY")
    print("-" * 75)
    test_points = [
        # Submerged disaster points
        ("Kharghuli Riverfront (Guwahati Submerged)", 26.185, 91.745, "Access severed", True),
        ("Majuli Lowland Corridor (Submerged)", 26.195, 91.765, "Access severed", True),
        ("Kaziranga North Inundation Hamlet", 26.645, 93.140, "Access severed", True),
        
        # Buffer / At Risk points
        ("Zoo Road Central (Threat Perimeter)", 26.165, 91.775, "At risk", False),
        ("Bokakhat East Edge (Bottleneck Road)", 26.625, 93.015, "At risk", False),
        
        # Safe High Ground points inside theater
        ("Dispur Ridge NDRF Base (Elevated)", 26.138, 91.785, "Accessible", False),
        ("Siljuri Ridge Post (High Ground)", 26.580, 93.180, "Accessible", False),
        
        # Global Coordinates outside theater
        ("Tokyo, Japan (Global High Ground)", 35.6762, 139.6503, "Accessible", False),
        ("London, UK (Global High Ground)", 51.5074, -0.1278, "Accessible", False),
        ("New York, USA (Global High Ground)", 40.7128, -74.0060, "Accessible", False),
        ("Mumbai, India (Global High Ground)", 19.0760, 72.8777, "Accessible", False),
    ]

    all_click_tests_passed = True
    for name, lat, lon, expected_status, expected_marooned in test_points:
        pred = detector.predict_location(lat, lon, name)
        res = pred["prediction"]
        status_match = (res["access_status"] == expected_status)
        marooned_match = (res["is_marooned"] == expected_marooned)
        passed = status_match and marooned_match
        if not passed:
            all_click_tests_passed = False
        
        mark = "[PASS]" if passed else "[FAIL]"
        print(f"  {mark} | {name} [{lat:.4f}, {lon:.4f}]")
        print(f"         Status: {res['access_status']} (Expected: {expected_status}) | Risk: {res['risk_score']:.1f}/100")
        print(f"         Flood Dist: {res['flood_distance_meters']:.1f}m | Inundated: {res['is_inundated']}")
        print(f"         Action: {pred['recommended_action'][:70]}...")

    # 3. AUDIT DIJKSTRA RESCUE ROUTE BYPASS ACCURACY
    print("\n[SECTION 3] RESCUEROUTE AI DIJKSTRA BYPASS INTEGRATION")
    print("-" * 75)
    sample_route = rescue_route_engine.calculate_route(
        start="CAMP_NDRF_01",
        destination=[26.185, 91.745],
        avoid_flooded=True
    )
    print(f"Algorithm:       {sample_route['algorithm']}")
    print(f"Route Status:    {sample_route['status']}")
    print(f"Total Distance:  {sample_route['total_distance_km']} km (ETA: {sample_route.get('eta_minutes', 0)} mins)")
    print(f"Avoided Floods:  {sample_route['avoided_flooded_roads_count']} submerged roads bypassed")
    for r in sample_route.get("avoided_flooded_roads", []):
        print(f"                 - {r['name']} ({r['water_depth_cm']}cm water)")
    print(f"Waypoints Count: {len(sample_route['route_coordinates'])} GPS coordinates plotted")
    print(f"First 3 Coords:  {sample_route['route_coordinates'][:3]}")
    print(f"Last 3 Coords:   {sample_route['route_coordinates'][-3:]}")

    # 4. AUDIT MAP TILE & POPUP PAYLOAD INTEGRITY
    print("\n[SECTION 4] FRONTEND MAP & POPUP CONTRACT AUDIT")
    print("-" * 75)
    popup_payload = detector.predict_location(26.185, 91.745, "Kharghuli Riverfront")
    required_keys = [
        "place_name", "latitude", "longitude", "coordinates",
        "prediction", "nearest_rescue_camp", "all_reachable_camps",
        "recommended_rescue_route", "recommended_action"
    ]
    missing_keys = [k for k in required_keys if k not in popup_payload]
    if missing_keys:
        print(f"  [FAIL] Missing keys in prediction payload: {missing_keys}")
    else:
        print(f"  [PASS] All {len(required_keys)} frontend popup contract keys present and validated!")
        print(f"    - place_name: {popup_payload['place_name']}")
        print(f"    - status: {popup_payload['prediction']['access_status']}")
        print(f"    - risk_score: {popup_payload['prediction']['risk_score']}")
        print(f"    - isolation_reason: {popup_payload['prediction']['isolation_reason']}")
        print(f"    - nearest_camp: {popup_payload['nearest_rescue_camp']['camp_name']}")
        route_dist = popup_payload['recommended_rescue_route'].get('total_distance_km', popup_payload['recommended_rescue_route'].get('distance_km', 0.0))
        print(f"    - route length: {route_dist} km")

    print("\n" + "=" * 75)
    if all_click_tests_passed and not missing_keys:
        print("ALL AUDIT CHECKS PASSED: MAP DETAILS & DETECTION ENGINE 100% OPERATIONAL")
    else:
        print("AUDIT FAILED ON SOME CHECKS")
    print("=" * 75)


if __name__ == "__main__":
    audit_map_and_detection()
