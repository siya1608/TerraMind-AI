"""
TerraMind AI — Carbon Calculator Routes
========================================
Handles carbon footprint submission, calculation, and history retrieval.

Endpoints:
  POST /api/calculator/calculate — Submit inputs, compute footprint, award XP + badges
  GET  /api/calculator/history   — Paginated history of past calculations

Business logic is delegated to app.services.calculations.calculate_footprint().
Gamification side-effects (XP, streaks, levels, badges, leaderboard) are applied
transactionally within the calculate endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.db.session import get_db
from app.db.models import (
    User, CarbonEntry, CarbonCalculation, SustainabilityScore,
    EcoBadge, UserBadge, Leaderboard,
)
from app.schemas import CarbonLogInput, CarbonCalculationResponse
from app.security import get_current_user
from app.services.calculations import calculate_footprint

router = APIRouter(prefix="/calculator", tags=["calculator"])


@router.post(
    "/calculate",
    response_model=CarbonCalculationResponse,
    summary="Submit and calculate monthly carbon footprint",
)
def calculate_and_save(
    log_input: CarbonLogInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accepts a full monthly carbon footprint submission, computes emissions
    across all categories, persists the result, and applies gamification
    side-effects (XP, streak, level-up, badge unlocks, leaderboard update).

    Returns the persisted CarbonCalculation record.
    """
    # ── 1. Perform emission calculations ──────────────────────────────────────
    input_dict = log_input.model_dump()
    results = calculate_footprint(input_dict)

    # ── 2. Persist raw carbon entry ───────────────────────────────────────────
    new_entry = CarbonEntry(
        user_id=current_user.id,
        category="all",  # aggregated multi-category entry
        details=input_dict,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    # ── 3. Persist calculation results ────────────────────────────────────────
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
        environmental_impact_rating=results["environmental_impact_rating"],
    )
    db.add(new_calc)

    # ── 4. Record sustainability score time-series ────────────────────────────
    score_entry = SustainabilityScore(
        user_id=current_user.id,
        score=results["sustainability_score"],
    )
    db.add(score_entry)
    db.commit()
    db.refresh(new_calc)

    # ── 5. XP & Streak calculation ────────────────────────────────────────────
    profile = current_user.profile
    xp_earned = 50  # base XP for any submission

    # Bonus XP when user reduces their carbon vs historical average
    previous_calcs = (
        db.query(CarbonCalculation)
        .filter(
            CarbonCalculation.user_id == current_user.id,
            CarbonCalculation.id != new_calc.id,
        )
        .all()
    )
    if previous_calcs:
        avg_prev_co2 = sum(c.total_co2 for c in previous_calcs) / len(previous_calcs)
        if new_calc.total_co2 < avg_prev_co2:
            xp_earned += 50  # carbon reduction reward

    profile.xp += xp_earned

    # Streak logic: increment if last calc was within 48 hours, reset otherwise
    last_calc = (
        db.query(CarbonCalculation)
        .filter(
            CarbonCalculation.user_id == current_user.id,
            CarbonCalculation.id != new_calc.id,
        )
        .order_by(CarbonCalculation.timestamp.desc())
        .first()
    )
    if last_calc:
        time_diff = datetime.utcnow() - last_calc.timestamp
        profile.streak = profile.streak + 1 if time_diff < timedelta(days=2) else 1
    else:
        profile.streak = 1

    # ── 6. Level progression ──────────────────────────────────────────────────
    # Levels: Eco Explorer (<100), Green Innovator (100-499), Climate Warrior (500-1199),
    #         Sustainability Champion (1200-2499), Earth Guardian (>=2500)
    xp = profile.xp
    if xp >= 2500:
        profile.current_level = "Earth Guardian"
    elif xp >= 1200:
        profile.current_level = "Sustainability Champion"
    elif xp >= 500:
        profile.current_level = "Climate Warrior"
    elif xp >= 100:
        profile.current_level = "Green Innovator"
    else:
        profile.current_level = "Eco Explorer"

    db.commit()

    # ── 7. Leaderboard sync ───────────────────────────────────────────────────
    leaderboard_entry = (
        db.query(Leaderboard)
        .filter(Leaderboard.user_id == current_user.id, Leaderboard.period == "monthly")
        .first()
    )
    if not leaderboard_entry:
        db.add(Leaderboard(user_id=current_user.id, xp=profile.xp, period="monthly"))
    else:
        leaderboard_entry.xp = profile.xp
    db.commit()

    # ── 8. Badge unlocks ──────────────────────────────────────────────────────
    _check_and_unlock_badges(db, current_user, profile, new_calc, results)

    return new_calc


def _check_and_unlock_badges(db, user, profile, calc, results) -> None:
    """
    Evaluate badge unlock conditions and award any newly earned badges.
    Handles XP bonus for each badge earned.

    Badge triggers:
      - Eco Starter:     first ever calculation
      - Earth Saver:     sustainability score >= 85
      - Climate Warrior: reached Climate Warrior level or higher
    """
    def _try_award(badge_name: str, bonus_xp: int) -> None:
        badge = db.query(EcoBadge).filter(EcoBadge.name == badge_name).first()
        if not badge:
            return
        already_has = db.query(UserBadge).filter(
            UserBadge.user_id == user.id,
            UserBadge.badge_id == badge.id,
        ).first()
        if not already_has:
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))
            profile.xp += bonus_xp

    _try_award("Eco Starter", 100)

    if results["sustainability_score"] >= 85:
        _try_award("Earth Saver", 150)

    if profile.current_level in ("Climate Warrior", "Sustainability Champion", "Earth Guardian"):
        _try_award("Climate Warrior", 200)

    db.commit()


@router.get(
    "/history",
    response_model=List[CarbonCalculationResponse],
    summary="Paginated list of past carbon calculations",
)
def get_calculations_history(
    skip: int = Query(default=0, ge=0, description="Records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max records (1–100)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user's carbon calculation history in descending
    timestamp order, with pagination via skip/limit query parameters.
    """
    calcs = (
        db.query(CarbonCalculation)
        .filter(CarbonCalculation.user_id == current_user.id)
        .order_by(CarbonCalculation.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return calcs
