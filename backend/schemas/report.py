from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class SitrepMetricsResponse(BaseModel):
    timestamp: str
    inundationAreaSqKm: float
    monitoredSettlements: int
    maroonedSettlementsCount: int
    atRiskSettlementsCount: int
    accessibleSettlementsCount: int
    maroonedPopulation: int
    blockedRoadsCount: int
    submergedRoadKm: float
    activeSafeCorridors: int
    activeSOS: int
    totalStranded: int
    criticalPrioritySOS: int
    dispatchedMissions: int
    operationalRescueCamps: int
    satelliteSensor: str
    navicAssisted: bool


class SituationReportResponse(BaseModel):
    report_id: str
    timestamp: str
    region: str
    metrics: Optional[Dict[str, Any]] = None
    inundation_area_sqkm: float
    monitored_settlements: int
    marooned_settlements_count: int
    marooned_population: int
    total_active_sos: int
    total_stranded_souls: int
    critical_priority_sos: int
    dispatched_missions: int
    blocked_roads_count: Optional[int] = None
    marooned_villages_list: List[Dict[str, Any]]
    at_risk_villages_list: Optional[List[Dict[str, Any]]] = None
    blocked_roads: Optional[List[Dict[str, Any]]] = None
    recommended_routes: Optional[List[Dict[str, Any]]] = None
    executive_summary: str
