from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class FloodZoneProperties(BaseModel):
    id: str
    name: str
    source: Optional[str] = None
    depth_category: Optional[str] = None
    inundation_area_sqkm: Optional[float] = None
    detected_at: Optional[str] = None


class FloodZoneFeature(BaseModel):
    type: str = "Feature"
    properties: FloodZoneProperties
    geometry: Dict[str, Any]


class FloodZoneCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[FloodZoneFeature]
