import React from 'react';
import { Label } from '@/components/ui/label';
import { Ruler } from 'lucide-react';

const RESTAURANT_SIZE_NONE = '__NONE__';

interface BasicInfoSectionProps {
  name: string;
  setName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  groceryPackEnabled?: boolean;
  setGroceryPackEnabled?: (v: boolean) => void;
  restaurantBaseSizesEnabled?: boolean;
  setRestaurantBaseSizesEnabled?: (v: boolean) => void;
  restaurantPriceSmall?: string;
  setRestaurantPriceSmall?: (v: string) => void;
  restaurantPriceMedium?: string;
  setRestaurantPriceMedium?: (v: string) => void;
  restaurantPriceLarge?: string;
  setRestaurantPriceLarge?: (v: string) => void;
  stock: string;
  setStock: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isRestaurant: boolean;
  hideStock?: boolean;
  isFashion: boolean;
  fashionSizeItems: any[];
  namePlaceholder?: string;
  categoryPlaceholder?: string;
  descriptionPlaceholder?: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name, setName,
  price, setPrice,
  groceryPackEnabled,
  setGroceryPackEnabled,
  restaurantBaseSizesEnabled,
  setRestaurantBaseSizesEnabled,
  restaurantPriceSmall,
  setRestaurantPriceSmall,
  restaurantPriceMedium,
  setRestaurantPriceMedium,
  restaurantPriceLarge,
  setRestaurantPriceLarge,
  stock, setStock,
  cat, setCat,
  description, setDescription,
  isRestaurant,
  hideStock = false,
  isFashion,
  fashionSizeItems,
  namePlaceholder,
  categoryPlaceholder,
  descriptionPlaceholder,
}) => {
  const resolvedNamePlaceholder =
    String(namePlaceholder || '').trim() || (isRestaurant ? 'مثلاً: بيتزا مارجريتا' : isFashion ? 'مثلاً: قميص أبيض قطن' : 'مثلاً: منتج جديد');
  const resolvedCategoryPlaceholder =
    String(categoryPlaceholder || '').trim() || (isRestaurant ? 'مثلاً: وجبات - مشروبات - إضافات' : isFashion ? 'مثلاً: ملابس صيفية' : 'مثلاً: منتجات منزلية');
  const resolvedDescriptionPlaceholder =
    String(descriptionPlaceholder || '').trim() || (isRestaurant ? 'مثلاً: مكونات الوجبة...' : 'مثلاً: تفاصيل المنتج، طريقة الاستخدام...');

  const canToggleRestaurantBaseSizes = Boolean(
    isRestaurant &&
      typeof setRestaurantBaseSizesEnabled === 'function' &&
      typeof setRestaurantPriceSmall === 'function' &&
      typeof setRestaurantPriceMedium === 'function' &&
      typeof setRestaurantPriceLarge === 'function',
  );
  const baseSizesEnabled = Boolean(restaurantBaseSizesEnabled);

  const smallDisabled = String(restaurantPriceSmall ?? '') === RESTAURANT_SIZE_NONE;
  const mediumDisabled = String(restaurantPriceMedium ?? '') === RESTAURANT_SIZE_NONE;
  const largeDisabled = String(restaurantPriceLarge ?? '') === RESTAURANT_SIZE_NONE;

  const hasSmall = baseSizesEnabled && !smallDisabled;
  const hasMedium = baseSizesEnabled && !mediumDisabled;
  const hasLarge = baseSizesEnabled && !largeDisabled;

  const canToggleGroceryPack = Boolean(!isRestaurant && typeof setGroceryPackEnabled === 'function');
  const packEnabled = Boolean(groceryPackEnabled);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم الصنف</label>
        <input
          required
          placeholder={resolvedNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
        />
      </div>

      <div className={`grid grid-cols-1 ${isRestaurant || hideStock ? '' : 'md:grid-cols-2'} gap-6`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">السعر (ج.م)</label>
            {canToggleRestaurantBaseSizes ? (
              <button
                type="button"
                onClick={() => {
                  const next = !baseSizesEnabled;
                  setRestaurantBaseSizesEnabled?.(next);
                  if (next) {
                    setPrice('');
                  } else {
                    setRestaurantPriceSmall?.('');
                    setRestaurantPriceMedium?.('');
                    setRestaurantPriceLarge?.('');
                  }
                }}
                className={`flex items-center gap-2 text-[10px] font-black px-3 py-2 rounded-xl border transition-colors ${baseSizesEnabled ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'}`}
              >
                <Ruler size={14} />
                {baseSizesEnabled ? 'لا يوجد' : 'أحجام'}
              </button>
            ) : canToggleGroceryPack ? (
              <button
                type="button"
                onClick={() => {
                  const next = !packEnabled;
                  setGroceryPackEnabled?.(next);
                  if (next) {
                    setPrice('');
                  }
                }}
                className={`flex items-center gap-2 text-[10px] font-black px-3 py-2 rounded-xl border transition-colors ${packEnabled ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'}`}
              >
                باقة
              </button>
            ) : null}
          </div>

          {isRestaurant && baseSizesEnabled ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صغير</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentlyDisabled = String(restaurantPriceSmall ?? '') === RESTAURANT_SIZE_NONE;
                      setRestaurantPriceSmall?.(currentlyDisabled ? '' : RESTAURANT_SIZE_NONE);
                    }}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                  >
                    {hasSmall ? 'لا يوجد' : 'موجود'}
                  </button>
                </div>
                <input
                  type="number"
                  disabled={!hasSmall}
                  placeholder={hasSmall ? '0' : 'لا يوجد'}
                  value={hasSmall ? String(restaurantPriceSmall ?? '') : ''}
                  onChange={(e) => setRestaurantPriceSmall?.(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">وسط</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentlyDisabled = String(restaurantPriceMedium ?? '') === RESTAURANT_SIZE_NONE;
                      setRestaurantPriceMedium?.(currentlyDisabled ? '' : RESTAURANT_SIZE_NONE);
                    }}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                  >
                    {hasMedium ? 'لا يوجد' : 'موجود'}
                  </button>
                </div>
                <input
                  type="number"
                  disabled={!hasMedium}
                  placeholder={hasMedium ? '0' : 'لا يوجد'}
                  value={hasMedium ? String(restaurantPriceMedium ?? '') : ''}
                  onChange={(e) => setRestaurantPriceMedium?.(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">كبير</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentlyDisabled = String(restaurantPriceLarge ?? '') === RESTAURANT_SIZE_NONE;
                      setRestaurantPriceLarge?.(currentlyDisabled ? '' : RESTAURANT_SIZE_NONE);
                    }}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                  >
                    {hasLarge ? 'لا يوجد' : 'موجود'}
                  </button>
                </div>
                <input
                  type="number"
                  disabled={!hasLarge}
                  placeholder={hasLarge ? '0' : 'لا يوجد'}
                  value={hasLarge ? String(restaurantPriceLarge ?? '') : ''}
                  onChange={(e) => setRestaurantPriceLarge?.(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 px-6 font-black text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all disabled:opacity-60"
                />
              </div>
            </div>
          ) : packEnabled && !isRestaurant ? (
            <div className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right opacity-60">
              تم تفعيل الباقة
            </div>
          ) : (
            <input
              required={!isRestaurant && (!isFashion || fashionSizeItems.length === 0)}
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
            />
          )}

          {packEnabled && !isRestaurant ? (
            <div className="text-[10px] font-black text-slate-400 pr-4">سيتم الاعتماد على سعر الباقة بدلاً من السعر الأساسي.</div>
          ) : null}
        </div>
        {!isRestaurant && !hideStock && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الكمية المتوفرة</label>
            <input
              required
              type="number"
              placeholder="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">القسم</label>
        <input
          placeholder={resolvedCategoryPlaceholder}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الوصف</label>
        <textarea
          placeholder={resolvedDescriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all min-h-[140px]"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
