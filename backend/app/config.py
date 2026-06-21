import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TerraMind AI Backend"
    API_V1_STR: str = "/api"
    
    # Database: dynamic fallback to SQLite for zero-config local testing if postgres isn't set up
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./terramind_ai.db"
    )
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-climate-os-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # API integrations
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        case_sensitive = True

settings = Settings()
