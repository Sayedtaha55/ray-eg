import React, { useMemo, useState, Suspense, lazy } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, RotateCw } from 'lucide-react';

const Spin360Viewer = lazy(() => import('@/components/common/ui/Spin360Viewer'));
const Model3DViewer = lazy(() => import('@/components/common/ui/Model3DViewer'));

const MotionDiv = motion.div as any;

type MediaMode = 'image' | '360' | '3d';

interface ProductGalleryProps {
  galleryImages: string[];
  activeImageSrc: string;
  setActiveImageSrc: (src: string) => void;
  productName: string;
  hasDiscount: boolean;
  discount?: number;
  onGalleryTouchStart: (e: React.TouchEvent) => void;
  onGalleryTouchEnd: (e: React.TouchEvent) => void;
  spinImages?: string[];
  model3dUrl?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  galleryImages,
  activeImageSrc,
  setActiveImageSrc,
  productName,
  hasDiscount,
  discount,
  onGalleryTouchStart,
  onGalleryTouchEnd,
  spinImages,
  model3dUrl,
}) => {
  const enable3dMedia = String((import.meta as any)?.env?.VITE_ENABLE_3D_MEDIA || '').trim().toLowerCase() === 'true';
  const safeActiveSrc = String(activeImageSrc || '').trim();
  const safeGalleryImages = (galleryImages || []).map((s) => String(s || '').trim()).filter(Boolean);
  const safeSpinImages = useMemo(
    () => (Array.isArray(spinImages) ? spinImages.map((s) => String(s || '').trim()).filter(Boolean) : []),
    [spinImages],
  );
  const has3D = enable3dMedia && Boolean(model3dUrl);
  const hasSpin = enable3dMedia && safeSpinImages.length >= 2;

  const availableModes: MediaMode[] = useMemo(() => {
    const modes: MediaMode[] = ['image'];
    if (hasSpin) modes.push('360');
    if (has3D) modes.push('3d');
    return modes;
  }, [hasSpin, has3D]);

  const [mode, setMode] = useState<MediaMode>('image');

  React.useEffect(() => {
    if (!enable3dMedia && mode !== 'image') setMode('image');
  }, [enable3dMedia, mode]);

  const prefersReducedMotion = useReducedMotion();
  const isLowEndDevice = useMemo(() => {
    try {
      const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : undefined;
      const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const disableMotion = Boolean(prefersReducedMotion) || isLowEndDevice;
  const Wrapper: any = disableMotion ? 'div' : MotionDiv;

  const modeLabels: Record<MediaMode, string> = { image: 'صورة', '360': '360°', '3d': '3D' };
  const modeIcons: Record<MediaMode, React.ReactNode> = {
    image: null,
    '360': <RotateCw size={10} />,
    '3d': <Box size={10} />,
  };

  return (
    <div className="space-y-6">
      {/* Mode switcher */}
      {availableModes.length > 1 && (
        <div className="flex gap-2 flex-row-reverse">
          {availableModes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                mode === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {modeIcons[m]}
              {modeLabels[m]}
            </button>
          ))}
        </div>
      )}

      {/* Main viewer */}
      <Wrapper
        {...(disableMotion ? {} : { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } })}
        className="relative aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl"
        onTouchStart={mode === 'image' ? onGalleryTouchStart : undefined}
        onTouchEnd={mode === 'image' ? onGalleryTouchEnd : undefined}
      >
        {mode === '3d' && model3dUrl ? (
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RotateCw size={24} className="animate-spin" />
                  <span className="text-xs font-bold">Loading 3D...</span>
                </div>
              </div>
            }
          >
            <Model3DViewer url={model3dUrl} autoRotate />
          </Suspense>
        ) : mode === '360' && hasSpin ? (
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RotateCw size={24} className="animate-spin" />
                  <span className="text-xs font-bold">Loading 360°...</span>
                </div>
              </div>
            }
          >
            <Spin360Viewer images={safeSpinImages} alt={productName} />
          </Suspense>
        ) : (
          <>
            {safeActiveSrc ? (
              <img
                loading="lazy"
                decoding="async"
                src={safeActiveSrc}
                className="w-full h-full object-contain"
                alt={productName}
              />
            ) : null}
          </>
        )}

        {hasDiscount && mode === 'image' && (
          <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-[#BD00FF] text-white px-4 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-2xl">
            -{discount}%
          </div>
        )}
      </Wrapper>

      {/* Thumbnails (only in image mode) */}
      {mode === 'image' && safeGalleryImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar flex-row-reverse">
          {safeGalleryImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageSrc(src)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                safeActiveSrc === src ? 'border-[#00E5FF] scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={src}
                className={`w-full h-full object-cover ${disableMotion ? '' : 'transition-transform duration-500'}`}
                alt={`${productName} ${idx + 1}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGallery);
