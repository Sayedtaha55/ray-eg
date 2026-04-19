import { Category } from '@/types';
import { getAllowedTabIdsForCategory } from './activities';
import { CORE_MERCHANT_MODULES } from './coreModules';
import i18n from '@/i18n';

export type MerchantDashboardTabId =
  | 'overview'
  | 'notifications'
  | 'products'
  | 'reservations'
  | 'invoice'
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
  dynamicLabel?: (category?: string) => string;
};

export const getProductTabLabel = (category?: string): string => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'RESTAURANT') return i18n.t('business.dashboardTabs.menu');
  return i18n.t('business.dashboardTabs.inventory');
};

export const MERCHANT_DASHBOARD_TABS: MerchantDashboardTabDefinition[] = [
  { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
  { id: 'notifications', label: i18n.t('business.dashboardTabs.notifications') },
  { id: 'gallery', label: i18n.t('business.dashboardTabs.gallery') },
  { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
  { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
  { id: 'products', label: i18n.t('business.dashboardTabs.inventory'), dynamicLabel: getProductTabLabel },
  { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
  { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
  { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
  { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
  { id: 'pos', label: i18n.t('business.dashboardTabs.pos') },
  { id: 'builder', label: i18n.t('business.dashboardTabs.builder') },
  { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
];

export type ShopDashboardMode = 'showcase' | 'manage';

const isKnownTabId = (value: any): value is MerchantDashboardTabId => {
  const v = String(value || '').trim() as MerchantDashboardTabId;
  return Boolean(MERCHANT_DASHBOARD_TABS.some((t) => t.id === v));
};

const getAllowedTabsForMode = (mode?: ShopDashboardMode): Set<MerchantDashboardTabId> | null => {
  if (!mode) return null;
  if (mode === 'manage') return null;
  return new Set<MerchantDashboardTabId>([
    'overview',
    'products',
    'promotions',
    'reservations',
    'invoice',
    'sales',
    'customers',
    'reports',
    'gallery',
    'pos',
    'builder',
    'settings',
  ]);
};

export const isMerchantDashboardTabVisibleForCategory = (tab: MerchantDashboardTabDefinition, category?: unknown) => {
  if (!tab.visibleFor || tab.visibleFor.length === 0) return true;
  const cat = String(category || '').toUpperCase();
  if (!cat) return false;
  return tab.visibleFor.some((c) => String(c).toUpperCase() === cat);
};

export const getVisibleMerchantDashboardTabs = (category?: unknown) => {
  return MERCHANT_DASHBOARD_TABS.filter((t) => isMerchantDashboardTabVisibleForCategory(t, category));
};

export const getMerchantDashboardTabsForShop = (shop?: any) => {
  const category = shop?.category;
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw = layoutConfig?.enabledModules;
  const modeRaw = layoutConfig?.dashboardMode;
  const mode = (String(modeRaw || '').trim().toLowerCase() as ShopDashboardMode) || undefined;

  const allowedForMode = getAllowedTabsForMode(mode);

  const allowedForCategory = getAllowedTabIdsForCategory(category);

  const enabledSet = (() => {
    const set = new Set<MerchantDashboardTabId>();
    for (const coreId of CORE_MERCHANT_MODULES) set.add(coreId);

    if (!Array.isArray(enabledRaw)) return set;

    for (const id of enabledRaw) {
      if (!isKnownTabId(id)) continue;
      set.add(String(id).trim() as MerchantDashboardTabId);
    }

    return set;
  })();

  const base = getVisibleMerchantDashboardTabs(category);
  return base.filter((t) => {
    if (allowedForCategory && !allowedForCategory.has(t.id)) return false;
    if (enabledSet && !enabledSet.has(t.id)) return false;
    if (allowedForMode && !allowedForMode.has(t.id)) return false;
    return true;
  });
};

export const resolveMerchantDashboardTab = (requested: any, category?: unknown): MerchantDashboardTabId => {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'pos' || req === 'builder') return req;
  const known = MERCHANT_DASHBOARD_TABS.find((t) => t.id === req);
  if (!known) return 'overview';
  return isMerchantDashboardTabVisibleForCategory(known, category) ? known.id : 'overview';
};

export const resolveMerchantDashboardTabForShop = (requested: any, shop?: any): MerchantDashboardTabId => {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'builder') return req;

  if (req === 'pos') {
    const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
    const modeRaw = layoutConfig?.dashboardMode;
    const mode = (String(modeRaw || '').trim().toLowerCase() as ShopDashboardMode) || undefined;
    const allowedForMode = getAllowedTabsForMode(mode);

    if (allowedForMode && !allowedForMode.has('pos')) return 'overview';
    return 'pos';
  }

  const tabs = getMerchantDashboardTabsForShop(shop);
  const known = tabs.find((t) => t.id === req);
  if (!known) return 'overview';
  return known.id;
};
