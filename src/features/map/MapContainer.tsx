import React, { useEffect, useRef } from 'react';
import { buildShopMarkerHtml, buildListingMarkerHtml, escapeHtml } from './mapUtils';

interface MapContainerProps {
  pins: any[];
  coords: { lat: number; lng: number } | null;
  onMapReady?: () => void;
  navigate: (url: string) => void;
}


const MapContainer: React.FC<MapContainerProps> = ({ pins, coords, onMapReady, navigate }) => {
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
          navigate(`/s/${p.slug}`);
        } else if (!isShop && p.id) {
          navigate(`/map/listing/${p.id}`);
        }
      });

      marker.addTo(markersLayerRef.current);
    }
  }, [pins, navigate]);

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
    } catch {
    }
  }, [coords]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default React.memo(MapContainer);
