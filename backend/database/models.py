from pydantic import BaseModel, Field
from typing import List, Optional

class SOSCreate(BaseModel):
    village_id: Optional[str] = "VIL_01"
    village_name: Optional[str] = "Dhansiri Riverbank"
    latitude: float
    longitude: float
    people_count: int = Field(default=1, ge=1)
    urgency: str = Field(default="critical")  # critical, high, moderate, low
    needs: List[str] = Field(default_factory=list)  # medical, drinking_water, food, rescue_boat, infant_supplies
    message: Optional[str] = ""
    gnss_source: Optional[str] = "NavIC-compatible L5/S-Band (Simulated)"
    offline_queued: Optional[bool] = False

class SOSUpdate(BaseModel):
    status: str  # pending, dispatched, rescued, cancelled
    assigned_camp: Optional[str] = None
    notes: Optional[str] = None

class RouteRequest(BaseModel):
    rescue_camp_id: str = "CAMP_01"
    destination_node_or_id: str = "VIL_01"
    avoid_flooded_roads: bool = True
