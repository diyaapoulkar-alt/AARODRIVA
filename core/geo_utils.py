import math
from typing import Tuple, List, Dict, Any, Union
from shapely.geometry import shape, mapping
from shapely.geometry.base import BaseGeometry

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
    coord1: [lon1, lat1]
    coord2: [lon2, lat2]
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
    # Return geometric mean of both axes for isotropic buffer approximation
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
