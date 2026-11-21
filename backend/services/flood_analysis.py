import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from core.marooned_detector import MaroonedSettlementDetector


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
        return MaroonedSettlementDetector(
            settlements_geojson=self.get_villages(),
            road_network_geojson=self.get_roads(),
            flood_zones_geojson=self.get_flood_zones(),
            rescue_camps_geojson=self.get_camps(),
            threat_buffer_meters=threat_buffer_meters
        )

    def analyze_marooned_settlements(self, threat_buffer_meters: float = 150.0) -> List[Dict[str, Any]]:
        """
        Evaluates settlements against satellite flood inundation masks and topological road graphs.
        Returns a classified list of settlements with their isolation status.
        """
        detector = self.get_detector(threat_buffer_meters)
        analysis = detector.detect_all()

        results = []
        for s in analysis["settlements"]:
            is_marooned = (s["status"] == "Access severed")
            results.append({
                "village_id": s["settlement_id"],
                "name": s["name"],
                "latitude": s["coordinates"][1],
                "longitude": s["coordinates"][0],
                "population": s["population"],
                "vulnerability": "Critical" if is_marooned else ("Moderate" if s["status"] == "At risk" else "Low"),
                "access_status": s["status"],
                "is_marooned": is_marooned,
                "isolation_reason": s["isolation_reason"],
                "risk_score": s["risk_score"],
                "risk_factors": s["risk_factors"],
                "nearest_camp": s["nearest_camp"],
                "open_connecting_roads": s["open_connecting_roads"],
                "total_connecting_roads": s["total_connecting_roads"]
            })

        return results

    def get_full_analysis(self, threat_buffer_meters: float = 150.0) -> Dict[str, Any]:
        """Returns the full detection output including summary, settlements and GeoJSONs."""
        detector = self.get_detector(threat_buffer_meters)
        return detector.detect_all()

    def get_blocked_roads(self) -> Dict[str, Any]:
        """Returns GeoJSON FeatureCollection of submerged and impassable road segments."""
        detector = self.get_detector()
        return detector.road_graph.get_flooded_edges_geojson()


flood_analysis_service = FloodAnalysisService()
