'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, X, Loader2, Save, Upload, Image as ImageIcon, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { useShop } from '@/hooks/useShop';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import { apiRequest } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ImageMapEditorModal from '@/components/apps/image-editor/ImageMapEditor';

const RESTAURANT_SIZE_NONE = '__NONE__';

type AddonItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  imageUploadFile: File | null;
  hasSmall: boolean;
  hasMedium: boolean;
  hasLarge: boolean;
  priceSmall: string;
  priceMedium: string;
  priceLarge: string;
};

type MenuVariantItem = {
  id: string;
  name: string;
  hasSmall: boolean;
  hasMedium: boolean;
  hasLarge: boolean;
  priceSmall: string;
  priceMedium: string;
  priceLarge: string;
};

const parseNumberInput = (value: any) => {
  if (typeof value === 'number') return value;
  const raw = String(value ?? '').trim();
  if (!raw) return NaN;
  const cleaned = raw
    .replace(/[٠-٩۰-۹]/g, (d) => {
      const map: Record<string, string> = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
        '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      };
      return map[d] || d;
    })
    .replace(/[٬،]/g, '')
    .replace(/[٫]/g, '.')
    .replace(/\s+/g, '');
  return Number(cleaned);
};

export default function RestaurantAddProductPage() {
  const { shop } = useShop();
  const router = useRouter();
  const { isInstalled } = useInstalledApps();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageMapModalOpen, setImageMapModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Product form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Base sizes (small/medium/large for the main product)
  const [baseSizesEnabled, setBaseSizesEnabled] = useState(false);
  const [priceSmall, setPriceSmall] = useState(RESTAURANT_SIZE_NONE);
  const [priceMedium, setPriceMedium] = useState(RESTAURANT_SIZE_NONE);
  const [priceLarge, setPriceLarge] = useState(RESTAURANT_SIZE_NONE);

  // Menu variants (types like "Chicken", "Beef" etc. each with sizes)
  const [menuVariants, setMenuVariants] = useState<MenuVariantItem[]>([]);

  // Addons state
  const [addonItems, setAddonItems] = useState<AddonItem[]>([]);
  const [openAddonId, setOpenAddonId] = useState('');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await apiRequest('/products');
      const list = Array.isArray(data) ? data : (data?.products || data?.data || []);
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiRequest('/categories');
      const list = Array.isArray(data) ? data : (data?.categories || data?.data || []);
      setCategories(list);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleAddMenuVariant = () => {
    const newId = `variant_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setMenuVariants([...menuVariants, {
      id: newId,
      name: '',
      hasSmall: true,
      hasMedium: true,
      hasLarge: true,
      priceSmall: '',
      priceMedium: '',
      priceLarge: '',
    }]);
  };

  const handleRemoveMenuVariant = (id: string) => {
    setMenuVariants(menuVariants.filter(v => v.id !== id));
  };

  const handleUpdateMenuVariant = (id: string, field: keyof MenuVariantItem, value: any) => {
    setMenuVariants(menuVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleAddAddon = () => {
    const newId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setAddonItems([...addonItems, {
      id: newId,
      name: '',
      imageUrl: null,
      imageUploadFile: null,
      hasSmall: true,
      hasMedium: true,
      hasLarge: true,
      priceSmall: '',
      priceMedium: '',
      priceLarge: '',
    }]);
    setOpenAddonId(newId);
  };

  const handleRemoveAddon = (id: string) => {
    setAddonItems(addonItems.filter(a => a.id !== id));
    if (openAddonId === id) setOpenAddonId('');
  };

  const handleUpdateAddon = (id: string, field: keyof AddonItem, value: any) => {
    setAddonItems(addonItems.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddonImageUpload = (addonId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateAddon(addonId, 'imageUploadFile', file);
        handleUpdateAddon(addonId, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    // Build menu variants payload
    const baseSizes: Array<{ id: string; label: string; price: number }> = [];
    if (baseSizesEnabled) {
      if (String(priceSmall) !== RESTAURANT_SIZE_NONE) {
        const ps = parseNumberInput(priceSmall);
        if (!Number.isFinite(ps) || ps <= 0) { alert('سعر الحجم الصغير غير صحيح'); return; }
        baseSizes.push({ id: 'small', label: 'صغير', price: ps });
      }
      if (String(priceMedium) !== RESTAURANT_SIZE_NONE) {
        const pm = parseNumberInput(priceMedium);
        if (!Number.isFinite(pm) || pm <= 0) { alert('سعر الحجم المتوسط غير صحيح'); return; }
        baseSizes.push({ id: 'medium', label: 'متوسط', price: pm });
      }
      if (String(priceLarge) !== RESTAURANT_SIZE_NONE) {
        const pl = parseNumberInput(priceLarge);
        if (!Number.isFinite(pl) || pl <= 0) { alert('سعر الحجم الكبير غير صحيح'); return; }
        baseSizes.push({ id: 'large', label: 'كبير', price: pl });
      }
      if (baseSizes.length === 0) { alert('اختر حجم واحد على الأقل'); return; }
    }

    const mappedVariants = menuVariants.map(v => {
      const tid = v.id.trim();
      const tname = v.name.trim();
      if (!tid || !tname) return null;
      const sizes: Array<{ id: string; label: string; price: number }> = [];
      if (v.hasSmall) {
        const ps = parseNumberInput(v.priceSmall);
        if (!Number.isFinite(ps) || ps <= 0) return null;
        sizes.push({ id: 'small', label: 'صغير', price: ps });
      }
      if (v.hasMedium) {
        const pm = parseNumberInput(v.priceMedium);
        if (!Number.isFinite(pm) || pm <= 0) return null;
        sizes.push({ id: 'medium', label: 'متوسط', price: pm });
      }
      if (v.hasLarge) {
        const pl = parseNumberInput(v.priceLarge);
        if (!Number.isFinite(pl) || pl <= 0) return null;
        sizes.push({ id: 'large', label: 'كبير', price: pl });
      }
      if (sizes.length === 0) return null;
      return { id: tid, name: tname, sizes };
    }).filter(Boolean);

    // Calculate resolved base price
    const parsedPrice = parseNumberInput(price);
    let resolvedBasePrice = parsedPrice;
    if (baseSizesEnabled && baseSizes.length > 0) {
      const prices = baseSizes.map(s => s.price).filter(n => Number.isFinite(n) && n > 0);
      const min = prices.length > 0 ? Math.min(...prices) : NaN;
      if (Number.isFinite(min)) resolvedBasePrice = min;
    }

    if (!Number.isFinite(resolvedBasePrice) || resolvedBasePrice < 0) {
      alert('السعر غير صحيح');
      return;
    }

    const finalMenuVariants = baseSizes.length > 0
      ? [{ id: 'base', name: name.trim(), sizes: baseSizes }, ...mappedVariants]
      : mappedVariants.length > 0 ? mappedVariants : undefined;

    // Build addons payload
    const addonsPayload = addonItems.length > 0
      ? [{
          id: 'addons',
          name: 'إضافات',
          label: 'إضافات',
          title: 'إضافات',
          options: addonItems.map(a => {
            const variants: Array<{ id: string; label: string; price: number }> = [];
            if (a.hasSmall) {
              const ps = parseNumberInput(a.priceSmall);
              if (Number.isFinite(ps) && ps > 0) variants.push({ id: 'small', label: 'صغير', price: ps });
            }
            if (a.hasMedium) {
              const pm = parseNumberInput(a.priceMedium);
              if (Number.isFinite(pm) && pm > 0) variants.push({ id: 'medium', label: 'متوسط', price: pm });
            }
            if (a.hasLarge) {
              const pl = parseNumberInput(a.priceLarge);
              if (Number.isFinite(pl) && pl > 0) variants.push({ id: 'large', label: 'كبير', price: pl });
            }
            return {
              id: a.id,
              name: a.name.trim(),
              imageUrl: a.imageUrl,
              variants,
            };
          }).filter(o => o.name && o.variants.length > 0),
        }]
      : undefined;

    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const shopId = shopData?.id;

      if (!shopId) {
        alert('لم يتم العثور على المتجر');
        return;
      }

      // Upload product image if exists
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

      const productData: any = {
        name: name.trim(),
        description: description.trim() || null,
        price: resolvedBasePrice,
        category: category || 'عام',
        imageUrl: finalImageUrl,
        isActive,
        shopId,
        trackStock: false,
        ...(finalMenuVariants ? { menuVariants: finalMenuVariants } : {}),
        ...(addonsPayload ? { addons: addonsPayload } : {}),
      };

      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      alert('تم إضافة المنتج بنجاح');
      router.push('/dashboard/inventory');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert(err?.message || 'فشل حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
          <span className="text-2xl">🍽️</span>
        </div>
        <div className="text-right flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">إضافة منتج مطعم</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">إضافة منتج مع خيارات الأحجام والأنواع والإضافات</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all"
        >
          <X size={18} />
          <span>إلغاء</span>
        </button>
      </div>

      {/* Product Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">معلومات المنتج الأساسية</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم المنتج *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              placeholder="مثال: بيتزا مارغريتا"
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
              disabled={baseSizesEnabled}
            />
            {baseSizesEnabled && (
              <p className="text-xs text-slate-400 mt-1">السعر يُحسب تلقائياً من الأحجام</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 resize-none"
            placeholder="وصف المنتج..."
          />
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">الفئة</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="">اختر الفئة</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="text-right">
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">صورة المنتج</label>
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
            <div className="flex items-center gap-2">
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
              {isInstalled('image-editor') && (
                <button
                  type="button"
                  onClick={() => setImageMapModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 text-sm font-bold hover:bg-[#00B8CC] transition-all"
                >
                  <Map size={16} />
                  <span>خريطة الصور</span>
                </button>
              )}
            </div>
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
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">نشط</label>
        </div>
      </div>

      {/* Base Sizes Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">أحجام المنتج الأساسية</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={baseSizesEnabled}
              onChange={(e) => setBaseSizesEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">تفعيل الأحجام</span>
          </label>
        </div>

        {baseSizesEnabled && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-700 w-20">صغير</label>
              <input
                type="number"
                value={priceSmall === RESTAURANT_SIZE_NONE ? '' : priceSmall}
                onChange={(e) => setPriceSmall(e.target.value || RESTAURANT_SIZE_NONE)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                placeholder="السعر (اتركه فارغ لتعطيل)"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-700 w-20">متوسط</label>
              <input
                type="number"
                value={priceMedium === RESTAURANT_SIZE_NONE ? '' : priceMedium}
                onChange={(e) => setPriceMedium(e.target.value || RESTAURANT_SIZE_NONE)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                placeholder="السعر (اتركه فارغ لتعطيل)"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-700 w-20">كبير</label>
              <input
                type="number"
                value={priceLarge === RESTAURANT_SIZE_NONE ? '' : priceLarge}
                onChange={(e) => setPriceLarge(e.target.value || RESTAURANT_SIZE_NONE)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                placeholder="السعر (اتركه فارغ لتعطيل)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu Variants Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">أنواع / متغيرات القائمة</h2>
            <p className="text-xs text-slate-400 mt-1">مثال: دجاج، لحم، نباتي — كل نوع له أحجام وأسعار خاصة</p>
          </div>
          <button
            onClick={handleAddMenuVariant}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-all"
          >
            <Plus size={16} />
            <span>إضافة نوع</span>
          </button>
        </div>

        {menuVariants.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package size={32} className="mx-auto mb-2" />
            <p className="text-sm">لا توجد أنواع مضافة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {menuVariants.map((variant) => (
              <div key={variant.id} className="rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleUpdateMenuVariant(variant.id, 'name', e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                    placeholder="اسم النوع (مثال: دجاج)"
                  />
                  <button
                    onClick={() => handleRemoveMenuVariant(variant.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all mr-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={variant.hasSmall}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'hasSmall', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">صغير</label>
                    <input
                      type="number"
                      value={variant.priceSmall}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'priceSmall', e.target.value)}
                      disabled={!variant.hasSmall}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                      placeholder="السعر"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={variant.hasMedium}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'hasMedium', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">متوسط</label>
                    <input
                      type="number"
                      value={variant.priceMedium}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'priceMedium', e.target.value)}
                      disabled={!variant.hasMedium}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                      placeholder="السعر"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={variant.hasLarge}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'hasLarge', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">كبير</label>
                    <input
                      type="number"
                      value={variant.priceLarge}
                      onChange={(e) => handleUpdateMenuVariant(variant.id, 'priceLarge', e.target.value)}
                      disabled={!variant.hasLarge}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                      placeholder="السعر"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Addons Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">الإضافات</h2>
          <button
            onClick={handleAddAddon}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all"
          >
            <Plus size={16} />
            <span>إضافة إضافة</span>
          </button>
        </div>

        {addonItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package size={32} className="mx-auto mb-2" />
            <p className="text-sm">لا توجد إضافات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addonItems.map((addon) => (
              <div key={addon.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenAddonId(openAddonId === addon.id ? '' : addon.id)}
                  className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-slate-900">{addon.name || 'إضافة جديدة'}</span>
                  <div className="flex items-center gap-2">
                    {openAddonId === addon.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAddon(addon.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </button>

                {openAddonId === addon.id && (
                  <div className="p-4 space-y-4">
                    <div className="text-right">
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم الإضافة</label>
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => handleUpdateAddon(addon.id, 'name', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                        placeholder="مثال: جبنة إضافية"
                      />
                    </div>

                    <div className="text-right">
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">صورة الإضافة</label>
                      <div className="flex items-center gap-4">
                        {addon.imageUrl ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={addon.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-300" />
                          </div>
                        )}
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer">
                          <Upload size={14} />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleAddonImageUpload(addon.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 block">الأحجام والأسعار</label>

                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={addon.hasSmall}
                          onChange={(e) => handleUpdateAddon(addon.id, 'hasSmall', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-700">صغير</label>
                        <input
                          type="number"
                          value={addon.priceSmall}
                          onChange={(e) => handleUpdateAddon(addon.id, 'priceSmall', e.target.value)}
                          disabled={!addon.hasSmall}
                          className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                          placeholder="السعر"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={addon.hasMedium}
                          onChange={(e) => handleUpdateAddon(addon.id, 'hasMedium', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-700">متوسط</label>
                        <input
                          type="number"
                          value={addon.priceMedium}
                          onChange={(e) => handleUpdateAddon(addon.id, 'priceMedium', e.target.value)}
                          disabled={!addon.hasMedium}
                          className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                          placeholder="السعر"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={addon.hasLarge}
                          onChange={(e) => handleUpdateAddon(addon.id, 'hasLarge', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <label className="text-sm text-slate-700">كبير</label>
                        <input
                          type="number"
                          value={addon.priceLarge}
                          onChange={(e) => handleUpdateAddon(addon.id, 'priceLarge', e.target.value)}
                          disabled={!addon.hasLarge}
                          className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 disabled:opacity-50"
                          placeholder="السعر"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>حفظ المنتج</span>
        </button>
      </div>

      {/* Image Map Editor Modal */}
      {shop && (
        <ImageMapEditorModal
          open={imageMapModalOpen}
          onClose={() => setImageMapModalOpen(false)}
          shopId={shop.id}
          products={products}
        />
      )}
    </div>
  );
}
