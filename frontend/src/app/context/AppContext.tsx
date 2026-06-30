'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, apiPost } from '../lib/api';

// Interfaces matching backend schemas
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  current_level: string;
  xp: number;
  streak: number;
  last_active: string;
  role: string;
}

export interface CalculationResult {
  id: string;
  timestamp: string;
  transport_emissions: number;
  energy_emissions: number;
  food_emissions: number;
  shopping_emissions: number;
  waste_emissions: number;
  water_emissions: number;
  total_co2: number;
  monthly_carbon_footprint: number;
  annual_carbon_footprint: number;
  sustainability_score: number;
  environmental_impact_rating: string;
}

export interface OffsetProject {
  id: number;
  title: string;
  description: string;
  category: string;
  price_per_ton: number;
  co2_reduction: number;
  image_url: string;
}

export interface OffsetContributionResponse {
  id: number;
  project_id: number;
  amount: number;
  co2_offset: number;
  earned_xp: number;
  created_at: string;
}

export interface CityStat {
  city_name: string;
  air_quality_index: number;
  pollution_level: number;
  renewable_energy_usage: number;
  sustainability_ranking?: number;
}

export interface CountryStat {
  country_code: string;
  country_name: string;
  emissions_tons: number;
  climate_risk_score: number;
  sustainability_rank?: number;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string;
  xp: number;
  rank: number;
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  is_completed: boolean;
}

export interface EcoBadge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  is_earned: boolean;
}

export interface AgentTaskResponse {
  task_id: string;
  status: string;
  agent_outputs: { agent: string; output: string }[];
  final_recommendation: string;
}

export interface AdminStats {
  total_users: number;
  total_calculations: number;
  active_agents: number;
  total_offsets_purchased: number;
  average_sustainability_score: number;
  system_latency: string;
  system_status: string;
}

export interface CarbonLogInput {
  transport: {
    car_km: number;
    bike_km: number;
    public_transport_km: number;
    flight_km: number;
  };
  energy: {
    electricity_kwh: number;
    lpg_kg: number;
    renewable_kwh: number;
  };
  food: {
    diet_type: string;
  };
  shopping: {
    clothing_spend: number;
    electronics_spend: number;
    household_spend: number;
  };
  waste: {
    disposal_kg: number;
    recycling_kg: number;
  };
  water_liters: number;
}

