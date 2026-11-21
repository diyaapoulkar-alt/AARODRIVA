from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SettlementStatus(str, Enum):
    ACCESSIBLE = "Accessible"
    AT_RISK = "At risk"
    ACCESS_SEVERED = "Access severed"


class EvacuationPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class NearestCampInfo(BaseModel):
    camp_id: str
    camp_name: str
    distance_meters: float
    distance_km: float
    waypoints_count: int


class SettlementDetailResponse(BaseModel):
    settlement_id: str
    name: str
    district: str
    population: int
    vulnerable_count: int
    coordinates: List[float]
    status: str
    evacuation_priority: str
    is_inundated: bool
    flood_distance_meters: float
    threat_buffer_applied_m: float
    snap_distance_to_road_m: float
    total_connecting_roads: int
    submerged_connecting_roads: int
    open_connecting_roads: int
    reachable_camps_count: int
    nearest_camp: Optional[NearestCampInfo] = None
    all_reachable_camps: List[NearestCampInfo] = []
    risk_score: float
    risk_factors: List[str]
    isolation_reason: str
    geometry: Dict[str, Any]


class StatusCounts(BaseModel):
    accessible: int
    at_risk: int
    access_severed: int


class PopulationSummary(BaseModel):
    total_population: int
    accessible_population: int
    at_risk_population: int
    marooned_population: int


class RoadInfrastructureSummary(BaseModel):
    total_network_km: float
    submerged_network_km: float
    submerged_percentage: float
    severed_segments_count: int


class SitrepSummaryResponse(BaseModel):
    timestamp: str
    total_settlements: int
    status_counts: StatusCounts
    population_summary: PopulationSummary
    road_infrastructure: RoadInfrastructureSummary
    threat_buffer_meters: float
    operational_rescue_camps: int


class MaroonedAnalysisResponse(BaseModel):
    summary: SitrepSummaryResponse
    settlements: List[SettlementDetailResponse]
    settlements_geojson: Dict[str, Any]
    blocked_roads_geojson: Dict[str, Any]


class SimulationRequest(BaseModel):
    buffer_expansion_meters: float = Field(default=50.0, description="Expand flood perimeter by this distance in meters")
    threat_buffer_meters: float = Field(default=200.0, description="Buffer sensitivity in meters")


class CustomAnalysisRequest(BaseModel):
    threat_buffer_meters: float = Field(default=150.0, description="Proximity threat buffer in meters")
    settlements_geojson: Optional[Dict[str, Any]] = None
    road_network_geojson: Optional[Dict[str, Any]] = None
    flood_zones_geojson: Optional[Dict[str, Any]] = None
    rescue_camps_geojson: Optional[Dict[str, Any]] = None
