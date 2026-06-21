from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserProfileResponse(BaseModel):
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

# Carbon Footprint Schemas
class TransportInput(BaseModel):
    car_km: float = 0.0
    bike_km: float = 0.0
    public_transport_km: float = 0.0
    flight_km: float = 0.0

class EnergyInput(BaseModel):
    electricity_kwh: float = 0.0
    lpg_kg: float = 0.0
    renewable_kwh: float = 0.0

class FoodInput(BaseModel):
    diet_type: str = "mixed"  # 'vegan', 'vegetarian', 'mixed', 'meat_heavy'

class ShoppingInput(BaseModel):
    clothing_spend: float = 0.0
    electronics_spend: float = 0.0
    household_spend: float = 0.0

class WasteInput(BaseModel):
    disposal_kg: float = 0.0
    recycling_kg: float = 0.0

class CarbonLogInput(BaseModel):
    transport: TransportInput
    energy: EnergyInput
    food: FoodInput
    shopping: ShoppingInput
    waste: WasteInput
    water_liters: float = 0.0

class CarbonCalculationResponse(BaseModel):
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

# AI Sustainability Coach Schemas
class ChatPrompt(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    reply: str
    session_id: str
    timestamp: datetime

# AI Agents Collaboration Schemas
class AgentTaskRequest(BaseModel):
    task_description: str
    context: Optional[Dict[str, Any]] = None

class AgentTaskResponse(BaseModel):
    task_id: str
    status: str
    agent_outputs: List[Dict[str, str]]
    final_recommendation: str

# Carbon Offset Marketplace Schemas
class OffsetProjectResponse(BaseModel):
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
    project_id: int
    amount: float

class OffsetContributionResponse(BaseModel):
    id: int
    project_id: int
    amount: float
    co2_offset: float
    earned_xp: int
    created_at: datetime

    class Config:
        from_attributes = True

# Smart City & Climate Map Schemas
class CityStatResponse(BaseModel):
    city_name: str
    air_quality_index: int
    pollution_level: float
    renewable_energy_usage: float
    sustainability_ranking: Optional[int]

    class Config:
        from_attributes = True

class CountryStatResponse(BaseModel):
    country_code: str
    country_name: str
    emissions_tons: float
    climate_risk_score: float
    sustainability_rank: Optional[int]

    class Config:
        from_attributes = True

# Reports Schemas
class ReportResponse(BaseModel):
    id: int
    title: str
    report_type: str
    file_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas
class AdminDashboardStats(BaseModel):
    total_users: int
    total_calculations: int
    active_agents: int
    total_offsets_purchased: float
    average_sustainability_score: float
    system_latency: str
    system_status: str
