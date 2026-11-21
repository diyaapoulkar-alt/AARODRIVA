import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend.database.connection import get_db_connection
from backend.database.models import SOSCreate, SOSUpdate
from backend.services.priority import calculate_incident_priority

router = APIRouter(prefix="/api/sos", tags=["Citizen Distress"])

@router.get("")
def list_sos_incidents():
    """Fetches all citizen SOS incidents enriched with AI priority scoring."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sos_incidents ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        item = dict(row)
        try:
            item["needs"] = json.loads(item["needs"]) if item["needs"] else []
        except Exception:
            item["needs"] = [item["needs"]] if item["needs"] else []
        
        # Calculate dynamic triage priority
        p_info = calculate_incident_priority(item)
        item["priority_score"] = p_info["priority_score"]
        item["triage_tier"] = p_info["triage_tier"]
        item["triage_factors"] = p_info["factors"]
        results.append(item)

    # Sort primarily by priority score descending
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results

@router.post("")
def create_sos_incident(payload: SOSCreate):
    """Submits a new emergency SOS distress beacon."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    new_id = f"SOS-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now().isoformat()

    cursor.execute("""
    INSERT INTO sos_incidents 
    (id, village_id, village_name, latitude, longitude, people_count, urgency, needs, message, status, timestamp, gnss_source, offline_queued)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        payload.village_id,
        payload.village_name,
        payload.latitude,
        payload.longitude,
        payload.people_count,
        payload.urgency,
        json.dumps(payload.needs),
        payload.message,
        "pending",
        now_iso,
        payload.gnss_source,
        1 if payload.offline_queued else 0
    ))
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "message": "Distress beacon registered in EOC queue",
        "incident_id": new_id
    }

@router.patch("/{incident_id}")
def update_sos_status(incident_id: str, payload: SOSUpdate):
    """Updates emergency incident operational status."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM sos_incidents WHERE id = ?", (incident_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Incident ID not found")

    cursor.execute("UPDATE sos_incidents SET status = ? WHERE id = ?", (payload.status, incident_id))
    conn.commit()
    conn.close()

    return {"status": "success", "incident_id": incident_id, "updated_status": payload.status}
