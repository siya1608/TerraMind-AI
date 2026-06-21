from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import GlobalStatistic, User
from app.schemas import CountryStatResponse
from app.security import get_current_user

router = APIRouter(prefix="/climate-map", tags=["climate-map"])

COUNTRY_DATASET = [
    {"country_code": "CHN", "country_name": "China",          "emissions_tons": 7.38, "climate_risk_score": 72.0, "sustainability_rank": 48},
    {"country_code": "USA", "country_name": "United States",  "emissions_tons": 14.24,"climate_risk_score": 55.0, "sustainability_rank": 22},
    {"country_code": "IND", "country_name": "India",          "emissions_tons": 1.91, "climate_risk_score": 78.0, "sustainability_rank": 55},
    {"country_code": "RUS", "country_name": "Russia",         "emissions_tons": 11.44,"climate_risk_score": 60.0, "sustainability_rank": 40},
    {"country_code": "JPN", "country_name": "Japan",          "emissions_tons": 8.73, "climate_risk_score": 42.0, "sustainability_rank": 18},
    {"country_code": "DEU", "country_name": "Germany",        "emissions_tons": 7.72, "climate_risk_score": 35.0, "sustainability_rank": 8},
    {"country_code": "GBR", "country_name": "United Kingdom", "emissions_tons": 5.38, "climate_risk_score": 30.0, "sustainability_rank": 5},
    {"country_code": "BRA", "country_name": "Brazil",         "emissions_tons": 2.14, "climate_risk_score": 65.0, "sustainability_rank": 35},
    {"country_code": "CAN", "country_name": "Canada",         "emissions_tons": 14.83,"climate_risk_score": 28.0, "sustainability_rank": 6},
    {"country_code": "AUS", "country_name": "Australia",      "emissions_tons": 14.77,"climate_risk_score": 58.0, "sustainability_rank": 30},
    {"country_code": "SWE", "country_name": "Sweden",         "emissions_tons": 3.83, "climate_risk_score": 12.0, "sustainability_rank": 1},
    {"country_code": "NOR", "country_name": "Norway",         "emissions_tons": 6.64, "climate_risk_score": 14.0, "sustainability_rank": 2},
    {"country_code": "DNK", "country_name": "Denmark",        "emissions_tons": 5.26, "climate_risk_score": 15.0, "sustainability_rank": 3},
    {"country_code": "FRA", "country_name": "France",         "emissions_tons": 4.56, "climate_risk_score": 27.0, "sustainability_rank": 7},
    {"country_code": "ZAF", "country_name": "South Africa",   "emissions_tons": 6.91, "climate_risk_score": 80.0, "sustainability_rank": 58},
    {"country_code": "MEX", "country_name": "Mexico",         "emissions_tons": 3.67, "climate_risk_score": 68.0, "sustainability_rank": 42},
    {"country_code": "IDN", "country_name": "Indonesia",      "emissions_tons": 1.84, "climate_risk_score": 82.0, "sustainability_rank": 60},
    {"country_code": "NLD", "country_name": "Netherlands",    "emissions_tons": 8.04, "climate_risk_score": 25.0, "sustainability_rank": 4},
]

def seed_countries(db: Session):
    if db.query(GlobalStatistic).count() == 0:
        for c in COUNTRY_DATASET:
            db.add(GlobalStatistic(**c))
        db.commit()

@router.get("/countries", response_model=List[CountryStatResponse])
def get_country_stats(db: Session = Depends(get_db)):
    seed_countries(db)
    return db.query(GlobalStatistic).order_by(GlobalStatistic.sustainability_rank).all()

@router.get("/risk-leaders")
def get_high_risk_countries(db: Session = Depends(get_db)):
    seed_countries(db)
    return db.query(GlobalStatistic).order_by(GlobalStatistic.climate_risk_score.desc()).limit(10).all()

@router.get("/sustainability-leaders")
def get_top_sustainable(db: Session = Depends(get_db)):
    seed_countries(db)
    return db.query(GlobalStatistic).order_by(GlobalStatistic.sustainability_rank).limit(10).all()