interface AppContextProps {
  apiUrl: string;
  token: string | null;
  profile: UserProfile | null;
  calculations: CalculationResult[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  googleLogin: (email: string, name: string, picture: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  calculateCarbon: (data: CarbonLogInput) => Promise<CalculationResult>;
  sendMessageToCoach: (message: string) => Promise<string>;
  dispatchAgentTask: (taskDescription: string) => Promise<AgentTaskResponse>;
  fetchMarketplaceProjects: () => Promise<OffsetProject[]>;
  contributeOffset: (projectId: number, amount: number) => Promise<OffsetContributionResponse>;
  fetchSmartCityStats: () => Promise<CityStat[]>;
  fetchClimateMapStats: () => Promise<CountryStat[]>;
  fetchLeaderboard: () => Promise<LeaderboardEntry[]>;
  fetchChallenges: () => Promise<EcoChallenge[]>;
  fetchBadges: () => Promise<EcoBadge[]>;
  completeChallenge: (challengeId: string) => Promise<boolean>;
  fetchAdminStats: () => Promise<AdminStats>;
  triggerReportDownload: (format: 'pdf' | 'csv') => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Default Backend URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    const savedToken = localStorage.getItem('terramind_ai_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfileData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfileData = async (activeToken: string) => {
    try {
      const data = await apiFetch<UserProfile>('/auth/profile', { token: activeToken });
      setProfile(data);
      // also fetch calculations automatically
      fetchCalculationsHistory(activeToken);
    } catch (e) {
      console.error('Error loading profile', e);
      // Token might have expired
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchCalculationsHistory = async (activeToken: string) => {
    try {
      const data = await apiFetch<CalculationResult[]>('/calculator/history', { token: activeToken });
      setCalculations(data);
    } catch (e) {
      console.error('Error fetching calculation history', e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiPost<{ access_token: string }>('/auth/login', { email, password });
      localStorage.setItem('terramind_ai_token', data.access_token);
      setToken(data.access_token);
      await fetchProfileData(data.access_token);
      return true;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiPost<{ access_token: string }>('/auth/signup', { email, password });
      localStorage.setItem('terramind_ai_token', data.access_token);
      setToken(data.access_token);
      await fetchProfileData(data.access_token);
      return true;
    } catch (e) {
      console.error('Signup error', e);
      return false;
    }
  };

  const googleLogin = async (email: string, name: string, picture: string): Promise<boolean> => {
    try {
      const data = await apiPost<{ access_token: string }>('/auth/google', { email, name, picture });
      localStorage.setItem('terramind_ai_token', data.access_token);
      setToken(data.access_token);
      await fetchProfileData(data.access_token);
      return true;
    } catch (e) {
      console.error('Google login error', e);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('terramind_ai_token');
    setToken(null);
    setProfile(null);
    setCalculations([]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (token) await fetchProfileData(token);
  };

  const calculateCarbon = async (data: CarbonLogInput): Promise<CalculationResult> => {
    if (!token) throw new Error('Unauthenticated');
    const result = await apiPost<CalculationResult>('/calculator/calculate', data, { token });
    // Prepend new calculation
    setCalculations((prev) => [result, ...prev]);
    // Refresh profile to see level-up or XP additions
    fetchProfile();
    return result;
  };

  const sendMessageToCoach = async (message: string): Promise<string> => {
    if (!token) throw new Error('Unauthenticated');
    const data = await apiPost<{ reply: string }>('/coach/chat', { message }, { token });
    return data.reply;
  };

  const dispatchAgentTask = async (taskDescription: string): Promise<AgentTaskResponse> => {
    if (!token) throw new Error('Unauthenticated');
    return await apiPost<AgentTaskResponse>(
      '/agents/dispatch',
      { task_description: taskDescription },
      { token }
    );
  };

  const fetchMarketplaceProjects = async (): Promise<OffsetProject[]> => {
    if (!token) return [];
    return await apiFetch<OffsetProject[]>('/marketplace/projects', { token });
  };

  const contributeOffset = async (projectId: number, amount: number): Promise<OffsetContributionResponse> => {
    if (!token) throw new Error('Unauthenticated');
    const data = await apiPost<OffsetContributionResponse>(
      '/marketplace/contribute',
      { project_id: projectId, amount },
      { token }
    );
    // Refresh profile since XP will be earned
    fetchProfile();
    return data;
  };

  const fetchSmartCityStats = async (): Promise<CityStat[]> => {
    try {
      return await apiFetch<CityStat[]>('/smart-city/statistics');
    } catch (e) {
      console.warn('Backend unavailable, using smart city stats fallback:', e);
      return [
        { city_name: 'Copenhagen', air_quality_index: 18, pollution_level: 4.1, renewable_energy_usage: 84.0, sustainability_ranking: 1 },
        { city_name: 'Singapore', air_quality_index: 42, pollution_level: 9.8, renewable_energy_usage: 31.0, sustainability_ranking: 2 },
        { city_name: 'Amsterdam', air_quality_index: 22, pollution_level: 5.2, renewable_energy_usage: 76.0, sustainability_ranking: 3 },
        { city_name: 'Stockholm', air_quality_index: 15, pollution_level: 3.7, renewable_energy_usage: 88.0, sustainability_ranking: 4 },
        { city_name: 'Tokyo', air_quality_index: 55, pollution_level: 12.4, renewable_energy_usage: 22.0, sustainability_ranking: 5 },
        { city_name: 'San Francisco', air_quality_index: 38, pollution_level: 8.6, renewable_energy_usage: 62.0, sustainability_ranking: 6 },
      ];
    }
  };

  const fetchClimateMapStats = async (): Promise<CountryStat[]> => {
    try {
      return await apiFetch<CountryStat[]>('/climate-map/countries');
    } catch (e) {
      console.warn('Backend unavailable, using climate map stats fallback:', e);
      return [
        { country_code: 'SWE', country_name: 'Sweden', emissions_tons: 3.83, climate_risk_score: 12.0, sustainability_rank: 1 },
        { country_code: 'NOR', country_name: 'Norway', emissions_tons: 6.64, climate_risk_score: 14.0, sustainability_rank: 2 },
        { country_code: 'DNK', country_name: 'Denmark', emissions_tons: 5.26, climate_risk_score: 15.0, sustainability_rank: 3 },
        { country_code: 'NLD', country_name: 'Netherlands', emissions_tons: 8.04, climate_risk_score: 25.0, sustainability_rank: 4 },
        { country_code: 'GBR', country_name: 'United Kingdom', emissions_tons: 5.38, climate_risk_score: 30.0, sustainability_rank: 5 },
      ];
    }
  };

  const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
      return await apiFetch<LeaderboardEntry[]>('/gamification/leaderboard', token ? { token } : undefined);
    } catch (e) {
      console.warn('Backend unavailable, using leaderboard fallback:', e);
      return [
        { id: 'fallback-1', full_name: 'Elena Rostova', avatar_url: '', xp: 4850, rank: 1 },
        { id: 'fallback-2', full_name: 'Marcus Vance', avatar_url: '', xp: 3920, rank: 2 },
        { id: 'fallback-3', full_name: 'Sari Tanaka', avatar_url: '', xp: 3400, rank: 3 },
        { id: 'fallback-4', full_name: 'David Kojo', avatar_url: '', xp: 2950, rank: 4 },
        { id: 'fallback-5', full_name: 'Amélie Dupont', avatar_url: '', xp: 2500, rank: 5 },
      ];
    }
  };

  const fetchChallenges = async (): Promise<EcoChallenge[]> => {
    if (!token) return [];
    return await apiFetch<EcoChallenge[]>('/gamification/challenges', { token });
  };

  const fetchBadges = async (): Promise<EcoBadge[]> => {
    if (!token) return [];
    return await apiFetch<EcoBadge[]>('/gamification/badges', { token });
  };

  const completeChallenge = async (challengeId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await apiPost<unknown>('/gamification/challenges/claim', { challenge_id: challengeId }, { token });
      fetchProfile();
      return true;
    } catch (e) {
      console.error('Failed to claim challenge', e);
      return false;
    }
  };

  const fetchAdminStats = async (): Promise<AdminStats> => {
    if (!token) throw new Error('Unauthenticated');
    return await apiFetch<AdminStats>('/admin/dashboard-stats', { token });
  };

  const triggerReportDownload = async (format: 'pdf' | 'csv'): Promise<void> => {
    if (!token) throw new Error('Unauthenticated');
    const response = await fetch(`${apiUrl}/reports/download?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to export report');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TerraMind AI_Sustainability_Report_${new Date().toISOString().slice(0,10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoggedIn = !!token;
  const isAdmin = profile?.role === 'admin';

  return (
    <AppContext.Provider
      value={{
        apiUrl,
        token,
        profile,
        calculations,
        isLoggedIn,
        isAdmin,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        fetchProfile,
        calculateCarbon,
        sendMessageToCoach,
        dispatchAgentTask,
        fetchMarketplaceProjects,
        contributeOffset,
        fetchSmartCityStats,
        fetchClimateMapStats,
        fetchLeaderboard,
        fetchChallenges,
        fetchBadges,
        completeChallenge,
        fetchAdminStats,
        triggerReportDownload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
