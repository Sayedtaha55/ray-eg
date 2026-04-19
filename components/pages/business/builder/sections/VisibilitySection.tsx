import React from 'react';
import { useToast } from '@/components/common/feedback/Toaster';
import { useTranslation } from 'react-i18next';

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
  | 'purchaseModeButton'
  | 'profileBanner'
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

const VISIBILITY_KEYS: VisibilityKey[] = [
  'headerNavHome',
  'headerNavGallery',
  'headerNavInfo',
  'headerChatButton',
  'headerShareButton',
  'purchaseModeButton',
  'profileBanner',
  'floatingChatButton',
  'shopFollowersCount',
  'shopFollowButton',
  'productCardPrice',
  'productCardStock',
  'productCardAddToCart',
  'productCardReserve',
  'productTabs',
  'productShareButton',
  'productQuickSpecs',
  'mobileBottomNav',
  'mobileBottomNavHome',
  'mobileBottomNavCart',
  'mobileBottomNavAccount',
  'footer',
  'footerQuickLinks',
  'footerContact',
];

const VisibilitySection: React.FC<Props> = ({ config, setConfig, shop }) => {
  const { addToast } = useToast();
  const { t } = useTranslation();
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
      addToast(t('business.builder.visibility.enableCartRequiresSales'), 'info');
      return;
    }
    if (value && isReserveToggle(key) && !hasReservationsModule) {
      addToast(t('business.builder.visibility.enableReserveRequiresReservations'), 'info');
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
      {VISIBILITY_KEYS.map((key) => (
        <label
          key={key}
          className={`flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-white ${
            (isCartToggle(key) && !hasSalesModule) || (isReserveToggle(key) && !hasReservationsModule)
              ? 'opacity-60'
              : ''
          }`}
        >
          <span className="font-black text-xs md:text-sm text-slate-700">{t(`business.builder.visibility.items.${key}`)}</span>
          <input
            type="checkbox"
            checked={getValue(key)}
            disabled={(isCartToggle(key) && !hasSalesModule) || (isReserveToggle(key) && !hasReservationsModule)}
            onChange={(e) => setValue(key, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );
};

export default VisibilitySection;
