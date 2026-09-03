'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, Upload, Image as ImageIcon, Clock, Stethoscope } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { apiRequest } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const DURATION_PRESETS = [
  { value: 15, label: '15 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: 'ساعة' },
  { value: 90, label: 'ساعة ونصف' },
  { value: 120, label: 'ساعتين' },
];

export default function ServiceAddProductPage() {
  const { shop } = useShop();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [customDuration, setCustomDuration] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadCategories = async () => {
    try {
      const data = await apiRequest('/categories');
      const list = Array.isArray(data) ? data : (data?.categories || data?.data || []);
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleQuickAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, nameAr: trimmed, shopId: sid, status: 'active' }),
      });
      setNewCategoryName('');
      setShowQuickCategoryModal(false);
      await loadCategories();
      setCategory(trimmed);
    } catch (err) {
      alert('حدث خطأ أثناء إضافة التخصص/الفئة');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('يرجى إدخال اسم الخدمة');
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert('السعر غير صحيح');
      return;
    }

    const parsedDuration = Number(durationMinutes);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      alert('مدة الخدمة غير صحيحة');
      return;
    }

    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const shopId = shopData?.id;

      if (!shopId) {
        alert('لم يتم العثور على المتجر');
        return;
      }

      let finalImageUrl = imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('purpose', 'product_image');
        const uploadResponse = await apiRequest(`/media/upload?shopId=${shopId}`, {
          method: 'POST',
          body: formData,
        });
        finalImageUrl = uploadResponse?.url || imageUrl;
      }

      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: parsedPrice,
          category: category || 'خدمات عامة',
          imageUrl: finalImageUrl,
          isActive,
          shopId,
          unit: 'service',
          trackStock: false,
          durationMinutes: parsedDuration,
        }),
      });

      alert('تم إضافة الخدمة بنجاح');
      router.push('/dashboard/inventory');
    } catch (err: any) {
      console.error('Failed to save service:', err);
      alert(err?.message || 'فشل حفظ الخدمة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center shrink-0">
          <span className="text-2xl">🩺</span>
        </div>
        <div className="text-right flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">إضافة خدمة</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">أضف خدمة بمواعيدها ومدتها وسعرها — بدون مخزون</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          <X size={18} />
          <span>إلغاء</span>
        </button>
      </div>

      {/* Service Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">بيانات الخدمة</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم الخدمة *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="مثال: استشارة طبية / جلسة علاج طبيعي"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">السعر (ج.م) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-right">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 block">التخصص / الفئة</label>
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(true)}
                className="text-xs font-bold text-[#00E5FF] hover:underline"
              >
                + فئة جديدة
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="">اختر التخصص / الفئة</option>
              {categories.map((cat: any) => {
                const val = cat.name || cat.nameAr || cat.name_ar || String(cat.id || '');
                const label = cat.nameAr || cat.name || cat.name_ar || val;
                return (
                  <option key={cat.id || val} value={val}>{label}</option>
                );
              })}
            </select>
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Clock size={12} />
              مدة الخدمة
            </label>
            {customDuration ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  min="5"
                  step="5"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                  placeholder="بالدقائق"
                />
                <button
                  type="button"
                  onClick={() => { setCustomDuration(false); setDurationMinutes('60'); }}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all shrink-0"
                >
                  قوائم جاهزة
                </button>
              </div>
            ) : (
              <select
                value={durationMinutes}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setCustomDuration(true);
                    setDurationMinutes('');
                  } else {
                    setDurationMinutes(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              >
                {DURATION_PRESETS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
                <option value="__CUSTOM__">مدة أخرى...</option>
              </select>
            )}
          </div>
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">وصف الخدمة</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 resize-none"
            placeholder="تفاصيل الخدمة وما تشمله..."
          />
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">صورة الخدمة</label>
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                <ImageIcon size={32} className="text-slate-300" />
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">
              <Upload size={16} />
              <span>رفع صورة</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">متاحة للحجز</label>
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-sky-100">
        <Stethoscope size={18} className="text-sky-600 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 leading-relaxed">
          الخدمات لا تتبع المخزون — العملاء يحجزون مواعيد ويختارون مقدم الخدمة والوقت المناسب.
          يمكنك إدارة مواعيد الحجز وقائمة مقدمي الخدمة من قسم الحجوزات.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          <span>حفظ الخدمة</span>
        </button>
      </div>
      {/* Quick Add Category Modal */}
      {showQuickCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowQuickCategoryModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between flex-row-reverse">
              <h3 className="text-lg font-black text-slate-900">إضافة تخصص/فئة جديدة سريعة</h3>
              <button onClick={() => setShowQuickCategoryModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">اسم التخصص / الفئة *</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="مثال: استشارات عامة"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleQuickAddCategory}
                className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة التخصص
              </button>
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
