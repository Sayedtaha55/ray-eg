import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
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
  { key: 'footer', label: 'إظهار الفوتر بالكامل' },
  { key: 'footerQuickLinks', label: 'إظهار روابط سريعة في الفوتر' },
  { key: 'footerContact', label: 'إظهار بيانات التواصل في الفوتر' },
];

const VisibilitySection: React.FC<Props> = ({ config, setConfig }) => {
  const current = (config?.elementsVisibility || {}) as Record<string, any>;

  const getValue = (key: VisibilityKey) => {
    if (current[key] === undefined || current[key] === null) return true;
    return Boolean(current[key]);
  };

  const setValue = (key: VisibilityKey, value: boolean) => {
    const next = { ...current, [key]: value };
    setConfig({ ...config, elementsVisibility: next });
  };

  return (
    <div className="space-y-3">
      {VISIBILITY_ITEMS.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
          <span className="font-black text-xs md:text-sm text-slate-700">{item.label}</span>
          <input type="checkbox" checked={getValue(item.key)} onChange={(e) => setValue(item.key, e.target.checked)} />
        </label>
      ))}
    </div>
  );
};

export default VisibilitySection;
