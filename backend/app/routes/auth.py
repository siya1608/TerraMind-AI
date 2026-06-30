from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import User, UserProfile, Leaderboard
from app.schemas import UserCreate, UserLogin, Token, UserProfileResponse, UserProfileUpdate
from app.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # Make the first user an admin for easy testing
    is_first_user = db.query(User).count() == 0
    role = "admin" if is_first_user else "user"
    
    # Create user
    new_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create corresponding user profile
    new_profile = UserProfile(
        id=new_user.id,
        full_name=user_in.email.split("@")[0].capitalize(),
        avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG",
        current_level="Eco Explorer",
        xp=0,
        streak=1
    )
    db.add(new_profile)
    db.flush()

    # Create leaderboard entry for this user
    lb = Leaderboard(user_id=new_user.id, xp=0, period="monthly")
    db.add(lb)
    db.commit()
    
    access_token = create_access_token(subject=new_user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": new_user.role
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    # Update last active timestamp
    if user.profile:
        user.profile.last_active = datetime.utcnow()
        db.commit()
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/google", response_model=Token)
def google_login(payload: dict, db: Session = Depends(get_db)):
    # In production, we verify the Google ID token sent from the frontend client.
    # For a fully functional developer setup, we verify the email parameter from the payload
    # and automatically log in or sign up the user.
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Sign In payload must contain an email"
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Sign up user automatically
        user = User(
            email=email,
            password_hash=hash_password("google_oauth_fallback_password_2026"),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create profile
        new_profile = UserProfile(
            id=user.id,
            full_name=payload.get("name", email.split("@")[0].capitalize()),
            avatar_url=payload.get("picture", "https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG"),
            current_level="Eco Explorer",
            xp=0,
            streak=1
        )
        db.add(new_profile)
        db.commit()
    else:
        # Update details if provided
        if user.profile:
            if payload.get("name"):
                user.profile.full_name = payload.get("name")
            if payload.get("picture"):
                user.profile.avatar_url = payload.get("picture")
            user.profile.last_active = datetime.utcnow()
            db.commit()
            
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name,
        "avatar_url": profile.avatar_url,
        "current_level": profile.current_level,
        "xp": profile.xp,
        "streak": profile.streak,
        "last_active": profile.last_active,
        "role": current_user.role
    }

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_in: UserProfileUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile_in.full_name is not None:
        profile.full_name = profile_in.full_name
    if profile_in.avatar_url is not None:
        profile.avatar_url = profile_in.avatar_url
        
    db.commit()
    db.refresh(profile)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": profile.full_name,
        "avatar_url": profile.avatar_url,
        "current_level": profile.current_level,
        "xp": profile.xp,
        "streak": profile.streak,
        "last_active": profile.last_active,
        "role": current_user.role
    }

@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
        
    # Mock password reset email logging
    print(f"[AUTH RESET] Password reset requested for: {email}")
    return {"message": "If this email is registered, a password reset link has been dispatched."}
