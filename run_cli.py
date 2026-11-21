#!/usr/bin/env python3
"""
AARODRIVA AI — Marooned Settlement Detection CLI Runner
Executes the detection engine directly from the command line and displays
a formatted situation report.
"""

import sys
import json
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from core.marooned_detector import MaroonedSettlementDetector


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description="AARODRIVA AI - Marooned Settlement Detection Engine CLI"
    )
    parser.add_argument(
        "--buffer",
        type=float,
        default=150.0,
        help="Proximity threat buffer in meters (default: 150.0)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of formatted report"
    )

    args = parser.parse_args()

    data_dir = Path(__file__).resolve().parent / "data" / "assam_scenario"
    settlements = load_json(data_dir / "settlements.geojson")
    roads = load_json(data_dir / "road_network.geojson")
    floods = load_json(data_dir / "flood_zones.geojson")
    camps = load_json(data_dir / "rescue_camps.geojson")

    detector = MaroonedSettlementDetector(
        settlements_geojson=settlements,
        road_network_geojson=roads,
        flood_zones_geojson=floods,
        rescue_camps_geojson=camps,
        threat_buffer_meters=args.buffer
    )

    result = detector.detect_all()

    if args.json:
        print(json.dumps(result, indent=2))
        return

    summary = result["summary"]
    settlements_list = result["settlements"]

    print("=" * 80)
    print("       AARODRIVA AI - MAROONED SETTLEMENT DETECTION REPORT")
    print("       Scenario: Assam Brahmaputra Basin Inundation & Rescue Routing")
    print("=" * 80)
    print(f" Timestamp:              {summary['timestamp']}")
    print(f" Threat Buffer Applied:  {summary['threat_buffer_meters']} meters")
    print(f" Operational Camps:      {summary['operational_rescue_camps']}")
    print("-" * 80)
    print(" SITUATION REPORT (SITREP) SUMMARY:")
    counts = summary["status_counts"]
    pops = summary["population_summary"]
    roads_info = summary["road_infrastructure"]

    print(f"  * Total Settlements:       {summary['total_settlements']}")
    print(f"    - [OK]   Accessible:      {counts['accessible']}  (Pop: {pops['accessible_population']:,})")
    print(f"    - [WARN] At Risk:         {counts['at_risk']}  (Pop: {pops['at_risk_population']:,})")
    print(f"    - [CRIT] Access Severed:  {counts['access_severed']}  (Pop: {pops['marooned_population']:,}) [MAROONED]")
    print(f"  * Road Network Impact:")
    print(f"    - Total Mapped Network:  {roads_info['total_network_km']} km")
    print(f"    - Submerged Segments:    {roads_info['submerged_network_km']} km ({roads_info['submerged_percentage']}%)")
    print(f"    - Impassable Cut Points: {roads_info['severed_segments_count']} segments")
    print("=" * 80)
    print(f"{'SETTLEMENT NAME':<34} | {'STATUS':<15} | {'PRIORITY':<8} | {'CAMP DIST':<10} | {'CONNECTIVITY'}")
    print("-" * 80)

    for s in settlements_list:
        name = s["name"][:33]
        status = s["status"]
        priority = s["evacuation_priority"]
        camp_dist = f"{s['nearest_camp']['distance_km']} km" if s["nearest_camp"] else "CUT OFF"
        conn = f"{s['open_connecting_roads']}/{s['total_connecting_roads']} roads open"

        # Color/tag indicators
        tag = "[OK]  "
        if status == "Access severed":
            tag = "[CRIT]"
        elif status == "At risk":
            tag = "[WARN]"

        print(f"{tag} {name:<27} | {status:<15} | {priority:<8} | {camp_dist:<10} | {conn}")
        print(f"   |-- Reason: {s['isolation_reason']}")
        if s["risk_factors"]:
            print(f"   |-- Risk Triggers: {', '.join(s['risk_factors'])}")
        print()

    print("=" * 80)
    print(" BLOCKED / SUBMERGED ROAD SEGMENTS:")
    flooded_edges = result["blocked_roads_geojson"]["features"]
    for idx, edge in enumerate(flooded_edges, start=1):
        p = edge["properties"]
        print(f"  {idx}. {p['road_name']} ({p['road_id']}): {p['submerged_length_m']}m submerged ({p['submerged_pct']}%)")
    print("=" * 80)


if __name__ == "__main__":
    main()
