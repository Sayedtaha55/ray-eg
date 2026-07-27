'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { BACKEND_URL } from '@/lib/api';
import { buildShopMarkerHtml, buildListingMarkerHtml, escapeHtml } from '@/lib/mapUtils';

interface MapPinItem {
  id?: string;
  slug?: string;
  type: string;
  title?: string;
  addressLabel?: string;
  city?: string;
  latitude: number;
  longitude: number;
}

interface Coords { lat: number; lng: number }

export default function MapPage() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState<MapPinItem[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const loadPins = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (coords?.lat != null) params.set('lat', String(coords.lat));
      if (coords?.lng != null) params.set('lng', String(coords.lng));
      params.set('radiusKm', '50');
      const qs = params.toString();
      const res = await fetch(`${BACKEND_URL}/api/v1/map/pins${qs ? `?${qs}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setPins(Array.isArray(data) ? data : (data?.items ?? []));
      } else {
        setPins([]);
      }
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    loadPins();
    const timer = setInterval(loadPins, 20000);
    return () => clearInterval(timer);
  }, [loadPins]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        // @ts-expect-error leaflet CSS has no type declarations
        await import('leaflet/dist/leaflet.css');
        const L = (await import('leaflet')).default;
        if (cancelled) return;
        leafletRef.current = L;

        const markerIcon = (await import('leaflet/dist/images/marker-icon.png')).default as unknown as string;
        const markerIcon2x = (await import('leaflet/dist/images/marker-icon-2x.png')).default as unknown as string;
        const markerShadow = (await import('leaflet/dist/images/marker-shadow.png')).default as unknown as string;

        const defaultIcon = L.icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = defaultIcon;

        const mapEl = mapContainerRef.current;
        if (!mapEl) return;

        if (!mapRef.current) {
          mapRef.current = L.map(mapEl, {
            zoomControl: true,
            attributionControl: false,
          }).setView([30.0444, 31.2357], 12);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(mapRef.current);

          markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }
      } catch (err) {
        console.error('Leaflet load error:', err);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !leafletRef.current) return;
    const L = leafletRef.current;

    markersLayerRef.current.clearLayers();

    for (const p of pins) {
      if (typeof p.latitude !== 'number' || typeof p.longitude !== 'number') continue;

      const isShop = p.type === 'shop';
      const label = String(p.title ?? '').trim();
      const city = String(p.addressLabel ?? p.city ?? '').trim();

      const html = isShop
        ? buildShopMarkerHtml(escapeHtml(label), escapeHtml(city))
        : buildListingMarkerHtml(escapeHtml(label), escapeHtml(city));

      const marker = L.marker([p.latitude, p.longitude], {
        icon: L.divIcon({
          className: '',
          iconSize: isShop ? [250, 62] : [250, 56],
          iconAnchor: isShop ? [125, 62] : [125, 56],
          html,
        }),
      });

      marker.on('click', () => {
        if (isShop && p.slug) {
          router.push(`/shop/${p.slug}`);
        } else if (!isShop && p.id) {
          router.push(`/map/listing/${p.id}`);
        }
      });

      marker.addTo(markersLayerRef.current);
    }
  }, [pins, router]);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !coords) return;
    const L = leafletRef.current;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([coords.lat, coords.lng]);
      userMarkerRef.current.addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
    }

    try {
      const zoom = Math.max(14, Number(mapRef.current?.getZoom?.() ?? 0));
      mapRef.current?.flyTo?.([coords.lat, coords.lng], zoom, { animate: true, duration: 0.7 });
      setTimeout(() => {
        mapRef.current?.invalidateSize?.();
      }, 0);
    } catch {}
  }, [coords]);

  const handleLocateMe = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }
    if (typeof window !== 'undefined' && !(window as any).isSecureContext) {
      setLocationError('تحديد الموقع يتطلب اتصال آمن (HTTPS)');
      return;
    }
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch (err: any) {
      const msg = String(err?.message || '').trim();
      if (msg.includes('denied')) setLocationError('تم رفض إذن تحديد الموقع');
      else if (msg.includes('unavailable')) setLocationError('الموقع غير متاح');
      else if (msg.includes('timeout')) setLocationError('انتهت مهلة تحديد الموقع');
      else setLocationError('تعذر تحديد موقعك');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10" dir="rtl">
      <div className="flex items-start justify-between gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">الخريطة</h1>
          <p className="text-slate-400 font-bold mt-2">اكتشف المتاجر والأنشطة القريبة منك</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs md:text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          العودة
        </button>
      </div>

      <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="w-full h-[70vh] md:h-[78vh]">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        <div className="absolute top-4 right-4 left-4 md:left-auto md:w-[420px] z-[2500] pointer-events-auto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-100 dark:border-slate-800 rounded-[2rem] p-4 md:p-5 space-y-3 pointer-events-auto relative">
            {locationError && (
              <p className="text-red-500 text-xs font-bold text-center">{locationError}</p>
            )}

            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="w-full py-4 bg-brand-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-all"
              style={{ touchAction: 'manipulation' }}
            >
              {locating ? <Loader2 className="animate-spin w-4 h-4" /> : <><MapPin className="w-4 h-4" /> حدد موقعي</>}
            </button>

            <div className="text-xs font-black text-slate-500 text-center">
              {loading ? (
                <span className="inline-block w-40 h-4 skeleton rounded-xl" />
              ) : (
                `عدد الأماكن الظاهرة: ${pins.length}`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
