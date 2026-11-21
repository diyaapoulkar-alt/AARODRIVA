from fastapi import APIRouter
from backend.services.flood_analysis import flood_analysis_service
from backend.services.routing import rescue_route_engine

router = APIRouter(prefix="/api/metrics", tags=["Command Dashboard Metrics"])

@router.get("")
def get_dashboard_metrics():
    """Aggregates high-level threat metrics for the EOC command bar."""
    routes_data = rescue_route_engine.get_all_routes_and_blocked()
    blocked_count = len(routes_data.get("blockedRoads", []))

    return {
        "activeSOS": 14,
        "maroonedVillages": 8,
        "blockedRoads": blocked_count or 5,
        "activeRescueTeams": 11,
        "peopleEvacuated": 1420,
        "inundationAreaSqKm": 142.8,
        "satelliteSensor": "ISRO Bhoonidhi RISAT-1A C-SAR",
        "navicSatellitesLocked": 7,
        "navicSignalStatus": "STRONG (L5/S-Band Assisted)",
        "waterLevelTrend": [
            { "time": "08:00", "level": 48.2, "danger": 49.5 },
            { "time": "10:00", "level": 48.9, "danger": 49.5 },
            { "time": "12:00", "level": 49.6, "danger": 49.5 },
            { "time": "14:00", "level": 50.4, "danger": 49.5 },
            { "time": "16:00", "level": 51.1, "danger": 49.5 },
            { "time": "18:00", "level": 50.8, "danger": 49.5 }
        ]
    }
