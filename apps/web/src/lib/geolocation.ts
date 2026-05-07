'use client';

export interface AppCoords {
  lat: number;
  lng: number;
}

export async function requestPreciseBrowserLocation(): Promise<AppCoords> {
  if (!navigator.geolocation) {
    const err = new Error('GEO_UNSUPPORTED');
    throw err;
  }

  if (typeof location !== 'undefined' && location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    const err = new Error('GEO_INSECURE_CONTEXT');
    throw err;
  }

  return new Promise<AppCoords>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
          resolve({ lat, lng });
        } else {
          reject(new Error('Invalid coordinates received'));
        }
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access.'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('Location unavailable. Please try again.'));
            break;
          case err.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Failed to get location.'));
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 }
    );
  });
}

export function explainGeoError(err: unknown): string {
  const msg = String((err as any)?.message || '').trim();
  if (msg) return msg;
  return 'Failed to get location. Please try again.';
}
