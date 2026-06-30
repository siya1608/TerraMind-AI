import { apiFetch, apiPost, ApiError } from '../api';

describe('apiFetch client wrapper', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('should parse successful JSON responses', async () => {
    const mockResponseData = { success: true, payload: 'test-data' };
    
    globalThis.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponseData),
      } as Response)
    );

    const result = await apiFetch<{ success: boolean; payload: string }>('/test-route');
    
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-route'),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
    );
    expect(result).toEqual(mockResponseData);
  });

  it('should inject authorization header if token is provided', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)
    );

    await apiFetch('/auth/profile', { token: 'mock-jwt-token' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer mock-jwt-token',
        },
      })
    );
  });

  it('should throw ApiError for non-2xx response codes', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ detail: 'Token expired' }),
      } as Response)
    );

    await expect(apiFetch('/calculator/history')).rejects.toThrow(ApiError);
    
    try {
      await apiFetch('/calculator/history');
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(401);
      expect(e.detail).toBe('Token expired');
    }
  });

  it('should support apiPost POST helper requests', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ created: true }),
      } as Response)
    );

    const requestPayload = { key: 'value' };
    const response = await apiPost<{ created: boolean }>('/test-post', requestPayload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-post'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestPayload),
      })
    );
    expect(response).toEqual({ created: true });
  });
});
