import { backendDelete, backendGet, backendPatch, backendPost } from '../httpClient';
import { normalizeProductFromBackend } from '../normalizers';

export async function getProductsViaBackend(shopId?: string, opts?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (shopId) params.set('shopId', String(shopId));
  if (typeof opts?.page === 'number') params.set('page', String(opts.page));
  if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
  const qs = params.toString();
  const products = await backendGet<any[]>(`/api/v1/products${qs ? `?${qs}` : ''}`);
  return products.map(normalizeProductFromBackend);
}

export async function getProductsForManageViaBackend(shopId: string, opts?: { page?: number; limit?: number; includeImageMap?: boolean }) {
  const sid = String(shopId || '').trim();
  if (!sid) return [];
  const params = new URLSearchParams();
  if (typeof opts?.page === 'number') params.set('page', String(opts.page));
  if (typeof opts?.limit === 'number') params.set('limit', String(opts.limit));
  if (opts?.includeImageMap === true) params.set('includeImageMap', 'true');
  const qs = params.toString();
  const products = await backendGet<any[]>(
    `/api/v1/products/manage/by-shop/${encodeURIComponent(sid)}${qs ? `?${qs}` : ''}`,
  );
  return products.map(normalizeProductFromBackend);
}

export async function getProductByIdViaBackend(id: string) {
  const product = await backendGet<any>(`/api/v1/products/${encodeURIComponent(id)}`);
  return normalizeProductFromBackend(product);
}

export async function addProductViaBackend(product: any) {
  const created = await backendPost<any>('/api/v1/products', product);
  return normalizeProductFromBackend(created);
}

export async function updateProductStockViaBackend(id: string, stock: number) {
  const updated = await backendPatch<any>(`/api/v1/products/${encodeURIComponent(id)}/stock`, { stock });
  return normalizeProductFromBackend(updated);
}

export async function updateProductViaBackend(id: string, data: any) {
  const updated = await backendPatch<any>(`/api/v1/products/${encodeURIComponent(id)}`, data);
  return normalizeProductFromBackend(updated);
}

export async function deleteProductViaBackend(id: string) {
  const deleted = await backendDelete<any>(`/api/v1/products/${encodeURIComponent(id)}`);
  return normalizeProductFromBackend(deleted);
}
