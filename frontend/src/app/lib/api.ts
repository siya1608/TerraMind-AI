/**
 * TerraMind AI — Typed API Fetch Utility
 * ========================================
 * Centralised HTTP client for all backend API calls.
 *
 * Features:
 *   - Generic type parameter for type-safe response parsing
 *   - Automatic Bearer token injection from localStorage
 *   - Structured error handling with ApiError class
 *   - Configurable retry logic for transient network failures
 *   - Environment-aware base URL via NEXT_PUBLIC_API_URL
 *
 * Usage:
 *   const projects = await apiFetch<OffsetProject[]>('/marketplace/projects', { token });
 */

/** Base API URL — override via NEXT_PUBLIC_API_URL environment variable */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// ── Error Types ───────────────────────────────────────────────────────────────

/** Structured error thrown for non-2xx API responses */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    message?: string,
  ) {
    super(message ?? `API Error ${status}: ${detail}`);
    this.name = 'ApiError';
  }
}

/** Options accepted by apiFetch */
export interface FetchOptions extends RequestInit {
  /** JWT Bearer token — injected as Authorization header when provided */
  token?: string | null;
  /** Number of retry attempts on network failure (default: 0) */
  retries?: number;
}

// ── Core Fetch ────────────────────────────────────────────────────────────────

/**
 * Generic, typed fetch wrapper for TerraMind AI API calls.
 *
 * @template T - The expected shape of the successful response body
 * @param path - API path relative to API_BASE_URL (e.g. '/auth/login')
 * @param options - Standard RequestInit options + token + retries
 * @returns Parsed JSON body typed as T
 * @throws {ApiError} When the response status is not 2xx
 * @throws {Error} On network failure after all retry attempts
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, retries = 0, headers: extraHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...restOptions, headers });

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const errorBody = await response.json();
          detail = errorBody?.detail ?? detail;
        } catch {
          // Response body may not be JSON — keep generic detail
        }
        throw new ApiError(response.status, detail);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      if (error instanceof ApiError) throw error; // Don't retry API errors
      if (attempt < retries) {
        // Exponential backoff: 200ms, 400ms, 800ms, ...
        await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

// ── Convenience Helpers ───────────────────────────────────────────────────────

/**
 * POST JSON body to an API path.
 *
 * @template T - Expected response type
 * @param path - API path (e.g. '/auth/login')
 * @param body - JSON-serialisable request body
 * @param options - Additional fetch options (token, etc.)
 */
export function apiPost<T>(
  path: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT JSON body to an API path.
 *
 * @template T - Expected response type
 */
export function apiPut<T>(
  path: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request to an API path.
 *
 * @template T - Expected response type (often void)
 */
export function apiDelete<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE', ...options });
}
