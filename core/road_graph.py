from typing import Dict, Any, List, Tuple, Optional, Set
import networkx as nx
from shapely.geometry import LineString, Point

from .geo_utils import (
    quantize_coords,
    haversine_distance,
    linestring_length_meters,
    to_shapely,
    to_geojson_geometry,
)
from .flood_intersection import FloodIntersectionEngine


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
        """
        Parses LineString features, breaks them into topological segments,
        intersects with flood polygons, and populates NetworkX graphs.
        """
        features = self.raw_geojson.get("features", [])
        edge_index = 0

        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            road_id = str(props.get("id", feat.get("id", f"ROAD-{edge_index}")))
            road_name = props.get("name", f"Road segment {edge_index}")
            road_type = props.get("road_type", "secondary")

            if geom.get("type") != "LineString":
                continue

            raw_coords = geom.get("coordinates", [])
            if len(raw_coords) < 2:
                continue

            # Quantize coordinates for clean node coincidence
            clean_coords = [quantize_coords(c) for c in raw_coords]

            for i in range(len(clean_coords) - 1):
                u = clean_coords[i]
                v = clean_coords[i + 1]

                segment_geom = LineString([u, v])
                seg_length_m = linestring_length_meters([u, v])
                if seg_length_m <= 0:
                    continue

                flood_info = {
                    "is_flooded": False,
                    "submerged_length_m": 0.0,
                    "total_length_m": round(seg_length_m, 2),
                    "submerged_pct": 0.0,
                    "is_threatened": False,
                    "min_distance_to_flood_m": 999999.0,
                    "submerged_geom_geojson": None,
                }

                if self.flood_engine:
                    flood_info = self.flood_engine.analyze_road_geometry(segment_geom)

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

                # Add to passable graph only if not submerged
                if not flood_info["is_flooded"]:
                    self.passable_graph.add_node(u, pos=u)
                    self.passable_graph.add_node(v, pos=v)
                    self.passable_graph.add_edge(u, v, **edge_data)

                edge_index += 1

    def find_nearest_node(self, coord: Tuple[float, float], 
                          max_distance_m: float = 2500.0) -> Tuple[Optional[Tuple[float, float]], float]:
        """
        Finds the closest node in the road network graph to a given [lon, lat] coordinate.
        Returns (nearest_node, distance_in_meters).
        """
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

        if min_dist <= max_distance_m:
            return best_node, round(min_dist, 2)
        return best_node, round(min_dist, 2)

    def get_connecting_edges_for_node(self, node: Tuple[float, float], 
                                      graph_type: str = "full") -> List[Dict[str, Any]]:
        """
        Returns all edges connected to a specific graph node.
        graph_type: 'full' or 'passable'
        """
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
        """
        Checks whether a viable road route exists between source and target.
        """
        g = self.passable_graph if use_passable_only else self.full_graph
        if source_node not in g or target_node not in g:
            return False
        return nx.has_path(g, source_node, target_node)

    def shortest_path_details(self, source_node: Tuple[float, float], 
                              target_node: Tuple[float, float], 
                              use_passable_only: bool = True) -> Optional[Dict[str, Any]]:
        """
        Computes Dijkstra shortest path and returns path coordinates and distance in meters.
        """
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
        """
        Returns a GeoJSON FeatureCollection of all road segments cut by flood waters.
        """
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
