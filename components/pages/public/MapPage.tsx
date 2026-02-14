
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { Shop } from '@/types';
import { Skeleton } from '@/components/common/ui';

const { Link, useNavigate } = ReactRouterDOM as any;

type Coords = { lat: number; lng: number };

function buildShopMarkerHtml(name: string, city: string) {
  return `<div dir="rtl" style="display:flex; flex-direction:column; align-items:center; gap:7px; transform:translateZ(0);">
    <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.96); border:1px solid rgba(226,232,240,0.95); border-radius:999px; padding:8px 12px; box-shadow:0 14px 30px rgba(15,23,42,0.16); cursor:pointer; user-select:none; transition:transform 160ms ease, box-shadow 160ms ease;">
      <div style="display:flex; flex-direction:column; text-align:right; line-height:1.2; min-width:0;">
        <div style="font-weight:950; font-size:12px; color:#0f172a; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</div>
        <div style="font-weight:800; font-size:10px; color:#64748b; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${city}</div>
      </div>
      <div style="background:#0f172a; color:#ffffff; font-weight:950; font-size:10px; padding:5px 12px; border-radius:999px; white-space:nowrap; letter-spacing:0.2px;">زيارة</div>
    </div>
    <div style="width:10px; height:10px; background:#0f172a; border:2px solid #ffffff; border-radius:999px; box-shadow:0 10px 22px rgba(15,23,42,0.20);"></div>
  </div>`;
}

function escapeHtml(input: string) {
  const s = String(input ?? '');
  return s.replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&#39;';
  });
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

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getShops('approved');
      setShops(Array.isArray(data) ? data : []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    window.addEventListener('ray-db-update', loadShops);
    return () => window.removeEventListener('ray-db-update', loadShops);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leaflet = await import('leaflet');
        const markerIconMod: any = await import('leaflet/dist/images/marker-icon.png');
        const markerIcon2xMod: any = await import('leaflet/dist/images/marker-icon-2x.png');
        const markerShadowMod: any = await import('leaflet/dist/images/marker-shadow.png');

        if (cancelled) return;

        const L: any = (leaflet as any)?.default || leaflet;
        leafletRef.current = L;

        const markerIconUrl: string = String(markerIconMod?.default || markerIconMod || '');
        const markerIconRetinaUrl: string = String(markerIcon2xMod?.default || markerIcon2xMod || '');
        const markerShadowUrl: string = String(markerShadowMod?.default || markerShadowMod || '');

        const defaultIcon = L.icon({
          iconUrl: markerIconUrl,
          iconRetinaUrl: markerIconRetinaUrl,
          shadowUrl: markerShadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        });
        (L.Marker.prototype as any).options.icon = defaultIcon;

        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false,
          }).setView([30.0444, 31.2357], 12);

          mapRef.current.whenReady(() => setMapReady(true));

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          }).addTo(mapRef.current);

          markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }
      } catch {
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
        userMarkerRef.current = null;
      }
      leafletRef.current = null;
      setMapReady(false);
    };
  }, []);

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
    if (!mapRef.current) return;
    if (!markersLayerRef.current) return;
    if (!leafletRef.current) return;

    const L: any = leafletRef.current;

    markersLayerRef.current.clearLayers();

    for (const s of visibleShops) {
      const lat = typeof (s as any)?.latitude === 'number' ? (s as any).latitude : null;
      const lng = typeof (s as any)?.longitude === 'number' ? (s as any).longitude : null;
      if (lat == null || lng == null) continue;

      const label = String((s as any)?.mapLabel ?? (s as any)?.map_label ?? (s as any)?.name ?? '').trim();
      const secondary = String((s as any)?.displayAddress ?? (s as any)?.display_address ?? (s as any)?.city ?? '').trim();
      const name = escapeHtml(label || String((s as any)?.name || ''));
      const city = escapeHtml(secondary || String((s as any)?.city || ''));
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          iconSize: [250, 62],
          iconAnchor: [125, 62],
          html: buildShopMarkerHtml(name, city),
        }),
      });
      marker.on('click', () => {
        const slugOrId = String((s as any)?.slug || (s as any)?.id || '').trim();
        if (!slugOrId) return;
        navigate(`/s/${slugOrId}`);
      });
      marker.addTo(markersLayerRef.current);
    }

    if (coords) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([coords.lat, coords.lng]);
        userMarkerRef.current.addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
      }
    }

    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 0);
  }, [visibleShops, coords?.lat, coords?.lng, navigate]);

  const handleLocateMe = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          setLocationError('تعذر الحصول على الموقع');
          setLocating(false);
          return;
        }
        setCoords({ lat, lng });
        mapRef.current?.setView([lat, lng], 14);
        setLocating(false);
      },
      () => {
        setLocationError('فشل تحديد موقعك. تأكد من السماح بالوصول للموقع.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
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
        <div ref={mapContainerRef} className="w-full h-[70vh] md:h-[78vh]" />

        {!mapReady && (
          <div className="absolute inset-0 z-[500] bg-slate-50 pointer-events-none">
            <div className="absolute inset-0 p-6 md:p-8">
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
          </div>
        )}

        <div className="absolute top-4 right-4 left-4 md:left-auto md:w-[420px] z-[1000]">
          <div className="bg-white/95 backdrop-blur border border-slate-100 rounded-[2rem] p-4 md:p-5 space-y-3">
            {locationError && (
              <p className="text-red-500 text-xs font-bold text-center">{String(locationError)}</p>
            )}

            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
