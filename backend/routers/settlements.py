from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Query, HTTPException, status
from backend.services.settlement_analysis import settlement_analysis_service
from backend.services.flood_analysis import flood_analysis_service
from backend.schemas.settlement import SimulationRequest

router = APIRouter(prefix="/api", tags=["Settlement Analysis"])


@router.get("/settlements")
def get_all_settlements():
    """Returns all villages with geographic points and demographic indicators."""
    return flood_analysis_service.get_villages()


@router.get("/settlements/marooned")
@router.get("/analysis/marooned")
def get_marooned_analysis(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0, description="Buffer sensitivity in meters")
):
    """Analyzes and identifies settlements with severed road connectivity."""
    return settlement_analysis_service.analyze_marooned(threat_buffer_meters)


@router.get("/settlements/marooned/full")
@router.get("/analysis/marooned/full")
def get_full_marooned_analysis(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0)
):
    """Returns complete detection summary, settlement diagnostics, and map GeoJSONs."""
    return settlement_analysis_service.get_full_analysis(threat_buffer_meters)


@router.get("/settlements/marooned/blocked-roads")
@router.get("/analysis/marooned/blocked-roads")
def get_blocked_roads():
    """Returns GeoJSON FeatureCollection of impassable submerged road segments."""
    return settlement_analysis_service.get_blocked_roads()


@router.get("/settlements/marooned/sitrep")
@router.get("/analysis/marooned/sitrep")
def get_marooned_sitrep(
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0)
):
    """Returns aggregated SITREP metrics for marooned settlement status."""
    return settlement_analysis_service.get_sitrep_summary(threat_buffer_meters)


@router.get("/settlements/{village_id}")
def get_settlement_diagnosis(
    village_id: str,
    threat_buffer_meters: float = Query(150.0, ge=0.0, le=5000.0)
):
    """Returns diagnostic details for a specific settlement ID."""
    full_data = settlement_analysis_service.get_full_analysis(threat_buffer_meters)
    for s in full_data["settlements"]:
        if s["settlement_id"].lower() == village_id.lower():
            return s
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Settlement with ID '{village_id}' not found."
    )


@router.post("/settlements/simulate")
@router.post("/analysis/marooned/simulate")
def simulate_flood_impact(request: SimulationRequest):
    """Simulates rising flood levels and reports delta impact on village accessibility."""
    baseline = settlement_analysis_service.get_full_analysis(threat_buffer_meters=150.0)
    simulated = settlement_analysis_service.get_full_analysis(threat_buffer_meters=request.threat_buffer_meters)

    base_map = {s["settlement_id"]: s["status"] for s in baseline["settlements"]}
    newly_severed = []
    newly_at_risk = []

    for s in simulated["settlements"]:
        sid = s["settlement_id"]
        base_status = base_map.get(sid)
        if base_status != "Access severed" and s["status"] == "Access severed":
            newly_severed.append({
                "settlement_id": sid,
                "name": s["name"],
                "previous_status": base_status,
                "current_status": s["status"],
                "reason": s["isolation_reason"]
            })
        elif base_status == "Accessible" and s["status"] == "At risk":
            newly_at_risk.append({
                "settlement_id": sid,
                "name": s["name"],
                "previous_status": base_status,
                "current_status": s["status"],
                "reason": s["isolation_reason"]
            })

    return {
        "simulation_parameters": {
            "buffer_expansion_meters": request.buffer_expansion_meters,
            "threat_buffer_meters": request.threat_buffer_meters
        },
        "baseline_summary": baseline["summary"]["status_counts"],
        "simulated_summary": simulated["summary"]["status_counts"],
        "delta": {
            "additional_severed_count": len(newly_severed),
            "additional_at_risk_count": len(newly_at_risk),
            "newly_severed": newly_severed,
            "newly_at_risk": newly_at_risk
        }
    }
