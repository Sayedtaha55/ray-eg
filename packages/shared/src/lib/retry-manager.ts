interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export class RetryManager {
  private static instance: RetryManager;
  private retryQueue: Map<string, number> = new Map();

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
    } = retryOptions;

    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.ok) {
          return response;
        }

        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        if (attempt < maxRetries) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} for ${url} in ${delay}ms`);
          await this.sleep(delay);
          delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
      }
    }

    throw lastError || new Error('Max retries reached');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  waitForOnline(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', onOnline);
        resolve(false);
      }, timeout);

      const onOnline = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', onOnline);
        resolve(true);
      };

      window.addEventListener('online', onOnline);
    });
  }
}

export const retryManager = RetryManager.getInstance();

// Fetch wrapper with retry
export const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> => {
  return retryManager.fetchWithRetry(url, options, retryOptions);
};

// Optimistic update helper
export const optimisticUpdate = async <T>(
  optimisticData: T,
  apiCall: () => Promise<T>,
  rollback: (original: T) => void
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed, rolling back optimistic update:', error);
    rollback(optimisticData);
    throw error;
  }
};
