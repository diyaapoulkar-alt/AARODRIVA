from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class SituationReportResponse(BaseModel):
    report_id: str
    timestamp: str
    region: str
    inundation_area_sqkm: float
    monitored_settlements: int
    marooned_settlements_count: int
    marooned_population: int
    total_active_sos: int
    total_stranded_souls: int
    critical_priority_sos: int
    dispatched_missions: int
    marooned_villages_list: List[Dict[str, Any]]
    executive_summary: str
