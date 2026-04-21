export type MerchantModuleId =
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
  | 'settings'
  | 'chats'
  | 'shared-products'
  | string;

export type MerchantDashboardButtonDefinition = {
  id: MerchantModuleId;
  route: string;
  iconName: string;
};

export const MERCHANT_DASHBOARD_BUTTONS: MerchantDashboardButtonDefinition[] = [
  { id: 'overview', route: '/(tabs)', iconName: 'trending-up-outline' },
  { id: 'notifications', route: '/(tabs)/notifications', iconName: 'notifications-outline' },
  { id: 'gallery', route: '/more/gallery', iconName: 'camera-outline' },
  { id: 'reports', route: '/more/reports', iconName: 'bar-chart-outline' },
  { id: 'customers', route: '/more/customers', iconName: 'people-outline' },
  { id: 'products', route: '/(tabs)/products', iconName: 'cube-outline' },
  { id: 'promotions', route: '/more/promotions', iconName: 'megaphone-outline' },
  { id: 'reservations', route: '/more/reservations', iconName: 'calendar-outline' },
  { id: 'invoice', route: '/more/invoice', iconName: 'document-text-outline' },
  { id: 'sales', route: '/(tabs)/sales', iconName: 'card-outline' },
  { id: 'pos', route: '/more/pos', iconName: 'phone-portrait-outline' },
  { id: 'builder', route: '/more/builder', iconName: 'color-palette-outline' },
  { id: 'settings', route: '/settings/overview', iconName: 'settings-outline' },
];

export type ShopDashboardMode = 'showcase' | 'manage' | undefined;

const CORE_MERCHANT_MODULES: MerchantModuleId[] = [
  'overview',
  'notifications',
  'products',
  'promotions',
  'builder',
  'settings',
];

function normalizeModuleId(raw: any): MerchantModuleId | null {
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
  return candidate as MerchantModuleId;
}

export function getEnabledModulesSet(shop: any): Set<MerchantModuleId> {
  const layoutConfig = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
  const enabledRaw = layoutConfig?.enabledModules;

  const set = new Set<MerchantModuleId>();
  for (const id of CORE_MERCHANT_MODULES) set.add(id);

  if (!Array.isArray(enabledRaw)) return set;

  for (const id of enabledRaw) {
    const normalized = normalizeModuleId(id);
    if (!normalized) continue;
    set.add(normalized);
  }

  if (!set.has('sales')) {
    set.delete('customers');
    set.delete('reports');
  }

  return set;
}

export function isModuleEnabled(shop: any, moduleId: MerchantModuleId): boolean {
  return getEnabledModulesSet(shop).has(String(moduleId).toLowerCase());
}

export function getDashboardMode(shop: any): ShopDashboardMode {
  const layoutConfig = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
  const modeRaw = layoutConfig?.dashboardMode ?? layoutConfig?.dashboard_mode;
  const mode = String(modeRaw || '').trim().toLowerCase();
  if (mode === 'showcase' || mode === 'manage') return mode;
  return undefined;
}

function getAllowedTabsForMode(mode?: ShopDashboardMode): Set<MerchantModuleId> | null {
  if (!mode) return null;
  if (mode === 'manage') return null;
  return new Set<MerchantModuleId>([
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
}

function getAllowedTabIdsForCategory(category?: any): Set<MerchantModuleId> {
  const cat = String(category || '').trim().toUpperCase();
  const set = new Set<MerchantModuleId>();
  for (const id of CORE_MERCHANT_MODULES) set.add(id);
  set.add('reservations');

  const addMany = (ids: MerchantModuleId[]) => ids.forEach((id) => set.add(id));

  switch (cat) {
    case 'RESTAURANT':
      addMany(['overview', 'products', 'reservations', 'invoice', 'sales', 'promotions', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
    case 'FASHION':
      addMany(['overview', 'products', 'invoice', 'sales', 'promotions', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
    case 'ELECTRONICS':
      addMany(['overview', 'products', 'invoice', 'sales', 'promotions', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
    case 'HEALTH':
      addMany(['overview', 'products', 'invoice', 'sales', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
    case 'SERVICE':
      addMany(['overview', 'reservations', 'invoice', 'sales', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
    case 'RETAIL':
    default:
      addMany(['overview', 'products', 'invoice', 'sales', 'promotions', 'customers', 'gallery', 'reports', 'pos', 'settings']);
      break;
  }

  return set;
}

export function isDashboardTabVisible(shop: any, tabId: MerchantModuleId): boolean {
  const id = String(tabId || '').trim().toLowerCase();
  if (!id) return false;

  const category = shop?.category;
  const allowedForCategory = getAllowedTabIdsForCategory(category);
  if (allowedForCategory && !allowedForCategory.has(id)) return false;

  const enabled = getEnabledModulesSet(shop);
  if (enabled && !enabled.has(id)) return false;

  const mode = getDashboardMode(shop);
  const allowedForMode = getAllowedTabsForMode(mode);
  if (allowedForMode && !allowedForMode.has(id)) return false;

  return true;
}

export function getVisibleDashboardButtons(shop: any): MerchantDashboardButtonDefinition[] {
  return MERCHANT_DASHBOARD_BUTTONS.filter((btn) => isDashboardTabVisible(shop, btn.id));
}
