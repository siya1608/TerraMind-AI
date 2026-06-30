import math
import numpy as np
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

from app.db.models import CarbonCalculation

def generate_predictions_for_user(
    user_id: str, 
    historical_calcs: List[CarbonCalculation]
) -> List[Dict[str, Any]]:
    """
    Leverages scikit-learn to forecast future carbon emissions, scores, and impact.
    Uses synthetic generation to pad history if user has fewer than 6 entries.
    """
    now = datetime.utcnow()
    
    # 1. Establish baseline parameters
    if not historical_calcs:
        # Default baseline if user has logged nothing
        baseline_co2 = 0.35  # tons per month (about 4.2 tons per year)
        baseline_score = 65.0
        annual_impact = 4.2
    else:
        # Take mean of user logs as the baseline
        baseline_co2 = sum(c.total_co2 for c in historical_calcs) / len(historical_calcs)
        baseline_score = sum(c.sustainability_score for c in historical_calcs) / len(historical_calcs)
        annual_impact = sum(c.annual_carbon_footprint for c in historical_calcs) / len(historical_calcs)
        
    # 2. Construct historical dataset for training (12 monthly points)
    # If the user has real logs, map them by month relative to today.
    # Pad missing months with realistic noise and a downward trend (simulating improvements).
    x_train = []
    y_emissions = []
    y_scores = []
    
    # Map real calculations to relative months (-11 to 0)
    real_by_relative = {}
    for calc in historical_calcs:
        months_ago = (now.year - calc.timestamp.year) * 12 + (now.month - calc.timestamp.month)
        if 0 <= months_ago <= 11:
            real_by_relative[-months_ago] = calc
            
    # Pad to construct a full 12-month training set
    np.random.seed(42)  # consistent generation
    for r_month in range(-11, 1):
        x_train.append([r_month])
        if r_month in real_by_relative:
            calc = real_by_relative[r_month]
            y_emissions.append(calc.total_co2)
            y_scores.append(calc.sustainability_score)
        else:
            # Simulate a historical dataset: slight random walk + standard seasonality + slight downward trend
            trend_factor = 1.0 - (r_month / -11) * 0.08 if r_month != 0 else 1.0  # -8% trend over 12 months
            noise = np.random.normal(0, 0.03)
            sim_co2 = max(0.02, baseline_co2 * trend_factor + noise)
            y_emissions.append(sim_co2)
            
            # sustainability score is inversely proportional
            sim_score = min(100.0, max(1.0, baseline_score / trend_factor - (noise * 50)))
            y_scores.append(sim_score)
            
    X = np.array(x_train)
    Y_em = np.array(y_emissions)
    Y_sc = np.array(y_scores)
    
    # 3. Train models
    # We train standard models to capture trend (LinearRegression) and non-linearities (RandomForest)
    model_em = RandomForestRegressor(n_estimators=10, random_state=42)
    model_em.fit(X, Y_em)
    
    model_sc = RandomForestRegressor(n_estimators=10, random_state=42)
    model_sc.fit(X, Y_sc)
    
    # Fit simple linear model to capture direction
    lr_em = LinearRegression()
    lr_em.fit(X, Y_em)
    trend_slope = lr_em.coef_[0]
    
    # 4. Predict next 6 months (relative months 1 to 6)
    predictions = []
    for month_ahead in range(1, 7):
        pred_x = np.array([[month_ahead]])
        
        # Weighted combination of random forest and linear trend extrapolation
        rf_pred_em = model_em.predict(pred_x)[0]
        lr_pred_em = baseline_co2 + trend_slope * month_ahead
        pred_em = max(0.01, float(0.7 * rf_pred_em + 0.3 * lr_pred_em))
        
        rf_pred_sc = model_sc.predict(pred_x)[0]
        # Decaying sustainability score calculation based on predicted emissions
        eq_score = 100.0 * math.exp(-pred_em / 0.5)
        pred_sc = min(100.0, max(0.0, float(0.6 * rf_pred_sc + 0.4 * eq_score)))
        
        target_dt = (now + timedelta(days=30 * month_ahead)).date()
        
        predictions.append({
            "user_id": user_id,
            "target_date": target_dt,
            "predicted_emissions": round(pred_em, 3),
            "predicted_sustainability_score": round(pred_sc, 1),
            "predicted_annual_impact": round(pred_em * 12, 3)
        })
        
    return predictions
