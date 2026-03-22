import React, { useEffect, useRef } from 'react';
import { buildShopMarkerHtml, escapeHtml } from './mapUtils';

interface MapContainerProps {
  shops: any[];
  coords: { lat: number; lng: number } | null;
  onMapReady?: () => void;
  navigate: (url: string) => void;
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

          mapRef.current.whenReady(() => onMapReady?.());

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

      try {
        const zoom = Math.max(14, Number(mapRef.current?.getZoom?.() ?? 0));
        mapRef.current?.flyTo?.([coords.lat, coords.lng], zoom, { animate: true, duration: 0.7 });
        setTimeout(() => {
          mapRef.current?.invalidateSize?.();
        }, 0);
      } catch {
      }
    }
  }, [shops, coords, navigate]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default React.memo(MapContainer);
