from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import User, CarbonCalculation, UserOffsetContribution, Leaderboard
from app.security import get_current_admin
from app.schemas import AdminDashboardStats

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard-stats", response_model=AdminDashboardStats, summary="Admin platform statistics")
def admin_dashboard(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_calcs = db.query(CarbonCalculation).count()

    avg_score_row = db.query(func.avg(CarbonCalculation.sustainability_score)).scalar()
    avg_score = round(float(avg_score_row), 2) if avg_score_row else 0.0

    total_offsets = db.query(func.sum(UserOffsetContribution.co2_offset)).scalar()
    total_offsets = round(float(total_offsets), 3) if total_offsets else 0.0

    return AdminDashboardStats(
        total_users=total_users,
        total_calculations=total_calcs,
        active_agents=8,
        total_offsets_purchased=total_offsets,
        average_sustainability_score=avg_score,
        system_latency="12ms",
        system_status="Online"
    )

@router.get("/users")
def list_all_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id, "email": u.email, "role": u.role,
            "created_at": u.created_at,
            "level": u.profile.current_level if u.profile else "N/A",
            "xp": u.profile.xp if u.profile else 0
        }
        for u in users
    ]

@router.put("/users/{user_id}/role")
def update_user_role(user_id: str, payload: dict, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_role = payload.get("role")
    if new_role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    return {"message": f"User {user.email} role updated to {new_role}"}

@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
