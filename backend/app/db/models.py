import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Date, JSON, Text, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    carbon_entries = relationship("CarbonEntry", back_populates="user", cascade="all, delete-orphan")
    calculations = relationship("CarbonCalculation", back_populates="user", cascade="all, delete-orphan")
    sustainability_scores = relationship("SustainabilityScore", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("CarbonPrediction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("EcoGoal", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    leaderboard = relationship("Leaderboard", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="user", cascade="all, delete-orphan")
    offset_contributions = relationship("UserOffsetContribution", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(255))
    avatar_url = Column(Text)
    current_level = Column(String(50), nullable=False, default="Eco Explorer")
    xp = Column(Integer, nullable=False, default=0)
    streak = Column(Integer, nullable=False, default=0)
    last_active = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")

class CarbonEntry(Base):
    __tablename__ = "carbon_entries"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    category = Column(String(50), nullable=False)  # 'transport', 'energy', 'food', 'shopping', 'waste', 'water'
    details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="carbon_entries")
    calculations = relationship("CarbonCalculation", back_populates="entry", cascade="all, delete-orphan")

class CarbonCalculation(Base):
    __tablename__ = "carbon_calculations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_id = Column(String(36), ForeignKey("carbon_entries.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    transport_emissions = Column(Float, nullable=False, default=0.0)
    energy_emissions = Column(Float, nullable=False, default=0.0)
    food_emissions = Column(Float, nullable=False, default=0.0)
    shopping_emissions = Column(Float, nullable=False, default=0.0)
    waste_emissions = Column(Float, nullable=False, default=0.0)
    water_emissions = Column(Float, nullable=False, default=0.0)
    
    total_co2 = Column(Float, nullable=False, default=0.0)
    monthly_carbon_footprint = Column(Float, nullable=False, default=0.0)
    annual_carbon_footprint = Column(Float, nullable=False, default=0.0)
    sustainability_score = Column(Float, nullable=False, default=0.0)
    environmental_impact_rating = Column(String(50), nullable=False, default="C")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="calculations")
    entry = relationship("CarbonEntry", back_populates="calculations")

class SustainabilityScore(Base):
    __tablename__ = "sustainability_scores"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="sustainability_scores")

class CarbonPrediction(Base):
    __tablename__ = "carbon_predictions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_date = Column(Date, nullable=False)
    predicted_emissions = Column(Float, nullable=False)
    predicted_sustainability_score = Column(Float, nullable=False)
    predicted_annual_impact = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="predictions")

class EcoGoal(Base):
    __tablename__ = "eco_goals"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="active")  # 'active', 'completed', 'failed'
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="goals")

class EcoChallenge(Base):
    __tablename__ = "eco_challenges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    xp_reward = Column(Integer, nullable=False, default=100)
    duration_days = Column(Integer, nullable=False, default=7)
    difficulty = Column(String(50), nullable=False, default="Medium")
    created_at = Column(DateTime, default=datetime.utcnow)

class EcoBadge(Base):
    __tablename__ = "eco_badges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    icon = Column(String(100), nullable=False)
    xp_required = Column(Integer, nullable=False, default=500)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_badges = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")

class UserBadge(Base):
    __tablename__ = "user_badges"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(Integer, ForeignKey("eco_badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('user_id', 'badge_id', name='uniq_user_badge'),)
    
    user = relationship("User", back_populates="badges")
    badge = relationship("EcoBadge", back_populates="user_badges")

class Leaderboard(Base):
    __tablename__ = "leaderboards"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    xp = Column(Integer, nullable=False, default=0)
    rank = Column(Integer)
    period = Column(String(50), nullable=False, default="monthly")  # 'weekly', 'monthly', 'all_time'
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('user_id', 'period', name='uniq_user_leaderboard'),)
    
    user = relationship("User", back_populates="leaderboard")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, default="default")
    sender = Column(String(50), nullable=False)  # 'user', 'assistant'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chat_history")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    recommendation_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    impact_rating = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")

class CarbonOffsetProject(Base):
    __tablename__ = "carbon_offset_projects"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)  # 'Reforestation', 'Solar Energy', 'Wind Energy', 'Ocean Cleanup'
    price_per_ton = Column(Float, nullable=False, default=15.0)
    co2_reduction = Column(Float, nullable=False, default=1.0)
    image_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    contributions = relationship("UserOffsetContribution", back_populates="project", cascade="all, delete-orphan")

class UserOffsetContribution(Base):
    __tablename__ = "user_offset_contributions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("carbon_offset_projects.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)  # money spent ($)
    co2_offset = Column(Float, nullable=False)  # tons offset
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="offset_contributions")
    project = relationship("CarbonOffsetProject", back_populates="contributions")

class CityStatistic(Base):
    __tablename__ = "city_statistics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    city_name = Column(String(100), unique=True, nullable=False)
    air_quality_index = Column(Integer, nullable=False, default=50)
    pollution_level = Column(Float, nullable=False, default=12.5)
    renewable_energy_usage = Column(Float, nullable=False, default=20.0)
    sustainability_ranking = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GlobalStatistic(Base):
    __tablename__ = "global_statistics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    country_code = Column(String(5), unique=True, nullable=False)
    country_name = Column(String(100), nullable=False)
    emissions_tons = Column(Float, nullable=False, default=0.0)
    climate_risk_score = Column(Float, nullable=False, default=50.0)
    sustainability_rank = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False)  # 'PDF', 'CSV'
    file_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="reports")
