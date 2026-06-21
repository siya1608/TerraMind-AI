from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.db.session import get_db
from app.db.models import User, CarbonEntry, CarbonCalculation, SustainabilityScore, EcoBadge, UserBadge, Leaderboard
from app.schemas import CarbonLogInput, CarbonCalculationResponse
from app.security import get_current_user
from app.services.calculations import calculate_footprint

router = APIRouter(prefix="/calculator", tags=["calculator"])

@router.post("/calculate", response_model=CarbonCalculationResponse)
def calculate_and_save(
    log_input: CarbonLogInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Perform math logic
    input_dict = log_input.dict()
    results = calculate_footprint(input_dict)
    
    # 1. Save CarbonEntry (raw details)
    category = "all"  # aggregated entry
    new_entry = CarbonEntry(
        user_id=current_user.id,
        category=category,
        details=input_dict
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    # 2. Save CarbonCalculation results
    new_calc = CarbonCalculation(
        user_id=current_user.id,
        entry_id=new_entry.id,
        transport_emissions=results["transport_emissions"],
        energy_emissions=results["energy_emissions"],
        food_emissions=results["food_emissions"],
        shopping_emissions=results["shopping_emissions"],
        waste_emissions=results["waste_emissions"],
        water_emissions=results["water_emissions"],
        total_co2=results["total_co2"],
        monthly_carbon_footprint=results["monthly_carbon_footprint"],
        annual_carbon_footprint=results["annual_carbon_footprint"],
        sustainability_score=results["sustainability_score"],
        environmental_impact_rating=results["environmental_impact_rating"]
    )
    db.add(new_calc)
    
    # 3. Add to Sustainability Scores log
    score_entry = SustainabilityScore(
        user_id=current_user.id,
        score=results["sustainability_score"]
    )
    db.add(score_entry)
    db.commit()
    db.refresh(new_calc)
    
    # 4. Process XP / Streaks and levels in User Profile
    profile = current_user.profile
    xp_earned = 50  # Base XP for submitting calculations
    
    # Bonus XP if carbon is lower than previous average
    previous_calcs = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id,
        CarbonCalculation.id != new_calc.id
    ).all()
    
    if previous_calcs:
        avg_prev_co2 = sum(c.total_co2 for c in previous_calcs) / len(previous_calcs)
        if new_calc.total_co2 < avg_prev_co2:
            xp_earned += 50  # Reduction reward!
            
    profile.xp += xp_earned
    
    # Check streak update
    last_calc = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id,
        CarbonCalculation.id != new_calc.id
    ).order_by(CarbonCalculation.timestamp.desc()).first()
    
    if last_calc:
        time_diff = datetime.utcnow() - last_calc.timestamp
        if time_diff < timedelta(days=2):
            profile.streak += 1
        elif time_diff > timedelta(days=2):
            profile.streak = 1  # reset streak
    else:
        profile.streak = 1
        
    # Update Gamification Levels based on accumulated XP
    # Levels: Eco Explorer (<100 XP), Green Innovator (100-499 XP), Climate Warrior (500-1199 XP), 
    # Sustainability Champion (1200-2499 XP), Earth Guardian (>=2500 XP)
    if profile.xp >= 2500:
        profile.current_level = "Earth Guardian"
    elif profile.xp >= 1200:
        profile.current_level = "Sustainability Champion"
    elif profile.xp >= 500:
        profile.current_level = "Climate Warrior"
    elif profile.xp >= 100:
        profile.current_level = "Green Innovator"
    else:
        profile.current_level = "Eco Explorer"
        
    db.commit()
    
    # Update leaderboard table entry
    leaderboard_entry = db.query(Leaderboard).filter(
        Leaderboard.user_id == current_user.id,
        Leaderboard.period == "monthly"
    ).first()
    if not leaderboard_entry:
        leaderboard_entry = Leaderboard(
            user_id=current_user.id,
            xp=profile.xp,
            period="monthly"
        )
        db.add(leaderboard_entry)
    else:
        leaderboard_entry.xp = profile.xp
    db.commit()
    
    # 5. Check and unlock achievements (badges)
    # Ensure some standard badges exist in database first (we will seed them later)
    # Badge triggers:
    badges_unlocked = []
    
    # 5a. First calculator entry: "Eco Starter" badge (badge_id 1)
    starter_badge = db.query(EcoBadge).filter(EcoBadge.name == "Eco Starter").first()
    if starter_badge:
        # Check if already unlocked
        already_has = db.query(UserBadge).filter(
            UserBadge.user_id == current_user.id,
            UserBadge.badge_id == starter_badge.id
        ).first()
        if not already_has:
            new_ub = UserBadge(user_id=current_user.id, badge_id=starter_badge.id)
            db.add(new_ub)
            profile.xp += 100  # bonus XP
            badges_unlocked.append("Eco Starter")
            
    # 5b. Sustainability score >= 85: "Earth Saver" badge
    if results["sustainability_score"] >= 85:
        saver_badge = db.query(EcoBadge).filter(EcoBadge.name == "Earth Saver").first()
        if saver_badge:
            already_has = db.query(UserBadge).filter(
                UserBadge.user_id == current_user.id,
                UserBadge.badge_id == saver_badge.id
            ).first()
            if not already_has:
                new_ub = UserBadge(user_id=current_user.id, badge_id=saver_badge.id)
                db.add(new_ub)
                profile.xp += 150
                badges_unlocked.append("Earth Saver")
                
    # 5c. Level reached: Climate Warrior
    if profile.current_level in ["Climate Warrior", "Sustainability Champion", "Earth Guardian"]:
        warrior_badge = db.query(EcoBadge).filter(EcoBadge.name == "Climate Warrior").first()
        if warrior_badge:
            already_has = db.query(UserBadge).filter(
                UserBadge.user_id == current_user.id,
                UserBadge.badge_id == warrior_badge.id
            ).first()
            if not already_has:
                new_ub = UserBadge(user_id=current_user.id, badge_id=warrior_badge.id)
                db.add(new_ub)
                profile.xp += 200
                badges_unlocked.append("Climate Warrior")
                
    db.commit()
    
    return new_calc

@router.get("/history", response_model=List[CarbonCalculationResponse])
def get_calculations_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    calcs = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id
    ).order_by(CarbonCalculation.timestamp.desc()).all()
    return calcs
