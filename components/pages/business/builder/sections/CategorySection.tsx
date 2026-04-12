import React, { useEffect, useState } from 'react';
import { ApiService } from '@/services/api.service';
import { compressImage } from '@/lib/image-utils';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shopId?: string;
};

const CategorySection: React.FC<Props> = ({ config, setConfig, shopId }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  // Initialize categoryImages map if not exists
  const categoryImages = config.categoryImages || {};

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    ApiService.getProductsForManage(shopId, { limit: 1000, includeImageMap: false })
      .then((products) => {
        const uniqueCategories = new Set<string>();
        const specialCategories = ['__IMAGE_MAP__', '__DUPLICATE__AUTO__', 'IMAGE_MAP'];
        
        products?.forEach((p: any) => {
          const cat = String(p?.category || '').trim();
          if (cat && !specialCategories.some(s => cat.includes(s))) {
            uniqueCategories.add(cat);
          }
        });
        
        setCategories(Array.from(uniqueCategories).sort());
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shopId]);

  const handleImageUpload = async (category: string, file: File) => {
    if (!file) return;
    
    setUploadingCategory(category);
    try {
      const compressed = await compressImage(file, { maxWidthOrHeight: 800, maxSizeMB: 0.4 });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setConfig({
          ...config,
          categoryImages: {
            ...categoryImages,
            [category]: dataUrl,
          },
        });
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleRemoveImage = (category: string) => {
    const newImages = { ...categoryImages };
    delete newImages[category];
    setConfig({
      ...config,
      categoryImages: newImages,
    });
  };

  const handleDefaultUpload = async (key: string, file: File) => {
    await handleImageUpload(key, file);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل الأيقونة</label>
          <select
            value={String(config.categoryIconShape || 'circular')}
            onChange={(e) => setConfig({ ...config, categoryIconShape: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"
          >
            <option value="circular">دائري</option>
            <option value="square">مربع</option>
            <option value="large">كبير</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">حجم الأيقونة</label>
          <select
            value={String(config.categoryIconSize || 'medium')}
            onChange={(e) => setConfig({ ...config, categoryIconSize: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"
          >
            <option value="small">صغير</option>
            <option value="medium">متوسط</option>
            <option value="large">كبير</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-black text-sm">عرض المنتجات داخل الفئات فقط</span>
          <input
            type="checkbox"
            checked={Boolean(config.showProductsInCategories)}
            onChange={(e) => setConfig({ ...config, showProductsInCategories: e.target.checked })}
          />
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-4">
        <div className="font-black text-sm text-slate-900">صورة الأقسام الافتراضية</div>

        {(['الكل'] as const).map((key) => (
          <div key={key} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-black text-sm text-slate-900">الكل</div>

            {categoryImages[key] ? (
              <div className="space-y-2">
                <img
                  src={categoryImages[key]}
                  alt={key}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(key)}
                  className="text-xs font-black text-red-600 hover:text-red-700"
                >
                  حذف الصورة
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block">
                  <span className="inline-block px-4 py-2 rounded-xl border border-slate-200 bg-white font-black text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                    {uploadingCategory === key ? 'جاري الرفع...' : 'رفع صورة من الجهاز'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDefaultUpload(key, file);
                    }}
                    className="hidden"
                    disabled={uploadingCategory === key}
                  />
                </label>
                <p className="text-[10px] text-slate-400">تُستخدم كصورة افتراضية للأقسام</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="font-black text-sm text-slate-900">صور الأقسام من المخزون</div>
        
        {loading ? (
          <div className="text-xs text-slate-400">جاري تحميل الأقسام...</div>
        ) : categories.length === 0 ? (
          <div className="text-xs text-slate-400">لا توجد أقسام في المخزون</div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-black text-sm text-slate-900">{category}</div>
                
                {categoryImages[category] ? (
                  <div className="space-y-2">
                    <img
                      src={categoryImages[category]}
                      alt={category}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(category)}
                      className="text-xs font-black text-red-600 hover:text-red-700"
                    >
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block">
                      <span className="inline-block px-4 py-2 rounded-xl border border-slate-200 bg-white font-black text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                        {uploadingCategory === category ? 'جاري الرفع...' : 'إضافة صورة'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(category, file);
                        }}
                        className="hidden"
                        disabled={uploadingCategory === category}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">ارفع صورة من جهازك</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
