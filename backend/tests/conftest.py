"""
TerraMind AI — Pytest Fixtures (conftest.py)
=============================================
Shared test infrastructure for all pytest suites.

Fixtures:
  db              — Isolated SQLite test session, tables created/dropped per test
  client          — FastAPI TestClient wired to the test DB
  auth_headers    — Registers a fresh test user and returns Bearer auth headers
  admin_headers   — Like auth_headers but promotes the user to admin role
  make_calculation — Closure that submits a carbon calculation for the auth user
"""

import os
os.environ["DATABASE_URL"] = "sqlite:///./test_terramind_ai.db"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import Base, get_db

# ── Database setup ────────────────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_terramind_ai.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Default test user credentials ─────────────────────────────────────────────
TEST_USER_EMAIL = "testuser@terramind.ai"
TEST_USER_PASSWORD = "SecurePass123"

ADMIN_USER_EMAIL = "admin@terramind.ai"
ADMIN_USER_PASSWORD = "AdminPass456"


@pytest.fixture(scope="function")
def db():
    """
    Create a fresh database session for each test function.
    Tables are created before the test and dropped afterwards to ensure isolation.
    """
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """
    FastAPI TestClient backed by the isolated test database session.
    Dependency override ensures the app uses the test DB instead of the real one.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers(client):
    """
    Register a fresh user and return their Authorization headers.
    Useful as a dependency for tests that require an authenticated request.
    """
    # Sign up
    response = client.post(
        "/api/auth/signup",
        json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD},
    )
    assert response.status_code == 201, f"Signup failed: {response.json()}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def admin_headers(client):
    """
    Register a fresh user (first user is auto-promoted to admin) and return
    their admin-level Authorization headers.
    """
    response = client.post(
        "/api/auth/signup",
        json={"email": ADMIN_USER_EMAIL, "password": ADMIN_USER_PASSWORD},
    )
    assert response.status_code == 201, f"Admin signup failed: {response.json()}"
    assert response.json()["role"] == "admin", "First user must be admin"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def make_calculation(client, auth_headers):
    """
    Factory fixture — returns a callable that submits a full carbon calculation.
    Callers can customise specific fields by passing keyword overrides.

    Usage:
        result = make_calculation(car_km=500)
    """
    def _make(
        car_km: float = 100.0,
        electricity_kwh: float = 100.0,
        diet_type: str = "mixed",
        clothing_spend: float = 50.0,
        electronics_spend: float = 20.0,
        household_spend: float = 10.0,
        disposal_kg: float = 5.0,
        recycling_kg: float = 5.0,
        water_liters: float = 500.0,
    ):
        payload = {
            "transport": {"car_km": car_km, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 0.0},
            "energy": {"electricity_kwh": electricity_kwh, "lpg_kg": 0.0, "renewable_kwh": 0.0},
            "food": {"diet_type": diet_type},
            "shopping": {"clothing_spend": clothing_spend, "electronics_spend": electronics_spend, "household_spend": household_spend},
            "waste": {"disposal_kg": disposal_kg, "recycling_kg": recycling_kg},
            "water_liters": water_liters,
        }
        response = client.post("/api/calculator/calculate", json=payload, headers=auth_headers)
        assert response.status_code == 200, f"Calculation failed: {response.json()}"
        return response.json()

    return _make
