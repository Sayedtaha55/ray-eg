import React from 'react';
import { useToast } from '@/components/common/feedback/Toaster';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

type VisibilityKey =
  | 'headerNavHome'
  | 'headerNavGallery'
  | 'headerNavInfo'
  | 'headerChatButton'
  | 'headerShareButton'
  | 'floatingChatButton'
  | 'shopFollowersCount'
  | 'shopFollowButton'
  | 'productCardPrice'
  | 'productCardStock'
  | 'productCardAddToCart'
  | 'productCardReserve'
  | 'productTabs'
  | 'productShareButton'
  | 'productQuickSpecs'
  | 'mobileBottomNav'
  | 'mobileBottomNavHome'
  | 'mobileBottomNavCart'
  | 'mobileBottomNavAccount'
  | 'footer'
  | 'footerQuickLinks'
  | 'footerContact';

const VISIBILITY_ITEMS: { key: VisibilityKey; label: string }[] = [
  { key: 'headerNavHome', label: 'إظهار زر (المعروضات)' },
  { key: 'headerNavGallery', label: 'إظهار زر (معرض الصور)' },
  { key: 'headerNavInfo', label: 'إظهار زر (معلومات المتجر)' },
  { key: 'headerChatButton', label: 'إظهار زر المحادثة في الهيدر' },
  { key: 'headerShareButton', label: 'إظهار زر المشاركة في الهيدر' },
  { key: 'floatingChatButton', label: 'إظهار زر المحادثة العائم' },
  { key: 'shopFollowersCount', label: 'إظهار عدد المتابعين' },
  { key: 'shopFollowButton', label: 'إظهار زر متابعة المتجر' },
  { key: 'productCardPrice', label: 'إظهار السعر في كارت المنتج' },
  { key: 'productCardStock', label: 'إظهار المخزون في كارت المنتج' },
  { key: 'productCardAddToCart', label: 'إظهار زر (إضافة للسلة)' },
  { key: 'productCardReserve', label: 'إظهار زر (حجز)' },
  { key: 'productTabs', label: 'إظهار تبويبات صفحة المنتج' },
  { key: 'productShareButton', label: 'إظهار زر المشاركة في صفحة المنتج' },
  { key: 'productQuickSpecs', label: 'إظهار (مواصفات سريعة) في صفحة المنتج' },
  { key: 'mobileBottomNav', label: 'إظهار فوتر الموبايل (هوم/سلة/حساب)' },
  { key: 'mobileBottomNavHome', label: 'إظهار زر (الرئيسية) في فوتر الموبايل' },
  { key: 'mobileBottomNavCart', label: 'إظهار زر (السلة) في فوتر الموبايل' },
  { key: 'mobileBottomNavAccount', label: 'إظهار زر (حسابي) في فوتر الموبايل' },
  { key: 'footer', label: 'إظهار الفوتر بالكامل' },
  { key: 'footerQuickLinks', label: 'إظهار روابط سريعة في الفوتر' },
  { key: 'footerContact', label: 'إظهار بيانات التواصل في الفوتر' },
];

const VisibilitySection: React.FC<Props> = ({ config, setConfig, shop }) => {
  const { addToast } = useToast();
  const current = (config?.elementsVisibility || {}) as Record<string, any>;

  const hasSalesModule = (() => {
    try {
      const raw = (shop as any)?.layoutConfig?.enabledModules;
      if (!Array.isArray(raw)) return false;
      return raw.some((x: any) => String(x || '').trim() === 'sales');
    } catch {
      return false;
    }
  })();

  const hasReservationsModule = (() => {
    try {
      const raw = (shop as any)?.layoutConfig?.enabledModules;
      if (!Array.isArray(raw)) return false;
      return raw.some((x: any) => String(x || '').trim() === 'reservations');
    } catch {
      return false;
    }
  })();

  const isCartToggle = (key: VisibilityKey) => key === 'productCardAddToCart' || key === 'mobileBottomNavCart';
  const isReserveToggle = (key: VisibilityKey) => key === 'productCardReserve';

  const getValue = (key: VisibilityKey) => {
    if (isCartToggle(key) && !hasSalesModule) return false;
    if (isReserveToggle(key) && !hasReservationsModule) return false;
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: VisibilityKey, value: boolean) => {
    if (value && isCartToggle(key) && !hasSalesModule) {
      addToast('لتفعيل السلة لازم تفعيل (المبيعات) من لوحة التاجر أولاً', 'info');
      return;
    }
    if (value && isReserveToggle(key) && !hasReservationsModule) {
      addToast('لتفعيل الحجز لازم تفعيل (الحجوزات) من لوحة التاجر أولاً', 'info');
      return;
    }
    setConfig((prev: any) => {
      const base = (prev?.elementsVisibility && typeof prev.elementsVisibility === 'object')
        ? prev.elementsVisibility
        : {};
      const next = { ...base, [key]: value };
      return { ...prev, elementsVisibility: next };
    });
  };

  return (
    <div className="space-y-3">
      {VISIBILITY_ITEMS.map((item) => (
        <label
          key={item.key}
          className={`flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white ${
            (isCartToggle(item.key) && !hasSalesModule) || (isReserveToggle(item.key) && !hasReservationsModule)
              ? 'opacity-60'
              : ''
          }`}
        >
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input
            type="checkbox"
            checked={getValue(item.key)}
            disabled={(isCartToggle(item.key) && !hasSalesModule) || (isReserveToggle(item.key) && !hasReservationsModule)}
            onChange={(e) => setValue(item.key, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );
};

export default VisibilitySection;
