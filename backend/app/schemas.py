"""
TerraMind AI — Pydantic Request/Response Schemas
=================================================
All schemas use Pydantic v2 semantics (model_dump, field_validator, etc.).
Field validators enforce:
  - Email normalisation (lowercase, strip whitespace)
  - Password complexity requirements (length, character classes)
  - HTML stripping on free-text fields
  - Numeric range clamping on emissions inputs

Schemas are grouped by domain:
  Auth | CarbonFootprint | Coach | Agents | Marketplace | SmartCity | Reports | Admin
"""

import re
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Shared ────────────────────────────────────────────────────────────────────
class PaginationParams(BaseModel):
    """Reusable pagination query parameters."""
    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=20, ge=1, le=100, description="Maximum records to return (1–100)")


# ── Auth Schemas ──────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    """Schema for new user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters required")

    @field_validator("email", mode="before")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        """Normalise email to lowercase and strip surrounding whitespace."""
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        """
        Enforce password complexity:
          - At least 8 characters
          - At least one digit
          - At least one letter
        """
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserLogin(BaseModel):
    """Schema for user login credentials."""
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class Token(BaseModel):
    """JWT token response returned after successful authentication."""
    access_token: str
    token_type: str = "bearer"
    role: str


class UserProfileUpdate(BaseModel):
    """Partial update schema for user profile fields."""
    full_name: Optional[str] = Field(default=None, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("full_name", mode="before")
    @classmethod
    def strip_full_name(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v


class UserProfileResponse(BaseModel):
    """Full user profile response model."""
    id: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    current_level: str
    xp: int
    streak: int
    last_active: datetime
    role: str

    class Config:
        from_attributes = True


# ── Carbon Footprint Schemas ──────────────────────────────────────────────────
class TransportInput(BaseModel):
    """Monthly transport activity inputs (distances in km)."""
    car_km: float = Field(default=0.0, ge=0.0, le=100_000.0)
    bike_km: float = Field(default=0.0, ge=0.0, le=100_000.0)
    public_transport_km: float = Field(default=0.0, ge=0.0, le=100_000.0)
    flight_km: float = Field(default=0.0, ge=0.0, le=100_000.0)


class EnergyInput(BaseModel):
    """Monthly energy consumption inputs."""
    electricity_kwh: float = Field(default=0.0, ge=0.0, le=100_000.0)
    lpg_kg: float = Field(default=0.0, ge=0.0, le=10_000.0)
    renewable_kwh: float = Field(default=0.0, ge=0.0, le=100_000.0)


class FoodInput(BaseModel):
    """Dietary preference for food emission calculation."""
    diet_type: str = Field(
        default="mixed",
        pattern=r"^(vegan|vegetarian|mixed|meat_heavy)$",
        description="One of: vegan, vegetarian, mixed, meat_heavy",
    )


class ShoppingInput(BaseModel):
    """Monthly shopping expenditure inputs (USD)."""
    clothing_spend: float = Field(default=0.0, ge=0.0, le=1_000_000.0)
    electronics_spend: float = Field(default=0.0, ge=0.0, le=1_000_000.0)
    household_spend: float = Field(default=0.0, ge=0.0, le=1_000_000.0)


class WasteInput(BaseModel):
    """Monthly waste generation inputs (kg)."""
    disposal_kg: float = Field(default=0.0, ge=0.0, le=10_000.0)
    recycling_kg: float = Field(default=0.0, ge=0.0, le=10_000.0)


class CarbonLogInput(BaseModel):
    """Complete monthly carbon footprint log submission."""
    transport: TransportInput
    energy: EnergyInput
    food: FoodInput
    shopping: ShoppingInput
    waste: WasteInput
    water_liters: float = Field(default=0.0, ge=0.0, le=1_000_000.0)


class CarbonCalculationResponse(BaseModel):
    """Full carbon footprint calculation result."""
    id: str
    timestamp: datetime
    transport_emissions: float
    energy_emissions: float
    food_emissions: float
    shopping_emissions: float
    waste_emissions: float
    water_emissions: float
    total_co2: float
    monthly_carbon_footprint: float
    annual_carbon_footprint: float
    sustainability_score: float
    environmental_impact_rating: str

    class Config:
        from_attributes = True


# ── AI Sustainability Coach Schemas ───────────────────────────────────────────
_HTML_TAG_RE = re.compile(r"<[^>]+>")


class ChatPrompt(BaseModel):
    """User message to the AI sustainability coach."""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = Field(default="default", max_length=100)

    @field_validator("message", mode="before")
    @classmethod
    def sanitise_message(cls, v: str) -> str:
        """Strip HTML tags from coach messages to prevent XSS storage."""
        return _HTML_TAG_RE.sub("", v).strip()


class ChatResponse(BaseModel):
    """Coach reply with timestamp."""
    reply: str
    session_id: str
    timestamp: datetime


# ── AI Agents Collaboration Schemas ───────────────────────────────────────────
class AgentTaskRequest(BaseModel):
    """Task dispatch request to the multi-agent system."""
    task_description: str = Field(..., min_length=5, max_length=1000)
    context: Optional[Dict[str, Any]] = None

    @field_validator("task_description", mode="before")
    @classmethod
    def sanitise_task(cls, v: str) -> str:
        return _HTML_TAG_RE.sub("", v).strip()


class AgentTaskResponse(BaseModel):
    """Multi-agent collaboration result."""
    task_id: str
    status: str
    agent_outputs: List[Dict[str, str]]
    final_recommendation: str


# ── Carbon Offset Marketplace Schemas ─────────────────────────────────────────
class OffsetProjectResponse(BaseModel):
    """Carbon offset project listing."""
    id: int
    title: str
    description: Optional[str]
    category: str
    price_per_ton: float
    co2_reduction: float
    image_url: Optional[str]

    class Config:
        from_attributes = True


class OffsetContributionRequest(BaseModel):
    """User contribution to a carbon offset project."""
    project_id: int = Field(..., ge=1)
    amount: float = Field(..., gt=0.0, le=100_000.0, description="Amount in USD")


class OffsetContributionResponse(BaseModel):
    """Contribution confirmation with offset and XP earned."""
    id: int
    project_id: int
    amount: float
    co2_offset: float
    earned_xp: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Smart City & Climate Map Schemas ──────────────────────────────────────────
class CityStatResponse(BaseModel):
    """City-level sustainability statistics."""
    city_name: str
    air_quality_index: int
    pollution_level: float
    renewable_energy_usage: float
    sustainability_ranking: Optional[int]

    class Config:
        from_attributes = True


class CountryStatResponse(BaseModel):
    """Country-level climate statistics for the global map."""
    country_code: str
    country_name: str
    emissions_tons: float
    climate_risk_score: float
    sustainability_rank: Optional[int]

    class Config:
        from_attributes = True


# ── Reports Schemas ───────────────────────────────────────────────────────────
class ReportResponse(BaseModel):
    """Sustainability report metadata."""
    id: int
    title: str
    report_type: str
    file_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Admin Schemas ─────────────────────────────────────────────────────────────
class AdminDashboardStats(BaseModel):
    """Admin dashboard aggregate statistics."""
    total_users: int
    total_calculations: int
    active_agents: int
    total_offsets_purchased: float
    average_sustainability_score: float
    system_latency: str
    system_status: str
