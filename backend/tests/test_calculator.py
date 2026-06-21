from app.services.calculations import calculate_footprint

def test_calculate_footprint_vegan():
    inputs = {
        "transport": {
            "car_km": 0.0,
            "bike_km": 100.0,
            "public_transport_km": 0.0,
            "flight_km": 0.0
        },
        "energy": {
            "electricity_kwh": 0.0,
            "lpg_kg": 0.0,
            "renewable_kwh": 0.0
        },
        "food": {
            "diet_type": "vegan"
        },
        "shopping": {
            "clothing_spend": 0.0,
            "electronics_spend": 0.0,
            "household_spend": 0.0
        },
        "waste": {
            "disposal_kg": 0.0,
            "recycling_kg": 0.0
        },
        "water_liters": 0.0
    }
    
    results = calculate_footprint(inputs)
    
    # Vegan diet should be 1.5 kg * 30 days = 45 kg = 0.045 tons
    assert results["food_emissions"] == 0.045
    assert results["total_co2"] == 0.045
    assert results["sustainability_score"] > 80.0
    assert results["environmental_impact_rating"] == "A"

def test_calculate_footprint_mixed():
    inputs = {
        "transport": {
            "car_km": 1000.0, # 1000 * 0.18 = 180 kg
            "bike_km": 0.0,
            "public_transport_km": 0.0,
            "flight_km": 0.0
        },
        "energy": {
            "electricity_kwh": 500.0, # 500 * 0.38 = 190 kg
            "lpg_kg": 0.0,
            "renewable_kwh": 0.0
        },
        "food": {
            "diet_type": "mixed" # 2.5 * 30 = 75 kg
        },
        "shopping": {
            "clothing_spend": 100.0, # 100 * 0.25 = 25 kg
            "electronics_spend": 100.0, # 100 * 0.75 = 75 kg
            "household_spend": 0.0
        },
        "waste": {
            "disposal_kg": 20.0, # 20 * 0.5 = 10 kg
            "recycling_kg": 10.0 # 10 * -0.15 = -1.5 kg -> waste total = 8.5 kg
        },
        "water_liters": 1000.0 # 1000 * 0.0003 = 0.3 kg
    }
    
    results = calculate_footprint(inputs)
    # Total = 180 + 190 + 75 + 25 + 75 + 8.5 + 0.3 = 553.8 kg = 0.5538 tons = 0.554 tons
    assert results["transport_emissions"] == 0.180
    assert results["energy_emissions"] == 0.190
    assert results["food_emissions"] == 0.075
    assert results["shopping_emissions"] == 0.100
    assert results["waste_emissions"] == 0.009
    assert results["total_co2"] == 0.554
