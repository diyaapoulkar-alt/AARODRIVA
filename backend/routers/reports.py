from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from backend.services.sitrep import generate_situation_report

router = APIRouter(prefix="/api/reports", tags=["Reports & SITREP"])

@router.get("/sitrep")
def get_sitrep_json():
    """Generates structured EOC Situation Report JSON."""
    return generate_situation_report()

@router.get("/sitrep/download")
def download_sitrep_text():
    """Generates and downloads formal Situation Report plain text."""
    report = generate_situation_report()
    summary = report.get("executive_summary", "No summary available.")
    return PlainTextResponse(
        content=summary,
        headers={"Content-Disposition": f"attachment; filename={report['report_id']}.txt"}
    )
