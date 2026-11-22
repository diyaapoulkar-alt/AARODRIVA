from fastapi import APIRouter, Response, Query
from fastapi.responses import PlainTextResponse
from backend.services.sitrep import generate_situation_report, get_sitrep_metrics, generate_sitrep_pdf_bytes

router = APIRouter(prefix="/api/reports", tags=["Reports & SITREP"])


@router.get("/sitrep")
def get_sitrep_json():
    """Generates structured EOC Situation Report JSON."""
    return generate_situation_report()


@router.get("/sitrep/metrics")
@router.get("/summary")
def get_sitrep_summary_metrics():
    """Returns high-level SITREP key tactical and strategic indicators."""
    return get_sitrep_metrics()


@router.get("/sitrep/pdf")
def download_sitrep_pdf():
    """
    Generates and downloads formal Situation Report in high-fidelity PDF format
    with tactical tables, KPI grid, marooned settlements, and official seal.
    """
    report = generate_situation_report()
    pdf_bytes = generate_sitrep_pdf_bytes(report)
    filename = f"{report.get('report_id', 'AARODRIVA-SITREP')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/pdf"
        }
    )


@router.get("/sitrep/download")
def download_sitrep(format: str = Query("pdf", description="Format: pdf or txt")):
    """
    Downloads the official situation report either as formatted PDF (default) or plain text.
    """
    report = generate_situation_report()
    if format.lower() == "txt":
        summary = report.get("executive_summary", "No summary available.")
        filename = f"{report.get('report_id', 'AARODRIVA-SITREP')}.txt"
        return PlainTextResponse(
            content=summary,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    # Default to official PDF
    pdf_bytes = generate_sitrep_pdf_bytes(report)
    filename = f"{report.get('report_id', 'AARODRIVA-SITREP')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "application/pdf"
        }
    )
