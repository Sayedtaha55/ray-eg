'use client';

import React, { useState, useCallback } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import SmartImage from '@/components/common/SmartImage';

interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbUrl: string;
  mediumUrl: string;
  caption: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
}

interface GalleryManagerProps {
  items: GalleryItem[];
  onAdd: (file: File, caption?: string) => Promise<GalleryItem>;
  onUpdate: (id: string, caption: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder?: (items: GalleryItem[]) => Promise<void>;
  maxItems?: number;
}

export default function GalleryManager({
  items,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
  maxItems = 50,
}: GalleryManagerProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { state: uploadState, handleFileSelect, handleDrop, handleDragOver, reset } = useImageUpload({
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.85,
  });

  const handleUpload = useCallback(async (file: File) => {
    if (items.length >= maxItems) {
      alert(`الحد الأقصى هو ${maxItems} عنصر`);
      return;
    }

    setIsUploading(true);
    try {
      const newItem = await onAdd(file, caption);
      setCaption('');
      reset();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('فشل في رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  }, [items.length, maxItems, caption, onAdd, reset]);

  const handleUpdateCaption = useCallback(async () => {
    if (!selectedItem) return;

    try {
      await onUpdate(selectedItem.id, caption);
      setSelectedItem(null);
      setCaption('');
    } catch (error) {
      console.error('Update failed:', error);
      alert('فشل في تحديث الوصف');
    }
  }, [selectedItem, caption, onUpdate]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      await onDelete(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
        setCaption('');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('فشل في حذف العنصر');
    }
  }, [selectedItem, onDelete]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleItemDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex || !onReorder) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    try {
      await onReorder(newItems);
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-cyan transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-bold text-slate-600">اسحب وأفلت الصور والفيديوهات هنا</p>
            <p className="text-xs text-slate-400 mt-1">أو انقر للاختيار من جهازك</p>
          </div>
        </label>

        {uploadState.uploading && (
          <div className="mt-4">
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
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleItemDragOver}
            onDrop={(e) => handleItemDrop(e, index)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
              selectedItem?.id === item.id
                ? 'border-brand-cyan ring-2 ring-brand-cyan/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <SmartImage
              src={item.imageUrl}
              alt={item.caption || `Gallery item ${index + 1}`}
              variant="thumb"
              className="w-full aspect-square object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setCaption(item.caption);
                }}
                className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                title="تعديل الوصف"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="حذف"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Media Type Badge */}
            {item.mediaType === 'video' && (
              <div className="absolute top-2 right-2 p-1 bg-black/50 rounded">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption Editor */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">تعديل الوصف</h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="أضف وصفاً للصورة..."
              className="w-full p-3 rounded-xl border border-slate-200 resize-none h-32 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateCaption}
                className="flex-1 py-2 px-4 rounded-xl bg-brand-cyan text-white font-bold hover:bg-brand-cyan/90 transition-colors"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setCaption('');
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-slate-500 text-center">
        {items.length} / {maxItems} عنصر
      </div>
    </div>
  );
}