'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface Hotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label?: string;
  productId?: string;
  specialPrice?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ImageMapEditorProps {
  imageUrl: string;
  hotspots: Hotspot[];
  products: Product[];
  onHotspotsChange: (hotspots: Hotspot[]) => void;
  onImageChange: (imageUrl: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

export default function ImageMapEditor({
  imageUrl,
  hotspots,
  products,
  onHotspotsChange,
  onImageChange,
  onUpload,
}: ImageMapEditorProps) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { state: uploadState, handleFileSelect, handleDrop, handleDragOver, reset } = useImageUpload({
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.85,
    onUpload,
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: Date.now().toString(),
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };

    onHotspotsChange([...hotspots, newHotspot]);
    setSelectedHotspot(newHotspot);
    setIsAddMode(false);
  };

  const handleHotspotSelect = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  };

  const handleHotspotDelete = (id: string) => {
    onHotspotsChange(hotspots.filter((h) => h.id !== id));
    if (selectedHotspot?.id === id) {
      setSelectedHotspot(null);
    }
  };

  const handleHotspotUpdate = (updates: Partial<Hotspot>) => {
    if (!selectedHotspot) return;

    const updatedHotspots = hotspots.map((h) =>
      h.id === selectedHotspot.id ? { ...h, ...updates } : h
    );

    onHotspotsChange(updatedHotspots);
    setSelectedHotspot({ ...selectedHotspot, ...updates });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Update parent when upload completes
  React.useEffect(() => {
    if (uploadState.preview && uploadState.progress === 100) {
      onImageChange(uploadState.preview);
    }
  }, [uploadState.preview, uploadState.progress, onImageChange]);

  return (
    <div className="flex gap-4">
      {/* Image Canvas */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-sm">خريطة الصورة</h3>
          <button
            onClick={() => setIsAddMode(!isAddMode)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              isAddMode
                ? 'bg-brand-cyan text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAddMode ? 'إلغاء' : '+ إضافة نقطة'}
          </button>
        </div>

        {/* Image Upload */}
        <div
          className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden mb-4 hover:border-brand-cyan transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploadState.preview || imageUrl ? (
            <div
              ref={containerRef}
              className="relative cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                src={uploadState.preview || imageUrl}
                alt="Image map"
                className="w-full h-64 object-cover"
              />
              
              {/* Hotspots */}
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotSelect(hotspot);
                  }}
                  className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                    selectedHotspot?.id === hotspot.id
                      ? 'bg-brand-cyan border-white scale-110'
                      : 'bg-white border-brand-cyan hover:scale-110'
                  }`}
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                  }}
                >
                  {hotspot.productId && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
              ))}

              {isAddMode && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-cyan/20">
                  <div className="bg-brand-cyan text-white px-4 py-2 rounded-lg text-sm font-bold">
                    انقر لإضافة نقطة
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-50">
              <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-slate-500">اسحب وأفلت صورة هنا</p>
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
          <div className="mb-4">
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

        {/* Hotspots List */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-600">النقاط ({hotspots.length})</h4>
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => handleHotspotSelect(hotspot)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedHotspot?.id === hotspot.id
                  ? 'border-brand-cyan bg-brand-cyan/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-cyan" />
                  <span className="text-sm font-bold">
                    {hotspot.label || `نقطة ${hotspot.id.slice(0, 4)}`}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHotspotDelete(hotspot.id);
                  }}
                  className="p-1 hover:bg-red-50 rounded text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {selectedHotspot && (
          <>
            {/* Label */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">الاسم</label>
              <input
                type="text"
                value={selectedHotspot.label || ''}
                onChange={(e) => handleHotspotUpdate({ label: e.target.value })}
                placeholder="اسم النقطة"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>

            {/* Product Link */}
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">ربط بمنتج</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-2"
              />
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleHotspotUpdate({ productId: product.id })}
                    className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedHotspot.productId === product.id
                        ? 'bg-brand-cyan text-white'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">{product.name}</div>
                    <div className="text-xs opacity-70">{product.price} ر.س</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Price */}
            {selectedHotspot.productId && (
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">سعر خاص</label>
                <input
                  type="number"
                  value={selectedHotspot.specialPrice || ''}
                  onChange={(e) => handleHotspotUpdate({ specialPrice: parseFloat(e.target.value) || undefined })}
                  placeholder="السعر العادي"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
            )}

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">X: {Math.round(selectedHotspot.x)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedHotspot.x}
                  onChange={(e) => handleHotspotUpdate({ x: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Y: {Math.round(selectedHotspot.y)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedHotspot.y}
                  onChange={(e) => handleHotspotUpdate({ y: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={() => setSelectedHotspot(null)}
              className="w-full py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              إلغاء التحديد
            </button>
          </>
        )}

        {!selectedHotspot && (
          <div className="text-center text-sm text-slate-500 py-8">
            اختر نقطة للتعديل
          </div>
        )}
      </div>
    </div>
  );
}