import { UnifiedBuilderConfig } from '@/types/builder';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ray_token');
}

/**
 * Get builder configuration for a shop.
 * The Go backend returns the BuilderConfig directly (not wrapped in {data:...}).
 */
export async function getBuilderConfig(shopId: string): Promise<UnifiedBuilderConfig> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/builder/${shopId}/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch builder config');
  }

  // Backend returns the config object directly.
  const data = await response.json();
  return (data?.data ?? data) as UnifiedBuilderConfig;
}

/**
 * Update builder configuration for a shop.
 */
export async function updateBuilderConfig(
  shopId: string,
  config: Partial<UnifiedBuilderConfig>
): Promise<UnifiedBuilderConfig> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/builder/${shopId}/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({ config: { ...config, shopId } }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update builder config');
  }

  const data = await response.json();
  return (data?.data ?? data) as UnifiedBuilderConfig;
}

/**
 * Publish builder configuration for a shop.
 */
export async function publishBuilderConfig(shopId: string): Promise<{ success: boolean; message: string }> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/builder/${shopId}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to publish builder config');
  }

  return await response.json();
}