'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Circle, Square, Loader2 } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface CategorySectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
  shopId?: string;
}

export default function CategorySection({ config, onChange, shopId }: CategorySectionProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  const setVal = (key: string, value: any) => {
    onChange({ [key]: value });
  };

  const categoryImages = config.categoryImages || {};

  // Fetch categories from API
  useEffect(() => {
    if (!shopId) {
      // Use sample categories if no shopId
      setCategories(['إلكترونيات', 'ملابس', 'أحذية', 'إكسسوارات', 'منتجات منزلية', 'ألعاب']);
      return;
    }

    setLoading(true);
    // TODO: Replace with actual API call
    // fetch(`/api/shops/${shopId}/products`)
    //   .then(res => res.json())
    //   .then(data => {
    //     const uniqueCategories = new Set<string>();
    //     const specialCategories = ['__IMAGE_MAP__', '__DUPLICATE__AUTO__', 'IMAGE_MAP'];
    //     data.forEach((p: any) => {
    //       const cat = String(p?.category || '').trim();
    //       if (cat && !specialCategories.some(s => cat.includes(s))) {
    //         uniqueCategories.add(cat);
    //       }
    //     });
    //     setCategories(Array.from(uniqueCategories).sort());
    //   })
    //   .catch(err => {
    //     console.error('Failed to fetch categories:', err);
    //     setCategories(['إلكترونيات', 'ملابس', 'أحذية', 'إكسسوارات', 'منتجات منزلية', 'ألعاب']);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
    
    // For now, use sample categories
    setTimeout(() => {
      setCategories(['إلكترونيات', 'ملابس', 'أحذية', 'إكسسوارات', 'منتجات منزلية', 'ألعاب']);
      setLoading(false);
    }, 500);
  }, [shopId]);

  const handleCategoryImageChange = async (category: string, file: File | null) => {
    if (!file) return;
    
    setUploadingCategory(category);
    try {
      // TODO: Replace with actual image upload API
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('category', category);
      // formData.append('shopId', shopId);
      // const response = await fetch('/api/upload/category-image', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const result = await response.json();
      // if (result.url) {
      //   onChange({
      //     categoryImages: {
      //       ...categoryImages,
      //       [category]: result.url,
      //     },
      //   });
      // }
      
      // For now, use local preview
      const url = URL.createObjectURL(file);
      onChange({
        categoryImages: {
          ...categoryImages,
          [category]: url,
        },
      });
    } catch (err) {
      console.error('Failed to upload category image:', err);
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleRemoveCategoryImage = (category: string) => {
    const newImages = { ...categoryImages };
    delete newImages[category];
    onChange({ categoryImages: newImages });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Icon Shape */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          شكل أيقونة القسم
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setVal('categoryIconShape', 'circular')}
            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              config.categoryIconShape === 'circular' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100'
            }`}
          >
            <Circle size={16} />
            <span className="font-black text-sm">دائري</span>
          </button>
          <button
            type="button"
            onClick={() => setVal('categoryIconShape', 'square')}
            className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              config.categoryIconShape === 'square' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100'
            }`}
          >
            <Square size={16} />
            <span className="font-black text-sm">مربع</span>
          </button>
        </div>
      </div>

      {/* Icon Size */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          حجم الأيقونة
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'small', label: 'صغير' },
            { id: 'medium', label: 'متوسط' },
            { id: 'large', label: 'كبير' },
          ].map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => setVal('categoryIconSize', size.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                config.categoryIconSize === size.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100'
              }`}
            >
              <span className="font-black text-sm">{size.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 my-4" />

      {/* Show Products in Categories */}
      <label className="flex items-center justify-between text-xs font-bold text-slate-700">
        إظهار المنتجات داخل الأقسام
        <input
          type="checkbox"
          checked={config.showProductsInCategories || false}
          onChange={(e) => setVal('showProductsInCategories', e.target.checked)}
          className="w-4 h-4 accent-cyan-500"
        />
      </label>

      <div className="h-px bg-slate-100 my-4" />

      {/* Category Images */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
          صور الأقسام (اختياري)
        </label>
        <p className="text-xs font-bold text-slate-500">
          يمكنك رفع صور مخصصة لكل قسم من متجرك
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            <span className="text-xs font-bold text-slate-400 mr-2">جاري تحميل الأقسام...</span>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs font-bold text-slate-400 text-center py-4">
            لا توجد أقسام في متجرك
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category} className="p-3 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-sm">{category}</span>
                  {categoryImages[category] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategoryImage(category)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                {categoryImages[category] ? (
                  <div className="relative w-full h-20 rounded-lg overflow-hidden">
                    <img
                      src={categoryImages[category]}
                      alt={category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-slate-200 hover:border-cyan-400 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCategoryImageChange(category, file);
                        }
                      }}
                      disabled={uploadingCategory === category}
                    />
                    {uploadingCategory === category ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs font-bold">جاري الرفع...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Upload size={16} />
                        <span className="text-xs font-bold">رفع صورة</span>
                      </div>
                    )}
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
