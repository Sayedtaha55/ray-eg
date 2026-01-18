
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import L from 'leaflet';
import { ApiService } from '@/services/api.service';
import { Shop } from '@/types';

const { Link } = ReactRouterDOM as any;

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
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

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

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
        userMarkerRef.current = null;
      }
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

    markersLayerRef.current.clearLayers();

    for (const s of visibleShops) {
      const lat = typeof (s as any)?.latitude === 'number' ? (s as any).latitude : null;
      const lng = typeof (s as any)?.longitude === 'number' ? (s as any).longitude : null;
      if (lat == null || lng == null) continue;

      const marker = L.marker([lat, lng]);
      marker.bindPopup(
        `<div dir="rtl" style="text-align:right; font-weight:700;">
          <div style="font-size:14px;">${String((s as any)?.name || '')}</div>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">${String((s as any)?.city || '')}</div>
        </div>`
      );
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
  }, [visibleShops, coords?.lat, coords?.lng]);

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

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="md:w-[420px] w-full">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 space-y-4">
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

            <div className="text-xs font-black text-slate-500">
              عدد الأنشطة الظاهرة: {visibleShops.length}
            </div>

            <div className="max-h-[420px] overflow-y-auto no-scrollbar space-y-3">
              {loading ? (
                <div className="py-10 text-center text-slate-400 font-bold">جاري التحميل...</div>
              ) : visibleShops.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">لا توجد أنشطة حالياً</div>
              ) : (
                visibleShops.map((s: any) => {
                  const hasCoords = typeof s?.latitude === 'number' && typeof s?.longitude === 'number';
                  return (
                    <button
                      key={String(s.id)}
                      onClick={() => {
                        if (!hasCoords) return;
                        mapRef.current?.setView([s.latitude, s.longitude], 15);
                      }}
                      className="w-full text-right bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 rounded-2xl p-4"
                      disabled={!hasCoords}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-right">
                          <div className="font-black text-slate-900 text-sm">{String(s?.name || '')}</div>
                          <div className="text-slate-400 font-bold text-xs mt-1">{String(s?.city || '')}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s?.isActive === false ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {s?.isActive === false ? 'مقفول' : 'مفتوح'}
                        </span>
                      </div>
                      {!hasCoords && (
                        <div className="text-[10px] font-black text-slate-400 mt-2">لم يتم تحديد الموقع بعد</div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50">
            <div ref={mapContainerRef} className="w-full h-[520px] md:h-[700px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
