import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from backend.services.settlement_analysis import MaroonedSettlementDetector, settlement_analysis_service


class FloodAnalysisService:
    """
    Geospatial Flood Analysis Service.
    Integrates satellite-derived flood inundation masks with topological
    road graph analysis to identify marooned settlements and severed access corridors.
    """

    def __init__(self):
        self.data_dir = Path(__file__).resolve().parent.parent.parent / "data" / "processed"
        self.flood_file = self.data_dir / "flood_zones.geojson"
        self.villages_file = self.data_dir / "villages.geojson"
        self.roads_file = self.data_dir / "roads.geojson"
        self.camps_file = self.data_dir / "rescue_camps.geojson"

    def get_flood_zones(self) -> Dict[str, Any]:
        if not self.flood_file.exists():
            return {"type": "FeatureCollection", "features": []}
        with open(self.flood_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_villages(self) -> Dict[str, Any]:
        if not self.villages_file.exists():
            return {"type": "FeatureCollection", "features": []}
        with open(self.villages_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_roads(self) -> Dict[str, Any]:
        if not self.roads_file.exists():
            return {"type": "FeatureCollection", "features": []}
        with open(self.roads_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_camps(self) -> Dict[str, Any]:
        if not self.camps_file.exists():
            return {"type": "FeatureCollection", "features": []}
        with open(self.camps_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_detector(self, threat_buffer_meters: float = 150.0) -> MaroonedSettlementDetector:
        return settlement_analysis_service.get_detector(threat_buffer_meters)

    def analyze_marooned_settlements(self, threat_buffer_meters: float = 150.0) -> List[Dict[str, Any]]:
        """
        Evaluates settlements against satellite flood inundation masks and topological road graphs.
        Returns a classified list of settlements with their isolation status.
        """
        return settlement_analysis_service.analyze_marooned(threat_buffer_meters)

    def get_full_analysis(self, threat_buffer_meters: float = 150.0) -> Dict[str, Any]:
        """Returns the full detection output including summary, settlements and GeoJSONs."""
        return settlement_analysis_service.get_full_analysis(threat_buffer_meters)

    def get_blocked_roads(self) -> Dict[str, Any]:
        """Returns GeoJSON FeatureCollection of submerged and impassable road segments."""
        return settlement_analysis_service.get_blocked_roads()


flood_analysis_service = FloodAnalysisService()
