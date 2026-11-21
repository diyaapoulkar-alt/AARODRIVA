import json
from pathlib import Path
from typing import Dict, List, Any
from shapely.geometry import shape, Point

class FloodAnalysisService:
    def __init__(self):
        self.data_dir = Path(__file__).resolve().parent.parent.parent / "data" / "processed"
        self.flood_file = self.data_dir / "flood_zones.geojson"
        self.villages_file = self.data_dir / "villages.geojson"

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

    def analyze_marooned_settlements(self) -> List[Dict[str, Any]]:
        """
        Evaluates settlements against satellite flood inundation masks.
        Returns a classified list of settlements with their isolation status.
        """
        villages_data = self.get_villages()
        flood_data = self.get_flood_zones()

        flood_polygons = []
        for feature in flood_data.get("features", []):
            try:
                poly = shape(feature["geometry"])
                flood_polygons.append(poly)
            except Exception as e:
                print(f"[FloodAnalysis] Error parsing polygon: {e}")

        results = []
        for v in villages_data.get("features", []):
            props = dict(v.get("properties", {}))
            coords = v.get("geometry", {}).get("coordinates", [0, 0])
            pt = Point(coords[0], coords[1])

            # Check direct inundation or proximity
            in_water = any(poly.contains(pt) for poly in flood_polygons)
            
            # Use pre-computed road network status and proximity
            is_marooned = props.get("is_marooned", False) or in_water

            results.append({
                "village_id": props.get("id"),
                "name": props.get("name"),
                "latitude": coords[1],
                "longitude": coords[0],
                "population": props.get("population", 0),
                "vulnerability": "Critical" if is_marooned else props.get("vulnerability", "Moderate"),
                "access_status": "Access Severed" if is_marooned else "Accessible",
                "is_marooned": is_marooned,
                "isolation_reason": props.get("isolation_reason", "Roads under operational monitoring")
            })

        return results

flood_analysis_service = FloodAnalysisService()
