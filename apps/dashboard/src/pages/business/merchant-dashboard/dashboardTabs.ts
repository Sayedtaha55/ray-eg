import { Category } from '@/types';
import { getAllowedTabIdsForCategory } from './activities';
import { CORE_MERCHANT_MODULES } from './coreModules';
import i18n from '@/i18n';
import { getVocabulary, getBookingActivityById, isShopBookingActivity, ACTIVITY_MODULES } from '../bookings/config';
import type { BookingActivityType } from '../bookings/config';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';

export type MerchantDashboardTabId =
  | 'overview'
  | 'notifications'
  | 'products'
  | 'reservations'
  | 'providers'
  | 'services'
  | 'activityRooms'
  | 'activityPatients'
  | 'activityInventory'
  | 'restaurantTables'
  | 'invoice'
  | 'sales'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'pos'
  | 'builder'
  | 'abandonedCart'
  | 'expenses'
  | 'marketing'
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
  return i18n.t('business.dashboardTabs.overview');
};

export const getReservationsTabLabel = (category?: string): string => {
  return i18n.t('business.dashboardTabs.reservations');
};

export const getBuilderTabLabel = (category?: string): string => {
  return i18n.t('business.dashboardTabs.builder');
};

export const getSettingsTabLabel = (category?: string): string => {
  return i18n.t('business.dashboardTabs.settings');
};

