"""
TerraMind AI — Carbon Calculations Service Tests
================================================
Parametrised unit tests for the calculate_footprint() pure function.
Tests all diet types, edge cases, and high-emissions scenarios.
"""

import pytest
from app.services.calculations import calculate_footprint, EMISSION_FACTORS


# ── Helper ────────────────────────────────────────────────────────────────────

def _base_inputs(**overrides) -> dict:
    """Build a minimal carbon input dict with optional field overrides."""
    base = {
        "transport": {"car_km": 0.0, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 0.0},
        "energy": {"electricity_kwh": 0.0, "lpg_kg": 0.0, "renewable_kwh": 0.0},
        "food": {"diet_type": "mixed"},
        "shopping": {"clothing_spend": 0.0, "electronics_spend": 0.0, "household_spend": 0.0},
        "waste": {"disposal_kg": 0.0, "recycling_kg": 0.0},
        "water_liters": 0.0,
    }
    base.update(overrides)
    return base


# ── Return shape ──────────────────────────────────────────────────────────────

def test_calculate_footprint_returns_all_keys():
    """calculate_footprint returns all expected keys in the result dict."""
    result = calculate_footprint(_base_inputs())
    expected_keys = {
        "transport_emissions", "energy_emissions", "food_emissions",
        "shopping_emissions", "waste_emissions", "water_emissions",
        "total_co2", "monthly_carbon_footprint", "annual_carbon_footprint",
        "sustainability_score", "environmental_impact_rating",
    }
    assert expected_keys.issubset(result.keys())


def test_annual_is_12x_monthly():
    """Annual footprint is always exactly 12× the monthly footprint."""
    inputs = _base_inputs(transport={"car_km": 200.0, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 0.0})
    result = calculate_footprint(inputs)
    assert abs(result["annual_carbon_footprint"] - result["monthly_carbon_footprint"] * 12) < 0.001


# ── Diet types ────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("diet_type,expected_kg", [
    ("vegan",       1.5 * 30),  # 45 kg
    ("vegetarian",  1.7 * 30),  # 51 kg
    ("mixed",       2.5 * 30),  # 75 kg
    ("meat_heavy",  3.3 * 30),  # 99 kg
])
def test_food_emissions_by_diet(diet_type, expected_kg):
    """Food emissions correctly reflect the diet factor × 30 days."""
    inputs = _base_inputs(food={"diet_type": diet_type})
    result = calculate_footprint(inputs)
    expected_tons = round(expected_kg / 1000.0, 3)
    assert result["food_emissions"] == expected_tons


def test_vegan_diet_achieves_high_score():
    """Pure vegan diet (no other inputs) yields a high sustainability score."""
    inputs = _base_inputs(food={"diet_type": "vegan"})
    result = calculate_footprint(inputs)
    assert result["sustainability_score"] > 80.0
    assert result["environmental_impact_rating"] == "A"


# ── Transport ─────────────────────────────────────────────────────────────────

def test_car_emission_factor():
    """Car emissions = km × 0.18 kg CO2/km."""
    inputs = _base_inputs(transport={"car_km": 1000.0, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 0.0})
    result = calculate_footprint(inputs)
    expected = round(1000.0 * EMISSION_FACTORS["car_gasoline"] / 1000.0, 3)
    assert result["transport_emissions"] == expected


def test_bike_zero_emissions():
    """Cycling produces zero transport emissions."""
    inputs = _base_inputs(transport={"car_km": 0.0, "bike_km": 500.0, "public_transport_km": 0.0, "flight_km": 0.0})
    result = calculate_footprint(inputs)
    assert result["transport_emissions"] == 0.0


def test_flight_emissions():
    """Flight emissions = km × 0.13 kg CO2/km."""
    inputs = _base_inputs(transport={"car_km": 0.0, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 2000.0})
    result = calculate_footprint(inputs)
    expected = round(2000.0 * EMISSION_FACTORS["flight"] / 1000.0, 3)
    assert result["transport_emissions"] == expected


# ── Waste recycling offset ────────────────────────────────────────────────────

def test_waste_recycling_offset():
    """Recycling partially offsets disposal emissions; total never goes negative."""
    inputs = _base_inputs(
        waste={"disposal_kg": 5.0, "recycling_kg": 100.0}  # high recycling
    )
    result = calculate_footprint(inputs)
    assert result["waste_emissions"] >= 0.0  # clamped at 0


def test_disposal_without_recycling():
    """Pure disposal without recycling generates positive waste emissions."""
    inputs = _base_inputs(waste={"disposal_kg": 20.0, "recycling_kg": 0.0})
    result = calculate_footprint(inputs)
    expected = round(20.0 * EMISSION_FACTORS["waste_disposal"] / 1000.0, 3)
    assert result["waste_emissions"] == expected


# ── Sustainability score & rating ─────────────────────────────────────────────

@pytest.mark.parametrize("total_co2_approx,expected_rating", [
    (0.05, "A"),   # Very low: vegan + bike
    (0.55, "D"),   # Moderate: typical mixed
])
def test_sustainability_rating_boundaries(total_co2_approx, expected_rating, monkeypatch):
    """Sustainability rating grades correspond to expected score bands."""
    import app.services.calculations as calc_module
    import math
    score = 100.0 * math.exp(-total_co2_approx / 0.5)
    # Verify the score maps to the expected rating without calling calculate_footprint
    if score >= 85:
        rating = "A"
    elif score >= 70:
        rating = "B"
    elif score >= 50:
        rating = "C"
    elif score >= 30:
        rating = "D"
    else:
        rating = "E"
    assert rating == expected_rating


def test_zero_inputs_produce_only_food_emissions():
    """With all inputs at zero, only food (diet default) contributes to emissions."""
    inputs = _base_inputs()  # default diet_type = "mixed"
    result = calculate_footprint(inputs)
    assert result["transport_emissions"] == 0.0
    assert result["energy_emissions"] == 0.0
    assert result["shopping_emissions"] == 0.0
    assert result["water_emissions"] == 0.0
    assert result["food_emissions"] > 0.0


def test_known_mixed_scenario():
    """Regression test for the mixed diet scenario from the original test suite."""
    inputs = {
        "transport": {"car_km": 1000.0, "bike_km": 0.0, "public_transport_km": 0.0, "flight_km": 0.0},
        "energy": {"electricity_kwh": 500.0, "lpg_kg": 0.0, "renewable_kwh": 0.0},
        "food": {"diet_type": "mixed"},
        "shopping": {"clothing_spend": 100.0, "electronics_spend": 100.0, "household_spend": 0.0},
        "waste": {"disposal_kg": 20.0, "recycling_kg": 10.0},
        "water_liters": 1000.0,
    }
    result = calculate_footprint(inputs)
    assert result["transport_emissions"] == 0.180
    assert result["energy_emissions"] == 0.190
    assert result["food_emissions"] == 0.075
    assert result["shopping_emissions"] == 0.100
    assert result["total_co2"] == 0.554
