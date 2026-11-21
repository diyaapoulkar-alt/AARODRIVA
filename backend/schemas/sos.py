from typing import List, Optional
from pydantic import BaseModel, Field


class SOSCreateRequest(BaseModel):
    village_id: Optional[str] = None
    village_name: Optional[str] = None
    latitude: float
    longitude: float
    people_count: int = Field(default=1, ge=1)
    urgency: str = "critical"
    needs: List[str] = []
    message: Optional[str] = None
    gnss_source: str = "NavIC-compatible L5/S-Band (Simulated)"
    offline_queued: bool = False


class SOSIncidentResponse(BaseModel):
    id: str
    village_id: Optional[str] = None
    village_name: Optional[str] = None
    latitude: float
    longitude: float
    people_count: int
    urgency: str
    needs: List[str]
    message: Optional[str] = None
    status: str
    priority_score: Optional[float] = None
    triage_tier: Optional[str] = None
    timestamp: str
