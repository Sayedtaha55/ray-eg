import type { AppCoords } from '@/lib/geolocation';

export type PersistedCoords = AppCoords;

export type PersistedCheckoutLocation = {
  coords: PersistedCoords | null;
  locationNote: string;
  fallbackAddress: string;
  customerPhone: string;
  customerNote: string;
  updatedAt: number;
};

const MAP_LOCATION_KEY = 'ray_map_selected_location';
const CHECKOUT_LOCATION_KEY = 'ray_checkout_location';

function isFiniteCoord(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeCoords(value: any): PersistedCoords | null {
  if (!value || typeof value !== 'object') return null;
  const lat = typeof value.lat === 'number' ? value.lat : Number(value.lat);
  const lng = typeof value.lng === 'number' ? value.lng : Number(value.lng);
  if (!isFiniteCoord(lat) || !isFiniteCoord(lng)) return null;
  return { lat, lng };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const locationPersistence = {
  getMapLocation(): PersistedCoords | null {
    if (typeof localStorage === 'undefined') return null;
    const parsed = safeParse<any>(localStorage.getItem(MAP_LOCATION_KEY));
    return normalizeCoords(parsed);
  },

  setMapLocation(coords: PersistedCoords | null) {
    if (typeof localStorage === 'undefined') return;
    if (!coords) {
      localStorage.removeItem(MAP_LOCATION_KEY);
      return;
    }
    localStorage.setItem(MAP_LOCATION_KEY, JSON.stringify(coords));
  },

  getCheckoutLocation(): PersistedCheckoutLocation {
    if (typeof localStorage === 'undefined') {
      return { coords: locationPersistence.getMapLocation(), locationNote: '', fallbackAddress: '', customerPhone: '', customerNote: '', updatedAt: 0 };
    }
    const parsed = safeParse<any>(localStorage.getItem(CHECKOUT_LOCATION_KEY));
    return {
      coords: normalizeCoords(parsed?.coords) ?? locationPersistence.getMapLocation(),
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
