# TerraMind AI — API Documentation

This document describes the REST API endpoints provided by the TerraMind AI FastAPI backend.

- **Base URL (Local)**: `http://localhost:8000/api`
- **Response Format**: `application/json`

---

## 1. Authentication (`/auth`)

### POST `/auth/signup`
Creates a new user profile.
- **Auth Required**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "jwt_token_here",
    "token_type": "bearer",
    "role": "user"
  }
  ```

### POST `/auth/login`
Authenticates existing credentials.
- **Auth Required**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK)**: Same as signup.

### GET `/auth/profile`
Retrieves current user details.
- **Auth Required**: Bearer Token
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-string",
    "email": "user@example.com",
    "full_name": "Eco Advocate",
    "avatar_url": null,
    "current_level": "Eco Novice",
    "xp": 120,
    "streak": 3,
    "last_active": "2026-06-21T18:00:00Z",
    "role": "user"
  }
  ```

---

## 2. Carbon Calculator (`/calculator`)

### POST `/calculator/calculate`
Submits carbon log data and returns carbon footprints and sustainability ratings.
- **Auth Required**: Bearer Token
- **Request Body**:
  ```json
  {
    "transport": {
      "car_km": 120.0,
      "bike_km": 15.0,
      "public_transport_km": 50.0,
      "flight_km": 0.0
    },
    "energy": {
      "electricity_kwh": 180.0,
      "lpg_kg": 12.0,
      "renewable_kwh": 50.0
    },
    "food": {
      "diet_type": "mixed"
    },
    "shopping": {
      "clothing_spend": 50.0,
      "electronics_spend": 0.0,
      "household_spend": 80.0
    },
    "waste": {
      "disposal_kg": 15.0,
      "recycling_kg": 10.0
    },
    "water_liters": 250.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-string",
    "timestamp": "2026-06-21T19:00:00Z",
    "transport_emissions": 25.5,
    "energy_emissions": 85.2,
    "food_emissions": 45.0,
    "shopping_emissions": 20.0,
    "waste_emissions": 12.0,
    "water_emissions": 2.5,
    "total_co2": 0.1902,
    "monthly_carbon_footprint": 190.2,
    "annual_carbon_footprint": 2282.4,
    "sustainability_score": 75.0,
    "environmental_impact_rating": "moderate"
  }
  ```

### GET `/calculator/history`
Returns paginated history of carbon logs for the user.
- **Auth Required**: Bearer Token
- **Query Parameters**:
  - `skip` (int, default: 0)
  - `limit` (int, default: 20)
- **Response (200 OK)**: List of calculation result objects.

---

## 3. Gamification (`/gamification`)

### GET `/gamification/leaderboard`
Fetches global user leaderboard.
- **Auth Required**: None (Optional token for personalization)
- **Query Parameters**:
  - `period` (string: "weekly", "monthly", "all_time", default: "all_time")
  - `skip` (int, default: 0)
  - `limit` (int, default: 20)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid-user-1",
      "full_name": "Jane Green",
      "avatar_url": "https://avatar.url/1",
      "xp": 5400,
      "rank": 1
    }
  ]
  ```

### GET `/gamification/challenges`
Lists eco challenges and user completion state.
- **Auth Required**: Bearer Token
- **Response (200 OK)**: List of challenge objects.

---

## 4. Offset Marketplace (`/marketplace`)

### GET `/marketplace/projects`
Lists available offset conservation projects.
- **Auth Required**: Bearer Token
- **Response (200 OK)**: Array of projects.

### POST `/marketplace/contribute`
Contribute funds to purchase offsets, earning XP.
- **Auth Required**: Bearer Token
- **Request Body**:
  ```json
  {
    "project_id": 1,
    "amount": 25.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 12,
    "project_id": 1,
    "amount": 25.0,
    "co2_offset": 1.25,
    "earned_xp": 125,
    "created_at": "2026-06-21T19:10:00Z"
  }
  ```

---

## 5. Smart City Stats (`/smart-city`)

### GET `/smart-city/statistics`
Fetches cached city-level environmental metrics.
- **Auth Required**: None (uses TTL Cache)
- **Response (200 OK)**: Array of cities and their AQI/pollution indices.
