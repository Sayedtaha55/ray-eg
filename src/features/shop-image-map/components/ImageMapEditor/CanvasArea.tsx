import React, { memo, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface HotspotMarkerProps {
  id: string;
  x: number;
  y: number;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const HotspotMarker = memo(({ id, x, y, isSelected, onClick }: HotspotMarkerProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick(id);
    }}
    className={`absolute w-5 h-5 sm:w-7 sm:h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-200 ${
      isSelected ? 'bg-cyan-500 border-white scale-110 shadow-lg z-10' : 'bg-white/40 border-white/70 hover:bg-white/60'
    }`}
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className={`absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-20 ${isSelected ? 'block' : 'hidden'}`} />
  </button>
));

interface CanvasAreaProps {
  mapImageUrl: string;
  hotspots: any[];
  selectedId: string;
  addingMode: boolean;
  loading: boolean;
  imageUploading: boolean;
  onCanvasClick: (e: React.MouseEvent) => void;
  onHotspotClick: (id: string) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  mapImageUrl,
  hotspots,
  selectedId,
  addingMode,
  loading,
  imageUploading,
  onCanvasClick,
  onHotspotClick,
  canvasRef,
  fileInputRef
}) => {
  const isLowEndDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    return isMobile && (cores <= 4 || memory <= 4);
  }, []);

  if (loading || imageUploading) {
    return (
      <div className="relative bg-black flex items-center justify-center min-h-[400px]">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="animate-spin" />
          <span className="font-black text-sm">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!mapImageUrl) {
    return (
      <div className="relative bg-black flex items-center justify-center min-h-[400px]">
        <div className="text-white text-center space-y-4 p-8">
          <div className="font-black text-xl">لا توجد صورة خريطة بعد</div>
          <p className="text-slate-400 text-sm font-bold">ارفع صورة للمحل لتبدأ بتحديد المنتجات عليها</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 rounded-2xl bg-[#00E5FF] text-black font-black hover:scale-105 transition-all shadow-xl active:scale-95"
            type="button"
          >
            رفع صورة الخريطة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black flex items-center justify-center overflow-hidden" style={{ contentVisibility: 'auto' }}>
      <div
        ref={canvasRef}
        onClick={onCanvasClick}
        className={`relative w-full h-full flex items-center justify-center p-3 ${addingMode ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        <img 
          src={mapImageUrl} 
          className="max-w-full max-h-full object-contain select-none shadow-2xl" 
          alt="Map"
          loading={isLowEndDevice ? "lazy" : "eager"}
          decoding="async"
        />

        {hotspots.map((h) => (
          <HotspotMarker
            key={h.id}
            id={h.id}
            x={h.x}
            y={h.y}
            isSelected={selectedId === h.id}
            onClick={onHotspotClick}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(CanvasArea);
