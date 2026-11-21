from typing import Dict, Any, List

def calculate_incident_priority(incident: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes an explainable disaster triage score (0-100+) based on 
    urgency classification, headcount, medical needs, and village isolation.
    """
    score = 0
    factors = []

    urgency = str(incident.get("urgency", "")).lower()
    if urgency == "critical":
        score += 45
        factors.append("Critical threat classification (+45)")
    elif urgency == "high":
        score += 30
        factors.append("High urgency classification (+30)")
    elif urgency == "moderate":
        score += 15
        factors.append("Moderate urgency (+15)")
    else:
        score += 5

    # Headcount factor
    people = int(incident.get("people_count", 1))
    if people > 10:
        score += 25
        factors.append(f"Mass casualty vulnerability: {people} stranded souls (+25)")
    elif people >= 5:
        score += 15
        factors.append(f"Multi-person party: {people} stranded (+15)")
    else:
        score += 5

    # Needs factor
    needs = incident.get("needs", [])
    if isinstance(needs, str):
        import json
        try:
            needs = json.loads(needs)
        except Exception:
            needs = [needs]

    if "medical" in needs:
        score += 30
        factors.append("Active medical distress requires doctor/medic kit (+30)")
    if "rescue_boat" in needs:
        score += 20
        factors.append("Deep water trapping requires inflatable/motorized boat (+20)")
    if "infant_supplies" in needs:
        score += 15
        factors.append("Infant/lactating mother emergency supplies (+15)")

    triage_tier = "PRIORITY 1 - IMMEDIATE DISPATCH" if score >= 80 else (
        "PRIORITY 2 - HIGH URGENCY" if score >= 50 else "PRIORITY 3 - MONITOR & STAGE"
    )

    return {
        "priority_score": score,
        "triage_tier": triage_tier,
        "factors": factors
    }
