from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.services.flood_analysis import flood_analysis_service

router = APIRouter(prefix="/api", tags=["Settlement Analysis"])


@router.get("/settlements")
def get_all_settlements():
    """Returns all villages with geographic points and demographic indicators."""
    return flood_analysis_service.get_villages()


@router.get("/analysis/marooned")
def get_marooned_analysis(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0, description="Buffer sensitivity in meters")
):
    """Analyzes and identifies settlements with severed road connectivity."""
    return flood_analysis_service.analyze_marooned_settlements(threat_buffer_meters)


@router.get("/analysis/marooned/full")
def get_full_marooned_analysis(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0)
):
    """Returns complete detection summary, settlement diagnostics, and map GeoJSONs."""
    return flood_analysis_service.get_full_analysis(threat_buffer_meters)


@router.get("/analysis/marooned/blocked-roads")
def get_blocked_roads():
    """Returns GeoJSON FeatureCollection of impassable submerged road segments."""
    return flood_analysis_service.get_blocked_roads()


@router.get("/analysis/marooned/sitrep")
def get_marooned_sitrep(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0)
):
    """Returns aggregated SITREP metrics for marooned settlement status."""
    analysis = flood_analysis_service.get_full_analysis(threat_buffer_meters)
    return analysis["summary"]
