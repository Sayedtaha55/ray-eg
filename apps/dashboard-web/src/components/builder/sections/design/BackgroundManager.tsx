'use client';

import React, { useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface BackgroundManagerProps {
  imageUrl: string | null;
  backgroundColor: string;
  onImageChange: (imageUrl: string | null) => void;
  onColorChange: (color: string) => void;
  onUpload?: (file: File) => Promise<string>;
}

const BACKGROUND_PRESETS = [
  { id: 'mountains', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop', name: 'جبال' },
  { id: 'ice', url: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1600&auto=format&fit=crop', name: 'جليد' },
  { id: 'forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop', name: 'غابة' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600&auto=format&fit=crop', name: 'بحر' },
  { id: 'city', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&auto=format&fit=crop', name: 'مدينة' },
  { id: 'abstract', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop', name: 'تجريدي' },
];

const COLOR_PRESETS = [
  { color: '#FFFFFF', name: 'أبيض' },
  { color: '#F8FAFC', name: 'رمادي فاتح' },
  { color: '#1A1A1A', name: 'أسود' },
  { color: '#0F172A', name: 'كحلي داكن' },
  { color: '#064E3B', name: 'أخضر داكن' },
  { color: '#7C2D12', name: 'بني' },
  { color: '#831843', name: 'وردي داكن' },
  { color: '#4C1D95', name: 'بنفسجي' },
];

export default function BackgroundManager({
  imageUrl,
  backgroundColor,
  onImageChange,
  onColorChange,
  onUpload,
}: BackgroundManagerProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'color'>('image');

  const { state: uploadState, handleFileSelect, handleDrop, handleDragOver, reset } = useImageUpload({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    onUpload,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handlePresetSelect = (url: string) => {
    onImageChange(url);
  };

  const handleDelete = () => {
    onImageChange(null);
    reset();
  };

  // Update parent when upload completes
  React.useEffect(() => {
    if (uploadState.preview && uploadState.progress === 100) {
      onImageChange(uploadState.preview);
    }
  }, [uploadState.preview, uploadState.progress, onImageChange]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'image'
              ? 'text-brand-cyan border-b-2 border-brand-cyan'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          صورة
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'color'
              ? 'text-brand-cyan border-b-2 border-brand-cyan'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          لون
        </button>
      </div>

      {activeTab === 'image' && (
        <>
          {/* Upload Area */}
          <div
            className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-brand-cyan transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {uploadState.preview || imageUrl ? (
              <div className="relative">
                <img
                  src={uploadState.preview || imageUrl || ''}
                  alt="Background preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleDelete}
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
                <p className="text-xs text-slate-400 mt-1">أو اختر من الصور الجاهزة</p>
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

          {/* Presets */}
          <div>
            <h3 className="font-bold text-sm mb-3">صور جاهزة</h3>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.url)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    imageUrl === preset.url
                      ? 'border-brand-cyan ring-2 ring-brand-cyan/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-20 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'color' && (
        <>
          {/* Color Picker */}
          <div>
            <h3 className="font-bold text-sm mb-3">اختر لون</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <h3 className="font-bold text-sm mb-3">ألوان جاهزة</h3>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => onColorChange(preset.color)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    backgroundColor === preset.color
                      ? 'border-brand-cyan ring-2 ring-brand-cyan/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-bold text-sm mb-3">معاينة</h3>
            <div
              className="h-32 rounded-xl border-2 border-slate-200"
              style={{ backgroundColor }}
            >
              {imageUrl && (
                <div className="w-full h-full opacity-30">
                  <img
                    src={imageUrl}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}