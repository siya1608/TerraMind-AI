from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db
from app.db.models import User, CarbonCalculation, CarbonPrediction
from app.security import get_current_user
from app.services.ml_engine import generate_predictions_for_user

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.get("/forecast")
def get_user_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch historical logs
    historical_calcs = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id
    ).order_by(CarbonCalculation.timestamp.asc()).all()
    
    # Run ML Model to forecast
    preds = generate_predictions_for_user(current_user.id, historical_calcs)
    
    # Flush existing calculations in DB to insert fresh predictions
    db.query(CarbonPrediction).filter(CarbonPrediction.user_id == current_user.id).delete()
    
    # Save predictions
    db_preds = []
    for p in preds:
        db_p = CarbonPrediction(
            user_id=current_user.id,
            target_date=p["target_date"],
            predicted_emissions=p["predicted_emissions"],
            predicted_sustainability_score=p["predicted_sustainability_score"],
            predicted_annual_impact=p["predicted_annual_impact"]
        )
        db.add(db_p)
        db_preds.append(db_p)
        
    db.commit()
    
    # Return formatted prediction response list
    result = []
    for p in db_preds:
        result.append({
            "target_date": p.target_date.strftime("%Y-%m-%d"),
            "predicted_emissions": p.predicted_emissions,
            "predicted_sustainability_score": p.predicted_sustainability_score,
            "predicted_annual_impact": p.predicted_annual_impact
        })
        
    return result
