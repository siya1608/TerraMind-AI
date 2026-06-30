/**
 * TerraMind AI — Application Constants
 * ======================================
 * Centralised, named constants used across the frontend application.
 * Importing from this file ensures a single source of truth and avoids
 * magic strings/numbers scattered throughout components.
 */

// ── Routing ───────────────────────────────────────────────────────────────────

/** All application route paths as named constants */
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CALCULATOR: '/calculator',
  COACH: '/coach',
  AGENTS: '/agents',
  SIMULATOR: '/simulator',
  SMART_CITY: '/smart-city',
  MAP: '/map',
  GAMIFICATION: '/gamification',
  MARKETPLACE: '/marketplace',
  REPORTS: '/reports',
  ADMIN: '/admin',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// ── Gamification Levels ───────────────────────────────────────────────────────

/** XP thresholds for each gamification level */
export const LEVEL_XP_THRESHOLDS: Record<string, number> = {
  'Eco Explorer': 0,
  'Green Innovator': 100,
  'Climate Warrior': 500,
  'Sustainability Champion': 1200,
  'Earth Guardian': 2500,
} as const;

/** Ordered list of level names from lowest to highest */
export const LEVEL_ORDER = [
  'Eco Explorer',
  'Green Innovator',
  'Climate Warrior',
  'Sustainability Champion',
  'Earth Guardian',
] as const;

export type GamificationLevel = (typeof LEVEL_ORDER)[number];

// ── Emission Factors (display labels) ────────────────────────────────────────

/** Human-readable category labels for the carbon emissions breakdown */
export const EMISSION_CATEGORY_LABELS: Record<string, string> = {
  transport_emissions: 'Transport',
  energy_emissions: 'Energy',
  food_emissions: 'Food & Diet',
  shopping_emissions: 'Shopping',
  waste_emissions: 'Waste',
  water_emissions: 'Water',
} as const;

// ── Diet Types ────────────────────────────────────────────────────────────────

/** Available diet options for the carbon calculator */
export const DIET_TYPE_OPTIONS = [
  { value: 'vegan',       label: 'Vegan',        co2_per_day: 1.5 },
  { value: 'vegetarian',  label: 'Vegetarian',   co2_per_day: 1.7 },
  { value: 'mixed',       label: 'Mixed',        co2_per_day: 2.5 },
  { value: 'meat_heavy',  label: 'Meat Heavy',   co2_per_day: 3.3 },
] as const;

export type DietType = 'vegan' | 'vegetarian' | 'mixed' | 'meat_heavy';

// ── Environmental Impact Ratings ──────────────────────────────────────────────

/** Colour classes and labels for each sustainability rating grade */
export const IMPACT_RATING_CONFIG: Record<string, { label: string; colorClass: string; description: string }> = {
  A: { label: 'Excellent', colorClass: 'text-emerald-400', description: 'Significantly below average emissions' },
  B: { label: 'Good',      colorClass: 'text-green-400',   description: 'Below average emissions' },
  C: { label: 'Average',   colorClass: 'text-yellow-400',  description: 'Near global average' },
  D: { label: 'High',      colorClass: 'text-orange-400',  description: 'Above average emissions' },
  E: { label: 'Critical',  colorClass: 'text-red-400',     description: 'Significantly above average — urgent action needed' },
} as const;

// ── AQI Categories ────────────────────────────────────────────────────────────

/** Air Quality Index category definitions */
export const AQI_CATEGORIES = [
  { max: 50,  label: 'Good',          colorClass: 'text-emerald-400' },
  { max: 100, label: 'Moderate',      colorClass: 'text-yellow-400' },
  { max: 150, label: 'Unhealthy',     colorClass: 'text-orange-400' },
  { max: 200, label: 'Very Unhealthy',colorClass: 'text-red-400' },
  { max: Infinity, label: 'Hazardous',colorClass: 'text-red-600' },
] as const;

// ── Local Storage Keys ────────────────────────────────────────────────────────

/** Namespaced localStorage keys to avoid collisions */
export const STORAGE_KEYS = {
  TOKEN: 'terramind_ai_token',
  THEME: 'terramind_ai_theme',
  CALCULATOR_DRAFT: 'terramind_ai_calculator_draft',
} as const;

// ── Pagination Defaults ───────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LEADERBOARD_LIMIT: 50,
} as const;
