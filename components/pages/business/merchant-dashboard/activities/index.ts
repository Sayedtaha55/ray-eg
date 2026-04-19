import { Category } from '@/types';
import { CORE_MERCHANT_MODULES } from '../coreModules';
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
  disabled?: boolean;
};

export type ActivityFeatures = {
  showReservations: boolean;
  showMenuBuilder: boolean;
  showFashionSizes: boolean;
  showPOS: boolean;
  showAnalytics: boolean;
  showTableManagement: boolean;
  showDeliveryManagement: boolean;
  showInventoryTracking: boolean;
};

export type MerchantDashboardActivityConfig = {
  id: string;
  name: string;
  category: Category;
  tabs: MerchantDashboardTabDefinition[];
  defaultTab: MerchantDashboardTabId;
  features: ActivityFeatures;
};

// Activity definitions for different business types
export const ACTIVITY_CONFIGS: Record<string, MerchantDashboardActivityConfig> = {
  fashion: {
    id: 'fashion',
    name: i18n.t('business.activities.fashion'),
    category: Category.FASHION,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: false,
      showMenuBuilder: false,
      showFashionSizes: true,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  restaurant: {
    id: 'restaurant',
    name: i18n.t('business.activities.restaurant'),
    category: Category.RESTAURANT,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.menu') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: true,
      showMenuBuilder: true,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: true,
      showDeliveryManagement: true,
      showInventoryTracking: false,
    },
  },
  retail: {
    id: 'retail',
    name: i18n.t('business.activities.retail'),
    category: Category.RETAIL,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: false,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  electronics: {
    id: 'electronics',
    name: i18n.t('business.activities.electronics'),
    category: Category.ELECTRONICS,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.activities.products') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: false,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  health: {
    id: 'health',
    name: i18n.t('business.activities.health'),
    category: Category.HEALTH,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.activities.medicines') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: false,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  service: {
    id: 'service',
    name: i18n.t('business.activities.service'),
    category: Category.SERVICE,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.activities.invoices') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: true,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: false,
      showInventoryTracking: false,
    },
  },
};

export const resolveActivityConfig = (category?: Category): MerchantDashboardActivityConfig => {
  const cat = String(category || '').toUpperCase();
  
  switch (cat) {
    case 'FASHION':
      return ACTIVITY_CONFIGS.fashion;
    case 'RESTAURANT':
      return ACTIVITY_CONFIGS.restaurant;
    case 'ELECTRONICS':
      return ACTIVITY_CONFIGS.electronics;
    case 'HEALTH':
      return ACTIVITY_CONFIGS.health;
    case 'SERVICE':
      return ACTIVITY_CONFIGS.service;
    case 'RETAIL':
    default:
      return ACTIVITY_CONFIGS.retail;
  }
};

export const getVisibleTabsForCategory = (category?: Category): MerchantDashboardTabDefinition[] => {
  const config = resolveActivityConfig(category);
  return config.tabs;
};

export const getAllowedTabIdsForCategory = (category?: Category): Set<MerchantDashboardTabId> => {
  const tabs = getVisibleTabsForCategory(category);
  const set = new Set<MerchantDashboardTabId>();

  for (const coreId of CORE_MERCHANT_MODULES) {
    set.add(coreId as MerchantDashboardTabId);
  }

  set.add('reservations');

  for (const t of tabs) {
    set.add(t.id);
  }
  return set;
};
