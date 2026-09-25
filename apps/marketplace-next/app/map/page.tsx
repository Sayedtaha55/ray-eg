'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Store, Briefcase } from 'lucide-react';
import { apiPath } from '@/lib/api';
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

interface Coords {
  lat: number;
  lng: number;
}

// ثيم صفحة الخريطة مطابق للوحة التحكم: أبيض/سليت مع لمسة السماوي #00e5ff
const DASHBOARD_CYAN = '#00e5ff';
const DASHBOARD_DARK = '#0f172a';

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

  // الخريطة تعرض جميع المواقع الموجودة فعليًا — بدون أي تصفية نطاق/مسافة.
  const loadPins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath('/map/pins'));
      if (res.ok) {
        const data = await res.json();
        setPins(Array.isArray(data) ? data : (data?.data ?? data?.items ?? []));
      } else {
        setPins([]);
      }
    } catch {
      setPins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPins();
    // تحديث دوري خفيف — كل الداتا بتنزل مرة واحدة مش ضمن نطاق
    const timer = setInterval(() => {
      if (!document.hidden) loadPins();
    }, 60000);
    const onVisible = () => {
      if (!document.hidden) loadPins();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadPins]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const L = (await import('leaflet')).default;
        if (cancelled) return;
        leafletRef.current = L;

        const mapEl = mapContainerRef.current;
        if (!mapEl) return;

        if (!mapRef.current) {
          mapRef.current = L.map(mapEl, {
            zoomControl: true,
            attributionControl: true,
          }).setView([30.0444, 31.2357], 7);

          // بلاطات فاتحة نظيفة بنفس روح اللوحة (CARTO / OpenStreetMap)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap &copy; CARTO',
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
      userMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: L.divIcon({
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          html: `<div style="width:18px;height:18px;border-radius:999px;background:${DASHBOARD_CYAN};border:3px solid ${DASHBOARD_DARK};box-shadow:0 0 0 4px rgba(0,229,255,0.25);"></div>`,
        }),
      });
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

  const shopCount = pins.filter((p) => p.type === 'shop').length;
  const listingCount = pins.length - shopCount;

  return (
    <div
      className="min-h-screen bg-white"
      dir="rtl"
      style={{ color: DASHBOARD_DARK, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* شريط علوي بنفس هيكل الهيدر في اللوحة */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[2500]">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center">
            <MapPin size={16} style={{ color: DASHBOARD_CYAN }} />
          </span>
          <h1 className="text-sm font-black text-slate-900">الخريطة — جميع المواقع</h1>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-200 transition-all"
        >
          العودة
        </button>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* شريط إحصاءات بنفس شكل الكروت في اللوحة */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 mb-1">إجمالي المواقع</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {loading ? '…' : pins.length}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 mb-1">متاجر</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {loading ? '…' : shopCount}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-500 mb-1">أنشطة</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {loading ? '…' : listingCount}
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <div className="w-full h-[70vh] md:h-[74vh]">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          <div className="absolute top-4 right-4 left-4 md:left-auto md:w-[360px] z-[1000] pointer-events-auto">
            <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 md:p-5 space-y-3 pointer-events-auto relative shadow-sm">
              {locationError && (
                <p className="text-red-500 text-xs font-semibold text-center">{locationError}</p>
              )}

              <button
                onClick={handleLocateMe}
                disabled={locating}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-all"
                style={{ touchAction: 'manipulation' }}
              >
                {locating ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    <MapPin className="w-4 h-4" style={{ color: DASHBOARD_CYAN }} /> حدد موقعي
                  </>
                )}
              </button>

              {/* مفتاح الخريطة */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span
                    className="w-3 h-3 rounded-full inline-flex items-center justify-center"
                    style={{ background: DASHBOARD_DARK }}
                  >
                    <Store size={8} color={DASHBOARD_CYAN} />
                  </span>
                  متجر
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span
                    className="w-3 h-3 rounded-full inline-flex items-center justify-center border"
                    style={{ background: '#ffffff', borderColor: DASHBOARD_CYAN }}
                  >
                    <Briefcase size={8} color={DASHBOARD_DARK} />
                  </span>
                  نشاط
                </span>
                <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                  {loading ? (
                    <span className="inline-block w-16 h-3 rounded bg-slate-100 animate-pulse" />
                  ) : (
                    `${pins.length} موقع`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
