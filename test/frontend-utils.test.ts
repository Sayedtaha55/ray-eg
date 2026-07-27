/**
 * Frontend utility tests
 * Tests for retry-manager, offline-db, and sync-service
 */

// Mock fetch globally
global.fetch = jest.fn();
global.navigator = { onLine: true } as any;

describe('RetryManager', () => {
  let retryManager: any;
  let fetchWithRetry: any;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    const mod = await import('../src/shared/lib/retry-manager');
    retryManager = mod.retryManager;
    fetchWithRetry = mod.fetchWithRetry;
  });

  describe('fetchWithRetry', () => {
    it('should return response on successful fetch', async () => {
      const mockResponse = { ok: true, status: 200, statusText: 'OK' } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWithRetry('https://api.test.com/data');

      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 4xx errors', async () => {
      const mockResponse = { ok: false, status: 404, statusText: 'Not Found' } as any;
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWithRetry('https://api.test.com/data');

      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx errors', async () => {
      const mockErrorResponse = { ok: false, status: 500, statusText: 'Internal Server Error' } as any;
      const mockSuccessResponse = { ok: true, status: 200, statusText: 'OK' } as any;
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      // Use short delays for test
      const result = await fetchWithRetry(
        'https://api.test.com/data',
        {},
        { maxRetries: 3, initialDelay: 10 },
      );

      expect(result).toBe(mockSuccessResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        fetchWithRetry('https://api.test.com/data', {}, { maxRetries: 2, initialDelay: 10 }),
      ).rejects.toThrow('Network error');

      // 1 initial + 2 retries = 3 calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('isOnline', () => {
    it('should return navigator.onLine value', () => {
      expect(retryManager.isOnline()).toBe(true);
    });
  });
});

describe('optimisticUpdate', () => {
  it('should return result on successful API call', async () => {
    const { optimisticUpdate } = await import('../src/shared/lib/retry-manager');

    const apiCall = jest.fn().mockResolvedValue({ id: '1', name: 'Updated' });
    const rollback = jest.fn();

    const result = await optimisticUpdate(
      { id: '1', name: 'Optimistic' },
      apiCall,
      rollback,
    );

    expect(result).toEqual({ id: '1', name: 'Updated' });
    expect(rollback).not.toHaveBeenCalled();
  });

  it('should call rollback on API failure', async () => {
    const { optimisticUpdate } = await import('../src/shared/lib/retry-manager');

    const apiCall = jest.fn().mockRejectedValue(new Error('API failed'));
    const rollback = jest.fn();

    await expect(
      optimisticUpdate(
        { id: '1', name: 'Optimistic' },
        apiCall,
        rollback,
      ),
    ).rejects.toThrow('API failed');

    expect(rollback).toHaveBeenCalledWith({ id: '1', name: 'Optimistic' });
  });
});
