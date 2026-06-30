from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import CityStatistic
from app.schemas import CityStatResponse
from app.db.models import User
from app.services.cache import ttl_cache

router = APIRouter(prefix="/smart-city", tags=["smart-city"])

# Rich mock dataset for cities
MOCK_CITIES = [
    {"city_name": "Copenhagen",    "air_quality_index": 18,  "pollution_level": 4.1,  "renewable_energy_usage": 84.0, "sustainability_ranking": 1},
    {"city_name": "Singapore",     "air_quality_index": 42,  "pollution_level": 9.8,  "renewable_energy_usage": 31.0, "sustainability_ranking": 2},
    {"city_name": "Amsterdam",     "air_quality_index": 22,  "pollution_level": 5.2,  "renewable_energy_usage": 76.0, "sustainability_ranking": 3},
    {"city_name": "Stockholm",     "air_quality_index": 15,  "pollution_level": 3.7,  "renewable_energy_usage": 88.0, "sustainability_ranking": 4},
    {"city_name": "Tokyo",         "air_quality_index": 55,  "pollution_level": 12.4, "renewable_energy_usage": 22.0, "sustainability_ranking": 5},
    {"city_name": "San Francisco", "air_quality_index": 38,  "pollution_level": 8.6,  "renewable_energy_usage": 62.0, "sustainability_ranking": 6},
    {"city_name": "Berlin",        "air_quality_index": 28,  "pollution_level": 6.3,  "renewable_energy_usage": 55.0, "sustainability_ranking": 7},
    {"city_name": "Mumbai",        "air_quality_index": 142, "pollution_level": 58.2, "renewable_energy_usage": 12.0, "sustainability_ranking": 25},
    {"city_name": "Delhi",         "air_quality_index": 198, "pollution_level": 96.1, "renewable_energy_usage": 8.0,  "sustainability_ranking": 45},
    {"city_name": "Beijing",       "air_quality_index": 165, "pollution_level": 72.3, "renewable_energy_usage": 14.0, "sustainability_ranking": 38},
    {"city_name": "New York",      "air_quality_index": 48,  "pollution_level": 10.1, "renewable_energy_usage": 32.0, "sustainability_ranking": 12},
    {"city_name": "Zurich",        "air_quality_index": 12,  "pollution_level": 2.9,  "renewable_energy_usage": 90.0, "sustainability_ranking": 1},
]

def seed_cities(db: Session):
    """Seed cities into the database if not already present."""
    if db.query(CityStatistic).count() == 0:
        for city_data in MOCK_CITIES:
            city = CityStatistic(**city_data)
            db.add(city)
        db.commit()

@router.get("/statistics", response_model=List[CityStatResponse], summary="Global smart city sustainability statistics")
def get_city_statistics(db: Session = Depends(get_db)):
    """Returns sustainability metrics for tracked cities. Result is cached for 5 minutes."""
    seed_cities(db)
    return _fetch_city_statistics(db)


@ttl_cache(ttl_seconds=300, key_prefix="smart_city")
def _fetch_city_statistics(db) -> List:
    """Internal cached data-fetch, refreshed at most every 5 minutes."""
    cities = db.query(CityStatistic).order_by(CityStatistic.sustainability_ranking).all()
    return [CityStatResponse.model_validate(c).model_dump() for c in cities]

@router.get("/aqi-levels")
def get_aqi_levels(db: Session = Depends(get_db)):
    """Returns AQI classification summary across cities."""
    seed_cities(db)
    cities = db.query(CityStatistic).all()
    return [
        {
            "city": c.city_name,
            "aqi": c.air_quality_index,
            "category": (
                "Good" if c.air_quality_index <= 50 else
                "Moderate" if c.air_quality_index <= 100 else
                "Unhealthy" if c.air_quality_index <= 150 else
                "Very Unhealthy" if c.air_quality_index <= 200 else "Hazardous"
            )
        }
        for c in sorted(cities, key=lambda x: x.air_quality_index)
    ]
