"""
TerraMind AI — Application Configuration
=========================================
Centralised settings management via pydantic-settings.
All secrets MUST be provided via environment variables in production.

Environment variable precedence:
    1. System environment variables  (highest priority)
    2. .env file in backend/
    3. Default values              (only safe for development)
"""

import os
from typing import List
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Required in production:
        JWT_SECRET      — Must be set to a cryptographically strong random value.
        DATABASE_URL    — PostgreSQL DSN or leave unset for SQLite (dev only).
    """

    PROJECT_NAME: str = "TerraMind AI Backend"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")  # 'development' | 'production'

    # ── Database ──────────────────────────────────────────────────────────────
    # Falls back to local SQLite for zero-config local development.
    # Set DATABASE_URL to a PostgreSQL DSN for production.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./terramind_ai.db"
    )

    # ── Security ──────────────────────────────────────────────────────────────
    # IMPORTANT: Override JWT_SECRET with a strong random value in production.
    # Generate one with: python -c "import secrets; print(secrets.token_hex(32))"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-only-secret-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins. In production, set this to your
    # actual frontend domain (e.g., "https://terramind.ai").
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
        ).split(",") if origin.strip()
    ]

    # ── API Integrations ──────────────────────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    @model_validator(mode="after")
    def warn_insecure_defaults(self) -> "Settings":
        """
        Warn operators when insecure defaults are used.
        In 'production' environment, enforce that JWT_SECRET is explicitly set.
        """
        insecure_default = "dev-only-secret-change-in-production-2026"
        if self.ENVIRONMENT == "production" and self.JWT_SECRET == insecure_default:
            raise ValueError(
                "JWT_SECRET must be explicitly set to a strong secret in production. "
                "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        return self

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