export const MERCHANT_DASHBOARD_TABS: MerchantDashboardTabDefinition[] = [
  { id: 'overview', label: i18n.t('business.dashboardTabs.overview'), dynamicLabel: getOverviewTabLabel },
  { id: 'notifications', label: i18n.t('business.dashboardTabs.notifications') },
  { id: 'gallery', label: i18n.t('business.dashboardTabs.gallery') },
  { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
  { id: 'expenses', label: i18n.t('business.dashboardTabs.expenses') },
  { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
  { id: 'products', label: i18n.t('business.dashboardTabs.inventory'), dynamicLabel: getProductTabLabel },
  { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
  { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations'), dynamicLabel: getReservationsTabLabel },
  // Booking system tabs — gated exclusively by isShopBookingActivity() in
  // getBookingDashboardTabsForShop(). visibleFor is empty so the legacy
  // category-based path (getLegacyDashboardTabsForShop) never shows them.
  { id: 'providers', label: i18n.t('business.dashboardTabs.providers') },
  { id: 'services', label: i18n.t('business.dashboardTabs.services') },
  { id: 'activityRooms', label: i18n.t('business.dashboardTabs.activityRooms') },
  { id: 'activityPatients', label: i18n.t('business.dashboardTabs.activityPatients') },
  { id: 'activityInventory', label: i18n.t('business.dashboardTabs.activityInventory') },
  { id: 'restaurantTables', label: i18n.t('business.dashboardTabs.restaurantTables'), visibleFor: [Category.RESTAURANT] },
  { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
  { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
  { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
  { id: 'marketing', label: i18n.t('business.dashboardTabs.marketing') || 'التسويق' },
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
    'restaurantTables',
    'invoice',
    'sales',
    'abandonedCart',
    'customers',
    'reports',
    'expenses',
    'gallery',
    'pos',
    'marketing',
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

// ============================================
// نظام الحجوزات (Booking System) — مسار مستقل بالكامل
// ============================================
// أي نشاط حجوزات حقيقي (عيادات، صالونات، سبا، شاليهات...) يُحدد فقط عبر
// isShopBookingActivity() ولا يعتمد على الـ Category نهائياً.
const BOOKING_ONLY_TAB_IDS: MerchantDashboardTabId[] = ['providers', 'services', 'activityRooms', 'activityPatients', 'activityInventory'];
const BOOKING_CORE_TAB_IDS: MerchantDashboardTabId[] = ['overview', 'reservations', 'builder', 'settings'];
const BOOKING_SHARED_TAB_IDS: MerchantDashboardTabId[] = ['notifications', 'gallery', 'reports', 'expenses', 'marketing'];

const PROVIDER_ROUTES_SET = new Set(['providers', 'doctors', 'experts', 'therapists', 'coaches', 'instructors', 'technicians', 'vehicles', 'units', 'venues', 'rooms', 'tables']);

const mapModuleRouteToTabId = (route: string): MerchantDashboardTabId | null => {
  if (route === 'services') return 'services';
  if (route === 'activity/rooms' || route === 'activity/chairs') return 'activityRooms';
  if (route === 'activity/patients') return 'activityPatients';
  if (route === 'activity/inventory') return 'activityInventory';
  if (PROVIDER_ROUTES_SET.has(route)) return 'providers';
  return null;
};

const getBookingDashboardTabsForShop = (shop?: any) => {
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw = Array.isArray(layoutConfig?.enabledModules) ? layoutConfig.enabledModules : null;

  const allowedIds = new Set<MerchantDashboardTabId>(BOOKING_CORE_TAB_IDS);

  const activityType = (shop?.pageDesign?.bookingActivityType || 'clinic') as BookingActivityType;
  const modules = ACTIVITY_MODULES[activityType] || [];
  const enabledButtons = new Set<string>(
    Array.isArray(shop?.pageDesign?.activityEnabledButtons)
      ? shop.pageDesign.activityEnabledButtons.map((x: any) => String(x || '').trim()).filter(Boolean)
      : []
  );

  for (const mod of modules) {
    const tabId = mapModuleRouteToTabId(mod.route);
    if (!tabId) continue;
    if (!mod.isExtra) {
      allowedIds.add(tabId);
    } else if (enabledButtons.has(mod.id)) {
      allowedIds.add(tabId);
    }
  }

  if (enabledRaw) {
    for (const id of enabledRaw) {
      const normalized = normalizeTabId(id);
      if (normalized && BOOKING_SHARED_TAB_IDS.includes(normalized)) allowedIds.add(normalized);
    }
  } else {
    for (const id of BOOKING_SHARED_TAB_IDS) allowedIds.add(id);
  }

  return MERCHANT_DASHBOARD_TABS.filter((t) => allowedIds.has(t.id));
};

// ============================================
// نظام الأنشطة القديم (Legacy Activities) — مسار مستقل بالكامل
// ============================================
// أي نشاط غير حجوزات (مطاعم، أزياء، تجزئة، أثاث، عقارات...) يعتمد فقط على
// الـ Category + إعدادات المتجر، ولا تظهر له أبداً تابات نظام الحجوزات.
const getLegacyDashboardTabsForShop = (shop?: any) => {
  const category = shop?.category;
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw = layoutConfig?.enabledModules;
  const modeRaw = layoutConfig?.dashboardMode;
  const mode = (String(modeRaw || '').trim().toLowerCase() as ShopDashboardMode) || undefined;

  const allowedForMode = getAllowedTabsForMode(mode);
  const allowedForCategory = getAllowedTabIdsForCategory(category);

  const activityEnabledButtons = Array.isArray(shop?.pageDesign?.activityEnabledButtons)
    ? shop.pageDesign.activityEnabledButtons.map((x: any) => String(x || '').trim()).filter(Boolean)
    : [];

  const enabledSet = (() => {
    const set = new Set<MerchantDashboardTabId>();
    const cat = String(category || '').toUpperCase();

    for (const coreId of CORE_MERCHANT_MODULES) set.add(coreId);
    if (cat === 'RESTAURANT') set.add('restaurantTables');

    if (!Array.isArray(enabledRaw)) return set;

    for (const id of enabledRaw) {
      const normalized = normalizeTabId(id);
      if (!normalized) continue;
      if (!allowedForCategory.has(normalized)) continue;
      set.add(normalized);
    }

    return set;
  })();

  const base = getVisibleMerchantDashboardTabs(category);
  return base.filter((t) => {
    if (BOOKING_ONLY_TAB_IDS.includes(t.id)) return false;
    if (!allowedForCategory.has(t.id)) return false;
    if (enabledSet && !enabledSet.has(t.id)) return false;
    if (allowedForMode && !allowedForMode.has(t.id)) return false;
    if (t.id === 'restaurantTables' && !activityEnabledButtons.includes('tables') && !activityEnabledButtons.includes('table_bookings')) return false;
    return true;
  });
};

export const getMerchantDashboardTabsForShop = (shop?: any) => {
  return isShopBookingActivity(shop)
    ? getBookingDashboardTabsForShop(shop)
    : getLegacyDashboardTabsForShop(shop);
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

export const getTabLabel = (tab: MerchantDashboardTabDefinition, shop?: any): string => {
  const rawAct = shop?.pageDesign?.bookingActivityType;
  const act = (rawAct && getBookingActivityById(rawAct)) ? rawAct : 'clinic';
  const bizVocab = getShopActivityVocabulary(shop, i18n.language);

  if (tab.id === 'providers') {
    const vocab = getVocabulary(act);
    return vocab.providerPlural;
  }
  if (tab.id === 'services') {
    const vocab = getVocabulary(act);
    return vocab.servicePlural;
  }
  if (tab.id === 'activityRooms') {
    if (act === 'salon_barber') return i18n.t('business.dashboardTabs.activityRoomChairs');
    if (act === 'wellness_spa') return i18n.t('business.dashboardTabs.activityRoomSessions');
    if (act === 'hotels_rooms') return i18n.t('business.dashboardTabs.activityRoomRoomsAndSuites');
    return i18n.t('business.dashboardTabs.activityRooms');
  }
  if (tab.id === 'activityPatients') {
    const vocab = getVocabulary(act);
    return vocab.customerPlural;
  }
  if (tab.id === 'activityInventory') {
    return i18n.t('business.dashboardTabs.activityInventory');
  }
  if (tab.id === 'products') return bizVocab.productsTabLabel;
  if (tab.id === 'gallery') return bizVocab.galleryTabLabel;
  if (tab.id === 'sales') return bizVocab.salesTabLabel;
  if (tab.id === 'promotions') return bizVocab.promotionsTabLabel;
  if (tab.id === 'reports') return bizVocab.reportsTabLabel;
  if (tab.id === 'customers') return bizVocab.customersTabLabel;
  if (tab.id === 'marketing') return i18n.t('business.dashboardTabs.marketing') || 'التسويق';
  if (tab.id === 'overview') return bizVocab.overviewTabLabel;
  if (tab.id === 'settings') return bizVocab.settingsTabLabel;

  const category = shop?.category;
  return tab.dynamicLabel ? tab.dynamicLabel(category) : tab.label;
};
