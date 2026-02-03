import { Category } from '@/types';

export type MerchantDashboardTabId =
  | 'overview'
  | 'products'
  | 'reservations'
  | 'sales'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'pos'
  | 'builder'
  | 'settings';

export type MerchantDashboardTabDefinition = {
  id: MerchantDashboardTabId;
  label: string;
  visibleFor?: Category[];
};

export const MERCHANT_DASHBOARD_TABS: MerchantDashboardTabDefinition[] = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'gallery', label: 'معرض الصور' },
  { id: 'reports', label: 'التقارير' },
  { id: 'customers', label: 'العملاء' },
  { id: 'products', label: 'المخزون' },
  { id: 'promotions', label: 'العروض' },
  { id: 'reservations', label: 'الحجوزات' },
  { id: 'sales', label: 'المبيعات' },
  { id: 'builder', label: 'التصميم' },
  { id: 'settings', label: 'الإعدادات' },
];

export const isMerchantDashboardTabVisibleForCategory = (tab: MerchantDashboardTabDefinition, category?: unknown) => {
  if (!tab.visibleFor || tab.visibleFor.length === 0) return true;
  const cat = String(category || '').toUpperCase();
  if (!cat) return false;
  return tab.visibleFor.some((c) => String(c).toUpperCase() === cat);
};

export const getVisibleMerchantDashboardTabs = (category?: unknown) => {
  return MERCHANT_DASHBOARD_TABS.filter((t) => isMerchantDashboardTabVisibleForCategory(t, category));
};

export const resolveMerchantDashboardTab = (requested: any, category?: unknown): MerchantDashboardTabId => {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'pos' || req === 'builder') return req;
  const known = MERCHANT_DASHBOARD_TABS.find((t) => t.id === req);
  if (!known) return 'overview';
  return isMerchantDashboardTabVisibleForCategory(known, category) ? known.id : 'overview';
};
