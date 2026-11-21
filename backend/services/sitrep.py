import json
from datetime import datetime
from typing import Dict, Any
from backend.database.connection import get_db_connection
from backend.services.flood_analysis import flood_analysis_service

def generate_situation_report() -> Dict[str, Any]:
    """Generates an executive Emergency Operations Centre (EOC) Situation Briefing."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # SOS statistics
    cursor.execute("SELECT COUNT(*) as total, SUM(people_count) as total_people FROM sos_incidents")
    sos_agg = cursor.fetchone()
    total_sos = sos_agg["total"] or 0
    total_stranded = sos_agg["total_people"] or 0

    cursor.execute("SELECT COUNT(*) as critical_count FROM sos_incidents WHERE urgency = 'critical'")
    critical_sos = cursor.fetchone()["critical_count"] or 0

    cursor.execute("SELECT COUNT(*) as dispatched FROM sos_incidents WHERE status = 'dispatched'")
    dispatched_count = cursor.fetchone()["dispatched"] or 0

    conn.close()

    # Settlement data
    settlements = flood_analysis_service.analyze_marooned_settlements()
    marooned_villages = [v for v in settlements if v["is_marooned"]]
    marooned_pop = sum(v["population"] for v in marooned_villages)
    total_villages_monitored = len(settlements)

    now_str = datetime.now().strftime("%d %b %Y, %H:%M IST")

    report_narrative = (
        f"AARODRIVA AI EMERGENCY OPERATIONS CENTRE SITUATION REPORT\n"
        f"Generated at: {now_str}\n"
        f"Operational Zone: Golaghat & Brahmaputra Basin Floodplain, Assam\n"
        f"Satellite Observation: Bhoonidhi RISAT-1A SAR & Bhuvan Flood Services\n"
        f"----------------------------------------------------------------------\n\n"
        f"1. THREAT OVERVIEW:\n"
        f"   • Total Satellite Inundation Area: 142.8 sq km\n"
        f"   • Monitored Settlements: {total_villages_monitored}\n"
        f"   • Confirmed Marooned Villages: {len(marooned_villages)} ({', '.join(v['name'] for v in marooned_villages)})\n"
        f"   • Marooned Population at Critical Risk: {marooned_pop:,} residents\n\n"
        f"2. RESCUE & DISTRESS INCIDENTS:\n"
        f"   • Active SOS Distress Beacons: {total_sos}\n"
        f"   • Stranded Persons Awaiting Extraction: {total_stranded}\n"
        f"   • Priority 1 (Immediate Medical/Boat Dispatch): {critical_sos}\n"
        f"   • Rescue Missions Dispatched: {dispatched_count}\n\n"
        f"3. ACCESS & LOGISTICS DIRECTIVE:\n"
        f"   • State Highway 4 Causeway submerged under 1.4m turbulent water (Impassable).\n"
        f"   • RescueRoute AI recommends Southern High-Ground Ridge Bypass corridor via Bokakhat.\n"
        f"   • Speedboat staging authorized from NDRF Battalion 12 Base Bokakhat.\n"
    )

    return {
        "report_id": f"SITREP-{datetime.now().strftime('%Y%m%d-%H%M')}",
        "timestamp": now_str,
        "region": "Golaghat Flood Basin, Assam",
        "inundation_area_sqkm": 142.8,
        "monitored_settlements": total_villages_monitored,
        "marooned_settlements_count": len(marooned_villages),
        "marooned_population": marooned_pop,
        "total_active_sos": total_sos,
        "total_stranded_souls": total_stranded,
        "critical_priority_sos": critical_sos,
        "dispatched_missions": dispatched_count,
        "marooned_villages_list": marooned_villages,
        "executive_summary": report_narrative
    }
