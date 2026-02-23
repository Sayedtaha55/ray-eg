import React, { useEffect, useRef } from 'react';

interface MapContainerProps {
  shops: any[];
  coords: { lat: number; lng: number } | null;
  onMapReady: () => void;
  navigate: (url: string) => void;
}

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

const MapContainer: React.FC<MapContainerProps> = ({ shops, coords, onMapReady, navigate }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const L = (await import('leaflet')).default;
        if (cancelled) return;
        leafletRef.current = L;

        // Leaflet image fixes for Webpack/Vite
        const markerIcon = (await import('leaflet/dist/images/marker-icon.png')).default;
        const markerIcon2x = (await import('leaflet/dist/images/marker-icon-2x.png')).default;
        const markerShadow = (await import('leaflet/dist/images/marker-shadow.png')).default;

        const defaultIcon = L.icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = defaultIcon;

        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false,
          }).setView([30.0444, 31.2357], 12);

          mapRef.current.whenReady(() => onMapReady());

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

    for (const s of shops) {
      if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number') continue;

      const label = String(s.mapLabel ?? s.name ?? '').trim();
      const city = String(s.displayAddress ?? s.city ?? '').trim();
      
      const marker = L.marker([s.latitude, s.longitude], {
        icon: L.divIcon({
          className: '',
          iconSize: [250, 62],
          iconAnchor: [125, 62],
          html: buildShopMarkerHtml(escapeHtml(label), escapeHtml(city)),
        }),
      });

      marker.on('click', () => {
        const slugOrId = String(s.slug || s.id || '').trim();
        if (slugOrId) navigate(`/s/${slugOrId}`);
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
  }, [shops, coords, navigate]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default React.memo(MapContainer);
