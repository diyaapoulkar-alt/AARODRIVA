import json
from pathlib import Path
from fastapi import APIRouter
from backend.database.models import RouteRequest
from backend.services.routing import rescue_route_engine

router = APIRouter(prefix="/api", tags=["Rescue Intelligence"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "processed"

@router.get("/camps")
def get_rescue_camps():
    """Returns NDRF/SDRF rescue staging camps."""
    path = DATA_DIR / "rescue_camps.geojson"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}

@router.get("/roads")
def get_road_network():
    """Returns road network vectors with flood submergence status."""
    path = DATA_DIR / "roads.geojson"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}

@router.post("/routes")
def calculate_rescue_route(req: RouteRequest):
    """
    RescueRoute AI Endpoint:
    Calculates Dijkstra flood-avoidance path from rescue base to target destination.
    """
    res = rescue_route_engine.calculate_route(
        start_node=req.rescue_camp_id,
        target_node=req.destination_node_or_id,
        avoid_flooded=req.avoid_flooded_roads
    )
    return res
