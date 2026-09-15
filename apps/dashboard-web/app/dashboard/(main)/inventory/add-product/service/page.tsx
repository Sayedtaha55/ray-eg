'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Clock,
  Stethoscope,
  ArrowRight,
  Save,
} from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { apiRequest } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ExtendedProductSections, {
  type ProductExtraData,
  defaultExtraData,
} from '@/components/products/ExtendedProductSections';
import { RichDescriptionEditor } from '@/components/products/RichDescriptionEditor';
import {
  OrderFormFieldsBuilder,
  type OrderFormField,
} from '@/components/products/OrderFormFieldsBuilder';

const DURATION_PRESETS = [
  { value: 15, label: '15 دقيقة' },
  { value: 30, label: '30 دقيقة' },
  { value: 45, label: '45 دقيقة' },
  { value: 60, label: 'ساعة' },
  { value: 90, label: 'ساعة ونصف' },
  { value: 120, label: 'ساعتين' },
];

type ServiceExtraData = ProductExtraData & {
  orderFormFields?: OrderFormField[];
  durationMinutes?: number | null;
};

export default function ServiceAddProductPage() {
  const { shop } = useShop();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [editId, setEditId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  // Basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [googleCategory, setGoogleCategory] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [customDuration, setCustomDuration] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [extraData, setExtraData] = useState<ServiceExtraData>(
    defaultExtraData() as ServiceExtraData
  );

  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadCategories = async () => {
    try {
      const data = await apiRequest('/categories');
      const list = Array.isArray(data) ? data : data?.categories || data?.data || [];
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    const editParam = new URLSearchParams(window.location.search).get('edit');
    if (editParam) loadServiceForEdit(editParam);
  }, []);

  const loadServiceForEdit = async (id: string) => {
    setLoadingProduct(true);
    try {
      const data: any = await apiRequest(`/products/${id}`);
      const p = data?.data || data;
      if (!p || !p.id) throw new Error('الخدمة غير موجودة');
      setEditId(String(p.id));
      setName(String(p.name || ''));
      setDescription(String(p.description || ''));
      setPrice(p.price != null ? String(p.price) : '');
      setCategory(typeof p.category === 'string' ? p.category : String(p.category?.name || ''));
      setImageUrl(String(p.imageUrl || p.image_url || ''));
      setIsActive(p.isActive !== false);
      const ex = (p.extraData || {}) as ServiceExtraData;
      setExtraData({ ...defaultExtraData(), ...ex });
      setCostPrice(ex.costPrice != null ? String(ex.costPrice) : '');
      setBrand(String(ex.brand || ''));
      setGoogleCategory(String(ex.googleCategory || ''));
      setLocalCategory(String(ex.localCategory || ''));
      setYoutubeUrl(String(ex.youtubeUrl || ''));
      if (ex.durationMinutes != null && Number(ex.durationMinutes) > 0) {
        const mins = String(ex.durationMinutes);
        if (DURATION_PRESETS.some((d) => String(d.value) === mins)) {
          setDurationMinutes(mins);
          setCustomDuration(false);
        } else {
          setCustomDuration(true);
          setDurationMinutes(mins);
        }
      }
    } catch (err: any) {
      console.error('Failed to load service for edit:', err);
      alert(err?.message || 'تعذر تحميل بيانات الخدمة للتعديل');
    } finally {
      setLoadingProduct(false);
    }
  };

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

      const payload = {
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
        extraData: {
          ...extraData,
          costPrice: costPrice ? Number(costPrice) : null,
          brand: brand || undefined,
          googleCategory: googleCategory || undefined,
          localCategory: localCategory || undefined,
          youtubeUrl: youtubeUrl || undefined,
          durationMinutes: parsedDuration,
        },
      };

      if (editId) {
        await apiRequest(`/products/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        alert('تم تحديث الخدمة بنجاح');
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        alert('تم إضافة الخدمة بنجاح');
      }
      router.push('/dashboard/inventory');
    } catch (err: any) {
      console.error('Failed to save service:', err);
      alert(err?.message || 'فشل حفظ الخدمة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-full bg-[#F4F5F7] p-4 sm:p-6 md:p-8 space-y-6"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center shrink-0">
          <span className="text-2xl">🩺</span>
        </div>
        <div className="text-right flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {editId ? 'تعديل الخدمة' : 'إضافة خدمة'}
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {editId
              ? 'عدّل بيانات الخدمة ونموذج الطلب الخاص بها'
              : 'أضف خدمة بمواعيدها ومدتها وسعرها — بدون مخزون'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/inventory')}
          className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0"
          title="رجوع إلى المنتجات"
        >
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          <X size={18} />
          <span>إلغاء</span>
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">المعلومات الأساسية</h2>

        {/* Image: drag & drop + gallery + youtube */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/'))
                handleImageUpload({ target: { files: [file] } } as any);
            }}
            className={`w-28 h-28 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-center text-slate-300">
                <ImageIcon size={22} className="mx-auto" />
                <span className="text-[9px] font-bold block mt-1">اسحب وأفلت</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-2">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer">
              <Upload size={16} />
              <span>اختر من المعرض</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <div className="w-full sm:w-72 text-right">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                أو أضف رابط يوتيوب
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                dir="ltr"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم المنتج</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="أدخل اسم المنتج"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">السعر *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="أدخل السعر"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">سعر التكلفة</label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="أدخل سعر التكلفة"
            />
          </div>
          <div className="text-right">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 block">التصنيفات</label>
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(true)}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                + فئة جديدة
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            >
              <option value="">اختر التصنيفات</option>
              {categories.map((cat: any) => {
                const val = cat.name || cat.nameAr || cat.name_ar || String(cat.id || '');
                const label = cat.nameAr || cat.name || cat.name_ar || val;
                return (
                  <option key={cat.id || val} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">
              العلامة التجارية
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="اختر العلامة التجارية"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">تصنيفات جوجل</label>
            <input
              type="text"
              value={googleCategory}
              onChange={(e) => setGoogleCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="اختار تصنيف جوجل"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">تصنيف محلي</label>
            <input
              type="text"
              value={localCategory}
              onChange={(e) => setLocalCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="تصنيف محلي"
            />
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
                  onClick={() => {
                    setCustomDuration(false);
                    setDurationMinutes('60');
                  }}
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
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
                <option value="__CUSTOM__">مدة أخرى...</option>
              </select>
            )}
          </div>
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">وصف المنتج</label>
          <RichDescriptionEditor
            value={description}
            onChange={setDescription}
            placeholder="اكتب تفاصيل الخدمة وما تشمله..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
            متاحة للحجز
          </label>
        </div>
      </div>

      {/* Extended sections (advanced, discounts, channels, purchase options, tags, shipping, inventory, SEO, custom fields, notifications) */}
      <ExtendedProductSections value={extraData} onChange={setExtraData} />

      {/* Order form builder — service-specific */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">نموذج الطلب</h2>
        <p className="text-xs text-slate-400 font-bold">
          أضف حقولًا مخصصة تناسب نوع خدمتك — يجيبها العميل أثناء الطلب، وتوصللك مع كل طلب.
        </p>
        <OrderFormFieldsBuilder
          value={extraData.orderFormFields || []}
          onChange={(fields) => setExtraData((prev) => ({ ...prev, orderFormFields: fields }))}
        />
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-sky-100">
        <Stethoscope size={18} className="text-sky-600 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 leading-relaxed">
          الخدمات لا تتبع المخزون — العملاء يحجزون مواعيد ويختارون مقدم الخدمة والوقت المناسب. يمكنك
          إدارة مواعيد الحجز وقائمة مقدمي الخدمة من قسم الحجوزات.
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
          disabled={saving || loadingProduct}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{editId ? 'حفظ التعديلات' : 'حفظ الخدمة'}</span>
        </button>
      </div>
      {/* Quick Add Category Modal */}
      {showQuickCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowQuickCategoryModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between flex-row-reverse">
              <h3 className="text-lg font-black text-slate-900">إضافة تخصص/فئة جديدة سريعة</h3>
              <button
                onClick={() => setShowQuickCategoryModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                اسم التخصص / الفئة *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
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
