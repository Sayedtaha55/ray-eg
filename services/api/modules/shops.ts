import { backendDelete, backendGet, backendPatch, backendPost, toBackendUrl } from '../httpClient';
import { normalizeShopFromBackend } from '../normalizers';

export async function getShopsViaBackend(
  filterStatus: 'approved' | 'pending' | 'rejected' | 'all' | '' = 'approved',
  opts?: { take?: number; skip?: number; category?: string; governorate?: string; search?: string },
) {
  const status = String(filterStatus || 'approved').toLowerCase();

  const applyClientFilters = (items: any[]) => {
    let out = items;
    if (opts?.category) {
      const wanted = String(opts.category).toUpperCase();
      out = out.filter((s: any) => String(s?.category || '').toUpperCase() === wanted);
    }
    if (opts?.governorate) {
      const gov = String(opts.governorate).trim();
      out = out.filter((s: any) => String(s?.governorate || '').trim() === gov);
    }
    if (opts?.search) {
      const q = String(opts.search).trim();
      if (q) out = out.filter((s: any) => String(s?.name || '').includes(q));
    }
    return out;
  };

  if (!status || status === 'approved') {
    const params = new URLSearchParams();
    if (typeof opts?.take === 'number') params.set('take', String(opts.take));
    if (typeof opts?.skip === 'number') params.set('skip', String(opts.skip));
    if (opts?.category) params.set('category', String(opts.category));
    if (opts?.governorate) params.set('governorate', String(opts.governorate));
    if (opts?.search) params.set('search', String(opts.search));
    const qs = params.toString();
    const shops = await backendGet<any[]>(`/api/v1/shops${qs ? `?${qs}` : ''}`);
    return applyClientFilters(shops.map(normalizeShopFromBackend));
  }

  if (status === 'all') {
    const shops = await backendGet<any[]>('/api/v1/shops/admin/list?status=ALL');
    return shops.map(normalizeShopFromBackend);
  }

  if (status === 'pending') {
    const shops = await backendGet<any[]>('/api/v1/shops/admin/list?status=PENDING');
    return shops.map(normalizeShopFromBackend);
  }

  if (status === 'rejected') {
    const shops = await backendGet<any[]>('/api/v1/shops/admin/list?status=REJECTED');
    return shops.map(normalizeShopFromBackend);
  }

  const shops = await backendGet<any[]>('/api/v1/shops');
  return shops.map(normalizeShopFromBackend);
}

export async function updateShopDesignViaBackend(id: string, designConfig: any) {
  return await backendPatch<any>(`/api/v1/shops/${encodeURIComponent(id)}/design`, designConfig);
}

export async function getShopBySlugOrIdViaBackend(slugOrId: string) {
  const shop = await backendGet<any>(`/api/v1/shops/${encodeURIComponent(slugOrId)}`);
  return normalizeShopFromBackend(shop);
}

export async function getShopBySlugViaBackend(slug: string) {
  const shop = await backendGet<any>(`/api/v1/shops/${encodeURIComponent(slug)}`);
  return normalizeShopFromBackend(shop);
}

export async function getMyShopViaBackend() {
  try {
    const shop = await backendGet<any>('/api/v1/shops/me');
    return normalizeShopFromBackend(shop);
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : undefined;
    if (status === 404) {
      try {
        localStorage.removeItem('ray_user');
        localStorage.removeItem('ray_token');
        window.dispatchEvent(new Event('auth-change'));
      } catch {
        // ignore
      }
    }
    throw e;
  }
}

export async function updateMyShopViaBackend(payload: any) {
  const shop = await backendPatch<any>('/api/v1/shops/me', payload);
  return normalizeShopFromBackend(shop);
}

export async function uploadMyShopBannerViaBackend(payload: { file: File; shopId?: string }) {
  const formData = new FormData();
  formData.append('banner', payload.file);
  if (payload.shopId) {
    formData.append('shopId', payload.shopId);
  }
  const data = await backendPost<any>('/api/v1/shops/me/banner', formData);
  return {
    ...data,
    bannerUrl: toBackendUrl(data?.bannerUrl),
    bannerPosterUrl: toBackendUrl(data?.bannerPosterUrl),
    bannerMediumUrl: toBackendUrl(data?.bannerMediumUrl),
  };
}

export async function getShopAdminByIdViaBackend(id: string) {
  const shop = await backendGet<any>(`/api/v1/shops/admin/${encodeURIComponent(id)}`);
  return normalizeShopFromBackend(shop);
}

export async function updateShopStatusViaBackend(id: string, status: 'approved' | 'pending' | 'rejected') {
  const mapped = String(status || '').toUpperCase();
  const updated = await backendPatch<any>(`/api/v1/shops/admin/${encodeURIComponent(id)}/status`, {
    status: mapped,
  });
  return normalizeShopFromBackend(updated);
}

export async function upgradeDashboardConfigViaBackend(payload?: { shopIds?: string[]; dryRun?: boolean }) {
  const body: any = {};
  if (Array.isArray(payload?.shopIds)) body.shopIds = payload?.shopIds;
  if (typeof payload?.dryRun === 'boolean') body.dryRun = payload.dryRun;
  return await backendPost<any>('/api/v1/shops/admin/upgrade-dashboard-config', body);
}

export async function followShopViaBackend(shopId: string) {
  return await backendPost<{ followed: boolean; followers: number }>(
    `/api/v1/shops/${encodeURIComponent(shopId)}/follow`,
    {},
  );
}

export async function incrementVisitorsViaBackend(shopId: string) {
  const sid = String(shopId || '').trim();
  if (!sid) return { error: 'shopId مطلوب' } as any;
  return await backendPost<any>(`/api/v1/shops/${encodeURIComponent(sid)}/visit`, {});
}

export async function getShopAnalyticsViaBackend(shopId: string, opts?: { from?: string; to?: string }) {
  try {
    const params = new URLSearchParams();
    if (opts?.from) params.set('from', String(opts.from));
    if (opts?.to) params.set('to', String(opts.to));
    const qs = params.toString();
    return await backendGet<any>(`/api/v1/shops/${encodeURIComponent(shopId)}/analytics${qs ? `?${qs}` : ''}`);
  } catch {
    return {};
  }
}

export async function getShopGalleryViaBackend(shopId: string) {
  const images = await backendGet<any[]>(`/api/v1/gallery/${shopId}`);
  return (images || []).map((img: any) => ({
    ...img,
    imageUrl: toBackendUrl(img?.imageUrl),
    mediaType: img?.mediaType,
    thumbUrl: toBackendUrl(img?.thumbUrl),
    mediumUrl: toBackendUrl(img?.mediumUrl),
  }));
}

export async function addShopGalleryImageFileViaBackend(shopId: string, image: { file: File; caption?: string }) {
  const formData = new FormData();
  formData.append('image', image.file);
  formData.append('caption', image.caption || '');
  formData.append('shopId', shopId);
  const created = await backendPost<any>(`/api/v1/gallery/upload`, formData);
  return {
    ...created,
    imageUrl: toBackendUrl(created?.imageUrl),
    mediaType: created?.mediaType,
    thumbUrl: toBackendUrl(created?.thumbUrl),
    mediumUrl: toBackendUrl(created?.mediumUrl),
  };
}

export async function deleteShopGalleryImageViaBackend(imageId: string) {
  return backendDelete(`/api/v1/gallery/${imageId}`);
}
