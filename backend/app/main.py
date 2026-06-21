from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from app.config import settings
from app.db.session import engine, Base

# Import all models to register them with SQLAlchemy before create_all
from app.db import models  # noqa: F401

from app.routes import auth, calculator, coach, agents, predictions
from app.routes import smart_city, climate_map, gamification, marketplace, reports, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("✅ TerraMind AI Backend started. Database tables initialized.")
    yield
    print("TerraMind AI Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Climate Intelligence Platform — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS — allow Next.js frontend (adjust origins for production deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware for latency monitoring
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Mount all routers under /api prefix
API = settings.API_V1_STR
app.include_router(auth.router,        prefix=API)
app.include_router(calculator.router,  prefix=API)
app.include_router(coach.router,       prefix=API)
app.include_router(agents.router,      prefix=API)
app.include_router(predictions.router, prefix=API)
app.include_router(smart_city.router,  prefix=API)
app.include_router(climate_map.router, prefix=API)
app.include_router(gamification.router,prefix=API)
app.include_router(marketplace.router, prefix=API)
app.include_router(reports.router,     prefix=API)
app.include_router(admin.router,       prefix=API)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def api_health():
    return {"status": "healthy", "timestamp": time.time()}
