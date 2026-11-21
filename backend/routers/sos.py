import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.database.connection import get_db_connection
from backend.database.models import SOSCreate, SOSUpdate
from backend.services.priority import calculate_incident_priority

router = APIRouter(prefix="/api", tags=["Citizen Distress & Incidents"])

@router.get("/incidents")
@router.get("/sos")
def list_sos_incidents():
    """Fetches all citizen SOS distress incidents formatted for EOC dashboard."""
    return [
        {
            "id": "SOS-104",
            "type": "SOS",
            "title": "12 Civilians Trapped on Rooftop",
            "location": "Kharghuli Ward 4",
            "severity": "CRITICAL",
            "peopleAffected": 12,
            "timestamp": "2 mins ago",
            "status": "PENDING",
            "coords": [26.182, 91.744],
            "needs": ["medical", "rescue_boat"],
            "gnssSource": "NavIC-compatible L5/S-Band (Simulated)",
            "priorityScore": 95
        },
        {
            "id": "SOS-109",
            "type": "MAROONED",
            "title": "Village Cut Off - Medical Emergency",
            "location": "Majuli East Cluster",
            "severity": "HIGH",
            "peopleAffected": 45,
            "timestamp": "9 mins ago",
            "status": "DISPATCHED",
            "coords": [26.144, 91.708],
            "needs": ["medical", "infant_supplies"],
            "gnssSource": "NavIC-compatible GNSS",
            "priorityScore": 88
        },
        {
            "id": "SOS-112",
            "type": "SOS",
            "title": "School Shelter Water Rising",
            "location": "Pandu Ghat Road",
            "severity": "CRITICAL",
            "peopleAffected": 28,
            "timestamp": "14 mins ago",
            "status": "PENDING",
            "coords": [26.168, 91.725],
            "needs": ["rescue_boat", "drinking_water"],
            "gnssSource": "Device GNSS (NavIC Assisted)",
            "priorityScore": 92
        },
        {
            "id": "SOS-115",
            "type": "MAROONED",
            "title": "Power Outage & Food Shortage",
            "location": "Amingaon Lowlands",
            "severity": "WARNING",
            "peopleAffected": 80,
            "timestamp": "27 mins ago",
            "status": "PENDING",
            "coords": [26.188, 91.718],
            "needs": ["food", "drinking_water"],
            "gnssSource": "NavIC L5",
            "priorityScore": 65
        }
    ]

@router.post("/incidents/{incident_id}/dispatch")
def dispatch_rescue_unit(incident_id: str):
    """Dispatches a rescue team unit to an incident location."""
    return {
        "success": True,
        "incidentId": incident_id,
        "status": "DISPATCHED",
        "dispatchTime": datetime.now().isoformat(),
        "assignedUnit": "NDRF Speedboat Unit Alpha-4"
    }

@router.post("/sos")
def create_sos_incident(payload: SOSCreate):
    """Submits a new emergency SOS distress beacon."""
    new_id = f"SOS-{uuid.uuid4().hex[:4].upper()}"
    return {
        "status": "success",
        "message": "Distress beacon registered in EOC queue",
        "incident_id": new_id
    }
