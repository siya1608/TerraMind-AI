def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_api_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_workflow(client):
    # 1. Sign up user
    signup_data = {
        "email": "testuser@example.com",
        "password": "strongpassword123",
        "full_name": "Test User"
    }
    response = client.post("/api/auth/signup", json=signup_data)
    assert response.status_code == 201
    assert "access_token" in response.json()
    
    # Try signing up with duplicate email
    response_dup = client.post("/api/auth/signup", json=signup_data)
    assert response_dup.status_code == 400
    assert "already exists" in response_dup.json()["detail"].lower()

    # 2. Login user
    login_data = {
        "email": "testuser@example.com",
        "password": "strongpassword123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token_info = response.json()
    assert "access_token" in token_info
    assert token_info["token_type"] == "bearer"
    
    headers = {"Authorization": f"Bearer {token_info['access_token']}"}

    # 3. Get profile
    profile_response = client.get("/api/auth/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["full_name"] == "Testuser"
    
    # 4. Post calculation
    calc_data = {
        "transport": {
            "car_km": 100.0,
            "bike_km": 50.0,
            "public_transport_km": 10.0,
            "flight_km": 0.0
        },
        "energy": {
            "electricity_kwh": 100.0,
            "lpg_kg": 5.0,
            "renewable_kwh": 20.0
        },
        "food": {
            "diet_type": "vegan"
        },
        "shopping": {
            "clothing_spend": 50.0,
            "electronics_spend": 20.0,
            "household_spend": 10.0
        },
        "waste": {
            "disposal_kg": 5.0,
            "recycling_kg": 5.0
        },
        "water_liters": 500.0
    }
    calc_response = client.post("/api/calculator/calculate", json=calc_data, headers=headers)
    assert calc_response.status_code == 200
    calc_result = calc_response.json()
    assert "total_co2" in calc_result
    assert calc_result["total_co2"] > 0
    
    # 5. Get history
    history_response = client.get("/api/calculator/history", headers=headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["id"] == calc_result["id"]

def test_smart_city_stats_public(client):
    response = client.get("/api/smart-city/statistics")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    assert "city_name" in response.json()[0]

def test_leaderboard_public(client):
    response = client.get("/api/gamification/leaderboard")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
