
import React, { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { locationPersistence } from '@/services/locationPersistence';
import { Shop } from '@/types';
import { Skeleton } from '@/components/common/ui';
import { explainGeoError, requestPreciseBrowserLocation } from '@/lib/geolocation';

// Lazy load heavy map components
const MapRenderer = lazy(() => import('@/components/features/map/MapRenderer'));

const { Link, useNavigate } = ReactRouterDOM as any;


type Coords = { lat: number; lng: number };


function haversineDistanceKm(a: Coords, b: Coords) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [coords, setCoords] = useState<Coords | null>(() => locationPersistence.getMapLocation());
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');


  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getShops('approved');
      setShops(Array.isArray(data) ? data : []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onRefresh = () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      } catch {
      }
      loadShops();
    };

    onRefresh();
    window.addEventListener('ray-db-update', onRefresh);
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ray-db');
        bc.onmessage = () => {
          onRefresh();
        };
      }
    } catch {
      bc = null;
    }

    const onStorage = (e: StorageEvent) => {
      if (e && e.key && e.key !== 'ray_db_update_ts') return;
      onRefresh();
    };
    window.addEventListener('storage', onStorage);

    const timer = window.setInterval(() => {
      onRefresh();
    }, 20_000);

    return () => {
      window.removeEventListener('ray-db-update', onRefresh);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
      try { bc?.close(); } catch { }
    };
  }, [loadShops]);


  const visibleShops = useMemo(() => {
    const approved = shops.filter((s: any) => String(s?.status || '').toLowerCase() === 'approved');

    if (!coords) {
      return approved;
    }

    const withDistance = approved
      .map((s: any) => {
        const lat = typeof s?.latitude === 'number' ? s.latitude : null;
        const lng = typeof s?.longitude === 'number' ? s.longitude : null;
        if (lat == null || lng == null) return { shop: s, distanceKm: null as number | null };
        return { shop: s, distanceKm: haversineDistanceKm(coords, { lat, lng }) };
      })
      .sort((a, b) => {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });

    return withDistance.map((x) => x.shop);
  }, [shops, coords]);



  useEffect(() => {
    locationPersistence.setMapLocation(coords);
  }, [coords]);

  const handleLocateMe = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    if (typeof window !== 'undefined' && !(window as any).isSecureContext) {
      setLocationError('تحديد الموقع يحتاج فتح الموقع عبر HTTPS.');
      return;
    }

    setLocating(true);

    try {
      const nextCoords = await requestPreciseBrowserLocation();
      setCoords(nextCoords);
    } catch (err) {
      const message = String((err as any)?.message || '').trim();
      if (message === 'GEO_UNSUPPORTED') {
        setLocationError('المتصفح لا يدعم تحديد الموقع');
      } else if (message === 'GEO_INSECURE_CONTEXT') {
        setLocationError('تحديد الموقع يحتاج فتح الموقع عبر HTTPS.');
      } else {
        setLocationError(explainGeoError(err));
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">الخريطة</h1>
          <p className="text-slate-400 font-bold mt-2">بتعرض المحلات/الأنشطة المسجّلة عندنا فقط.</p>
        </div>
        <Link
          to="/"
          className="px-5 py-3 bg-slate-100 rounded-2xl font-black text-xs md:text-sm text-slate-900 hover:bg-slate-200 transition-all"
        >
          رجوع
        </Link>
      </div>

      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50">
        <div className="w-full h-[70vh] md:h-[78vh]">
          <Suspense fallback={
            <div className="w-full h-full p-6 md:p-8">
              <div className="h-full w-full rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-sm p-6 md:p-8">
                <div className="grid grid-cols-1 gap-5">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-72" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <Skeleton className="h-[38vh] md:h-[44vh] w-full" />
                </div>
              </div>
            </div>
          }>
            <MapRenderer
              shops={visibleShops}
              coords={coords}
              navigate={navigate}
            />
          </Suspense>
        </div>

        <div className="absolute top-4 right-4 left-4 md:left-auto md:w-[420px] z-[2500] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur border border-slate-100 rounded-[2rem] p-4 md:p-5 space-y-3 pointer-events-auto relative">
            {locationError && (
              <p className="text-red-500 text-xs font-bold text-center">{String(locationError)}</p>
            )}

            <button
              onClick={handleLocateMe}
              onTouchStart={(e) => {
                e.preventDefault();
                handleLocateMe();
              }}
              onPointerDown={(e) => {
                // Some mobile browsers may not reliably fire click over map layers.
                // PointerDown provides a more immediate interaction signal.
                // We keep onClick as well for desktop.
                e.currentTarget?.focus?.();
              }}
              disabled={locating}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ touchAction: 'manipulation' }}
            >
              {locating ? <Loader2 className="animate-spin" size={16} /> : <><MapPin size={16} /> تحديد موقعي</>}
            </button>

            <div className="text-xs font-black text-slate-500 text-center">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : (
                `عدد الأنشطة الظاهرة: ${visibleShops.length}`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
