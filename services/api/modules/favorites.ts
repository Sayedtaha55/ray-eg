import { backendDelete, backendGet, backendPost, disablePathPrefix } from '../httpClient';

// TODO: Re-enable when backend /api/v1/favorites endpoints are implemented.
// Currently the backend has no favorites controller, so all requests return 404.
const FAVORITES_BACKEND_AVAILABLE = false;

export async function getMyFavoritesViaBackend(): Promise<string[]> {
  if (!FAVORITES_BACKEND_AVAILABLE) return [];
  try {
    const data = await backendGet<any[]>('/api/v1/favorites/me');
    if (!Array.isArray(data)) return [];
    return data
      .map((item: any) => String(item?.productId || item?.product_id || item?.id || '').trim())
      .filter((id: string) => Boolean(id));
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : Number(err?.status);
    if (status === 404) {
      disablePathPrefix('/api/v1/favorites');
      return [];
    }
    throw err;
  }
}

export async function addMyFavoriteViaBackend(productId: string): Promise<void> {
  if (!FAVORITES_BACKEND_AVAILABLE) return;
  try {
    await backendPost('/api/v1/favorites/me', { productId });
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : Number(err?.status);
    if (status === 404) {
      disablePathPrefix('/api/v1/favorites');
      return;
    }
    throw err;
  }
}

export async function removeMyFavoriteViaBackend(productId: string): Promise<void> {
  if (!FAVORITES_BACKEND_AVAILABLE) return;
  try {
    await backendDelete(`/api/v1/favorites/me/${encodeURIComponent(String(productId || '').trim())}`);
  } catch (err: any) {
    const status = typeof err?.status === 'number' ? err.status : Number(err?.status);
    if (status === 404) {
      disablePathPrefix('/api/v1/favorites');
      return;
    }
    throw err;
  }
}
