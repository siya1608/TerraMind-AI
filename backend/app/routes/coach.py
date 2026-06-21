from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import User, ChatHistory, CarbonCalculation
from app.schemas import ChatPrompt, ChatResponse
from app.security import get_current_user
from app.services.ai_agents import AIAgentCoordinator

router = APIRouter(prefix="/coach", tags=["coach"])

@router.post("/chat", response_model=ChatResponse)
def coach_chat(
    prompt: ChatPrompt,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch user context
    last_calc = db.query(CarbonCalculation).filter(
        CarbonCalculation.user_id == current_user.id
    ).order_by(CarbonCalculation.timestamp.desc()).first()
    
    user_context = {
        "total_co2": last_calc.total_co2 if last_calc else 0.35,
        "sustainability_score": last_calc.sustainability_score if last_calc else 65.0,
        "current_level": current_user.profile.current_level if current_user.profile else "Eco Explorer"
    }
    
    # 2. Fetch recent chat history
    db_history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == prompt.session_id
    ).order_by(ChatHistory.created_at.asc()).all()
    
    chat_history = [{"sender": h.sender, "message": h.message} for h in db_history]
    
    # 3. Generate response from AI coordinator
    coordinator = AIAgentCoordinator()
    reply = coordinator.generate_coach_response(
        user_prompt=prompt.message,
        user_context=user_context,
        chat_history=chat_history
    )
    
    # 4. Save chat logs
    user_msg = ChatHistory(
        user_id=current_user.id,
        session_id=prompt.session_id,
        sender="user",
        message=prompt.message
    )
    assistant_msg = ChatHistory(
        user_id=current_user.id,
        session_id=prompt.session_id,
        sender="assistant",
        message=reply
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    
    return {
        "reply": reply,
        "session_id": prompt.session_id,
        "timestamp": datetime.utcnow()
    }

@router.get("/history")
def get_chat_history(
    session_id: str = "default",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at.asc()).all()
    return history
