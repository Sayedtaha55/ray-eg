'use client';

import type { AppCoords } from '@/lib/geolocation';

export type PersistedCheckoutLocation = {
  coords: AppCoords | null;
  locationNote: string;
  fallbackAddress: string;
  customerPhone: string;
  customerNote: string;
  updatedAt: number;
};

const CHECKOUT_LOCATION_KEY = 'ray_checkout_location';

function isFiniteCoord(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeCoords(value: any): AppCoords | null {
  if (!value || typeof value !== 'object') return null;
  const lat = typeof value.lat === 'number' ? value.lat : Number(value.lat);
  const lng = typeof value.lng === 'number' ? value.lng : Number(value.lng);
  if (!isFiniteCoord(lat) || !isFiniteCoord(lng)) return null;
  return { lat, lng };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export const locationPersistence = {
  getCheckoutLocation(): PersistedCheckoutLocation {
    if (typeof localStorage === 'undefined') {
      return { coords: null, locationNote: '', fallbackAddress: '', customerPhone: '', customerNote: '', updatedAt: 0 };
    }
    const parsed = safeParse<any>(localStorage.getItem(CHECKOUT_LOCATION_KEY));
    return {
      coords: normalizeCoords(parsed?.coords),
      locationNote: String(parsed?.locationNote || ''),
      fallbackAddress: String(parsed?.fallbackAddress || ''),
      customerPhone: String(parsed?.customerPhone || ''),
      customerNote: String(parsed?.customerNote || ''),
      updatedAt: Number(parsed?.updatedAt || 0) || 0,
    };
  },

  setCheckoutLocation(input: Partial<PersistedCheckoutLocation>) {
    if (typeof localStorage === 'undefined') return;
    const current = locationPersistence.getCheckoutLocation();
    const next: PersistedCheckoutLocation = {
      coords: input.coords === undefined ? current.coords : normalizeCoords(input.coords),
      locationNote: input.locationNote === undefined ? current.locationNote : String(input.locationNote || ''),
      fallbackAddress: input.fallbackAddress === undefined ? current.fallbackAddress : String(input.fallbackAddress || ''),
      customerPhone: input.customerPhone === undefined ? current.customerPhone : String(input.customerPhone || ''),
      customerNote: input.customerNote === undefined ? current.customerNote : String(input.customerNote || ''),
      updatedAt: Date.now(),
    };
    localStorage.setItem(CHECKOUT_LOCATION_KEY, JSON.stringify(next));
  },

  clearCheckoutLocation() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(CHECKOUT_LOCATION_KEY);
  },
};
