import math
from typing import Dict, Any

# Standard greenhouse gas emission factors (mostly in kg CO2 per unit)
EMISSION_FACTORS = {
    # Transportation (kg CO2 per km)
    "car_gasoline": 0.18,
    "bike": 0.0,
    "public_transport": 0.04,
    "flight": 0.13,
    
    # Energy (kg CO2 per unit)
    "electricity_kwh": 0.38,  # average grid mix
    "lpg_kg": 1.51,           # liquified petroleum gas
    "renewable_kwh": 0.01,    # lifecycle emissions
    
    # Food (kg CO2 per day)
    "food_vegan": 1.5,
    "food_vegetarian": 1.7,
    "food_mixed": 2.5,
    "food_meat_heavy": 3.3,
    
    # Shopping (kg CO2 per dollar spent)
    "clothing_usd": 0.25,
    "electronics_usd": 0.75,
    "household_usd": 0.20,
    
    # Waste (kg CO2 per kg)
    "waste_disposal": 0.50,
    "waste_recycling": -0.15,  # carbon offset credit from recycling
    
    # Water (kg CO2 per liter)
    "water_liter": 0.0003
}

def calculate_footprint(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates carbon emissions across categories.
    Inputs must be formatted matching CarbonLogInput schema.
    Returns emission values in kg and tons, sustainability scores, and rating grades.
    """
    transport = inputs.get("transport", {})
    energy = inputs.get("energy", {})
    food = inputs.get("food", {})
    shopping = inputs.get("shopping", {})
    waste = inputs.get("waste", {})
    water_liters = inputs.get("water_liters", 0.0)
    
    # 1. Transportation Category (kg CO2)
    car_co2 = transport.get("car_km", 0.0) * EMISSION_FACTORS["car_gasoline"]
    bike_co2 = transport.get("bike_km", 0.0) * EMISSION_FACTORS["bike"]
    transit_co2 = transport.get("public_transport_km", 0.0) * EMISSION_FACTORS["public_transport"]
    flights_co2 = transport.get("flight_km", 0.0) * EMISSION_FACTORS["flight"]
    transport_total = car_co2 + bike_co2 + transit_co2 + flights_co2
    
    # 2. Energy Category (kg CO2)
    electricity_co2 = energy.get("electricity_kwh", 0.0) * EMISSION_FACTORS["electricity_kwh"]
    lpg_co2 = energy.get("lpg_kg", 0.0) * EMISSION_FACTORS["lpg_kg"]
    renewable_co2 = energy.get("renewable_kwh", 0.0) * EMISSION_FACTORS["renewable_kwh"]
    energy_total = electricity_co2 + lpg_co2 + renewable_co2
    
    # 3. Food Category (kg CO2 - assuming a 30-day month)
    diet_type = food.get("diet_type", "mixed")
    diet_factor = EMISSION_FACTORS.get(f"food_{diet_type}", EMISSION_FACTORS["food_mixed"])
    food_total = diet_factor * 30.0
    
    # 4. Shopping Category (kg CO2)
    clothing_co2 = shopping.get("clothing_spend", 0.0) * EMISSION_FACTORS["clothing_usd"]
    electronics_co2 = shopping.get("electronics_spend", 0.0) * EMISSION_FACTORS["electronics_usd"]
    household_co2 = shopping.get("household_spend", 0.0) * EMISSION_FACTORS["household_usd"]
    shopping_total = clothing_co2 + electronics_co2 + household_co2
    
    # 5. Waste Category (kg CO2)
    disposal_co2 = waste.get("disposal_kg", 0.0) * EMISSION_FACTORS["waste_disposal"]
    recycling_co2 = waste.get("recycling_kg", 0.0) * EMISSION_FACTORS["waste_recycling"]
    waste_total = max(0.0, disposal_co2 + recycling_co2)  # do not let waste offset go negative overall
    
    # 6. Water Category (kg CO2)
    water_total = water_liters * EMISSION_FACTORS["water_liter"]
    
    # Summarize in kg
    total_kg = transport_total + energy_total + food_total + shopping_total + waste_total + water_total
    
    # Convert categories and total to tons CO2
    transport_tons = transport_total / 1000.0
    energy_tons = energy_total / 1000.0
    food_tons = food_total / 1000.0
    shopping_tons = shopping_total / 1000.0
    waste_tons = waste_total / 1000.0
    water_tons = water_total / 1000.0
    total_tons = total_kg / 1000.0
    
    # Calculate sustainability score out of 100
    # Decays exponentially. A green target monthly footprint is ~0.166 tons (equivalent to 2 tons per year).
    # Decays such that 0.5 tons yields ~37 points, and 0.166 tons yields ~72 points.
    score = 100.0 * math.exp(-total_tons / 0.5)
    score = max(0.0, min(100.0, round(score, 1)))
    
    # Determine Rating Grade
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
        
    return {
        "transport_emissions": round(transport_tons, 3),
        "energy_emissions": round(energy_tons, 3),
        "food_emissions": round(food_tons, 3),
        "shopping_emissions": round(shopping_tons, 3),
        "waste_emissions": round(waste_tons, 3),
        "water_emissions": round(water_tons, 4),
        "total_co2": round(total_tons, 3),
        "monthly_carbon_footprint": round(total_tons, 3),
        "annual_carbon_footprint": round(total_tons * 12, 3),
        "sustainability_score": score,
        "environmental_impact_rating": rating
    }
