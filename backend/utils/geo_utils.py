import math
from typing import Tuple, List, Dict, Any, Union, Optional
import networkx as nx
from shapely.geometry import Point, LineString, Polygon, MultiPolygon, MultiLineString, shape, mapping
from shapely.geometry.base import BaseGeometry
from shapely.ops import unary_union
from shapely import STRtree

EARTH_RADIUS_METERS = 6371008.8  # Mean Earth radius in meters


def quantize_coords(coord: Union[Tuple[float, float], List[float]], precision: int = 6) -> Tuple[float, float]:
    """
    Rounds [longitude, latitude] to a fixed precision to ensure topological node
    coincidence across road junctions and snapping.
    Precision 6 corresponds to ~0.11 meters.
    """
    lon = round(float(coord[0]), precision)
    lat = round(float(coord[1]), precision)
    return (lon, lat)


def haversine_distance(coord1: Union[Tuple[float, float], List[float]], 
                       coord2: Union[Tuple[float, float], List[float]]) -> float:
    """
    Calculates great-circle distance between two [lon, lat] points in meters.
    """
    lon1, lat1 = math.radians(coord1[0]), math.radians(coord1[1])
    lon2, lat2 = math.radians(coord2[0]), math.radians(coord2[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_METERS * c


def linestring_length_meters(coords: List[Union[Tuple[float, float], List[float]]]) -> float:
    """
    Calculates the true geodesic length of a LineString coordinate sequence in meters.
    """
    total = 0.0
    for i in range(len(coords) - 1):
        total += haversine_distance(coords[i], coords[i + 1])
    return total


def meters_to_degrees_approx(meters: float, latitude: float = 26.5) -> float:
    """
    Converts a distance in meters to approximate decimal degrees at a specified latitude.
    Used for creating buffer zones in EPSG:4326.
    """
    lat_deg_per_meter = 1.0 / 111320.0
    lon_deg_per_meter = 1.0 / (111320.0 * math.cos(math.radians(latitude)))
    return meters * math.sqrt(lat_deg_per_meter * lon_deg_per_meter)


def degrees_to_meters_approx(degrees: float, latitude: float = 26.5) -> float:
    """
    Converts decimal degrees to approximate meters at a given latitude.
    """
    meters_per_deg_lat = 111320.0
    meters_per_deg_lon = 111320.0 * math.cos(math.radians(latitude))
    avg_scale = (meters_per_deg_lat + meters_per_deg_lon) / 2.0
    return degrees * avg_scale


def to_shapely(geom_dict_or_obj: Any) -> BaseGeometry:
    """
    Safely converts a GeoJSON geometry dictionary or existing Shapely geometry into a Shapely geometry object.
    """
    if isinstance(geom_dict_or_obj, BaseGeometry):
        return geom_dict_or_obj
    if isinstance(geom_dict_or_obj, dict):
        if "geometry" in geom_dict_or_obj:
            return shape(geom_dict_or_obj["geometry"])
        return shape(geom_dict_or_obj)
    raise ValueError(f"Cannot convert object of type {type(geom_dict_or_obj)} to Shapely geometry")


def to_geojson_geometry(geom: BaseGeometry) -> Dict[str, Any]:
    """
    Converts a Shapely geometry into a standard GeoJSON geometry dictionary.
    """
    return mapping(geom)


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
        """
        coords = list(road_geom.coords)
        total_len_m = linestring_length_meters(coords)
        if total_len_m <= 0.0:
            total_len_m = 0.1

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
                if isinstance(intersection, LineString):
                    submerged_len_m = linestring_length_meters(list(intersection.coords))
                    submerged_geojson = to_geojson_geometry(intersection)
                elif isinstance(intersection, MultiLineString):
                    submerged_len_m = sum(linestring_length_meters(list(ls.coords)) for ls in intersection.geoms)
                    submerged_geojson = to_geojson_geometry(intersection)
                else:
                    submerged_len_m = 5.0
                    submerged_geojson = to_geojson_geometry(intersection)

        submerged_pct = min(100.0, (submerged_len_m / total_len_m) * 100.0)
        is_flooded = intersects_flood and (submerged_len_m >= 2.0 or submerged_pct >= 2.0)

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


class RoadNetworkGraph:
    """
    Constructs a topological network graph from road network GeoJSON features,
    integrates flood status on road segments, and supports reachability queries.
    """

    def __init__(self, road_geojson: Dict[str, Any], flood_engine: Optional[FloodIntersectionEngine] = None):
        self.raw_geojson = road_geojson
        self.flood_engine = flood_engine
        self.full_graph = nx.Graph()
        self.passable_graph = nx.Graph()
        self.edge_records: List[Dict[str, Any]] = []
        self._build_graph()

    def _build_graph(self) -> None:
        features = self.raw_geojson.get("features", [])
        edge_index = 0

        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            road_id = str(props.get("id", feat.get("id", f"ROAD-{edge_index}")))
            road_name = props.get("name", f"Road segment {edge_index}")
            road_type = props.get("road_type", "secondary")

            # Check if road is explicitly tagged as flooded in GeoJSON properties
            prop_flooded = bool(props.get("is_flooded", False))

            if geom.get("type") != "LineString":
                continue

            raw_coords = geom.get("coordinates", [])
            if len(raw_coords) < 2:
                continue

            clean_coords = [quantize_coords(c) for c in raw_coords]

            for i in range(len(clean_coords) - 1):
                u = clean_coords[i]
                v = clean_coords[i + 1]

                segment_geom = LineString([u, v])
                seg_length_m = linestring_length_meters([u, v])
                if seg_length_m <= 0:
                    continue

                flood_info = {
                    "is_flooded": prop_flooded,
                    "submerged_length_m": seg_length_m if prop_flooded else 0.0,
                    "total_length_m": round(seg_length_m, 2),
                    "submerged_pct": 100.0 if prop_flooded else 0.0,
                    "is_threatened": prop_flooded,
                    "min_distance_to_flood_m": 0.0 if prop_flooded else 999999.0,
                    "submerged_geom_geojson": None,
                }

                if self.flood_engine:
                    geo_flood_info = self.flood_engine.analyze_road_geometry(segment_geom)
                    # Merge spatial flood detection with any existing property flags
                    is_cut = prop_flooded or geo_flood_info["is_flooded"]
                    flood_info["is_flooded"] = is_cut
                    flood_info["submerged_length_m"] = geo_flood_info["submerged_length_m"] or (seg_length_m if is_cut else 0.0)
                    flood_info["submerged_pct"] = geo_flood_info["submerged_pct"] or (100.0 if is_cut else 0.0)
                    flood_info["is_threatened"] = is_cut or geo_flood_info["is_threatened"]
                    flood_info["min_distance_to_flood_m"] = geo_flood_info["min_distance_to_flood_m"]
                    flood_info["submerged_geom_geojson"] = geo_flood_info["submerged_geom_geojson"]

                edge_data = {
                    "edge_id": f"{road_id}_seg_{i}",
                    "road_id": road_id,
                    "road_name": road_name,
                    "road_type": road_type,
                    "length_m": round(seg_length_m, 2),
                    "weight": round(seg_length_m, 2),
                    "is_flooded": flood_info["is_flooded"],
                    "submerged_length_m": flood_info["submerged_length_m"],
                    "submerged_pct": flood_info["submerged_pct"],
                    "is_threatened": flood_info["is_threatened"],
                    "min_distance_to_flood_m": flood_info["min_distance_to_flood_m"],
                    "submerged_geom_geojson": flood_info["submerged_geom_geojson"],
                    "geometry": segment_geom,
                    "coords": [u, v]
                }

                self.edge_records.append(edge_data)

                # Add to full graph
                self.full_graph.add_node(u, pos=u)
                self.full_graph.add_node(v, pos=v)
                self.full_graph.add_edge(u, v, **edge_data)

                # Add to passable graph only if unflooded
                if not flood_info["is_flooded"]:
                    self.passable_graph.add_node(u, pos=u)
                    self.passable_graph.add_node(v, pos=v)
                    self.passable_graph.add_edge(u, v, **edge_data)

                edge_index += 1

    def find_nearest_node(self, coord: Tuple[float, float], 
                          max_distance_m: float = 3000.0) -> Tuple[Optional[Tuple[float, float]], float]:
        clean_pt = quantize_coords(coord)
        nodes = list(self.full_graph.nodes)
        if not nodes:
            return None, float("inf")

        best_node = None
        min_dist = float("inf")

        for node in nodes:
            dist = haversine_distance(clean_pt, node)
            if dist < min_dist:
                min_dist = dist
                best_node = node

        return best_node, round(min_dist, 2)

    def get_connecting_edges_for_node(self, node: Tuple[float, float], 
                                      graph_type: str = "full") -> List[Dict[str, Any]]:
        g = self.passable_graph if graph_type == "passable" else self.full_graph
        if node not in g:
            return []

        results = []
        for neighbor in g.neighbors(node):
            edge_data = g.get_edge_data(node, neighbor)
            results.append(edge_data)
        return results

    def is_reachable(self, source_node: Tuple[float, float], 
                     target_node: Tuple[float, float], 
                     use_passable_only: bool = True) -> bool:
        g = self.passable_graph if use_passable_only else self.full_graph
        if source_node not in g or target_node not in g:
            return False
        return nx.has_path(g, source_node, target_node)

    def shortest_path_details(self, source_node: Tuple[float, float], 
                              target_node: Tuple[float, float], 
                              use_passable_only: bool = True) -> Optional[Dict[str, Any]]:
        g = self.passable_graph if use_passable_only else self.full_graph
        if source_node not in g or target_node not in g:
            return None

        if not nx.has_path(g, source_node, target_node):
            return None

        try:
            path_nodes = nx.shortest_path(g, source=source_node, target=target_node, weight="weight")
            length_m = nx.shortest_path_length(g, source=source_node, target=target_node, weight="weight")
            return {
                "path_nodes": path_nodes,
                "length_meters": round(length_m, 2),
                "length_km": round(length_m / 1000.0, 2),
                "is_passable": use_passable_only
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def get_flooded_edges_geojson(self) -> Dict[str, Any]:
        features = []
        for edge in self.edge_records:
            if edge["is_flooded"]:
                features.append({
                    "type": "Feature",
                    "id": edge["edge_id"],
                    "properties": {
                        "edge_id": edge["edge_id"],
                        "road_id": edge["road_id"],
                        "road_name": edge["road_name"],
                        "road_type": edge["road_type"],
                        "total_length_m": edge["length_m"],
                        "submerged_length_m": edge["submerged_length_m"],
                        "submerged_pct": edge["submerged_pct"],
                        "status": "IMPASSABLE"
                    },
                    "geometry": to_geojson_geometry(edge["geometry"])
                })

        return {
            "type": "FeatureCollection",
            "name": "severed_road_segments",
            "features": features
        }
