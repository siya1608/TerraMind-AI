'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  calculateCarbon: (data: any) => Promise<CalculationResult>;
  sendMessageToCoach: (message: string) => Promise<string>;
  dispatchAgentTask: (taskDescription: string) => Promise<AgentTaskResponse>;
  fetchMarketplaceProjects: () => Promise<OffsetProject[]>;
  contributeOffset: (projectId: number, amount: number) => Promise<any>;
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
      const res = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // also fetch calculations automatically
        fetchCalculationsHistory(activeToken);
      } else {
        // Token might have expired
        logout();
      }
    } catch (e) {
      console.error('Error loading profile', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalculationsHistory = async (activeToken: string) => {
    try {
      const res = await fetch(`${apiUrl}/calculator/history`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCalculations(data);
      }
    } catch (e) {
      console.error('Error fetching calculation history', e);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('terramind_ai_token', data.access_token);
        setToken(data.access_token);
        await fetchProfileData(data.access_token);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('terramind_ai_token', data.access_token);
        setToken(data.access_token);
        await fetchProfileData(data.access_token);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Signup error', e);
      return false;
    }
  };

  const googleLogin = async (email: string, name: string, picture: string): Promise<boolean> => {
    try {
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, picture }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('terramind_ai_token', data.access_token);
        setToken(data.access_token);
        await fetchProfileData(data.access_token);
        return true;
      }
      return false;
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

  const calculateCarbon = async (data: any): Promise<CalculationResult> => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${apiUrl}/calculator/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('Calculation failed');
    }
    const result = await res.json();
    // Prepend new calculation
    setCalculations((prev) => [result, ...prev]);
    // Refresh profile to see level-up or XP additions
    fetchProfile();
    return result;
  };

  const sendMessageToCoach = async (message: string): Promise<string> => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${apiUrl}/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error('Coach message failed');
    }
    const data = await res.json();
    return data.reply;
  };

  const dispatchAgentTask = async (taskDescription: string): Promise<AgentTaskResponse> => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${apiUrl}/agents/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ task_description: taskDescription }),
    });
    if (!res.ok) {
      throw new Error('Agent dispatch failed');
    }
    return await res.json();
  };

  const fetchMarketplaceProjects = async (): Promise<OffsetProject[]> => {
    if (!token) return [];
    const res = await fetch(`${apiUrl}/marketplace/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to load marketplace projects');
    return await res.json();
  };

  const contributeOffset = async (projectId: number, amount: number): Promise<any> => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${apiUrl}/marketplace/contribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId, amount }),
    });
    if (!res.ok) throw new Error('Contribution failed');
    const data = await res.json();
    // Refresh profile since XP will be earned
    fetchProfile();
    return data;
  };

  const fetchSmartCityStats = async (): Promise<CityStat[]> => {
    try {
      const res = await fetch(`${apiUrl}/smart-city/statistics`);
      if (!res.ok) throw new Error('Failed to fetch smart city stats');
      return await res.json();
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
      const res = await fetch(`${apiUrl}/climate-map/countries`);
      if (!res.ok) throw new Error('Failed to fetch climate map stats');
      return await res.json();
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
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/gamification/leaderboard`, { headers });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return await res.json();
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
    const res = await fetch(`${apiUrl}/gamification/challenges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch challenges');
    return await res.json();
  };

  const fetchBadges = async (): Promise<EcoBadge[]> => {
    if (!token) return [];
    const res = await fetch(`${apiUrl}/gamification/badges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch badges');
    return await res.json();
  };

  const completeChallenge = async (challengeId: string): Promise<boolean> => {
    if (!token) return false;
    const res = await fetch(`${apiUrl}/gamification/challenges/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ challenge_id: challengeId }),
    });
    if (res.ok) {
      fetchProfile();
      return true;
    }
    return false;
  };

  const fetchAdminStats = async (): Promise<AdminStats> => {
    if (!token) throw new Error('Unauthenticated');
    const res = await fetch(`${apiUrl}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Admin stats failed');
    return await res.json();
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
