import { backendDelete, backendGet, backendPost } from '../httpClient';

export async function getMyFavoritesViaBackend(): Promise<string[]> {
  const data = await backendGet<any[]>('/api/v1/favorites/me');
  if (!Array.isArray(data)) return [];
  return data
    .map((item: any) => String(item?.productId || item?.product_id || item?.id || '').trim())
    .filter((id: string) => Boolean(id));
}

export async function addMyFavoriteViaBackend(productId: string): Promise<void> {
  await backendPost('/api/v1/favorites/me', { productId });
}

export async function removeMyFavoriteViaBackend(productId: string): Promise<void> {
  await backendDelete(`/api/v1/favorites/me/${encodeURIComponent(String(productId || '').trim())}`);
}
