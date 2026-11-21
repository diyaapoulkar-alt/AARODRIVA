from fastapi import APIRouter
from backend.database.connection import get_db_connection
from backend.services.flood_analysis import flood_analysis_service

router = APIRouter(prefix="/api/metrics", tags=["Command Dashboard Metrics"])

@router.get("")
def get_dashboard_metrics():
    """Aggregates high-level threat metrics for the EOC command bar."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as active_sos, SUM(people_count) as total_stranded FROM sos_incidents WHERE status != 'rescued'")
    agg = cursor.fetchone()
    active_sos = agg["active_sos"] or 0
    total_stranded = agg["total_stranded"] or 0

    cursor.execute("SELECT COUNT(*) as dispatched FROM sos_incidents WHERE status = 'dispatched'")
    dispatched = cursor.fetchone()["dispatched"] or 0

    conn.close()

    settlements = flood_analysis_service.analyze_marooned_settlements()
    marooned = [v for v in settlements if v["is_marooned"]]

    return {
        "inundation_area_sqkm": 142.8,
        "satellite_source": "Bhoonidhi RISAT-1A SAR",
        "total_settlements_monitored": len(settlements),
        "marooned_settlements_count": len(marooned),
        "marooned_population": sum(v["population"] for v in marooned),
        "active_sos_count": active_sos,
        "total_stranded_count": total_stranded,
        "dispatched_missions_count": dispatched,
        "navic_satellites_locked": 7,
        "navic_signal_status": "STRONG (L5/S-Band Assisted)",
        "rain_intensity_mm_hr": 38.5,
        "rain_source": "MOSDAC INSAT-3DR Rapid Precipitation"
    }
