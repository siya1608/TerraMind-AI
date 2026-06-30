import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.db.session import get_db
from app.db.models import User, CarbonCalculation, AIRecommendation
from app.schemas import AgentTaskRequest, AgentTaskResponse
from app.security import get_current_user
from app.services.ai_agents import AIAgentCoordinator

router = APIRouter(prefix="/agents", tags=["agents"])

# The 8 agent status definitions (returned for the Multi-Agent Control Center page)
AGENT_DEFINITIONS = [
    {"name": "Carbon Analyst",        "icon": "query_stats",   "role": "Strategic Monitoring",  "color": "primary"},
    {"name": "Sustainability Advisor", "icon": "psychology",    "role": "Policy Generation",     "color": "secondary"},
    {"name": "Energy Optimization",   "icon": "bolt",          "role": "Grid Efficiency",        "color": "primary"},
    {"name": "Green Shopping",        "icon": "shopping_cart", "role": "Supply Chain AI",        "color": "primary"},
    {"name": "Smart Travel",          "icon": "flight",        "role": "Mobility Optimization",  "color": "secondary"},
    {"name": "Climate Research",      "icon": "science",       "role": "Data Processing",        "color": "primary"},
    {"name": "Predictive AI",         "icon": "timeline",      "role": "Risk Analysis",          "color": "primary"},
    {"name": "ESG Intelligence",      "icon": "verified_user", "role": "Compliance Scoring",     "color": "secondary"},
]

@router.get("/status")
def get_agent_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns live-ish status for each of the 8 agents for the control-center UI."""
    import random, math
    statuses = []
    for i, agent in enumerate(AGENT_DEFINITIONS):
        # Deterministic-ish progress derived from agent index + current second
        import time
        base = (time.time() + i * 37) % 100
        progress = round(40 + 55 * abs(math.sin(base * 0.1)), 1)
        state = "active" if i % 3 != 2 else "thinking"
        statuses.append({**agent, "progress": progress, "state": state})
    return {"agents": statuses}

@router.post("/dispatch", response_model=AgentTaskResponse)
@router.post("/collaborate", response_model=AgentTaskResponse)
def run_collaboration(
    task_in: AgentTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dispatches a multi-agent collaboration task and stores the recommendation."""
    last_calc = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id
    ).order_by(CarbonCalculation.timestamp.desc()).first()

    user_context = task_in.context or {}
    if last_calc:
        user_context.update({
            "total_co2": last_calc.total_co2,
            "sustainability_score": last_calc.sustainability_score,
            "current_level": current_user.profile.current_level if current_user.profile else "Eco Explorer"
        })

    coordinator = AIAgentCoordinator()
    result = coordinator.execute_collaboration(task_in.task_description, user_context)

    # Persist the final recommendation
    db_rec = AIRecommendation(
        user_id=current_user.id,
        agent_name="Multi-Agent System",
        recommendation_text=result["final_recommendation"],
        category="collaboration",
        impact_rating="High"
    )
    db.add(db_rec)
    db.commit()

    task_id = str(uuid.uuid4())[:8]
    return AgentTaskResponse(
        task_id=task_id,
        status=result["status"],
        agent_outputs=result["agent_outputs"],
        final_recommendation=result["final_recommendation"]
    )

@router.get("/recommendations")
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = db.query(AIRecommendation).filter(
        AIRecommendation.user_id == current_user.id
    ).order_by(AIRecommendation.created_at.desc()).limit(20).all()
    return recs
