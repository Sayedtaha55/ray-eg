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
  | 'abandonedCart'
  | 'settings'
  | 'design';

export type Category =
  | 'FASHION'
  | 'RESTAURANT'
  | 'RETAIL'
  | 'ELECTRONICS'
  | 'HEALTH'
  | 'SERVICE'
  | 'FOOD'
  | 'OTHER';

export type MerchantDashboardTabDefinition = {
  id: MerchantDashboardTabId;
  labelKey: string;
  visibleFor?: Category[];
  disabled?: boolean;
  upgradeRequired?: boolean;
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
  category: Category;
  tabs: MerchantDashboardTabDefinition[];
  defaultTab: MerchantDashboardTabId;
  features: ActivityFeatures;
};

export const CORE_MERCHANT_MODULES: MerchantDashboardTabId[] = [
  'overview',
  'notifications',
  'products',
  'promotions',
  'builder',
  'settings',
];

const ACTIVITY_CONFIGS: Record<string, MerchantDashboardActivityConfig> = {
  fashion: {
    id: 'fashion',
    category: 'FASHION',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'products', labelKey: 'business.dashboardTabs.inventory' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.dashboardTabs.sales' },
      { id: 'promotions', labelKey: 'business.dashboardTabs.promotions' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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
    category: 'RESTAURANT',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'products', labelKey: 'business.dashboardTabs.menu' },
      { id: 'reservations', labelKey: 'business.dashboardTabs.reservations' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.dashboardTabs.sales' },
      { id: 'promotions', labelKey: 'business.dashboardTabs.promotions' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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
    category: 'RETAIL',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'products', labelKey: 'business.dashboardTabs.inventory' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.dashboardTabs.sales' },
      { id: 'promotions', labelKey: 'business.dashboardTabs.promotions' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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
    category: 'ELECTRONICS',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'products', labelKey: 'business.activities.products' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.dashboardTabs.sales' },
      { id: 'promotions', labelKey: 'business.dashboardTabs.promotions' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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
    category: 'HEALTH',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'products', labelKey: 'business.activities.medicines' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.dashboardTabs.sales' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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
    category: 'SERVICE',
    tabs: [
      { id: 'overview', labelKey: 'business.dashboardTabs.overview' },
      { id: 'reservations', labelKey: 'business.dashboardTabs.reservations' },
      { id: 'invoice', labelKey: 'business.dashboardTabs.invoice' },
      { id: 'sales', labelKey: 'business.activities.invoices' },
      { id: 'customers', labelKey: 'business.dashboardTabs.customers' },
      { id: 'gallery', labelKey: 'business.activities.gallery' },
      { id: 'reports', labelKey: 'business.dashboardTabs.reports' },
      { id: 'abandonedCart', labelKey: 'business.dashboardTabs.abandonedCart' },
      { id: 'pos', labelKey: 'business.activities.pos' },
      { id: 'design', labelKey: 'business.dashboardTabs.design' },
      { id: 'settings', labelKey: 'business.dashboardTabs.settings' },
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

export function resolveActivityConfig(category?: string): MerchantDashboardActivityConfig {
  const cat = String(category || '').toUpperCase();
  switch (cat) {
    case 'FASHION': return ACTIVITY_CONFIGS.fashion;
    case 'RESTAURANT': return ACTIVITY_CONFIGS.restaurant;
    case 'ELECTRONICS': return ACTIVITY_CONFIGS.electronics;
    case 'HEALTH': return ACTIVITY_CONFIGS.health;
    case 'SERVICE': return ACTIVITY_CONFIGS.service;
    case 'RETAIL':
    default: return ACTIVITY_CONFIGS.retail;
  }
}

export function getVisibleTabsForCategory(category?: string): MerchantDashboardTabDefinition[] {
  return resolveActivityConfig(category).tabs;
}

export function getMerchantDashboardTabsForShop(shop?: any): MerchantDashboardTabDefinition[] {
  const category = shop?.category;
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw = layoutConfig?.enabledModules;

  const base = getVisibleTabsForCategory(category);

  const enabledSet = (() => {
    const set = new Set<MerchantDashboardTabId>();
    for (const coreId of CORE_MERCHANT_MODULES) set.add(coreId);
    set.add('design');
    if (!Array.isArray(enabledRaw)) return set;
    for (const id of enabledRaw) {
      const normalized = String(id?.id ?? id?.moduleId ?? id?.key ?? id ?? '').trim().toLowerCase();
      if (normalized && isKnownTabId(normalized)) set.add(normalized as MerchantDashboardTabId);
    }
    return set;
  })();

  return base.map(t => ({
    ...t,
    upgradeRequired: !enabledSet.has(t.id),
  }));
}

/** Returns only enabled (no upgrade required) tabs for a shop. */
export function getEnabledMerchantDashboardTabsForShop(shop?: any): MerchantDashboardTabDefinition[] {
  return getMerchantDashboardTabsForShop(shop).filter(t => !t.upgradeRequired);
}

function isKnownTabId(value: string): boolean {
  const known: MerchantDashboardTabId[] = [
    'overview', 'notifications', 'products', 'reservations', 'invoice',
    'sales', 'promotions', 'reports', 'customers', 'gallery', 'pos',
    'builder', 'abandonedCart', 'settings', 'design',
  ];
  return known.includes(value as MerchantDashboardTabId);
}

export function resolveMerchantDashboardTabForShop(requested: any, shop?: any): MerchantDashboardTabId {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'pos' || req === 'builder' || req === 'design') return req;
  const tabs = getMerchantDashboardTabsForShop(shop);
  const known = tabs.find(t => t.id === req);
  if (!known) return 'overview';
  return known.id;
}

/** Check if a specific tab requires upgrade (not yet enabled) for a shop. */
export function isTabUpgradeRequired(tabId: MerchantDashboardTabId, shop?: any): boolean {
  const tabs = getMerchantDashboardTabsForShop(shop);
  const tab = tabs.find(t => t.id === tabId);
  return !!tab?.upgradeRequired;
}
