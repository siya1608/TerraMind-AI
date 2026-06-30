from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import User, CarbonOffsetProject, UserOffsetContribution, Leaderboard
from app.schemas import OffsetProjectResponse, OffsetContributionRequest, OffsetContributionResponse
from app.security import get_current_user

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

DEFAULT_PROJECTS = [
    {
        "title": "Amazon Reforestation Initiative",
        "description": "Plant native tree species across degraded Amazon basin land. Each unit sponsors 5 trees, absorbing CO2 over 25 years.",
        "category": "Reforestation",
        "price_per_ton": 12.0,
        "co2_reduction": 1.0,
        "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800"
    },
    {
        "title": "Solar Grid Expansion — Rajasthan, India",
        "description": "Funds the installation of new photovoltaic panels in desert regions, displacing coal energy generation.",
        "category": "Solar Energy",
        "price_per_ton": 18.0,
        "co2_reduction": 1.5,
        "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800"
    },
    {
        "title": "North Sea Wind Farm Expansion",
        "description": "Offshore turbine expansion in the North Sea. Each contribution displaces 1.8 tons of grid CO2 annually.",
        "category": "Wind Energy",
        "price_per_ton": 20.0,
        "co2_reduction": 1.8,
        "image_url": "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800"
    },
    {
        "title": "Ocean Plastic Interception Network",
        "description": "Funds automated ocean-surface skimmer deployments collecting plastic before it reaches critical reef ecosystems.",
        "category": "Ocean Cleanup",
        "price_per_ton": 25.0,
        "co2_reduction": 0.8,
        "image_url": "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800"
    },
    {
        "title": "Mangrove Coastal Restoration — Indonesia",
        "description": "Restores mangrove belts that act as blue carbon sinks, sequestering 5x more CO2 per hectare than terrestrial forests.",
        "category": "Reforestation",
        "price_per_ton": 15.0,
        "co2_reduction": 2.0,
        "image_url": "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800"
    },
    {
        "title": "Biochar Soil Enrichment Program",
        "description": "Converts agricultural waste into biochar, locking carbon in soil for hundreds of years while improving crop yields.",
        "category": "Carbon Sequestration",
        "price_per_ton": 22.0,
        "co2_reduction": 1.2,
        "image_url": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800"
    },
]

def seed_projects(db: Session):
    if db.query(CarbonOffsetProject).count() == 0:
        for p in DEFAULT_PROJECTS:
            db.add(CarbonOffsetProject(**p))
        db.commit()

@router.get("/projects", response_model=List[OffsetProjectResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    seed_projects(db)
    return db.query(CarbonOffsetProject).all()

@router.post("/contribute")
def make_contribution(
    contrib_in: OffsetContributionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_projects(db)
    project = db.query(CarbonOffsetProject).filter(CarbonOffsetProject.id == contrib_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Offset project not found")

    co2_offset = contrib_in.amount / project.price_per_ton * project.co2_reduction

    contribution = UserOffsetContribution(
        user_id=current_user.id,
        project_id=project.id,
        amount=contrib_in.amount,
        co2_offset=co2_offset
    )
    db.add(contribution)

    # Award XP for contributing
    xp_earned = int(contrib_in.amount * 5)  # 5 XP per dollar contributed
    if current_user.profile:
        current_user.profile.xp += xp_earned

    # Update leaderboard
    lb = db.query(Leaderboard).filter(
        Leaderboard.user_id == current_user.id, Leaderboard.period == "monthly"
    ).first()
    if lb:
        lb.xp = current_user.profile.xp if current_user.profile else lb.xp

    db.commit()
    db.refresh(contribution)

    return {
        "id": contribution.id,
        "project_id": project.id,
        "project_title": project.title,
        "amount": contribution.amount,
        "co2_offset": round(co2_offset, 3),
        "earned_xp": xp_earned,
        "created_at": contribution.created_at
    }

@router.get("/my-contributions")
def my_contributions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    contribs = (
        db.query(UserOffsetContribution, CarbonOffsetProject)
        .join(CarbonOffsetProject, CarbonOffsetProject.id == UserOffsetContribution.project_id)
        .filter(UserOffsetContribution.user_id == current_user.id)
        .order_by(UserOffsetContribution.created_at.desc())
        .all()
    )
    return [
        {
            "id": c.id, "project_title": p.title, "category": p.category,
            "amount": c.amount, "co2_offset": c.co2_offset, "created_at": c.created_at
        }
        for c, p in contribs
    ]
