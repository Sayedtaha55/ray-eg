'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, MapPin } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useParams } from 'next/navigation';
import { useT } from '@/i18n/useT';

type Coords = { lat: number; lng: number };

interface MapPinType {
  id: string;
  title: string;
  category?: string;
  latitude: number;
  longitude: number;
  logoUrl?: string;
  slug?: string;
}

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

export default function MapPage() {
  const { locale } = useParams<{ locale: string }>();
  const prefix = `/${locale}`;
  const t = useT();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState<MapPinType[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const loadPins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientFetch<unknown>(`/api/v1/map/pins?lat=${coords?.lat || ''}&lng=${coords?.lng || ''}&radiusKm=50`);
      setPins(Array.isArray(data) ? data as MapPinType[] : []);
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    const onRefresh = () => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      } catch {}
      loadPins();
    };

    onRefresh();

    const timer = window.setInterval(() => {
      onRefresh();
    }, 20_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadPins]);

  const handleLocateMe = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError(t('map.geoNotSupported', 'Geolocation is not supported by your browser'));
      return;
    }

    if (typeof window !== 'undefined' && !(window as any).isSecureContext) {
      setLocationError(t('map.geoRequiresHttps', 'Geolocation requires accessing the site over HTTPS.'));
      return;
    }

    setLocating(true);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        });
      });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (err: any) {
      const message = String(err?.message || '').trim();
      if (message.includes('not supported') || message.includes('denied')) {
        setLocationError(t('map.geoNotSupported', 'Geolocation is not supported by your browser'));
      } else if (message.includes('insecure')) {
        setLocationError(t('map.geoRequiresHttps', 'Geolocation requires accessing the site over HTTPS.'));
      } else {
        setLocationError(t('map.geoFailed', "Couldn't determine your location. Please try again."));
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right" dir={dir}>
      <div className="flex items-start justify-between gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{t('map.title', 'Map')}</h1>
          <p className="text-slate-400 font-bold mt-2">{t('map.subtitle', 'Shows only registered businesses on our platform.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${prefix}/`}
            className="px-5 py-3 bg-slate-100 rounded-2xl font-black text-xs md:text-sm text-slate-900 hover:bg-slate-200 transition-all"
          >
            {t('common.back', 'Back')}
          </Link>
        </div>
      </div>

      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50">
        <div className="w-full h-[70vh] md:h-[78vh]">
          {/* Map placeholder — full MapRenderer integration pending */}
          <div className="w-full h-full p-6 md:p-8">
            <div className="h-full w-full rounded-[2rem] border border-slate-200 bg-white/70 backdrop-blur-0 md:backdrop-blur-sm p-6 md:p-8 flex flex-col items-center justify-center gap-4">
              <MapPin size={48} className="text-slate-300" />
              <p className="text-slate-400 font-bold text-lg">{t('map.loadingMap', 'Map is loading...')}</p>
              <p className="text-slate-300 text-sm">{t('map.pinsCount', 'Visible businesses:')} {loading ? '...' : pins.length}</p>
            </div>
          </div>
        </div>

        <div className="absolute left-4 right-4 bottom-4 top-auto md:top-4 md:bottom-auto md:right-4 md:left-auto md:w-[420px] z-[2500] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-0 md:backdrop-blur border border-slate-100 rounded-[2rem] p-4 md:p-5 space-y-3 pointer-events-auto relative shadow-[0_20px_50px_rgba(0,0,0,0.10)]">
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
                e.currentTarget?.focus?.();
              }}
              disabled={locating}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ touchAction: 'manipulation' }}
            >
              {locating ? <Loader2 className="animate-spin" size={16} /> : <><MapPin size={16} /> {t('map.locateMe', 'Locate Me')}</>}
            </button>

            <div className="text-xs font-black text-slate-500 text-center">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : (
                `${t('map.pinsCount', 'Visible businesses:')} ${pins.length}`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
