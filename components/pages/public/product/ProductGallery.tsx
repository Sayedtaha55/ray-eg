import React from 'react';
import { motion } from 'framer-motion';

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

  return (
    <div className="space-y-6">
      <MotionDiv
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl"
        onTouchStart={onGalleryTouchStart}
        onTouchEnd={onGalleryTouchEnd}
      >
        {safeActiveSrc ? (
          <img
            loading="lazy"
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
      </MotionDiv>

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
              <img src={src} className="w-full h-full object-cover" alt={`${productName} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGallery);
