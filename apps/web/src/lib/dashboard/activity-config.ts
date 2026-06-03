export type MerchantDashboardTabId =
  | 'overview'
  | 'notifications'
  | 'apps'
  | 'chats'
  | 'products'
  | 'sharedProducts'
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
  title: string;
  subtitle: string;
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
    title: 'ملابس / أحذية / إكسسوارات',
    subtitle: 'مقاسات، ألوان، مخزون، فواتير وعروض.',
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
    title: 'مطعم / كافيه',
    subtitle: 'منيو، طاولات، طلبات، دليفري، عروض وحجوزات.',
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
    title: 'تاجر (Retail)',
    subtitle: 'منتجات، مخزون، فواتير، عروض ولوحة مبيعات.',
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
    title: 'إلكترونيات وصيدليات',
    subtitle: 'أجهزة، مستحضرات، مخزون، فواتير وتقارير.',
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
    title: 'صحة وعيادات',
    subtitle: 'مواعيد، خدمات، فواتير وعملاء.',
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
    title: 'خدمات وحجوزات',
    subtitle: 'حجوزات، مواعيد، فواتير، عملاء وتقارير.',
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


const ACTIVITY_ALIASES: Record<string, keyof typeof ACTIVITY_CONFIGS> = {
  restaurant: 'restaurant',
  cafe: 'restaurant',
  grocery: 'retail',
  supermarket: 'retail',
  fashion: 'fashion',
  homeTextiles: 'retail',
  carpets: 'retail',
  furniture: 'retail',
  homeGoods: 'retail',
  electronics: 'electronics',
  pharmacy: 'health',
  health: 'health',
  realEstate: 'service',
  carShowroom: 'retail',
  pets: 'retail',
  hotelBookings: 'service',
  clinicBookings: 'health',
  salonBookings: 'service',
  sportsBookings: 'service',
  trainingBookings: 'service',
  other: 'retail',
};

export const DEVELOPER_ACTIVITY_OPTIONS: Array<{ id: string; configKey: keyof typeof ACTIVITY_CONFIGS; label: string; category: Category }> = [
  { id: 'restaurant', configKey: 'restaurant', label: 'مطعم / كافيه', category: 'RESTAURANT' },
  { id: 'grocery', configKey: 'retail', label: 'سوبر ماركت / بقالة / عطارة', category: 'FOOD' },
  { id: 'fashion', configKey: 'fashion', label: 'ملابس / أحذية / إكسسوارات', category: 'FASHION' },
  { id: 'homeTextiles', configKey: 'retail', label: 'مفروشات وسجاد وستائر', category: 'RETAIL' },
  { id: 'furniture', configKey: 'retail', label: 'أثاث / معارض / ديكور', category: 'RETAIL' },
  { id: 'electronics', configKey: 'electronics', label: 'كمبيوترات وموبايلات', category: 'ELECTRONICS' },
  { id: 'health', configKey: 'health', label: 'صيدلية / مستحضرات / أجهزة طبية', category: 'HEALTH' },
  { id: 'homeGoods', configKey: 'retail', label: 'مستلزمات المنزل', category: 'RETAIL' },
  { id: 'realEstate', configKey: 'service', label: 'عقارات', category: 'SERVICE' },
  { id: 'carShowroom', configKey: 'retail', label: 'معارض سيارات', category: 'RETAIL' },
  { id: 'pets', configKey: 'retail', label: 'حيوانات', category: 'RETAIL' },
  { id: 'hotelBookings', configKey: 'service', label: 'حجوزات فنادق وشاليهات', category: 'SERVICE' },
  { id: 'clinicBookings', configKey: 'health', label: 'حجوزات عيادات وأطباء', category: 'HEALTH' },
  { id: 'salonBookings', configKey: 'service', label: 'حجوزات صالونات ومراكز تجميل', category: 'SERVICE' },
  { id: 'sportsBookings', configKey: 'service', label: 'ملاعب وجيم ومراكز رياضية', category: 'SERVICE' },
  { id: 'trainingBookings', configKey: 'service', label: 'كورسات ومدربين ومواعيد', category: 'SERVICE' },
  { id: 'other', configKey: 'retail', label: 'نشاط آخر', category: 'OTHER' },
];

export const BOOKING_ACTIVITY_OPTIONS = DEVELOPER_ACTIVITY_OPTIONS.filter((a) =>
  ['restaurant', 'hotelBookings', 'clinicBookings', 'salonBookings', 'sportsBookings', 'trainingBookings', 'realEstate'].includes(a.id)
);

export function resolveActivityConfigByActivityId(activityId?: string): MerchantDashboardActivityConfig {
  const key = ACTIVITY_ALIASES[String(activityId || '').trim()] || 'retail';
  return ACTIVITY_CONFIGS[key];
}

export function getActivityOptionById(activityId?: string) {
  return DEVELOPER_ACTIVITY_OPTIONS.find((a) => a.id === String(activityId || '').trim()) || null;
}

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
  const activityId = shop?.activityId || shop?.layoutConfig?.activityId;
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw = layoutConfig?.enabledModules;

  const base = activityId ? resolveActivityConfigByActivityId(activityId).tabs : getVisibleTabsForCategory(category);

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
    'overview', 'notifications', 'apps', 'chats', 'products', 'sharedProducts',
    'reservations', 'invoice', 'sales', 'promotions', 'reports', 'customers',
    'gallery', 'pos', 'builder', 'abandonedCart', 'settings', 'design',
  ];
  return known.includes(value as MerchantDashboardTabId);
}

export function resolveMerchantDashboardTabForShop(requested: any, shop?: any): MerchantDashboardTabId {
  const req = String(requested || '').trim() as MerchantDashboardTabId;
  if (req === 'builder' || req === 'design') return req;
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
