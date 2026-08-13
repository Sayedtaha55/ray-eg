'use client';

import React, { useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Stethoscope, Shield, User2, CheckCircle2, Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  nextAvailable: string;
  photo: string;
}

interface ProvidersSectionProps {
  config: any;
  onChange: (updates: any) => void;
  activityType: 'CLINIC' | 'SALON' | 'HOTEL' | 'RESTAURANT' | 'GENERAL';
}

const VOCABULARY: Record<string, { provider: string; providers: string }> = {
  CLINIC: { provider: 'طبيب', providers: 'الأطباء' },
  SALON: { provider: 'مصمم', providers: 'المصممين' },
  HOTEL: { provider: 'موظف', providers: 'الموظفين' },
  RESTAURANT: { provider: 'نادل', providers: 'النادلين' },
  GENERAL: { provider: 'مقدم خدمة', providers: 'مقدمو الخدمة' },
};

export default function ProvidersSection({
  config,
  onChange,
  activityType,
}: ProvidersSectionProps) {
  const [providers, setProviders] = useState<Provider[]>(config.providers || []);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const vocab = VOCABULARY[activityType] || VOCABULARY.GENERAL;

  const { state: uploadState, handleFileSelect, reset } = useImageUpload({
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.85,
  });

  const handleAddProvider = () => {
    if (!editingProvider) return;

    const newProvider: Provider = {
      id: Date.now().toString(),
      name: editingProvider.name,
      title: editingProvider.title,
      rating: editingProvider.rating,
      reviews: editingProvider.reviews,
      nextAvailable: editingProvider.nextAvailable,
      photo: uploadState.preview || '',
    };

    const updatedProviders = [...providers, newProvider];
    setProviders(updatedProviders);
    onChange({ providers: updatedProviders });
    
    setEditingProvider(null);
    setIsAdding(false);
    reset();
  };

  const handleUpdateProvider = () => {
    if (!editingProvider) return;

    const updatedProviders = providers.map((p) =>
      p.id === editingProvider.id
        ? { ...p, ...editingProvider, photo: uploadState.preview || p.photo }
        : p
    );

    setProviders(updatedProviders);
    onChange({ providers: updatedProviders });
    
    setEditingProvider(null);
    reset();
  };

  const handleDeleteProvider = (id: string) => {
    const updatedProviders = providers.filter((p) => p.id !== id);
    setProviders(updatedProviders);
    onChange({ providers: updatedProviders });
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{vocab.providers}</h3>
        <button
          onClick={() => {
            setEditingProvider({
              id: '',
              name: '',
              title: '',
              rating: 0,
              reviews: 0,
              nextAvailable: '',
              photo: '',
            });
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan text-white text-xs font-bold hover:bg-brand-cyan/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة
        </button>
      </div>

      {/* Providers List */}
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                {provider.photo ? (
                  <img
                    src={provider.photo}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User2 className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{provider.name}</h4>
                <p className="text-xs text-slate-500">{provider.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-500">⭐ {provider.rating}</span>
                  <span className="text-xs text-slate-400">({provider.reviews} تقييم)</span>
                </div>
                {provider.nextAvailable && (
                  <p className="text-xs text-green-500 mt-1">
                    متاح: {provider.nextAvailable}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditProvider(provider)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingProvider) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {isAdding ? `إضافة ${vocab.provider}` : `تعديل ${vocab.provider}`}
              </h3>
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setIsAdding(false);
                  reset();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">الصورة</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden">
                  {uploadState.preview || editingProvider?.photo ? (
                    <img
                      src={uploadState.preview || editingProvider?.photo}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center bg-slate-50">
                      <User2 className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">الاسم</label>
                <input
                  type="text"
                  value={editingProvider?.name || ''}
                  onChange={(e) =>
                    setEditingProvider((prev) => ({ ...(prev || { id: '', name: '', title: '', rating: 0, reviews: 0, nextAvailable: '', photo: '' }), name: e.target.value }))
                  }
                  placeholder={`اسم ${vocab.provider}`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={editingProvider?.title || ''}
                  onChange={(e) =>
                    setEditingProvider((prev) => ({ ...(prev || { id: '', name: '', title: '', rating: 0, reviews: 0, nextAvailable: '', photo: '' }), title: e.target.value }))
                  }
                  placeholder="المسمى الوظيفي"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">التقييم</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editingProvider?.rating || 0}
                  onChange={(e) =>
                    setEditingProvider((prev) => ({ ...(prev || { id: '', name: '', title: '', rating: 0, reviews: 0, nextAvailable: '', photo: '' }), rating: parseFloat(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Next Available */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">التوفر القادم</label>
                <input
                  type="text"
                  value={editingProvider?.nextAvailable || ''}
                  onChange={(e) =>
                    setEditingProvider((prev) => ({ ...(prev || { id: '', name: '', title: '', rating: 0, reviews: 0, nextAvailable: '', photo: '' }), nextAvailable: e.target.value }))
                  }
                  placeholder="مثال: غداً 10:00 ص"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={isAdding ? handleAddProvider : handleUpdateProvider}
                  className="flex-1 py-2 px-4 rounded-xl bg-brand-cyan text-white font-bold text-sm"
                >
                  {isAdding ? 'إضافة' : 'حفظ'}
                </button>
                <button
                  onClick={() => {
                    setEditingProvider(null);
                    setIsAdding(false);
                    reset();
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}