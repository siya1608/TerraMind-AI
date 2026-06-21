-- TerraMind AI PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    current_level VARCHAR(50) NOT NULL DEFAULT 'Eco Explorer',
    xp INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Carbon Entries Table
CREATE TABLE IF NOT EXISTS carbon_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50) NOT NULL, -- 'transport', 'energy', 'food', 'shopping', 'waste', 'water'
    details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_carbon_entries_user ON carbon_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_entries_timestamp ON carbon_entries(timestamp);

-- 4. Carbon Calculations Table
CREATE TABLE IF NOT EXISTS carbon_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES carbon_entries(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transport_emissions FLOAT NOT NULL DEFAULT 0.0,
    energy_emissions FLOAT NOT NULL DEFAULT 0.0,
    food_emissions FLOAT NOT NULL DEFAULT 0.0,
    shopping_emissions FLOAT NOT NULL DEFAULT 0.0,
    waste_emissions FLOAT NOT NULL DEFAULT 0.0,
    water_emissions FLOAT NOT NULL DEFAULT 0.0,
    total_co2 FLOAT NOT NULL DEFAULT 0.0,
    monthly_carbon_footprint FLOAT NOT NULL DEFAULT 0.0,
    annual_carbon_footprint FLOAT NOT NULL DEFAULT 0.0,
    sustainability_score FLOAT NOT NULL DEFAULT 0.0,
    environmental_impact_rating VARCHAR(50) NOT NULL DEFAULT 'C',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_carbon_calc_user ON carbon_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_calc_timestamp ON carbon_calculations(timestamp);

-- 5. Sustainability Scores Table
CREATE TABLE IF NOT EXISTS sustainability_scores (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sust_scores_user ON sustainability_scores(user_id);

-- 6. Carbon Predictions Table
CREATE TABLE IF NOT EXISTS carbon_predictions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_date DATE NOT NULL,
    predicted_emissions FLOAT NOT NULL,
    predicted_sustainability_score FLOAT NOT NULL,
    predicted_annual_impact FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_carbon_pred_user ON carbon_predictions(user_id);

-- 7. Eco Goals Table
CREATE TABLE IF NOT EXISTS eco_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value FLOAT NOT NULL,
    current_value FLOAT NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'failed'
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eco_goals_user ON eco_goals(user_id);

-- 8. Eco Challenges Table
CREATE TABLE IF NOT EXISTS eco_challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    duration_days INTEGER NOT NULL DEFAULT 7,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Eco Badges Table
CREATE TABLE IF NOT EXISTS eco_badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) NOT NULL,
    xp_required INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES eco_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_user_badge UNIQUE (user_id, badge_id)
);

-- 11. Leaderboards Table
CREATE TABLE IF NOT EXISTS leaderboards (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    rank INTEGER,
    period VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'all_time'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_user_leaderboard UNIQUE (user_id, period)
);
CREATE INDEX IF NOT EXISTS idx_leaderboards_xp ON leaderboards(xp DESC);

-- 12. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL DEFAULT 'default',
    sender VARCHAR(50) NOT NULL, -- 'user', 'assistant'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);

-- 13. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    recommendation_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    impact_rating VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_rec_user ON ai_recommendations(user_id);

-- 14. Carbon Offset Projects Table
CREATE TABLE IF NOT EXISTS carbon_offset_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'Reforestation', 'Solar Energy', 'Wind Energy', 'Ocean Cleanup'
    price_per_ton FLOAT NOT NULL DEFAULT 15.0,
    co2_reduction FLOAT NOT NULL DEFAULT 1.0, -- tons offset per share/unit
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. User Offset Contributions Table
CREATE TABLE IF NOT EXISTS user_offset_contributions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES carbon_offset_projects(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL, -- money spent ($)
    co2_offset FLOAT NOT NULL, -- tons of CO2 offset
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_offset_user ON user_offset_contributions(user_id);

-- 16. City Statistics Table
CREATE TABLE IF NOT EXISTS city_statistics (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    air_quality_index INTEGER NOT NULL DEFAULT 50,
    pollution_level FLOAT NOT NULL DEFAULT 12.5, -- ug/m3 PM2.5
    renewable_energy_usage FLOAT NOT NULL DEFAULT 20.0, -- percentage
    sustainability_ranking INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Global Statistics Table
CREATE TABLE IF NOT EXISTS global_statistics (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(5) NOT NULL UNIQUE,
    country_name VARCHAR(100) NOT NULL,
    emissions_tons FLOAT NOT NULL DEFAULT 0.0, -- per capita
    climate_risk_score FLOAT NOT NULL DEFAULT 50.0,
    sustainability_rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'PDF', 'CSV'
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
