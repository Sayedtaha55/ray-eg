import React, { useMemo, useState, Suspense, lazy, useCallback } from 'react';
import SmartImage from './SmartImage';
import Spin360Viewer from './Spin360Viewer';
import { Box, RotateCw, Image } from 'lucide-react';

const Model3DViewer = lazy(() => import('./Model3DViewer'));

interface ProductMediaViewerProps {
  imageUrl?: string;
  images?: string[];
  spinImages?: string[];
  model3dUrl?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  /** Show mode switcher tabs (for product detail page) */
  showModeTabs?: boolean;
}

export type MediaMode = 'image' | '360' | '3d';

export default function ProductMediaViewer({
  imageUrl,
  images,
  spinImages,
  model3dUrl,
  alt = 'Product',
  className = '',
  width,
  height,
  showModeTabs = false,
}: ProductMediaViewerProps) {
  const enable3dMedia = String((import.meta as any)?.env?.VITE_ENABLE_3D_MEDIA || '').trim().toLowerCase() === 'true';
  const hasSpin = enable3dMedia && Array.isArray(spinImages) && spinImages.length >= 2;
  const has3D = enable3dMedia && Boolean(model3dUrl);

  // Auto-select best available mode
  const defaultMode = useMemo<MediaMode>(() => {
    if (has3D) return '3d';
    if (hasSpin) return '360';
    return 'image';
  }, [has3D, hasSpin]);

  const [mode, setMode] = useState<MediaMode>(defaultMode);

  React.useEffect(() => {
    if (!enable3dMedia && mode !== 'image') setMode('image');
  }, [enable3dMedia, mode]);

  // All gallery images
  const galleryImages = useMemo(() => {
    const main = imageUrl ? [imageUrl] : [];
    const extras = Array.isArray(images) ? images : [];
    return [...main, ...extras].map((u) => String(u || '').trim()).filter(Boolean);
  }, [imageUrl, images]);

  const availableModes: MediaMode[] = useMemo(() => {
    const modes: MediaMode[] = ['image'];
    if (hasSpin) modes.push('360');
    if (has3D) modes.push('3d');
    return modes;
  }, [hasSpin, has3D]);

  const modeLabels: Record<MediaMode, string> = {
    image: 'صورة',
    '360': '360°',
    '3d': '3D',
  };

  const prefetch3D = useCallback(() => {
    if (!has3D) return;
    void import('./Model3DViewer');
  }, [has3D]);

  const modeIcons: Record<MediaMode, React.ReactNode> = {
    image: <Image size={12} />,
    '360': <RotateCw size={12} />,
    '3d': <Box size={12} />,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mode tabs */}
      {showModeTabs && availableModes.length > 1 && (
        <div className="absolute top-2 left-2 z-20 flex gap-1">
          {availableModes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              onMouseEnter={m === '3d' ? prefetch3D : undefined}
              onFocus={m === '3d' ? prefetch3D : undefined}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                mode === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-black/30 backdrop-blur-sm text-white/80 hover:bg-black/50'
              }`}
            >
              {modeIcons[m]}
              {modeLabels[m]}
            </button>
          ))}
        </div>
      )}

      {/* 3D badge indicator (when not in showModeTabs) */}
      {!showModeTabs && has3D && mode === '3d' && (
        <div className="absolute top-2 left-2 z-20 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <Box size={10} />
          3D
        </div>
      )}

      {/* 360 badge indicator */}
      {!showModeTabs && hasSpin && mode === '360' && (
        <div className="absolute top-2 left-2 z-20 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <RotateCw size={10} />
          360°
        </div>
      )}

      {/* Content */}
      {mode === '3d' && model3dUrl ? (
        <Suspense
          fallback={
            <div
              className="w-full h-full flex items-center justify-center bg-slate-50"
              style={width && height ? { width, height } : undefined}
            >
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <RotateCw size={24} className="animate-spin" />
                <span className="text-xs font-bold">Loading 3D...</span>
              </div>
            </div>
          }
        >
          <Model3DViewer
            url={model3dUrl}
            width={width}
            height={height}
            autoRotate
          />
        </Suspense>
      ) : mode === '360' && hasSpin ? (
        <Spin360Viewer
          images={spinImages!}
          alt={alt}
          width={width}
          height={height}
        />
      ) : (
        <div
          className="relative overflow-hidden"
          style={width && height ? { width, height } : undefined}
        >
          {galleryImages.length > 0 ? (
            <SmartImage
              src={galleryImages[0]}
              alt={alt}
              className="w-full h-full"
              imgClassName="w-full h-full object-contain"
              optimizeVariant="md"
            />
          ) : (
            <div
              className="bg-slate-100 flex items-center justify-center"
              style={width && height ? { width, height } : { minHeight: 200 }}
            >
              <Image size={32} className="text-slate-300" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
