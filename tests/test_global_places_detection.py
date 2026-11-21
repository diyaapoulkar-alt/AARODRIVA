import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://127.0.0.1:8000"

GLOBAL_CITIES = [
    # Asia
    ("Tokyo", 35.6762, 139.6503, "Japan", "Asia"),
    ("Singapore", 1.3521, 103.8198, "Singapore", "Asia"),
    ("Seoul", 37.5665, 126.9780, "South Korea", "Asia"),
    ("Beijing", 39.9042, 116.4074, "China", "Asia"),
    ("Bangkok", 13.7563, 100.5018, "Thailand", "Asia"),
    ("Dubai", 25.2048, 55.2708, "UAE", "Middle East"),
    ("Mumbai", 19.0760, 72.8777, "India", "Asia"),
    ("New Delhi", 28.6139, 77.2090, "India", "Asia"),
    ("Bengaluru", 12.9716, 77.5946, "India", "Asia"),
    ("Kolkata", 22.5726, 88.3639, "India", "Asia"),
    # Europe
    ("London", 51.5074, -0.1278, "United Kingdom", "Europe"),
    ("Paris", 48.8566, 2.3522, "France", "Europe"),
    ("Berlin", 52.5200, 13.4050, "Germany", "Europe"),
    ("Rome", 41.9028, 12.4964, "Italy", "Europe"),
    ("Madrid", 40.4168, -3.7038, "Spain", "Europe"),
    ("Amsterdam", 52.3676, 4.9041, "Netherlands", "Europe"),
    ("Zurich", 47.3769, 8.5417, "Switzerland", "Europe"),
    # North America
    ("New York", 40.7128, -74.0060, "USA", "North America"),
    ("San Francisco", 37.7749, -122.4194, "USA", "North America"),
    ("Chicago", 41.8781, -87.6298, "USA", "North America"),
    ("Toronto", 43.6532, -79.3832, "Canada", "North America"),
    ("Mexico City", 19.4326, -99.1332, "Mexico", "North America"),
    # South America
    ("Sao Paulo", -23.5505, -46.6333, "Brazil", "South America"),
    ("Buenos Aires", -34.6037, -58.3816, "Argentina", "South America"),
    ("Santiago", -33.4489, -70.6693, "Chile", "South America"),
    ("Bogota", 4.7110, -74.0721, "Colombia", "South America"),
    # Africa
    ("Cairo", 30.0444, 31.2357, "Egypt", "Africa"),
    ("Nairobi", -1.2921, 36.8219, "Kenya", "Africa"),
    ("Johannesburg", -26.2041, 28.0473, "South Africa", "Africa"),
    ("Cape Town", -33.9249, 18.4241, "South Africa", "Africa"),
    ("Lagos", 6.5244, 3.3792, "Nigeria", "Africa"),
    # Oceania
    ("Sydney", -33.8688, 151.2093, "Australia", "Oceania"),
    ("Melbourne", -37.8136, 144.9631, "Australia", "Oceania"),
    ("Auckland", -36.8485, 174.7633, "New Zealand", "Oceania"),
    # Active Disaster Epicenter (Assam Basin)
    ("Guwahati Dispur Ridge", 26.138, 91.785, "Assam, India", "Disaster Theater (Safe Elevated Ridge)"),
    ("Zoo Road Central", 26.165, 91.775, "Assam, India", "Disaster Theater (Threat Buffer Zone)"),
    ("Kharghuli Riverfront", 26.185, 91.745, "Assam, India", "Disaster Theater (Submerged Marooned Zone)"),
    ("Kaziranga North Hamlet", 26.645, 93.140, "Assam, India", "Disaster Theater (Critical Marooned Zone)"),
]


def test_global_predictions():
    print("=" * 80)
    print("AARODRIVA AI — GLOBAL MULTI-CONTINENT DETECTION & PREDICTION TEST")
    print(f"Target Server: {BASE_URL}")
    print(f"Total Places Tested: {len(GLOBAL_CITIES)} across all 7 continents")
    print("=" * 80)

    passed_count = 0
    failed_count = 0

    start_time = time.time()

    for city, lat, lon, country, continent in GLOBAL_CITIES:
        # Test GET endpoint with query parameters
        params = urllib.parse.urlencode({
            "lat": lat,
            "lon": lon,
            "name": f"{city}, {country}"
        })
        url = f"{BASE_URL}/api/predict/location?{params}"

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AarodrivaTest/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                status_code = response.getcode()
                data = json.loads(response.read().decode("utf-8"))

            pred = data.get("prediction", {})
            status = pred.get("access_status")
            risk = pred.get("risk_score")
            inundated = pred.get("is_inundated")
            marooned = pred.get("is_marooned")
            dist_km = round(pred.get("flood_distance_meters", 0.0) / 1000.0, 1)
            camp = data.get("nearest_rescue_camp", {}).get("camp_name", "N/A")

            # Check correctness
            is_disaster = "Disaster Theater" in continent
            if is_disaster:
                if "Submerged" in continent or "Critical" in continent:
                    assert status == "Access severed" and marooned == True
                elif "Buffer" in continent:
                    assert status == "At risk" and marooned == False
                elif "Safe" in continent:
                    assert status == "Accessible" and marooned == False
            else:
                # Outside disaster theater should be Accessible with 0 risk
                assert status == "Accessible" and risk == 0.0 and marooned == False

            passed_count += 1
            print(f"[PASS] {continent:<14} | {city:<16} ({lat:>8.4f}, {lon:>9.4f}) -> {status:<14} | Risk: {risk:>5.1f} | Water Dist: {dist_km:>8.1f} km | Camp: {camp[:25]}")

        except Exception as e:
            failed_count += 1
            print(f"[FAIL] {continent:<14} | {city:<16} ({lat:>8.4f}, {lon:>9.4f}) -> ERROR: {e}")

    duration = time.time() - start_time
    print("=" * 80)
    print(f"RESULTS: {passed_count}/{len(GLOBAL_CITIES)} PLACES PASSED ({passed_count/len(GLOBAL_CITIES)*100:.1f}%) in {duration:.2f}s")
    if failed_count == 0:
        print("STATUS: 100% OPERATIONAL ACROSS ENTIRE WORLD MAP!")
    else:
        print(f"STATUS: {failed_count} PLACES FAILED")
    print("=" * 80)


if __name__ == "__main__":
    test_global_predictions()
