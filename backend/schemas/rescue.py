from typing import List, Optional
from pydantic import BaseModel


class RouteCalculationRequest(BaseModel):
    rescue_camp_id: str = "CAMP_01"
    destination_node_or_id: str = "VIL_01"
    avoid_flooded_roads: bool = True


class RouteCalculationResponse(BaseModel):
    status: str
    algorithm: str
    start_node: str
    target_node: str
    total_distance_km: float
    avoided_flooded_roads_count: int
    node_path: List[str]
    route_coordinates: List[List[float]]
    is_direct_unobstructed: bool
    warning: Optional[str] = None
