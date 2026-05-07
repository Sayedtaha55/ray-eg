'use client';

import React, { useEffect, useState } from 'react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>>; shopId?: string };

const CategorySection: React.FC<Props> = ({ config, setConfig, shopId }) => {
  const t = useT();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const categoryImages = config.categoryImages || {};

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    clientFetch<any[]>(`/v1/shops/${shopId}/products?limit=1000`).then(products => {
      const uniqueCategories = new Set<string>();
      const specialCategories = ['__IMAGE_MAP__', '__DUPLICATE__AUTO__', 'IMAGE_MAP'];
      (products || []).forEach((p: any) => { const cat = String(p?.category || '').trim(); if (cat && !specialCategories.some(s => cat.includes(s))) uniqueCategories.add(cat); });
      setCategories(Array.from(uniqueCategories).sort());
    }).catch(() => {}).finally(() => setLoading(false));
  }, [shopId]);

  const handleImageUpload = async (category: string, file: File) => {
    if (!file) return;
    setUploadingCategory(category);
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(r => { img.onload = r; img.onerror = r; });
      const maxW = 800; let w = img.width; let h = img.height;
      if (w > maxW) { h = (maxW / w) * h; w = maxW; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setConfig({ ...config, categoryImages: { ...categoryImages, [category]: dataUrl } });
    } catch {} finally { setUploadingCategory(null); }
  };

  const handleRemoveImage = (category: string) => { const newImages = { ...categoryImages }; delete newImages[category]; setConfig({ ...config, categoryImages: newImages }); };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.category.iconShape', 'شكل الأيقونة')}</label><select value={String(config.categoryIconShape || 'circular')} onChange={e => setConfig({ ...config, categoryIconShape: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"><option value="circular">{t('business.builder.category.shapeCircular', 'دائري')}</option><option value="square">{t('business.builder.category.shapeSquare', 'مربع')}</option><option value="large">{t('business.builder.category.shapeLarge', 'كبير')}</option></select></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.category.iconSize', 'حجم الأيقونة')}</label><select value={String(config.categoryIconSize || 'medium')} onChange={e => setConfig({ ...config, categoryIconSize: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"><option value="small">{t('business.builder.category.sizeSmall', 'صغير')}</option><option value="medium">{t('business.builder.category.sizeMedium', 'متوسط')}</option><option value="large">{t('business.builder.category.sizeLarge', 'كبير')}</option></select></div>
        <div className="flex items-center justify-between"><span className="font-black text-sm">{t('business.builder.category.showProductsInCategoriesOnly', 'عرض المنتجات حسب الفئة')}</span><input type="checkbox" checked={Boolean(config.showProductsInCategories)} onChange={e => setConfig({ ...config, showProductsInCategories: e.target.checked })} /></div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-4">
        <div className="font-black text-sm text-slate-900">{t('business.builder.category.defaultCategoryImage', 'صورة الفئة الافتراضية')}</div>
        {['__ALL__'].map(key => (
          <div key={key} className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-black text-sm text-slate-900">{t('business.builder.category.allCategories', 'كل الفئات')}</div>
            {categoryImages[key] ? (
              <div className="space-y-2"><img src={categoryImages[key]} alt={key} className="w-20 h-20 object-cover rounded-xl border border-slate-200" /><button type="button" onClick={() => handleRemoveImage(key)} className="text-xs font-black text-red-600 hover:text-red-700">{t('business.builder.category.deleteImage', 'حذف الصورة')}</button></div>
            ) : (
              <div className="space-y-2"><label className="block"><span className="inline-block px-4 py-2 rounded-xl border border-slate-200 bg-white font-black text-sm cursor-pointer hover:bg-slate-50 transition-colors">{uploadingCategory === key ? t('business.builder.category.uploading', 'جاري الرفع...') : t('business.builder.category.uploadFromDevice', 'رفع من جهازك')}</span><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(key, file); }} className="hidden" disabled={uploadingCategory === key} /></label><p className="text-[10px] text-slate-400">{t('business.builder.category.usedAsDefaultImage', 'تُستخدم كصورة افتراضية')}</p></div>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="font-black text-sm text-slate-900">{t('business.builder.category.inventoryCategoryImages', 'صور الفئات')}</div>
        {loading ? <div className="text-xs text-slate-400">{t('business.builder.category.loadingCategories', 'جاري التحميل...')}</div> : categories.length === 0 ? <div className="text-xs text-slate-400">{t('business.builder.category.noCategories', 'لا توجد فئات')}</div> : (
          <div className="space-y-3">{categories.map(category => (
            <div key={category} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="font-black text-sm text-slate-900">{category}</div>
              {categoryImages[category] ? (
                <div className="space-y-2"><img src={categoryImages[category]} alt={category} className="w-20 h-20 object-cover rounded-xl border border-slate-200" /><button type="button" onClick={() => handleRemoveImage(category)} className="text-xs font-black text-red-600 hover:text-red-700">{t('business.builder.category.deleteImage', 'حذف')}</button></div>
              ) : (
                <div className="space-y-2"><label className="block"><span className="inline-block px-4 py-2 rounded-xl border border-slate-200 bg-white font-black text-sm cursor-pointer hover:bg-slate-50 transition-colors">{uploadingCategory === category ? t('business.builder.category.uploading', 'جاري الرفع...') : t('business.builder.category.addImage', 'أضف صورة')}</span><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(category, file); }} className="hidden" disabled={uploadingCategory === category} /></label></div>
              )}
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
