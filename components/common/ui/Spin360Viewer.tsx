import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

interface Spin360ViewerProps {
  images: string[];
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function Spin360Viewer({
  images,
  alt = '360° view',
  className = '',
  width = 400,
  height = 400,
}: Spin360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const lastIndexRef = useRef(0);

  const totalFrames = images.length;

  const getIndexFromPosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      return Math.round(ratio * (totalFrames - 1));
    },
    [totalFrames],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      lastIndexRef.current = currentIndex;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentIndex],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const nextIndex = getIndexFromPosition(e.clientX);
      if (nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
        setLoadedImages((prev) => new Set([...prev, nextIndex]));
      }
    },
    [isDragging, currentIndex, getIndexFromPosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch swipe support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    lastIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startXRef.current;
      const step = 30; // pixels per frame
      const framesDiff = Math.round(dx / step);
      let nextIndex = lastIndexRef.current + framesDiff;
      // Wrap around
      nextIndex = ((nextIndex % totalFrames) + totalFrames) % totalFrames;
      setCurrentIndex(nextIndex);
      setLoadedImages((prev) => new Set([...prev, nextIndex]));
    },
    [totalFrames],
  );

  // Auto-rotate on first load
  const [autoRotating, setAutoRotating] = useState(true);
  useEffect(() => {
    if (!autoRotating || totalFrames === 0) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame = (frame + 1) % totalFrames;
      setCurrentIndex(frame);
      setLoadedImages((prev) => new Set([...prev, frame]));
      if (frame === totalFrames - 1) {
        setAutoRotating(false);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [autoRotating, totalFrames]);

  // Preload adjacent images
  useEffect(() => {
    const preload = [currentIndex - 1, currentIndex + 1].map(
      (i) => ((i % totalFrames) + totalFrames) % totalFrames,
    );
    preload.forEach((i) => {
      if (!loadedImages.has(i)) {
        const img = new Image();
        img.src = images[i];
        img.onload = () => setLoadedImages((prev) => new Set([...prev, i]));
      }
    });
  }, [currentIndex, images, loadedImages, totalFrames]);

  if (!images || images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className}`}
      style={{ width, height }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Current frame */}
      {images.map((src, idx) => (
        <img
          key={idx}
          src={src}
          alt={`${alt} - ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-75 ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          draggable={false}
          loading={Math.abs(idx - currentIndex) <= 2 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Drag indicator */}
      {autoRotating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <RotateCw size={12} className="animate-spin" />
            360°
          </div>
        </div>
      )}

      {/* Frame indicator */}
      {!autoRotating && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-20">
          {currentIndex + 1}/{totalFrames}
        </div>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`w-1 h-1 rounded-full transition-colors ${
              idx === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
