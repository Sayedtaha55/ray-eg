import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface ProductGalleryProps {
  galleryImages: string[];
  activeImageSrc: string;
  setActiveImageSrc: (src: string) => void;
  productName: string;
  hasDiscount: boolean;
  discount?: number;
  onGalleryTouchStart: (e: React.TouchEvent) => void;
  onGalleryTouchEnd: (e: React.TouchEvent) => void;
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
}) => {
  const safeActiveSrc = String(activeImageSrc || '').trim();
  const safeGalleryImages = (galleryImages || []).map((s) => String(s || '').trim()).filter(Boolean);

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

  return (
    <div className="space-y-6">
      <Wrapper
        {...(disableMotion ? {} : { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 } })}
        className="relative aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl"
        onTouchStart={onGalleryTouchStart}
        onTouchEnd={onGalleryTouchEnd}
      >
        {safeActiveSrc ? (
          <img
            loading="lazy"
            decoding="async"
            src={safeActiveSrc}
            className="w-full h-full object-contain"
            alt={productName}
          />
        ) : null}
        {hasDiscount && (
          <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-[#BD00FF] text-white px-4 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-2xl">
            -{discount}%
          </div>
        )}
      </Wrapper>

      {safeGalleryImages.length > 1 && (
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
