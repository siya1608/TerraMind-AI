"""
TerraMind AI — FastAPI Application Entry Point
===============================================
Bootstraps the FastAPI application with:
  - CORS middleware (restricted to configured origins)
  - Security headers middleware (OWASP recommendations)
  - Rate limiting (slowapi, 60 req/min per IP)
  - Request latency monitoring
  - Graceful error handling with environment-aware detail masking
  - All domain routers mounted under /api prefix
  - Full database seeding on startup (demo user, projects, cities, stats)
"""

import sys
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
import logging

from app.config import settings
from app.db.session import engine, Base, SessionLocal
from app.middleware.security_headers import SecurityHeadersMiddleware

# Import all models so SQLAlchemy registers them before create_all
from app.db import models  # noqa: F401
from app.db.models import (
    User, UserProfile, Leaderboard,
    CarbonOffsetProject, EcoBadge, EcoChallenge,
    CityStatistic, GlobalStatistic,
)
from app.security import hash_password

from app.routes import auth, calculator, coach, agents, predictions
from app.routes import smart_city, climate_map, gamification, marketplace, reports, admin

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("terramind_ai")

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


# ── Seed Data ─────────────────────────────────────────────────────────────────

DEFAULT_PROJECTS = [
    {"title": "Amazon Reforestation Initiative", "description": "Plant native tree species across degraded Amazon basin land. Each unit sponsors 5 trees, absorbing CO2 over 25 years.", "category": "Reforestation", "price_per_ton": 12.0, "co2_reduction": 1.0, "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800"},
    {"title": "Solar Grid Expansion — Rajasthan, India", "description": "Funds the installation of new photovoltaic panels in desert regions, displacing coal energy generation.", "category": "Solar Energy", "price_per_ton": 18.0, "co2_reduction": 1.5, "image_url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800"},
    {"title": "North Sea Wind Farm Expansion", "description": "Offshore turbine expansion in the North Sea. Each contribution displaces 1.8 tons of grid CO2 annually.", "category": "Wind Energy", "price_per_ton": 20.0, "co2_reduction": 1.8, "image_url": "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800"},
    {"title": "Ocean Plastic Interception Network", "description": "Funds automated ocean-surface skimmer deployments collecting plastic before it reaches critical reef ecosystems.", "category": "Ocean Cleanup", "price_per_ton": 25.0, "co2_reduction": 0.8, "image_url": "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800"},
    {"title": "Mangrove Coastal Restoration — Indonesia", "description": "Restores mangrove belts that act as blue carbon sinks, sequestering 5x more CO2 per hectare than terrestrial forests.", "category": "Reforestation", "price_per_ton": 15.0, "co2_reduction": 2.0, "image_url": "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800"},
    {"title": "Biochar Soil Enrichment Program", "description": "Converts agricultural waste into biochar, locking carbon in soil for hundreds of years while improving crop yields.", "category": "Carbon Sequestration", "price_per_ton": 22.0, "co2_reduction": 1.2, "image_url": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800"},
]

DEFAULT_BADGES = [
    {"name": "Eco Starter",    "icon": "eco",                   "description": "Logged your first carbon footprint.",           "xp_required": 0},
    {"name": "Earth Saver",    "icon": "park",                  "description": "Achieved a sustainability score of 85%+.",       "xp_required": 200},
    {"name": "Climate Warrior","icon": "shield",                "description": "Reached Climate Warrior level.",                 "xp_required": 500},
    {"name": "Green Champion", "icon": "emoji_events",          "description": "Reached Sustainability Champion level.",         "xp_required": 1200},
    {"name": "Earth Guardian", "icon": "public",                "description": "Reached the highest Earth Guardian level.",      "xp_required": 2500},
    {"name": "Streak Master",  "icon": "local_fire_department", "description": "Maintained a 7-day consecutive streak.",        "xp_required": 350},
    {"name": "Zero Waster",    "icon": "recycling",             "description": "Recycled more than you disposed in a month.",    "xp_required": 150},
    {"name": "Carbon Cutter",  "icon": "content_cut",           "description": "Reduced monthly footprint by 20%.",             "xp_required": 400},
    {"name": "Solar Champion", "icon": "wb_sunny",              "description": "Used renewable energy for 50+ kWh.",            "xp_required": 300},
    {"name": "Offset Hero",    "icon": "volunteer_activism",    "description": "Contributed to 3+ offset projects.",            "xp_required": 250},
]

DEFAULT_CHALLENGES = [
    {"title": "Car-Free Week",         "description": "Avoid using a personal car for 7 consecutive days.",         "xp_reward": 200, "duration_days": 7,  "difficulty": "Medium"},
    {"title": "Vegan Monday",          "description": "Eat plant-based every Monday this month.",                   "xp_reward": 100, "duration_days": 30, "difficulty": "Easy"},
    {"title": "Zero-Waste Day",        "description": "Generate zero landfill waste for a full day.",               "xp_reward": 150, "duration_days": 1,  "difficulty": "Hard"},
    {"title": "Cold Shower Challenge", "description": "Take only cold showers for 5 days to cut heating energy.",  "xp_reward": 120, "duration_days": 5,  "difficulty": "Medium"},
    {"title": "Lights Out Hour",       "description": "Participate in Earth Hour — power off all devices for 1hr.", "xp_reward": 80,  "duration_days": 1,  "difficulty": "Easy"},
    {"title": "Plant a Tree",          "description": "Plant or sponsor a tree through the Marketplace.",           "xp_reward": 300, "duration_days": 14, "difficulty": "Medium"},
    {"title": "Public Transit Sprint", "description": "Use only public transport for an entire week.",              "xp_reward": 175, "duration_days": 7,  "difficulty": "Medium"},
]

DEFAULT_CITIES = [
    {"city_name": "Copenhagen",    "air_quality_index": 18, "pollution_level": 4.1,  "renewable_energy_usage": 84.0, "sustainability_ranking": 1},
    {"city_name": "Singapore",     "air_quality_index": 42, "pollution_level": 9.8,  "renewable_energy_usage": 31.0, "sustainability_ranking": 2},
    {"city_name": "Amsterdam",     "air_quality_index": 22, "pollution_level": 5.2,  "renewable_energy_usage": 76.0, "sustainability_ranking": 3},
    {"city_name": "Stockholm",     "air_quality_index": 15, "pollution_level": 3.7,  "renewable_energy_usage": 88.0, "sustainability_ranking": 4},
    {"city_name": "Tokyo",         "air_quality_index": 55, "pollution_level": 12.4, "renewable_energy_usage": 22.0, "sustainability_ranking": 5},
    {"city_name": "San Francisco", "air_quality_index": 38, "pollution_level": 8.6,  "renewable_energy_usage": 62.0, "sustainability_ranking": 6},
    {"city_name": "Berlin",        "air_quality_index": 28, "pollution_level": 6.3,  "renewable_energy_usage": 52.0, "sustainability_ranking": 7},
    {"city_name": "Oslo",          "air_quality_index": 12, "pollution_level": 3.1,  "renewable_energy_usage": 92.0, "sustainability_ranking": 8},
    {"city_name": "Zurich",        "air_quality_index": 20, "pollution_level": 4.8,  "renewable_energy_usage": 71.0, "sustainability_ranking": 9},
    {"city_name": "Vancouver",     "air_quality_index": 25, "pollution_level": 5.9,  "renewable_energy_usage": 68.0, "sustainability_ranking": 10},
]

DEFAULT_GLOBAL_STATS = [
    {"country_code": "SWE", "country_name": "Sweden",         "emissions_tons": 3.83,  "climate_risk_score": 12.0, "sustainability_rank": 1},
    {"country_code": "NOR", "country_name": "Norway",         "emissions_tons": 6.64,  "climate_risk_score": 14.0, "sustainability_rank": 2},
    {"country_code": "DNK", "country_name": "Denmark",        "emissions_tons": 5.26,  "climate_risk_score": 15.0, "sustainability_rank": 3},
    {"country_code": "NLD", "country_name": "Netherlands",    "emissions_tons": 8.04,  "climate_risk_score": 25.0, "sustainability_rank": 4},
    {"country_code": "GBR", "country_name": "United Kingdom", "emissions_tons": 5.38,  "climate_risk_score": 30.0, "sustainability_rank": 5},
    {"country_code": "DEU", "country_name": "Germany",        "emissions_tons": 9.44,  "climate_risk_score": 28.0, "sustainability_rank": 6},
    {"country_code": "FRA", "country_name": "France",         "emissions_tons": 5.84,  "climate_risk_score": 22.0, "sustainability_rank": 7},
    {"country_code": "CAN", "country_name": "Canada",         "emissions_tons": 15.22, "climate_risk_score": 40.0, "sustainability_rank": 8},
    {"country_code": "USA", "country_name": "United States",  "emissions_tons": 15.52, "climate_risk_score": 45.0, "sustainability_rank": 9},
    {"country_code": "CHN", "country_name": "China",          "emissions_tons": 7.38,  "climate_risk_score": 55.0, "sustainability_rank": 10},
    {"country_code": "IND", "country_name": "India",          "emissions_tons": 1.91,  "climate_risk_score": 62.0, "sustainability_rank": 11},
    {"country_code": "BRA", "country_name": "Brazil",         "emissions_tons": 2.17,  "climate_risk_score": 48.0, "sustainability_rank": 12},
    {"country_code": "AUS", "country_name": "Australia",      "emissions_tons": 14.77, "climate_risk_score": 42.0, "sustainability_rank": 13},
    {"country_code": "JPN", "country_name": "Japan",          "emissions_tons": 8.73,  "climate_risk_score": 38.0, "sustainability_rank": 14},
    {"country_code": "KOR", "country_name": "South Korea",    "emissions_tons": 11.85, "climate_risk_score": 35.0, "sustainability_rank": 15},
]


def seed_database(db):
    """Seed all static reference data and demo user on first startup."""

    # 1. Marketplace Projects
    if db.query(CarbonOffsetProject).count() == 0:
        for p in DEFAULT_PROJECTS:
            db.add(CarbonOffsetProject(**p))
        logger.info("✅ Seeded 6 carbon offset marketplace projects.")

    # 2. Eco Badges
    if db.query(EcoBadge).count() == 0:
        for b in DEFAULT_BADGES:
            db.add(EcoBadge(**b))
        logger.info("✅ Seeded 10 eco badges.")

    # 3. Eco Challenges
    if db.query(EcoChallenge).count() == 0:
        for c in DEFAULT_CHALLENGES:
            db.add(EcoChallenge(**c))
        logger.info("✅ Seeded 7 eco challenges.")

    # 4. City Statistics
    if db.query(CityStatistic).count() == 0:
        for c in DEFAULT_CITIES:
            db.add(CityStatistic(**c))
        logger.info("✅ Seeded 10 city statistics.")

    # 5. Global Statistics
    if db.query(GlobalStatistic).count() == 0:
        for g in DEFAULT_GLOBAL_STATS:
            db.add(GlobalStatistic(**g))
        logger.info("✅ Seeded 15 global country statistics.")

    db.commit()

    # 6. Demo User — always ensure demo@terramind.ai exists
    demo_email = "demo@terramind.ai"
    demo_user = db.query(User).filter(User.email == demo_email).first()
    if not demo_user:
        demo_user = User(
            email=demo_email,
            password_hash=hash_password("demo1234"),
            role="user"
        )
        db.add(demo_user)
        db.flush()  # get the ID before commit

        demo_profile = UserProfile(
            id=demo_user.id,
            full_name="Demo User",
            avatar_url="https://lh3.googleusercontent.com/aida-public/AB6AXuB7g-RhrkZEKPYDJppythYM4MCto2-IVmhUK3U1m5_xsKSCgMtAsQsq5ImEWCRXZAdEpVFtNwnJsPfOZCxU-KG0zcSCwdw3aOo8X7G49Ycw7ioeGm35f-cK6jkmnJ0A9MA5zA8zjmWmm9r1pN2bmGwj8V1qPKYYtbOdXV1jjGgcy7qhZmherHAIpDiQqWDmiJzWwygaSHhGjFeqS3QeCaCfaftKr1IbfsekukbYfB8zsr7nZowiCIlG",
            current_level="Green Innovator",
            xp=350,
            streak=5,
        )
        db.add(demo_profile)

        # Add to leaderboard
        demo_lb = Leaderboard(user_id=demo_user.id, xp=350, period="monthly")
        db.add(demo_lb)
        db.commit()
        logger.info("✅ Demo user created: demo@terramind.ai / demo1234")

    # 7. Ensure every existing user has a leaderboard entry
    all_users = db.query(User).all()
    for u in all_users:
        existing_lb = db.query(Leaderboard).filter(
            Leaderboard.user_id == u.id,
            Leaderboard.period == "monthly"
        ).first()
        if not existing_lb:
            xp_val = u.profile.xp if u.profile else 0
            lb = Leaderboard(user_id=u.id, xp=xp_val, period="monthly")
            db.add(lb)
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise database tables and seed data on startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if we are running under pytest or targeting a test database to skip seeding
        is_testing = "pytest" in sys.modules or "test_" in settings.DATABASE_URL or "test" in os.environ.get("DATABASE_URL", "")
        if not is_testing:
            seed_database(db)
        else:
            logger.info("Skipping database seeding during test execution.")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
    finally:
        db.close()
    logger.info("✅ TerraMind AI Backend started — all systems online.")
    yield
    logger.info("TerraMind AI Backend shutting down.")


# ── Application Factory ───────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI-Powered Climate Intelligence Platform — Backend REST API.\n\n"
        "Authenticate via `/api/auth/login` and include the returned Bearer token "
        "in the `Authorization` header for protected endpoints.\n\n"
        "**Demo credentials**: `demo@terramind.ai` / `demo1234`"
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── State (needed by slowapi) ─────────────────────────────────────────────────
app.state.limiter = limiter

# ── Exception Handlers ────────────────────────────────────────────────────────
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all handler. In production, masks internal details to avoid
    leaking stack traces or implementation specifics to clients.
    """
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    detail = str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred."
    return JSONResponse(status_code=500, content={"detail": detail})


# ── Middleware Stack ───────────────────────────────────────────────────────────
# 1. Rate limiting
app.add_middleware(SlowAPIMiddleware)

# 2. CORS — restricted to configured origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# 3. Security headers (OWASP)
app.add_middleware(SecurityHeadersMiddleware)


# 4. Request timing — adds X-Process-Time-Ms to every response
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
API = settings.API_V1_STR
app.include_router(auth.router,         prefix=API)
app.include_router(calculator.router,   prefix=API)
app.include_router(coach.router,        prefix=API)
app.include_router(agents.router,       prefix=API)
app.include_router(predictions.router,  prefix=API)
app.include_router(smart_city.router,   prefix=API)
app.include_router(climate_map.router,  prefix=API)
app.include_router(gamification.router, prefix=API)
app.include_router(marketplace.router,  prefix=API)
app.include_router(reports.router,      prefix=API)
app.include_router(admin.router,        prefix=API)


# ── Health Endpoints ──────────────────────────────────────────────────────────
@app.get("/", tags=["health"], summary="Root health check")
def health_check():
    """Returns basic service status. Used by load balancers and uptime monitors."""
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "demo": "demo@terramind.ai / demo1234",
    }


@app.get("/api/health", tags=["health"], summary="API health check")
def api_health():
    """Returns API subsystem health with current timestamp."""
    return {"status": "healthy", "timestamp": time.time()}
