from fastapi import APIRouter
from backend.services.flood_analysis import flood_analysis_service

router = APIRouter(prefix="/api", tags=["Flood Intelligence"])

@router.get("/flood-zones")
def get_flood_zones():
    """Returns satellite-derived flood inundation polygons (Bhoonidhi / Bhuvan)."""
    return flood_analysis_service.get_flood_zones()

@router.get("/layers")
def get_available_layers():
    """Lists available operational data layers."""
    return [
        {
            "id": "bhuvan_satellite",
            "name": "ISRO Bhuvan Base Map",
            "type": "basemap",
            "provider": "NRSC / ISRO",
            "enabled": True
        },
        {
            "id": "bhoonidhi_sar_flood",
            "name": "Bhoonidhi RISAT-1A SAR Inundation Mask",
            "type": "vector",
            "provider": "ISRO Bhoonidhi EO Archive",
            "enabled": True
        },
        {
            "id": "mosdac_rainfall",
            "name": "MOSDAC INSAT-3DR Precipitation Intensity",
            "type": "raster_heatmap",
            "provider": "ISRO MOSDAC",
            "enabled": True
        },
        {
            "id": "osm_road_network",
            "name": "Transport & Causeway Road Graph",
            "type": "vector_lines",
            "provider": "OpenStreetMap / Public Works",
            "enabled": True
        }
    ]
