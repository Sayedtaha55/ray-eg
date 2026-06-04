import { Category } from '@/types';
import { getAllowedTabIdsForCategory } from './activities';
import { CORE_MERCHANT_MODULES } from './coreModules';
import i18n from '@/i18n';

export type MerchantDashboardTabId =
  | 'overview'
  | 'notifications'
  | 'products'
  | 'reservations'
  | 'clinicDoctors'
  | 'clinicServices'
  | 'clinicRooms'
  | 'clinicPatients'
  | 'invoice'
  | 'sales'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'pos'
  | 'builder'
  | 'abandonedCart'
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

export const getOverviewTabLabel = (category?: string): string => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'SERVICE') return 'نظرة عامة على العيادة';
  return i18n.t('business.dashboardTabs.overview');
};

export const getReservationsTabLabel = (category?: string): string => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'SERVICE') return 'جدول وقائمة الحجوزات';
  return i18n.t('business.dashboardTabs.reservations');
};

export const getBuilderTabLabel = (category?: string): string => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'SERVICE') return 'تصميم موقع العيادة';
  return i18n.t('business.dashboardTabs.builder');
};

export const getSettingsTabLabel = (category?: string): string => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'SERVICE') return 'إعدادات الحجوزات والعيادة';
  return i18n.t('business.dashboardTabs.settings');
};

export const MERCHANT_DASHBOARD_TABS: MerchantDashboardTabDefinition[] = [
  { id: 'overview', label: i18n.t('business.dashboardTabs.overview'), dynamicLabel: getOverviewTabLabel },
  { id: 'notifications', label: i18n.t('business.dashboardTabs.notifications') },
  { id: 'gallery', label: i18n.t('business.dashboardTabs.gallery') },
  { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
  { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
  { id: 'products', label: i18n.t('business.dashboardTabs.inventory'), dynamicLabel: getProductTabLabel },
  { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
  { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations'), dynamicLabel: getReservationsTabLabel },
  { id: 'clinicDoctors', label: 'الأطباء والكادر' },
  { id: 'clinicServices', label: 'التخصصات والخدمات' },
  { id: 'clinicRooms', label: 'غرف/عيادات فرعية' },
  { id: 'clinicPatients', label: 'ملفات المرضى' },
  { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
  { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
  { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
  { id: 'pos', label: i18n.t('business.dashboardTabs.pos') },
  { id: 'builder', label: i18n.t('business.dashboardTabs.builder'), dynamicLabel: getBuilderTabLabel },
  { id: 'settings', label: i18n.t('business.dashboardTabs.settings'), dynamicLabel: getSettingsTabLabel },
];

export type ShopDashboardMode = 'showcase' | 'manage';

const isKnownTabId = (value: any): value is MerchantDashboardTabId => {
  const v = String(value || '').trim() as MerchantDashboardTabId;
  return Boolean(MERCHANT_DASHBOARD_TABS.some((t) => t.id === v));
};

const normalizeTabId = (raw: any): MerchantDashboardTabId | null => {
  const candidate = String(
    raw?.id ??
    raw?.moduleId ??
    raw?.module_id ??
    raw?.key ??
    raw ??
    ''
  )
    .trim()
    .toLowerCase();

  if (!candidate) return null;
  return isKnownTabId(candidate) ? candidate : null;
};

const getAllowedTabsForMode = (mode?: ShopDashboardMode): Set<MerchantDashboardTabId> | null => {
  if (!mode) return null;
  if (mode === 'manage') return null;
  return new Set<MerchantDashboardTabId>([
    'overview',
    'products',
    'promotions',
    'reservations',
    'clinicDoctors',
    'clinicServices',
    'invoice',
    'sales',
    'abandonedCart',
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
    const cat = String(category || '').toUpperCase();
    
    if (cat === 'SERVICE') {
      set.add('reservations');
      set.add('clinicDoctors');
      set.add('clinicServices');
      set.add('clinicRooms');
      set.add('clinicPatients');
      set.add('builder');
      set.add('settings');
    } else {
      for (const coreId of CORE_MERCHANT_MODULES) set.add(coreId);
    }

    if (!Array.isArray(enabledRaw)) return set;

    for (const id of enabledRaw) {
      const normalized = normalizeTabId(id);
      if (!normalized) continue;
      if (
        cat === 'SERVICE' &&
        normalized !== 'reservations' &&
        normalized !== 'clinicDoctors' &&
        normalized !== 'clinicServices' &&
        normalized !== 'clinicRooms' &&
        normalized !== 'clinicPatients' &&
        normalized !== 'builder' &&
        normalized !== 'settings'
      ) {
        continue;
      }
      set.add(normalized);
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
  const visible = getVisibleMerchantDashboardTabs(category);
  if (!known) return visible[0]?.id || 'overview';
  return isMerchantDashboardTabVisibleForCategory(known, category) ? known.id : (visible[0]?.id || 'overview');
};

export const resolveMerchantDashboardTabForShop = (requested: any, shop?: any): MerchantDashboardTabId => {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'builder') return req;

  if (req === 'pos') {
    const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
    const modeRaw = layoutConfig?.dashboardMode;
    const mode = (String(modeRaw || '').trim().toLowerCase() as ShopDashboardMode) || undefined;
    const allowedForMode = getAllowedTabsForMode(mode);

    if (allowedForMode && !allowedForMode.has('pos')) {
      const tabs = getMerchantDashboardTabsForShop(shop);
      return tabs[0]?.id || 'overview';
    }
    return 'pos';
  }

  const tabs = getMerchantDashboardTabsForShop(shop);
  const known = tabs.find((t) => t.id === req);
  if (!known) return tabs[0]?.id || 'overview';
  return known.id;
};
