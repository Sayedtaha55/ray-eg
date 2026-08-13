'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface BannerPositionEditorProps {
  imageUrl: string;
  posX: number;
  posY: number;
  onPositionChange: (posX: number, posY: number) => void;
  onImageChange: (imageUrl: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export default function BannerPositionEditor({
  imageUrl,
  posX,
  posY,
  onPositionChange,
  onImageChange,
  onUpload,
}: BannerPositionEditorProps) {
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { state: uploadState, handleFileSelect, handleDrop, handleDragOver, reset } = useImageUpload({
    maxWidth: 1600,
    maxHeight: 900,
    quality: 0.85,
    onUpload,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMoveMode) return;
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isMoveMode) return;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onPositionChange(clampedX, clampedY);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Update parent when upload completes
  useEffect(() => {
    if (uploadState.preview && uploadState.progress === 100) {
      onImageChange(uploadState.preview);
    }
  }, [uploadState.preview, uploadState.progress, onImageChange]);

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <label className="text-xs font-bold text-slate-600 mb-2 block">صورة الشعار</label>
        <div
          className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-brand-cyan transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploadState.preview || imageUrl ? (
            <div className="relative">
              <img
                src={uploadState.preview || imageUrl}
                alt="Banner preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center bg-slate-50">
              <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-slate-500">اسحب وأفلت صورة هنا</p>
              <p className="text-xs text-slate-400 mt-1">أو انقر للاختيار</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        
        {uploadState.uploading && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">جاري المعالجة...</span>
              <span className="font-bold">{uploadState.progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-cyan transition-all"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadState.error && (
          <div className="mt-2 text-xs text-red-500">{uploadState.error}</div>
        )}

        {uploadState.compressedSize && uploadState.originalSize && (
          <div className="mt-2 text-xs text-slate-500">
            <span>الأصلي: {(uploadState.originalSize / 1024).toFixed(1)} KB</span>
            <span className="mx-2">→</span>
            <span>المضغوط: {(uploadState.compressedSize / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </div>

      {/* Position Controls */}
      {(uploadState.preview || imageUrl) && (
        <>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600">وضع الصورة</label>
            <button
              onClick={() => setIsMoveMode(!isMoveMode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                isMoveMode
                  ? 'bg-brand-cyan text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isMoveMode ? 'إكمال' : 'تحريك'}
            </button>
          </div>

          {/* Position Preview */}
          <div
            ref={containerRef}
            className={`relative rounded-xl overflow-hidden border-2 ${
              isMoveMode ? 'border-brand-cyan cursor-move' : 'border-slate-200'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={uploadState.preview || imageUrl}
              alt="Banner"
              className="w-full h-48 object-cover"
              style={{
                objectPosition: `${posX}% ${posY}%`,
              }}
            />
            
            {isMoveMode && (
              <>
                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 229, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20% 20%',
                  }} />
                </div>
                
                {/* Position Indicator */}
                <div
                  className="absolute w-4 h-4 bg-brand-cyan rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                  }}
                />
                
                {/* Instructions */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs text-center py-1 rounded">
                  اسحب لتحريك الصورة
                </div>
              </>
            )}
          </div>

          {/* Manual Position Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">موضع X</label>
              <input
                type="range"
                min="0"
                max="100"
                value={posX}
                onChange={(e) => onPositionChange(parseInt(e.target.value), posY)}
                className="w-full"
              />
              <div className="text-xs text-center font-bold mt-1">{Math.round(posX)}%</div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">موضع Y</label>
              <input
                type="range"
                min="0"
                max="100"
                value={posY}
                onChange={(e) => onPositionChange(posX, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-center font-bold mt-1">{Math.round(posY)}%</div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => onPositionChange(50, 50)}
            className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            إعادة تعيين الموضع
          </button>
        </>
      )}
    </div>
  );
}