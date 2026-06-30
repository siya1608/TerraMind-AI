"""
TerraMind AI — Core API Integration Tests
==========================================
Tests for the primary user journeys across Auth, Calculator, Smart City,
Admin, and security boundary scenarios.
"""

import pytest


# ── Health ────────────────────────────────────────────────────────────────────

def test_health_check(client):
    """Root health endpoint returns online status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data


def test_api_health(client):
    """API health endpoint returns healthy status with timestamp."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


# ── Auth: Registration & Login ────────────────────────────────────────────────

def test_signup_success(client):
    """New user can register and receives a JWT token."""
    response = client.post(
        "/api/auth/signup",
        json={"email": "newuser@example.com", "password": "ValidPass1"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] in ("user", "admin")


def test_signup_duplicate_email(client):
    """Registering with a duplicate email returns 400."""
    payload = {"email": "dup@example.com", "password": "ValidPass1"}
    client.post("/api/auth/signup", json=payload)
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_signup_weak_password(client):
    """Registration with a password missing digits fails validation."""
    response = client.post(
        "/api/auth/signup",
        json={"email": "weak@example.com", "password": "nouppernodigit"},
    )
    # Pydantic validation returns 422 Unprocessable Entity
    assert response.status_code == 422


def test_login_success(client):
    """Registered user can log in and receive a token."""
    client.post("/api/auth/signup", json={"email": "login@example.com", "password": "LoginPass1"})
    response = client.post("/api/auth/login", json={"email": "login@example.com", "password": "LoginPass1"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    """Login with wrong password returns 400."""
    client.post("/api/auth/signup", json={"email": "wrong@example.com", "password": "CorrectPass1"})
    response = client.post("/api/auth/login", json={"email": "wrong@example.com", "password": "WrongPass9"})
    assert response.status_code == 400


def test_login_unknown_email(client):
    """Login with unregistered email returns 400."""
    response = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "Pass1234"})
    assert response.status_code == 400


# ── Auth: Profile ─────────────────────────────────────────────────────────────

def test_get_profile_authenticated(client, auth_headers):
    """Authenticated user can retrieve their profile."""
    response = client.get("/api/auth/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "current_level" in data
    assert "xp" in data


def test_get_profile_unauthenticated(client):
    """Unauthenticated request to profile returns 403."""
    response = client.get("/api/auth/profile")
    assert response.status_code == 403


def test_get_profile_invalid_token(client):
    """Request with invalid token returns 403."""
    response = client.get("/api/auth/profile", headers={"Authorization": "Bearer invalid.token.here"})
    assert response.status_code == 401


def test_update_profile(client, auth_headers):
    """User can update their full_name via PUT /profile."""
    response = client.put(
        "/api/auth/profile",
        json={"full_name": "Updated Name"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"


# ── Calculator ────────────────────────────────────────────────────────────────

def test_full_calculator_workflow(client, auth_headers):
    """Full calculator workflow: submit → get history."""
    payload = {
        "transport": {"car_km": 100.0, "bike_km": 50.0, "public_transport_km": 10.0, "flight_km": 0.0},
        "energy": {"electricity_kwh": 100.0, "lpg_kg": 5.0, "renewable_kwh": 20.0},
        "food": {"diet_type": "vegan"},
        "shopping": {"clothing_spend": 50.0, "electronics_spend": 20.0, "household_spend": 10.0},
        "waste": {"disposal_kg": 5.0, "recycling_kg": 5.0},
        "water_liters": 500.0,
    }
    calc_response = client.post("/api/calculator/calculate", json=payload, headers=auth_headers)
    assert calc_response.status_code == 200
    calc = calc_response.json()
    assert "total_co2" in calc
    assert calc["total_co2"] > 0
    assert "sustainability_score" in calc
    assert "environmental_impact_rating" in calc

    history_response = client.get("/api/calculator/history", headers=auth_headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["id"] == calc["id"]


def test_history_pagination(client, auth_headers, make_calculation):
    """History pagination correctly limits and offsets results."""
    for _ in range(5):
        make_calculation()

    page1 = client.get("/api/calculator/history?skip=0&limit=3", headers=auth_headers).json()
    page2 = client.get("/api/calculator/history?skip=3&limit=3", headers=auth_headers).json()

    assert len(page1) == 3
    assert len(page2) == 2
    # Ensure no duplicates across pages
    ids_page1 = {r["id"] for r in page1}
    ids_page2 = {r["id"] for r in page2}
    assert ids_page1.isdisjoint(ids_page2)


def test_calculator_unauthenticated(client):
    """Calculator requires authentication."""
    response = client.post("/api/calculator/calculate", json={})
    assert response.status_code == 403


# ── Smart City (public) ───────────────────────────────────────────────────────

def test_smart_city_stats_public(client):
    """Smart city statistics are publicly accessible without auth."""
    response = client.get("/api/smart-city/statistics")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "city_name" in data[0]
    assert "air_quality_index" in data[0]


def test_smart_city_aqi_levels(client):
    """AQI levels endpoint returns categorised city air quality data."""
    response = client.get("/api/smart-city/aqi-levels")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "category" in data[0]


# ── Leaderboard (public) ──────────────────────────────────────────────────────

def test_leaderboard_public(client):
    """Leaderboard is publicly accessible."""
    response = client.get("/api/gamification/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_leaderboard_invalid_period(client):
    """Invalid period parameter returns 422 Unprocessable Entity."""
    response = client.get("/api/gamification/leaderboard?period=invalid_period")
    assert response.status_code == 422


# ── Admin ─────────────────────────────────────────────────────────────────────

def test_admin_stats_requires_admin(client, auth_headers):
    """Non-admin user receives 403 when accessing admin stats."""
    # auth_headers is for a non-admin user (second user)
    # First user becomes admin, register a second user
    client.post("/api/auth/signup", json={"email": "admin@example.com", "password": "AdminPass1"})
    response = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "AdminPass1"})
    token = response.json().get("access_token")
    # Attempt to access admin endpoint as a regular (second) user
    client.post("/api/auth/signup", json={"email": "regular@example.com", "password": "RegularPass1"})
    reg_login = client.post("/api/auth/login", json={"email": "regular@example.com", "password": "RegularPass1"})
    reg_token = reg_login.json().get("access_token")
    reg_headers = {"Authorization": f"Bearer {reg_token}"}
    response = client.get("/api/admin/dashboard-stats", headers=reg_headers)
    assert response.status_code == 403


def test_admin_stats_accessible_by_admin(client, admin_headers):
    """Admin user can access the admin dashboard stats."""
    response = client.get("/api/admin/dashboard-stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_users" in data
    assert "system_status" in data


def test_admin_list_users(client, admin_headers):
    """Admin can list all users."""
    response = client.get("/api/admin/users", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
