import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/common/ui';

const MapContainer = lazy(() => import('./MapContainer'));

interface MapRendererProps {
  shops: any[];
  coords: { lat: number; lng: number } | null;
  onMapReady: () => void;
  navigate: (url: string) => void;
}

const MapRenderer: React.FC<MapRendererProps> = ({ shops, coords, onMapReady, navigate }) => {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8">
        <Skeleton className="w-full h-full rounded-[2rem]" />
      </div>
    }>
      <MapContainer 
        shops={shops} 
        coords={coords} 
        onMapReady={onMapReady} 
        navigate={navigate} 
      />
    </Suspense>
  );
};

export default React.memo(MapRenderer);
