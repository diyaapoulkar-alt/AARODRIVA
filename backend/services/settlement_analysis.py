import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple

from backend.utils.geo_utils import (
    quantize_coords,
    to_geojson_geometry,
    meters_to_degrees_approx,
    FloodIntersectionEngine,
    RoadNetworkGraph,
    haversine_distance,
)
from backend.schemas.settlement import SettlementStatus, EvacuationPriority


class MaroonedSettlementDetector:
    """
    Core geospatial intelligence engine for detecting marooned and isolated settlements
    during flood disasters. Integrates satellite-derived inundation with topological
    road graph reachability to disaster response camps.
    """

    def __init__(
        self,
        settlements_geojson: Dict[str, Any],
        road_network_geojson: Dict[str, Any],
        flood_zones_geojson: Dict[str, Any],
        rescue_camps_geojson: Dict[str, Any],
        threat_buffer_meters: float = 150.0,
    ):
        self.settlements_geojson = settlements_geojson
        self.road_network_geojson = road_network_geojson
        self.flood_zones_geojson = flood_zones_geojson
        self.rescue_camps_geojson = rescue_camps_geojson
        self.threat_buffer_meters = threat_buffer_meters

        # Initialize flood spatial analysis engine
        self.flood_engine = FloodIntersectionEngine(
            self.flood_zones_geojson,
            default_threat_buffer_meters=threat_buffer_meters
        )

        # Build topological road graph with flood intersections
        self.road_graph = RoadNetworkGraph(
            self.road_network_geojson,
            flood_engine=self.flood_engine
        )

        # Parse rescue camps and map them to road graph nodes
        self.camps: List[Dict[str, Any]] = []
        self._map_rescue_camps()

    def _map_rescue_camps(self) -> None:
        """Extracts operational rescue camps and snaps each to the nearest road network node."""
        features = self.rescue_camps_geojson.get("features", [])
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            if geom.get("type") != "Point":
                continue

            coords = geom.get("coordinates", [])
            if len(coords) < 2:
                continue

            camp_id = str(props.get("id", feat.get("id", "CAMP-UNKNOWN")))
            camp_name = props.get("name", f"Rescue Camp {camp_id}")
            node, snap_dist_m = self.road_graph.find_nearest_node(coords)

            self.camps.append({
                "id": camp_id,
                "name": camp_name,
                "type": props.get("type", props.get("commanding_agency", "Relief Center")),
                "capacity": props.get("capacity_persons", props.get("capacity_people", 1000)),
                "status": props.get("status", props.get("operational_status", "OPERATIONAL")),
                "coordinates": coords,
                "graph_node": node,
                "snap_distance_m": snap_dist_m,
                "properties": props
            })

    def analyze_settlement(self, settlement_feature: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the marooned detection algorithm for a single settlement:
        1. Spatial submergence check (inside satellite flood polygon)
        2. Proximity to floodwaters (distance in meters)
        3. Topological road graph reachability to all rescue camps
        4. Degree of isolation, route redundancy, and threat buffer exposure
        5. Tri-state status classification: Accessible, At risk, or Access severed
        """
        props = settlement_feature.get("properties", {})
        geom = settlement_feature.get("geometry", {})
        coords = geom.get("coordinates", [0, 0])

        settlement_id = str(props.get("id", settlement_feature.get("id", "SETTLE-UNKNOWN")))
        name = props.get("name", f"Settlement {settlement_id}")
        district = props.get("district", "Assam")
        population = int(props.get("population", 500))
        vulnerable_count = int(props.get("vulnerable_count", int(population * 0.15)))

        # 1. Spatial submergence and distance to flood
        is_inundated = self.flood_engine.is_point_inundated(coords)
        flood_distance_m = self.flood_engine.point_distance_to_flood_meters(coords)
        is_threatened_by_buffer = self.flood_engine.is_point_threatened(coords, self.threat_buffer_meters)

        # 2. Graph node mapping
        settlement_node, snap_dist_m = self.road_graph.find_nearest_node(coords)

        # 3. Assess connecting edges at the settlement's junction
        connecting_full = self.road_graph.get_connecting_edges_for_node(settlement_node, graph_type="full")
        connecting_passable = self.road_graph.get_connecting_edges_for_node(settlement_node, graph_type="passable")
        
        total_links = len(connecting_full)
        open_links = len(connecting_passable)
        submerged_links = total_links - open_links

        # 4. Multi-camp reachability & shortest rescue corridor calculation
        reachable_camps = []
        nearest_camp_info = None
        min_camp_dist_km = float("inf")

        for camp in self.camps:
            camp_node = camp["graph_node"]
            if not camp_node or not settlement_node:
                continue

            path_info = self.road_graph.shortest_path_details(
                settlement_node, camp_node, use_passable_only=True
            )

            if path_info is not None:
                camp_entry = {
                    "camp_id": camp["id"],
                    "camp_name": camp["name"],
                    "distance_meters": path_info["length_meters"],
                    "distance_km": path_info["length_km"],
                    "waypoints_count": len(path_info["path_nodes"])
                }
                reachable_camps.append(camp_entry)

                if path_info["length_km"] < min_camp_dist_km:
                    min_camp_dist_km = path_info["length_km"]
                    nearest_camp_info = camp_entry

        if nearest_camp_info is None and self.camps:
            closest_camp = None
            closest_dist_m = float("inf")
            for camp in self.camps:
                ccoords = camp.get("coordinates", [0, 0])
                d_m = haversine_distance(coords, ccoords)
                if d_m < closest_dist_m:
                    closest_dist_m = d_m
                    closest_camp = camp
            if closest_camp:
                nearest_camp_info = {
                    "camp_id": closest_camp["id"],
                    "camp_name": closest_camp["name"],
                    "distance_meters": round(closest_dist_m, 1),
                    "distance_km": round(closest_dist_m / 1000.0, 2),
                    "waypoints_count": 0,
                    "is_direct_line_severed": True
                }

        # 5. Determine Status and Risk Triggers
        risk_factors: List[str] = []
        status: SettlementStatus
        priority: EvacuationPriority
        isolation_reason: str

        # Check explicit marooned property if present in dataset
        dataset_is_marooned = props.get("is_marooned", False)

        if len(reachable_camps) == 0 or (dataset_is_marooned and open_links == 0):
            # CASE: ACCESS SEVERED (MAROONED)
            status = SettlementStatus.ACCESS_SEVERED
            if is_inundated:
                priority = EvacuationPriority.CRITICAL
                isolation_reason = (
                    f"CRITICAL MAROONED: Settlement is directly submerged by floodwaters and "
                    f"has 0 viable mapped road routes to any rescue camp ({submerged_links}/{total_links} local roads cut)."
                )
                risk_factors.append("Direct physical land submergence")
                risk_factors.append("Total vehicular access severed")
            else:
                priority = EvacuationPriority.HIGH
                isolation_reason = (
                    f"ACCESS SEVERED: Islanded settlement. Ground is currently unflooded ({flood_distance_m:.1f}m from water), "
                    f"but all connecting roads to rescue camps are impassable due to submerged segments."
                )
                risk_factors.append("Total vehicular access severed to all rescue camps")
                if is_threatened_by_buffer:
                    risk_factors.append(f"Within {self.threat_buffer_meters}m flood threat perimeter")

        else:
            threat_triggers = []

            if is_inundated:
                threat_triggers.append("Settlement interior is physically inundated")
            if is_threatened_by_buffer:
                threat_triggers.append(f"Located within {self.threat_buffer_meters}m flood boundary buffer ({flood_distance_m:.1f}m)")
            if submerged_links > 0:
                threat_triggers.append(f"{submerged_links} of {total_links} connecting roads are already submerged/impassable")
            if open_links == 1 and total_links > 1:
                threat_triggers.append("Only a single bottleneck escape road remains open (loss of alternate route)")

            # Check if dataset explicitly tagged as At Risk
            if props.get("access_status", "").lower() == "at risk" and not threat_triggers:
                threat_triggers.append("Perimeter surface water approaching settlement")

            if threat_triggers:
                # CASE: AT RISK
                status = SettlementStatus.AT_RISK
                priority = EvacuationPriority.MEDIUM if not is_inundated else EvacuationPriority.HIGH
                risk_factors.extend(threat_triggers)
                camp_name = nearest_camp_info['camp_name'] if nearest_camp_info else 'nearest camp'
                dist_km = nearest_camp_info['distance_km'] if nearest_camp_info else 0.0
                isolation_reason = (
                    f"AT RISK: Viable road exists to {camp_name} ({dist_km} km), "
                    f"but settlement or corridor is threatened: {'; '.join(threat_triggers)}."
                )
            else:
                # CASE: ACCESSIBLE
                status = SettlementStatus.ACCESSIBLE
                priority = EvacuationPriority.LOW
                camp_name = nearest_camp_info['camp_name'] if nearest_camp_info else 'relief camp'
                dist_km = nearest_camp_info['distance_km'] if nearest_camp_info else 0.0
                isolation_reason = (
                    f"ACCESSIBLE: Clear, viable road connection to {camp_name} ({dist_km} km). "
                    f"All {total_links} local road links are open and above flood line."
                )

        # Risk score calculation (0 to 100)
        risk_score = 0.0
        if status == SettlementStatus.ACCESS_SEVERED:
            risk_score = 95.0 if is_inundated else 80.0
        elif status == SettlementStatus.AT_RISK:
            risk_score = 55.0
            if is_inundated:
                risk_score += 20.0
            if submerged_links > 0:
                risk_score += 15.0
            if flood_distance_m < 50.0:
                risk_score += 10.0
        else:
            risk_score = 15.0

        if vulnerable_count > 100 and status != SettlementStatus.ACCESSIBLE:
            risk_score = min(100.0, risk_score + 5.0)

        return {
            "settlement_id": settlement_id,
            "name": name,
            "district": district,
            "population": population,
            "vulnerable_count": vulnerable_count,
            "coordinates": coords,
            "status": status.value,
            "evacuation_priority": priority.value,
            "is_inundated": is_inundated,
            "flood_distance_meters": round(flood_distance_m, 1),
            "threat_buffer_applied_m": self.threat_buffer_meters,
            "snap_distance_to_road_m": snap_dist_m,
            "total_connecting_roads": total_links,
            "submerged_connecting_roads": submerged_links,
            "open_connecting_roads": open_links,
            "reachable_camps_count": len(reachable_camps),
            "nearest_camp": nearest_camp_info,
            "all_reachable_camps": reachable_camps,
            "risk_score": round(risk_score, 1),
            "risk_factors": risk_factors,
            "isolation_reason": isolation_reason,
            "geometry": geom
        }

    def detect_all(self) -> Dict[str, Any]:
        """Executes marooned analysis across all settlements in the dataset."""
        features = self.settlements_geojson.get("features", [])
        analyzed_settlements: List[Dict[str, Any]] = []

        accessible_count = 0
        at_risk_count = 0
        severed_count = 0

        accessible_pop = 0
        at_risk_pop = 0
        severed_pop = 0
        total_pop = 0

        for feat in features:
            res = self.analyze_settlement(feat)
            analyzed_settlements.append(res)
            pop = res["population"]
            total_pop += pop

            if res["status"] == SettlementStatus.ACCESS_SEVERED.value:
                severed_count += 1
                severed_pop += pop
            elif res["status"] == SettlementStatus.AT_RISK.value:
                at_risk_count += 1
                at_risk_pop += pop
            else:
                accessible_count += 1
                accessible_pop += pop

        # Road network metrics
        total_road_m = sum(e["length_m"] for e in self.road_graph.edge_records)
        submerged_road_m = sum(e["submerged_length_m"] for e in self.road_graph.edge_records if e["is_flooded"])
        submerged_pct = (submerged_road_m / total_road_m * 100.0) if total_road_m > 0 else 0.0

        summary = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_settlements": len(features),
            "status_counts": {
                "accessible": accessible_count,
                "at_risk": at_risk_count,
                "access_severed": severed_count
            },
            "population_summary": {
                "total_population": total_pop,
                "accessible_population": accessible_pop,
                "at_risk_population": at_risk_pop,
                "marooned_population": severed_pop
            },
            "road_infrastructure": {
                "total_network_km": round(total_road_m / 1000.0, 2),
                "submerged_network_km": round(submerged_road_m / 1000.0, 2),
                "submerged_percentage": round(submerged_pct, 1),
                "severed_segments_count": sum(1 for e in self.road_graph.edge_records if e["is_flooded"])
            },
            "threat_buffer_meters": self.threat_buffer_meters,
            "operational_rescue_camps": len(self.camps)
        }

        geojson_features = []
        for s in analyzed_settlements:
            geojson_features.append({
                "type": "Feature",
                "id": s["settlement_id"],
                "properties": {
                    "id": s["settlement_id"],
                    "name": s["name"],
                    "district": s["district"],
                    "population": s["population"],
                    "status": s["status"],
                    "evacuation_priority": s["evacuation_priority"],
                    "is_inundated": s["is_inundated"],
                    "flood_distance_m": s["flood_distance_meters"],
                    "risk_score": s["risk_score"],
                    "nearest_camp_name": s["nearest_camp"]["camp_name"] if s["nearest_camp"] else "None",
                    "nearest_camp_distance_km": s["nearest_camp"]["distance_km"] if s["nearest_camp"] else None,
                    "isolation_reason": s["isolation_reason"],
                    "risk_factors": s["risk_factors"]
                },
                "geometry": s["geometry"]
            })

        settlements_geojson_out = {
            "type": "FeatureCollection",
            "name": "marooned_analyzed_settlements",
            "features": geojson_features
        }

        return {
            "summary": summary,
            "settlements": analyzed_settlements,
            "settlements_geojson": settlements_geojson_out,
            "blocked_roads_geojson": self.road_graph.get_flooded_edges_geojson()
        }

    def predict_location(
        self,
        lat: float,
        lon: float,
        place_name: Optional[str] = None,
        threat_buffer_meters: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Dynamically analyzes and predicts disaster threat, inundation risk,
        and marooned isolation status for any map place or coordinate.
        """
        from backend.services.routing import rescue_route_engine

        buf = threat_buffer_meters if threat_buffer_meters is not None else self.threat_buffer_meters
        coords = [lon, lat]
        name = place_name or f"Sector ({lat:.4f}°N, {lon:.4f}°E)"

        # Check existing settlements for exact match
        for s in self.settlements_geojson.get("features", []):
            sprops = s.get("properties", {})
            sgeom = s.get("geometry", {})
            scoords = sgeom.get("coordinates", [0, 0])
            if (place_name and place_name.lower() in sprops.get("name", "").lower()) or (
                abs(scoords[0] - lon) < 0.005 and abs(scoords[1] - lat) < 0.005
            ):
                analyzed = self.analyze_settlement(s)
                nearest_camp_id = analyzed["nearest_camp"]["camp_id"] if analyzed.get("nearest_camp") else (
                    self.camps[0]["id"] if self.camps else "CAMP_NDRF_01"
                )
                route = rescue_route_engine.calculate_route(
                    start=nearest_camp_id,
                    destination=[lat, lon],
                    avoid_flooded=True
                )
                return {
                    "place_name": analyzed["name"],
                    "latitude": lat,
                    "longitude": lon,
                    "coordinates": [lat, lon],
                    "matched_settlement_id": analyzed["settlement_id"],
                    "prediction": {
                        "access_status": analyzed["status"],
                        "is_marooned": (analyzed["status"] == "Access severed"),
                        "is_inundated": analyzed["is_inundated"],
                        "evacuation_priority": analyzed["evacuation_priority"],
                        "risk_score": analyzed["risk_score"],
                        "flood_distance_meters": analyzed["flood_distance_meters"],
                        "threat_buffer_meters": buf,
                        "isolation_reason": analyzed["isolation_reason"],
                        "risk_factors": analyzed["risk_factors"],
                        "road_connectivity": {
                            "total_connecting_roads": analyzed["total_connecting_roads"],
                            "submerged_connecting_roads": analyzed["submerged_connecting_roads"],
                            "open_connecting_roads": analyzed["open_connecting_roads"]
                        }
                    },
                    "nearest_rescue_camp": analyzed.get("nearest_camp"),
                    "all_reachable_camps": analyzed.get("all_reachable_camps", []),
                    "recommended_rescue_route": route,
                    "recommended_action": (
                        "Immediate watercraft extraction required. Direct road transit impassable."
                        if analyzed["status"] == "Access severed"
                        else (
                            "Relief convoys alert: monitor approaching floodwaters; prepare elevated bypass."
                            if analyzed["status"] == "At risk"
                            else "Normal vehicular corridor intact. Maintain standby VHF communication."
                        )
                    )
                }

        # 1. Spatial submergence & flood distance
        is_inundated = self.flood_engine.is_point_inundated(coords)
        flood_distance_m = self.flood_engine.point_distance_to_flood_meters(coords)
        is_threatened = self.flood_engine.is_point_threatened(coords, buf)

        # 2. Road graph snapping
        nearest_node, snap_dist_m = self.road_graph.find_nearest_node(coords)
        connecting_full = self.road_graph.get_connecting_edges_for_node(nearest_node, graph_type="full")
        connecting_passable = self.road_graph.get_connecting_edges_for_node(nearest_node, graph_type="passable")
        total_links = len(connecting_full)
        open_links = len(connecting_passable)
        submerged_links = total_links - open_links

        # 3. Multi-camp reachability & nearest camp
        reachable_camps = []
        nearest_camp_info = None
        min_camp_dist_km = float("inf")

        for camp in self.camps:
            camp_node = camp["graph_node"]
            if not camp_node or not nearest_node:
                continue

            path_info = self.road_graph.shortest_path_details(
                nearest_node, camp_node, use_passable_only=True
            )
            if path_info is not None:
                camp_entry = {
                    "camp_id": camp["id"],
                    "camp_name": camp["name"],
                    "distance_km": path_info["length_km"],
                    "waypoints_count": len(path_info["path_nodes"])
                }
                reachable_camps.append(camp_entry)
                if path_info["length_km"] < min_camp_dist_km:
                    min_camp_dist_km = path_info["length_km"]
                    nearest_camp_info = camp_entry

        # 4. Status determination
        if is_inundated or (open_links == 0 and len(reachable_camps) == 0):
            status = "Access severed"
            priority = "Critical" if is_inundated else "High"
            risk_score = 95.0 if is_inundated else 85.0
            reason = (
                f"MAROONED: Submerged territory or severed road connectivity. "
                f"0 open vehicular corridors to rescue camps ({submerged_links} blocked links)."
            )
        elif is_threatened or submerged_links > 0:
            status = "At risk"
            priority = "Medium"
            risk_score = 65.0 if is_threatened else 50.0
            reason = (
                f"AT RISK: Proximity to active flood line ({flood_distance_m:.1f}m). "
                f"Corridors threatened or bottlenecked ({open_links}/{total_links} open links)."
            )
        else:
            status = "Accessible"
            priority = "Low"
            risk_score = 15.0
            camp_name = nearest_camp_info["camp_name"] if nearest_camp_info else "Relief Staging Depot"
            reason = f"ACCESSIBLE: High ground. Open connection to {camp_name} ({min_camp_dist_km:.1f} km)."

        # 5. Calculate live RescueRoute AI bypass
        nearest_camp_id = nearest_camp_info["camp_id"] if nearest_camp_info else (
            self.camps[0]["id"] if self.camps else "CAMP_NDRF_01"
        )
        route_details = rescue_route_engine.calculate_route(
            start=nearest_camp_id,
            destination=[lat, lon],
            avoid_flooded=True
        )

        return {
            "place_name": name,
            "latitude": lat,
            "longitude": lon,
            "coordinates": [lat, lon],
            "prediction": {
                "access_status": status,
                "is_marooned": (status == "Access severed"),
                "is_inundated": is_inundated,
                "is_threatened": is_threatened,
                "evacuation_priority": priority,
                "risk_score": risk_score,
                "flood_distance_meters": round(flood_distance_m, 1),
                "threat_buffer_meters": buf,
                "isolation_reason": reason,
                "road_connectivity": {
                    "total_connecting_roads": total_links,
                    "submerged_connecting_roads": submerged_links,
                    "open_connecting_roads": open_links,
                    "nearest_graph_node": nearest_node,
                    "snap_distance_meters": snap_dist_m
                }
            },
            "nearest_rescue_camp": nearest_camp_info or (self.camps[0] if self.camps else None),
            "all_reachable_camps": reachable_camps,
            "recommended_rescue_route": route_details,
            "recommended_action": (
                "Immediate watercraft extraction required. Direct road transit impassable."
                if status == "Access severed"
                else (
                    "Relief convoys alert: monitor approaching floodwaters; prepare elevated bypass."
                    if status == "At risk"
                    else "Normal vehicular corridor intact. Maintain standby VHF communication."
                )
            )
        }


class SettlementAnalysisService:
    """
    Service wrapper managing default and sample datasets for settlement analysis.
    """

    def __init__(self):
        self.root_dir = Path(__file__).resolve().parent.parent.parent
        self.processed_dir = self.root_dir / "data" / "processed"
        self.sample_dir = self.root_dir / "data" / "sample"

    def _load_json(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            return {"type": "FeatureCollection", "features": []}
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_processed_data(self) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
        villages = self._load_json(self.processed_dir / "villages.geojson")
        roads = self._load_json(self.processed_dir / "roads.geojson")
        floods = self._load_json(self.processed_dir / "flood_zones.geojson")
        camps = self._load_json(self.processed_dir / "rescue_camps.geojson")
        return villages, roads, floods, camps

    def get_detector(self, threat_buffer_meters: float = 150.0, use_sample: bool = False) -> MaroonedSettlementDetector:
        if use_sample and (self.sample_dir / "sample_villages.geojson").exists():
            villages = self._load_json(self.sample_dir / "sample_villages.geojson")
            roads = self._load_json(self.sample_dir / "sample_roads.geojson") if (self.sample_dir / "sample_roads.geojson").exists() else self._load_json(self.processed_dir / "roads.geojson")
            floods = self._load_json(self.sample_dir / "sample_flood.geojson")
            camps = self._load_json(self.processed_dir / "rescue_camps.geojson")
        else:
            villages, roads, floods, camps = self.get_processed_data()

        return MaroonedSettlementDetector(
            settlements_geojson=villages,
            road_network_geojson=roads,
            flood_zones_geojson=floods,
            rescue_camps_geojson=camps,
            threat_buffer_meters=threat_buffer_meters
        )

    def analyze_marooned(self, threat_buffer_meters: float = 150.0) -> List[Dict[str, Any]]:
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
                "vulnerability": s["evacuation_priority"],
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
        detector = self.get_detector(threat_buffer_meters)
        return detector.detect_all()

    def get_blocked_roads(self) -> Dict[str, Any]:
        detector = self.get_detector()
        return detector.road_graph.get_flooded_edges_geojson()

    def get_sitrep_summary(self, threat_buffer_meters: float = 150.0) -> Dict[str, Any]:
        detector = self.get_detector(threat_buffer_meters)
        return detector.detect_all()["summary"]

    def predict_location(
        self,
        lat: float,
        lon: float,
        place_name: Optional[str] = None,
        threat_buffer_meters: float = 150.0
    ) -> Dict[str, Any]:
        """Predicts disaster status, inundation and rescue corridor for any location or place."""
        detector = self.get_detector(threat_buffer_meters)
        return detector.predict_location(lat, lon, place_name, threat_buffer_meters)


settlement_analysis_service = SettlementAnalysisService()

