from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import User, CarbonCalculation, CarbonPrediction, Report
from app.security import get_current_user
from app.services.pdf_gen import generate_pdf_report, generate_csv_report

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/download")
def download_report(
    format: str = "pdf",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates and streams a PDF or CSV sustainability report for the current user."""
    calculations = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id
    ).order_by(CarbonCalculation.timestamp.desc()).all()

    predictions = db.query(CarbonPrediction).filter(
        CarbonPrediction.user_id == current_user.id
    ).order_by(CarbonPrediction.target_date.asc()).all()

    user_name = (current_user.profile.full_name or current_user.email) if current_user.profile else current_user.email
    timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M")

    if format.lower() == "csv":
        csv_content = generate_csv_report(calculations, predictions)
        filename = f"terramind_ai_report_{timestamp_str}.csv"

        # Save report record
        report_rec = Report(user_id=current_user.id, title=f"Carbon Report {timestamp_str}", report_type="CSV")
        db.add(report_rec)
        db.commit()

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        pdf_bytes = generate_pdf_report(user_name, calculations, predictions)
        filename = f"terramind_ai_report_{timestamp_str}.pdf"

        report_rec = Report(user_id=current_user.id, title=f"Carbon Report {timestamp_str}", report_type="PDF")
        db.add(report_rec)
        db.commit()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

@router.get("/history")
def get_report_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
