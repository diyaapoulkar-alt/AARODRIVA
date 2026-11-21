from typing import Dict, Any, List, Optional, Tuple, Union
from shapely.geometry import Point, LineString, Polygon, MultiPolygon, MultiLineString
from shapely.ops import unary_union
from shapely import STRtree

from .geo_utils import (
    to_shapely,
    to_geojson_geometry,
    haversine_distance,
    meters_to_degrees_approx,
    degrees_to_meters_approx,
    linestring_length_meters,
)


class FloodIntersectionEngine:
    """
    Performs high-performance geometric intersection and buffer analysis
    between satellite-derived flood inundation polygons and infrastructure
    (road networks and human settlements).
    """

    def __init__(self, flood_geojson: Dict[str, Any], default_threat_buffer_meters: float = 150.0):
        self.raw_geojson = flood_geojson
        self.default_threat_buffer_meters = default_threat_buffer_meters
        self.flood_features = flood_geojson.get("features", [])
        
        # Build unified geometry
        geometries = []
        for feat in self.flood_features:
            geom = to_shapely(feat["geometry"])
            if isinstance(geom, (Polygon, MultiPolygon)):
                geometries.append(geom)

        if geometries:
            self.unified_flood = unary_union(geometries)
        else:
            self.unified_flood = Polygon()

        self._threat_buffer_cache: Dict[float, Any] = {}
        self._tree = STRtree(geometries) if geometries else None

    def get_threat_buffer_geometry(self, buffer_meters: Optional[float] = None) -> Union[Polygon, MultiPolygon]:
        """
        Returns unified flood geometry expanded by buffer_meters.
        Caches result for rapid repeated lookups.
        """
        b_m = buffer_meters if buffer_meters is not None else self.default_threat_buffer_meters
        if b_m <= 0:
            return self.unified_flood

        if b_m not in self._threat_buffer_cache:
            buf_deg = meters_to_degrees_approx(b_m)
            self._threat_buffer_cache[b_m] = self.unified_flood.buffer(buf_deg)
        return self._threat_buffer_cache[b_m]

    def is_point_inundated(self, coord: Union[Tuple[float, float], List[float]]) -> bool:
        """
        Checks whether a point [lon, lat] is directly submerged inside the flood polygon.
        """
        if self.unified_flood.is_empty:
            return False
        pt = Point(coord[0], coord[1])
        return self.unified_flood.intersects(pt)

    def point_distance_to_flood_meters(self, coord: Union[Tuple[float, float], List[float]]) -> float:
        """
        Calculates distance from a point [lon, lat] to the nearest flood boundary in meters.
        Returns 0.0 if the point is inside the flood polygon.
        """
        if self.unified_flood.is_empty:
            return 999999.0
        pt = Point(coord[0], coord[1])
        if self.unified_flood.intersects(pt):
            return 0.0
        dist_deg = self.unified_flood.distance(pt)
        return degrees_to_meters_approx(dist_deg, latitude=coord[1])

    def is_point_threatened(self, coord: Union[Tuple[float, float], List[float]], 
                            buffer_meters: Optional[float] = None) -> bool:
        """
        Checks if a point lies within the flood proximity threat buffer.
        """
        if self.unified_flood.is_empty:
            return False
        threat_buf = self.get_threat_buffer_geometry(buffer_meters)
        pt = Point(coord[0], coord[1])
        return threat_buf.intersects(pt)

    def analyze_road_geometry(self, road_geom: LineString, 
                              buffer_meters: Optional[float] = None) -> Dict[str, Any]:
        """
        Analyzes a road LineString segment against the flood polygons.
        Determines:
        - is_flooded: whether water directly covers any part of the road
        - submerged_length_m: length of road underwater in meters
        - submerged_pct: percentage of total road length underwater
        - is_threatened: whether the road is within buffer_meters of water
        - min_distance_to_flood_m: minimum distance to flood boundary
        - submerged_geom_geojson: GeoJSON geometry of submerged cut parts
        """
        coords = list(road_geom.coords)
        total_len_m = linestring_length_meters(coords)
        if total_len_m <= 0.0:
            total_len_m = 0.1  # avoid divide-by-zero for zero-length edges

        if self.unified_flood.is_empty:
            return {
                "is_flooded": False,
                "submerged_length_m": 0.0,
                "total_length_m": round(total_len_m, 2),
                "submerged_pct": 0.0,
                "is_threatened": False,
                "min_distance_to_flood_m": 999999.0,
                "submerged_geom_geojson": None,
            }

        dist_deg = self.unified_flood.distance(road_geom)
        min_dist_m = degrees_to_meters_approx(dist_deg)

        intersects_flood = self.unified_flood.intersects(road_geom)
        submerged_len_m = 0.0
        submerged_geojson = None

        if intersects_flood:
            intersection = road_geom.intersection(self.unified_flood)
            if not intersection.is_empty:
                # Measure length of intersection
                if isinstance(intersection, LineString):
                    submerged_len_m = linestring_length_meters(list(intersection.coords))
                    submerged_geojson = to_geojson_geometry(intersection)
                elif isinstance(intersection, MultiLineString):
                    submerged_len_m = sum(linestring_length_meters(list(ls.coords)) for ls in intersection.geoms)
                    submerged_geojson = to_geojson_geometry(intersection)
                else:
                    # GeometryCollection or Points (e.g. crossing point)
                    # If it touches or crosses, estimate minimal cut
                    submerged_len_m = 5.0
                    submerged_geojson = to_geojson_geometry(intersection)

        submerged_pct = min(100.0, (submerged_len_m / total_len_m) * 100.0)
        # Threshold: if more than 2 meters or more than 2% submerged, road is blocked for vehicle passage
        is_flooded = intersects_flood and (submerged_len_m >= 2.0 or submerged_pct >= 2.0)

        # Threat analysis
        threat_buf = self.get_threat_buffer_geometry(buffer_meters)
        is_threatened = is_flooded or threat_buf.intersects(road_geom)

        return {
            "is_flooded": is_flooded,
            "submerged_length_m": round(submerged_len_m, 2),
            "total_length_m": round(total_len_m, 2),
            "submerged_pct": round(submerged_pct, 2),
            "is_threatened": is_threatened,
            "min_distance_to_flood_m": round(min_dist_m, 2),
            "submerged_geom_geojson": submerged_geojson,
        }
