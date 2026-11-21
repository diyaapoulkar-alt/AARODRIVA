from fastapi import APIRouter
from backend.services.flood_analysis import flood_analysis_service

router = APIRouter(prefix="/api", tags=["Settlement Analysis"])

@router.get("/settlements")
def get_all_settlements():
    """Returns all villages with geographic points and demographic indicators."""
    return flood_analysis_service.get_villages()

@router.get("/analysis/marooned")
def get_marooned_analysis():
    """Analyzes and identifies settlements with severed road connectivity."""
    return flood_analysis_service.analyze_marooned_settlements()
