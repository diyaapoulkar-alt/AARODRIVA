from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class RouteCalculationRequest(BaseModel):
    rescue_camp_id: Optional[str] = "CAMP_01"
    destination_node_or_id: Optional[str] = "VIL_01"
    avoid_flooded_roads: Optional[bool] = True
    start: Optional[Union[str, List[float]]] = None
    destination: Optional[Union[str, List[float]]] = None


class RouteCalculationResponse(BaseModel):
    status: str
    algorithm: str
    start_node: str
    target_node: str
    total_distance_km: float
    eta_minutes: Optional[int] = None
    avoided_flooded_roads_count: int
    avoided_flooded_roads: Optional[List[Dict[str, Any]]] = None
    route_roads: Optional[List[str]] = None
    node_path: List[str]
    route_coordinates: List[List[float]]
    geojson: Optional[Dict[str, Any]] = None
    turn_by_turn: Optional[List[str]] = None
    is_safe_bypass: Optional[bool] = None
    is_direct_unobstructed: bool
    safety_advisory: Optional[str] = None
    warning: Optional[str] = None


class BlockedRoadInfo(BaseModel):
    id: str
    name: str
    reason: str
    waterDepthCm: Optional[int] = None
    coordinates: List[List[float]]


class RescueRouteOverview(BaseModel):
    id: str
    name: str
    etaMinutes: int
    distanceKm: Optional[float] = None
    status: str
    coordinates: List[List[float]]


class LeafletRoutesPayload(BaseModel):
    rescueRoutes: List[RescueRouteOverview]
    blockedRoads: List[BlockedRoadInfo]
    status: str
    activeRoutingEngine: str
