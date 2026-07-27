import { backendGet, backendPost } from '../httpClient';

export type MapListingSubmitInput = {
  title: string;
  category?: string;
  description?: string;
  websiteUrl?: string;
  phone?: string;
  whatsapp?: string;
  socialLinks?: any;
  logoUrl?: string;
  coverUrl?: string;
  linkedShopId?: string;
  branch: {
    name?: string;
    latitude: number;
    longitude: number;
    addressLabel?: string;
    governorate?: string;
    city?: string;
    phone?: string;
  };
};

export type MapPin = {
  type: 'shop' | 'listing';
  id: string;
  slug: string | null;
  title: string;
  category: string | null;
  governorate: string;
  city: string;
  latitude: number;
  longitude: number;
  addressLabel: string;
  phone: string;
  logoUrl: string;
  websiteUrl: string | null;
  whatsapp: string | null;
};

export async function submitMapListingViaBackend(input: MapListingSubmitInput) {
  return await backendPost<any>('/api/v1/map-listings/public/submit', input);
}

export async function getMapPinsViaBackend(opts?: {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: string;
  q?: string;
  governorate?: string;
  city?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.lat != null) params.set('lat', String(opts.lat));
  if (opts?.lng != null) params.set('lng', String(opts.lng));
  if (opts?.radiusKm != null) params.set('radiusKm', String(opts.radiusKm));
  if (opts?.category) params.set('category', opts.category);
  if (opts?.q) params.set('q', opts.q);
  if (opts?.governorate) params.set('governorate', opts.governorate);
  if (opts?.city) params.set('city', opts.city);
  const qs = params.toString();
  return await backendGet<MapPin[]>(`/api/v1/map/pins${qs ? `?${qs}` : ''}`);
}

export async function getMapListingViaBackend(id: string) {
  return await backendGet<any>(`/api/v1/map-listings/public/${encodeURIComponent(id)}`);
}

export async function addMapListingBranchViaBackend(listingId: string, branch: {
  name?: string;
  latitude: number;
  longitude: number;
  addressLabel?: string;
  governorate?: string;
  city?: string;
  phone?: string;
}) {
  return await backendPost<any>(`/api/v1/map-listings/${encodeURIComponent(listingId)}/branches`, branch);
}

export async function getPendingMapListingsViaBackend(opts?: { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.limit) params.set('limit', String(opts.limit));
  const qs = params.toString();
  return await backendGet<{ items: any[]; total: number; page: number; limit: number }>(`/api/v1/map-listings/admin${qs ? `?${qs}` : ''}`);
}

export async function approveMapListingViaBackend(id: string, note?: string) {
  return await backendPost<any>(`/api/v1/map-listings/admin/${encodeURIComponent(id)}/approve`, { note: note || '' });
}

export async function rejectMapListingViaBackend(id: string, note?: string) {
  return await backendPost<any>(`/api/v1/map-listings/admin/${encodeURIComponent(id)}/reject`, { note: note || '' });
}
