import { backendDelete, backendGet, backendPost, disablePathPrefix } from '../httpClient';

export async function getMyFavoritesViaBackend(): Promise<string[]> {
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
