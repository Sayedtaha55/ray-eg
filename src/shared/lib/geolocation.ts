export type AppCoords = { lat: number; lng: number };

type GeoPosition = GeolocationPosition;
type GeoError = GeolocationPositionError;

function isFiniteCoord(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

function buildPositionPromise(options: PositionOptions) {
  return new Promise<GeoPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

function getPosWithHardTimeout(options: PositionOptions, hardTimeoutMs: number) {
  const ms = Number.isFinite(hardTimeoutMs) ? Math.max(1000, Math.floor(hardTimeoutMs)) : 10000;
  return new Promise<GeoPosition>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('GEO_HARD_TIMEOUT'));
    }, ms);

    buildPositionPromise(options)
      .then((pos) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(pos);
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(err);
      });
  });
}

export function explainGeoError(err: unknown) {
  const code = Number((err as GeoError | undefined)?.code);
  if (String((err as any)?.message || '') === 'GEO_HARD_TIMEOUT') {
    return 'تحديد الموقع لم يستجب. افتح الموقع عبر HTTPS وفعّل إذن الموقع وجرّب مرة أخرى.';
  }
  if (code === 1) return 'تم رفض إذن الموقع. فعّل إذن الموقع من إعدادات المتصفح.';
  if (code === 2) return 'تعذر تحديد الموقع. تأكد من تشغيل GPS/الإنترنت.';
  if (code === 3) return 'انتهت مهلة تحديد الموقع. جرّب مرة أخرى.';
  return 'فشل تحديد موقعك. تأكد من السماح بالوصول للموقع.';
}

export async function requestPreciseBrowserLocation(): Promise<AppCoords> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('GEO_UNSUPPORTED');
  }

  if (typeof window !== 'undefined' && !(window as any).isSecureContext) {
    throw new Error('GEO_INSECURE_CONTEXT');
  }

  const attempts: Array<{ options: PositionOptions; hardTimeoutMs: number }> = [
    { options: { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }, hardTimeoutMs: 12000 },
    { options: { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }, hardTimeoutMs: 20000 },
  ];

  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      const pos = await getPosWithHardTimeout(attempt.options, attempt.hardTimeoutMs);
      const lat = Number(pos?.coords?.latitude);
      const lng = Number(pos?.coords?.longitude);
      if (!isFiniteCoord(lat) || !isFiniteCoord(lng)) throw new Error('GEO_INVALID_COORDS');
      return { lat, lng };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('GEO_FAILED');
}
