from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import User, EcoBadge, UserBadge, EcoChallenge, Leaderboard, UserProfile
from app.security import get_current_user, get_current_user_optional

router = APIRouter(prefix="/gamification", tags=["gamification"])

DEFAULT_BADGES = [
    {"name": "Eco Starter",       "icon": "eco",             "description": "Logged your first carbon footprint.",            "xp_required": 0},
    {"name": "Earth Saver",       "icon": "park",            "description": "Achieved a sustainability score of 85%+.",        "xp_required": 200},
    {"name": "Climate Warrior",   "icon": "shield",          "description": "Reached Climate Warrior level.",                  "xp_required": 500},
    {"name": "Green Champion",    "icon": "emoji_events",    "description": "Reached Sustainability Champion level.",          "xp_required": 1200},
    {"name": "Earth Guardian",    "icon": "public",          "description": "Reached the highest Earth Guardian level.",       "xp_required": 2500},
    {"name": "Streak Master",     "icon": "local_fire_department", "description": "Maintained a 7-day consecutive streak.",   "xp_required": 350},
    {"name": "Zero Waster",       "icon": "recycling",       "description": "Recycled more than you disposed in a month.",     "xp_required": 150},
    {"name": "Carbon Cutter",     "icon": "content_cut",     "description": "Reduced monthly footprint by 20%.",              "xp_required": 400},
    {"name": "Solar Champion",    "icon": "wb_sunny",        "description": "Used renewable energy for 50+ kWh.",             "xp_required": 300},
    {"name": "Offset Hero",       "icon": "volunteer_activism","description":"Contributed to 3+ offset projects.",             "xp_required": 250},
]

DEFAULT_CHALLENGES = [
    {"title": "Car-Free Week",          "description": "Avoid using a personal car for 7 consecutive days.",         "xp_reward": 200, "duration_days": 7,  "difficulty": "Medium"},
    {"title": "Vegan Monday",           "description": "Eat plant-based every Monday this month.",                   "xp_reward": 100, "duration_days": 30, "difficulty": "Easy"},
    {"title": "Zero-Waste Day",         "description": "Generate zero landfill waste for a full day.",               "xp_reward": 150, "duration_days": 1,  "difficulty": "Hard"},
    {"title": "Cold Shower Challenge",  "description": "Take only cold showers for 5 days to cut heating energy.",  "xp_reward": 120, "duration_days": 5,  "difficulty": "Medium"},
    {"title": "Lights Out Hour",        "description": "Participate in Earth Hour — power off all devices for 1hr.", "xp_reward": 80,  "duration_days": 1,  "difficulty": "Easy"},
    {"title": "Plant a Tree",           "description": "Plant or sponsor a tree through the Marketplace.",           "xp_reward": 300, "duration_days": 14, "difficulty": "Medium"},
    {"title": "Public Transit Sprint",  "description": "Use only public transport for an entire week.",              "xp_reward": 175, "duration_days": 7,  "difficulty": "Medium"},
]

def seed_gamification(db: Session):
    if db.query(EcoBadge).count() == 0:
        for b in DEFAULT_BADGES:
            db.add(EcoBadge(**b))
    if db.query(EcoChallenge).count() == 0:
        for c in DEFAULT_CHALLENGES:
            db.add(EcoChallenge(**c))
    db.commit()

@router.get("/badges")
def get_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seed_gamification(db)
    all_badges = db.query(EcoBadge).all()
    earned_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()}
    return [
        {
            "id": b.id, "name": b.name, "description": b.description,
            "icon": b.icon, "xp_required": b.xp_required,
            "earned": b.id in earned_ids
        }
        for b in all_badges
    ]

@router.get("/challenges")
def get_challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seed_gamification(db)
    return db.query(EcoChallenge).all()

@router.get("/leaderboard")
def get_leaderboard(period: str = "monthly", db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    entries = (
        db.query(Leaderboard, UserProfile)
        .join(UserProfile, UserProfile.id == Leaderboard.user_id)
        .filter(Leaderboard.period == period)
        .order_by(Leaderboard.xp.desc())
        .limit(50)
        .all()
    )
    result = []
    for rank, (lb, profile) in enumerate(entries, 1):
        result.append({
            "rank": rank,
            "id": str(lb.user_id),
            "user_id": str(lb.user_id),
            "full_name": profile.full_name or "Anonymous Explorer",
            "name": profile.full_name or "Anonymous Explorer",
            "avatar_url": profile.avatar_url,
            "xp": lb.xp,
            "level": profile.current_level,
            "is_current_user": current_user is not None and lb.user_id == current_user.id
        })
    return result

@router.get("/profile-stats")
def get_profile_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seed_gamification(db)
    profile = current_user.profile
    earned_count = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).count()
    total_badges = db.query(EcoBadge).count()
    lb = db.query(Leaderboard).filter(Leaderboard.user_id == current_user.id, Leaderboard.period == "monthly").first()

    LEVEL_ORDER = ["Eco Explorer", "Green Innovator", "Climate Warrior", "Sustainability Champion", "Earth Guardian"]
    LEVEL_XP_THRESHOLDS = [0, 100, 500, 1200, 2500]
    level_index = LEVEL_ORDER.index(profile.current_level) if profile and profile.current_level in LEVEL_ORDER else 0
    next_threshold = LEVEL_XP_THRESHOLDS[level_index + 1] if level_index < len(LEVEL_XP_THRESHOLDS) - 1 else None
    xp_to_next = (next_threshold - profile.xp) if next_threshold and profile else None

    return {
        "level": profile.current_level if profile else "Eco Explorer",
        "xp": profile.xp if profile else 0,
        "streak": profile.streak if profile else 0,
        "badges_earned": earned_count,
        "total_badges": total_badges,
        "leaderboard_rank": lb.rank if lb else None,
        "xp_to_next_level": xp_to_next,
        "next_level": LEVEL_ORDER[level_index + 1] if level_index < len(LEVEL_ORDER) - 1 else "Max Level"
    }
