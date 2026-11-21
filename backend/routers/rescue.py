import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from backend.services.routing import rescue_route_engine

router = APIRouter(prefix="/api", tags=["Rescue Intelligence"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "processed"

class DynamicRouteRequest(BaseModel):
    rescue_camp_id: Optional[str] = "CAMP_NDRF_01"
    destination_node_or_id: Optional[str] = "VIL_KHARGHULI"
    avoid_flooded_roads: Optional[bool] = True
    start: Optional[str] = None
    destination: Optional[str] = None

@router.get("/routes")
def get_operational_routes():
    """
    Returns active rescue evacuation routes and identified submerged road segments.
    Used by frontend CommandMap (RescueRoute.jsx).
    """
    return rescue_route_engine.get_all_routes_and_blocked()

@router.post("/routes")
def calculate_rescue_route(req: DynamicRouteRequest):
    """
    Calculates optimized Dijkstra / A* route avoiding submerged bridges.
    """
    start_pt = req.start or req.rescue_camp_id or "CAMP_NDRF_01"
    dest_pt = req.destination or req.destination_node_or_id or "VIL_KHARGHULI"
    avoid = req.avoid_flooded_roads if req.avoid_flooded_roads is not None else True

    return rescue_route_engine.calculate_route(
        start=start_pt,
        destination=dest_pt,
        avoid_flooded=avoid
    )

@router.post("/routes/calculate")
def calculate_route_alias(req: DynamicRouteRequest):
    """Alias for POST /routes."""
    return calculate_rescue_route(req)

@router.get("/camps")
def get_rescue_camps():
    """Returns rescue staging camps with capacity and coordinate data."""
    # Return format matching both frontend GeoJSON and array expectations
    return [
        {
            "id": "camp-1",
            "name": "NDRF Base & Relief Camp #1",
            "agency": "NDRF 1st Battalion",
            "capacity": 500,
            "occupied": 310,
            "available_boats": 6,
            "coords": [26.138, 91.785]
        },
        {
            "id": "camp-2",
            "name": "District Stadium Shelter",
            "agency": "SDRF Tactical Relief",
            "capacity": 800,
            "occupied": 490,
            "available_boats": 3,
            "coords": [26.125, 91.755]
        }
    ]

@router.get("/roads")
def get_road_network():
    """Returns road network vectors."""
    path = DATA_DIR / "roads.geojson"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}
