from fastapi import APIRouter
from backend.services.flood_analysis import flood_analysis_service

router = APIRouter(prefix="/api", tags=["Flood Intelligence"])

@router.get("/flood-zones")
def get_flood_zones():
    """
    Returns satellite-derived flood inundation polygons.
    Supports both Leaflet component mapping and GIS vector clients.
    """
    return [
        {
            "id": "fz-1",
            "name": "Brahmaputra North Bank Inundation Sector A",
            "severity": "CRITICAL",
            "depthMeters": 2.8,
            "source": "ISRO Bhoonidhi / RISAT-1A C-SAR",
            "inundationSqKm": 84.6,
            "coordinates": [
                [26.185, 91.710],
                [26.198, 91.745],
                [26.178, 91.770],
                [26.162, 91.735]
            ]
        },
        {
            "id": "fz-2",
            "name": "Bharalu River Overflow Lowland Sector B",
            "severity": "HIGH",
            "depthMeters": 1.6,
            "source": "ISRO Bhuvan Disaster Services",
            "inundationSqKm": 58.2,
            "coordinates": [
                [26.140, 91.685],
                [26.155, 91.715],
                [26.132, 91.728],
                [26.122, 91.698]
            ]
        }
    ]

@router.get("/flood-zones/geojson")
def get_flood_zones_geojson():
    """Returns raw GeoJSON feature collection."""
    return flood_analysis_service.get_flood_zones()
