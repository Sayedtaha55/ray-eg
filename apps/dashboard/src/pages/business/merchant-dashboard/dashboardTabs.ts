import { Category } from '@/types';
import { getAllowedTabIdsForCategory } from './activities';
import { CORE_MERCHANT_MODULES } from './coreModules';
import i18n from '@/i18n';
import { getVocabulary, getBookingActivityById, isShopBookingActivity, ACTIVITY_MODULES } from '../bookings/config';
import type { BookingActivityType } from '../bookings/config';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';
import { MODULE_REGISTRY } from '../../../config/modules/registry';

// Build reverse map: tabId -> featureId (from module features/pages)
const FEATURE_TO_TAB: Map<string, string> = (() => {
  const m = new Map<string, string>();
  const SPECIAL: Record<string, string> = {
    'sales': 'orders',
    'activityRooms': 'rooms',
    'activityPatients': 'patient_records',
    'activityInventory': 'activity_inventory',
    'restaurantTables': 'restaurant_tables',
  };
  for (const mod of MODULE_REGISTRY) {
    const features = (mod as any).features || [];
    const featureIds = new Set(features.map((f: any) => f.id));
    for (const page of (mod as any).pages || []) {
      if (!page.tabId) continue;
      if (SPECIAL[page.tabId]) {
        m.set(page.tabId, SPECIAL[page.tabId]);
      } else if (featureIds.has(page.tabId)) {
        m.set(page.tabId, page.tabId);
      }
    }
  }
  return m;
})();

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
  | 'employees'
  | 'attendance'
  | 'payroll'
  | 'apps'
  | 'settings'
  // Sales sub-tabs
  | 'quotes' | 'payments' | 'returns' | 'loyalty' | 'subscriptions' | 'epayment' | 'orderStatus'
  // Inventory sub-tabs
  | 'categories' | 'variants' | 'warehouses' | 'stocktake' | 'suppliers' | 'purchaseOrders' | 'transfers' | 'barcode' | 'qrCode' | 'stockTracking' | 'lowStockAlerts'
  // Finance sub-tabs
  | 'revenue' | 'profits' | 'taxes' | 'journal' | 'cashflow' | 'accounts' | 'wallets' | 'financialReports'
  // Marketing sub-tabs
  | 'campaigns' | 'coupons' | 'discounts' | 'messages' | 'emailCampaigns' | 'pushNotifications' | 'smsCampaigns' | 'loyaltyPrograms' | 'seasonalOffers'
  // CRM sub-tabs
  | 'chats' | 'tickets' | 'complaints' | 'reviews' | 'notes' | 'followUps' | 'contactLog'
  // Bookings sub-tabs
  | 'appointments' | 'calendar' | 'rooms' | 'doctors' | 'bookingConfirm' | 'bookingCancel' | 'bookingReminder'
  // HR sub-tabs
  | 'permissions' | 'checkOut' | 'leaves' | 'tasks'
  // Website sub-tabs
  | 'pages' | 'templates' | 'seo' | 'blog' | 'forms' | 'media' | 'domains' | 'publishing'
  // Analytics sub-tabs
  | 'kpi' | 'charts' | 'salesPerformance' | 'productPerformance' | 'visitors' | 'conversions'
  // AI sub-tabs
  | 'aiContent' | 'aiImages' | 'aiSEO' | 'aiAnalysis' | 'aiReplies' | 'aiSuggestions' | 'aiPages' | 'aiDataAnalysis'
  | 'aiInsights' | 'aiRecommendations' | 'aiAutomations';

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
  { id: 'apps', label: i18n.t('business.dashboardTabs.apps') || 'التطبيقات' },
  { id: 'employees', label: i18n.t('business.dashboardTabs.employees') || 'الموظفون' },
  { id: 'attendance', label: i18n.t('business.dashboardTabs.attendance') || 'الحضور' },
  { id: 'payroll', label: i18n.t('business.dashboardTabs.payroll') || 'الرواتب' },
  { id: 'settings', label: i18n.t('business.dashboardTabs.settings'), dynamicLabel: getSettingsTabLabel },
  // Sales sub-tabs
  { id: 'quotes', label: i18n.t('business.dashboardTabs.quotes') || 'Quotes' },
  { id: 'payments', label: i18n.t('business.dashboardTabs.payments') || 'Payments' },
  { id: 'returns', label: i18n.t('business.dashboardTabs.returns') || 'Returns' },
  { id: 'loyalty', label: i18n.t('business.dashboardTabs.loyalty') || 'Loyalty' },
  { id: 'subscriptions', label: i18n.t('business.dashboardTabs.subscriptions') || 'Subscriptions' },
  { id: 'epayment', label: i18n.t('business.dashboardTabs.epayment') || 'E-Payment' },
  { id: 'orderStatus', label: i18n.t('business.dashboardTabs.orderStatus') || 'Order Status' },
  // Inventory sub-tabs
  { id: 'categories', label: i18n.t('business.dashboardTabs.categories') || 'Categories' },
  { id: 'variants', label: i18n.t('business.dashboardTabs.variants') || 'Variants' },
  { id: 'warehouses', label: i18n.t('business.dashboardTabs.warehouses') || 'Warehouses' },
  { id: 'stocktake', label: i18n.t('business.dashboardTabs.stocktake') || 'Stocktake' },
  { id: 'suppliers', label: i18n.t('business.dashboardTabs.suppliers') || 'Suppliers' },
  { id: 'purchaseOrders', label: i18n.t('business.dashboardTabs.purchaseOrders') || 'Purchase Orders' },
  { id: 'transfers', label: i18n.t('business.dashboardTabs.transfers') || 'Transfers' },
  { id: 'barcode', label: i18n.t('business.dashboardTabs.barcode') || 'Barcode' },
  { id: 'qrCode', label: i18n.t('business.dashboardTabs.qrCode') || 'QR Code' },
  { id: 'stockTracking', label: i18n.t('business.dashboardTabs.stockTracking') || 'Stock Tracking' },
  { id: 'lowStockAlerts', label: i18n.t('business.dashboardTabs.lowStockAlerts') || 'Low Stock Alerts' },
  // Finance sub-tabs
  { id: 'revenue', label: i18n.t('business.dashboardTabs.revenue') || 'Revenue' },
  { id: 'profits', label: i18n.t('business.dashboardTabs.profits') || 'Profits' },
  { id: 'taxes', label: i18n.t('business.dashboardTabs.taxes') || 'Taxes' },
  { id: 'journal', label: i18n.t('business.dashboardTabs.journal') || 'Journal' },
  { id: 'cashflow', label: i18n.t('business.dashboardTabs.cashflow') || 'Cash Flow' },
  { id: 'accounts', label: i18n.t('business.dashboardTabs.accounts') || 'Accounts' },
  { id: 'wallets', label: i18n.t('business.dashboardTabs.wallets') || 'Wallets' },
  { id: 'financialReports', label: i18n.t('business.dashboardTabs.financialReports') || 'Financial Reports' },
  // Marketing sub-tabs
  { id: 'campaigns', label: i18n.t('business.dashboardTabs.campaigns') || 'Campaigns' },
  { id: 'coupons', label: i18n.t('business.dashboardTabs.coupons') || 'Coupons' },
  { id: 'discounts', label: i18n.t('business.dashboardTabs.discounts') || 'Discounts' },
  { id: 'messages', label: i18n.t('business.dashboardTabs.messages') || 'Messages' },
  { id: 'emailCampaigns', label: i18n.t('business.dashboardTabs.emailCampaigns') || 'Email Campaigns' },
  { id: 'pushNotifications', label: i18n.t('business.dashboardTabs.pushNotifications') || 'Push Notifications' },
  { id: 'smsCampaigns', label: i18n.t('business.dashboardTabs.smsCampaigns') || 'SMS Campaigns' },
  { id: 'loyaltyPrograms', label: i18n.t('business.dashboardTabs.loyaltyPrograms') || 'Loyalty Programs' },
  { id: 'seasonalOffers', label: i18n.t('business.dashboardTabs.seasonalOffers') || 'Seasonal Offers' },
  // CRM sub-tabs
  { id: 'chats', label: i18n.t('business.dashboardTabs.chats') || 'Chats' },
  { id: 'tickets', label: i18n.t('business.dashboardTabs.tickets') || 'Tickets' },
  { id: 'complaints', label: i18n.t('business.dashboardTabs.complaints') || 'Complaints' },
  { id: 'reviews', label: i18n.t('business.dashboardTabs.reviews') || 'Reviews' },
  { id: 'notes', label: i18n.t('business.dashboardTabs.notes') || 'Notes' },
  { id: 'followUps', label: i18n.t('business.dashboardTabs.followUps') || 'Follow-ups' },
  { id: 'contactLog', label: i18n.t('business.dashboardTabs.contactLog') || 'Contact Log' },
  // Bookings sub-tabs
  { id: 'appointments', label: i18n.t('business.dashboardTabs.appointments') || 'Appointments' },
  { id: 'calendar', label: i18n.t('business.dashboardTabs.calendar') || 'Calendar' },
  { id: 'rooms', label: i18n.t('business.dashboardTabs.rooms') || 'Rooms' },
  { id: 'doctors', label: i18n.t('business.dashboardTabs.doctors') || 'Doctors' },
  { id: 'bookingConfirm', label: i18n.t('business.dashboardTabs.bookingConfirm') || 'Booking Confirm' },
  { id: 'bookingCancel', label: i18n.t('business.dashboardTabs.bookingCancel') || 'Booking Cancel' },
  { id: 'bookingReminder', label: i18n.t('business.dashboardTabs.bookingReminder') || 'Booking Reminder' },
  // HR sub-tabs
  { id: 'permissions', label: i18n.t('business.dashboardTabs.permissions') || 'Permissions' },
  { id: 'checkOut', label: i18n.t('business.dashboardTabs.checkOut') || 'Check-out' },
  { id: 'leaves', label: i18n.t('business.dashboardTabs.leaves') || 'Leaves' },
  { id: 'tasks', label: i18n.t('business.dashboardTabs.tasks') || 'Tasks' },
  // Website sub-tabs
  { id: 'pages', label: i18n.t('business.dashboardTabs.pages') || 'Pages' },
  { id: 'templates', label: i18n.t('business.dashboardTabs.templates') || 'Templates' },
  { id: 'seo', label: i18n.t('business.dashboardTabs.seo') || 'SEO' },
  { id: 'blog', label: i18n.t('business.dashboardTabs.blog') || 'Blog' },
  { id: 'forms', label: i18n.t('business.dashboardTabs.forms') || 'Forms' },
  { id: 'media', label: i18n.t('business.dashboardTabs.media') || 'Media' },
  { id: 'domains', label: i18n.t('business.dashboardTabs.domains') || 'Domains' },
  { id: 'publishing', label: i18n.t('business.dashboardTabs.publishing') || 'Publishing' },
  // Analytics sub-tabs
  { id: 'kpi', label: i18n.t('business.dashboardTabs.kpi') || 'KPI' },
  { id: 'charts', label: i18n.t('business.dashboardTabs.charts') || 'Charts' },
  { id: 'salesPerformance', label: i18n.t('business.dashboardTabs.salesPerformance') || 'Sales Performance' },
  { id: 'productPerformance', label: i18n.t('business.dashboardTabs.productPerformance') || 'Product Performance' },
  { id: 'visitors', label: i18n.t('business.dashboardTabs.visitors') || 'Visitors' },
  { id: 'conversions', label: i18n.t('business.dashboardTabs.conversions') || 'Conversions' },
  // AI sub-tabs
  { id: 'aiContent', label: i18n.t('business.dashboardTabs.aiContent') || 'AI Content' },
  { id: 'aiImages', label: i18n.t('business.dashboardTabs.aiImages') || 'AI Images' },
  { id: 'aiSEO', label: i18n.t('business.dashboardTabs.aiSEO') || 'AI SEO' },
  { id: 'aiAnalysis', label: i18n.t('business.dashboardTabs.aiAnalysis') || 'AI Analysis' },
  { id: 'aiReplies', label: i18n.t('business.dashboardTabs.aiReplies') || 'AI Replies' },
  { id: 'aiSuggestions', label: i18n.t('business.dashboardTabs.aiSuggestions') || 'AI Suggestions' },
  { id: 'aiPages', label: i18n.t('business.dashboardTabs.aiPages') || 'AI Pages' },
  { id: 'aiDataAnalysis', label: i18n.t('business.dashboardTabs.aiDataAnalysis') || 'AI Data Analysis' },
  { id: 'aiInsights', label: i18n.t('business.dashboardTabs.aiInsights') || 'AI Insights' },
  { id: 'aiRecommendations', label: i18n.t('business.dashboardTabs.aiRecommendations') || 'AI Recommendations' },
  { id: 'aiAutomations', label: i18n.t('business.dashboardTabs.aiAutomations') || 'AI Automations' },
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
    'employees',
    'attendance',
    'payroll',
    'settings',
    // New sub-tabs
    'quotes', 'payments', 'returns', 'loyalty', 'subscriptions', 'epayment', 'orderStatus',
    'categories', 'variants', 'warehouses', 'stocktake', 'suppliers', 'purchaseOrders', 'transfers', 'barcode', 'qrCode', 'stockTracking', 'lowStockAlerts',
    'revenue', 'profits', 'taxes', 'journal', 'cashflow', 'accounts', 'wallets', 'financialReports',
    'campaigns', 'coupons', 'discounts', 'messages', 'emailCampaigns', 'pushNotifications', 'smsCampaigns', 'loyaltyPrograms', 'seasonalOffers',
    'chats', 'tickets', 'complaints', 'reviews', 'notes', 'followUps', 'contactLog',
    'appointments', 'calendar', 'rooms', 'doctors', 'bookingConfirm', 'bookingCancel', 'bookingReminder',
    'permissions', 'checkOut', 'leaves', 'tasks',
    'pages', 'templates', 'seo', 'blog', 'forms', 'media', 'domains', 'publishing',
    'kpi', 'charts', 'salesPerformance', 'productPerformance', 'visitors', 'conversions',
    'aiContent', 'aiImages', 'aiSEO', 'aiAnalysis', 'aiReplies', 'aiSuggestions', 'aiPages', 'aiDataAnalysis',
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
const BOOKING_CORE_TAB_IDS: MerchantDashboardTabId[] = ['overview', 'notifications', 'reservations', 'builder', 'apps', 'settings'];
const BOOKING_SHARED_TAB_IDS: MerchantDashboardTabId[] = ['notifications', 'gallery', 'reports', 'expenses', 'marketing', 'employees', 'attendance', 'payroll', 'returns'];

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
  const enabledRaw =
    layoutConfig?.enabledModules ||
    shop?.enabledModules ||
    shop?.pageDesign?.moduleConfig?.enabledModules ||
    shop?.pageDesign?.enabledModules;
  const enabledArr = Array.isArray(enabledRaw) ? enabledRaw : null;

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

  if (enabledArr) {
    for (const raw of enabledArr) {
      const moduleId = String(raw || '').trim().toLowerCase();
      const tabs = MODULE_TO_TABS[moduleId];
      if (tabs) {
        const savedFeatures = layoutConfig?.enabledFeatures;
        if (savedFeatures && typeof savedFeatures === 'object' && Array.isArray(savedFeatures[moduleId])) {
          const enabledFeatureIds = new Set(savedFeatures[moduleId].map((f: any) => String(f)));
          for (const tabId of tabs) {
            if (!BOOKING_SHARED_TAB_IDS.includes(tabId)) continue;
            if (FEATURE_TO_TAB.has(tabId)) {
              const featureId = FEATURE_TO_TAB.get(tabId)!;
              if (enabledFeatureIds.has(featureId)) allowedIds.add(tabId);
            } else {
              allowedIds.add(tabId);
            }
          }
        } else {
          for (const tabId of tabs) {
            if (BOOKING_SHARED_TAB_IDS.includes(tabId)) allowedIds.add(tabId);
          }
        }
      }
    }
  }

  return MERCHANT_DASHBOARD_TABS.filter((t) => allowedIds.has(t.id));
};

// ============================================
// نظام الأنشطة القديم (Legacy Activities) — مسار مستقل بالكامل
// ============================================
// أي نشاط غير حجوزات (مطاعم، أزياء، تجزئة، أثاث، عقارات...) يعتمد فقط على
// الـ Category + إعدادات المتجر، ولا تظهر له أبداً تابات نظام الحجوزات.
const MODULE_TO_TABS: Record<string, MerchantDashboardTabId[]> = {
  sales: ['sales', 'abandonedCart', 'quotes', 'payments', 'returns', 'loyalty', 'subscriptions', 'pos', 'epayment', 'orderStatus'],
  inventory: ['products', 'categories', 'variants', 'warehouses', 'stocktake', 'suppliers', 'purchaseOrders', 'transfers', 'barcode', 'qrCode', 'stockTracking', 'lowStockAlerts'],
  finance: ['invoice', 'expenses', 'revenue', 'profits', 'taxes', 'journal', 'cashflow', 'accounts', 'wallets', 'financialReports'],
  crm: ['customers', 'chats', 'tickets', 'complaints', 'reviews', 'notes', 'followUps', 'contactLog'],
  marketing: ['promotions', 'marketing', 'campaigns', 'coupons', 'discounts', 'messages', 'emailCampaigns', 'pushNotifications', 'smsCampaigns', 'loyaltyPrograms', 'seasonalOffers'],
  bookings: ['reservations', 'appointments', 'calendar', 'rooms', 'doctors', 'bookingConfirm', 'bookingCancel', 'bookingReminder', 'restaurantTables'],
  hr: ['employees', 'attendance', 'payroll', 'permissions', 'checkOut', 'leaves', 'tasks'],
  website: ['builder', 'gallery', 'pages', 'templates', 'seo', 'blog', 'forms', 'media', 'domains', 'publishing'],
  analytics: ['reports', 'kpi', 'charts', 'salesPerformance', 'productPerformance', 'visitors', 'conversions'],
  ai: ['aiContent', 'aiImages', 'aiSEO', 'aiAnalysis', 'aiReplies', 'aiSuggestions', 'aiPages', 'aiDataAnalysis', 'aiInsights', 'aiRecommendations', 'aiAutomations'],
};

const ALWAYS_VISIBLE_TABS: MerchantDashboardTabId[] = ['overview', 'notifications', 'apps', 'settings'];

const getLegacyDashboardTabsForShop = (shop?: any) => {
  const category = shop?.category;
  const layoutConfig = (shop?.layoutConfig && typeof shop.layoutConfig === 'object') ? shop.layoutConfig : undefined;
  const enabledRaw =
    layoutConfig?.enabledModules ||
    shop?.enabledModules ||
    shop?.pageDesign?.moduleConfig?.enabledModules ||
    shop?.pageDesign?.enabledModules;
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

    // Always-visible core tabs
    for (const id of ALWAYS_VISIBLE_TABS) set.add(id);

    // Only add module-specific tabs if the module is enabled
    if (Array.isArray(enabledRaw)) {
      for (const raw of enabledRaw) {
        const moduleId = String(raw || '').trim().toLowerCase();
        const tabs = MODULE_TO_TABS[moduleId];
        if (tabs) {
          // If we have saved feature preferences, only add tabs for enabled features
          const savedFeatures = layoutConfig?.enabledFeatures;
          if (savedFeatures && typeof savedFeatures === 'object' && Array.isArray(savedFeatures[moduleId])) {
            const enabledFeatureIds = new Set(savedFeatures[moduleId].map((f: any) => String(f)));
            for (const tabId of tabs) {
              if (FEATURE_TO_TAB.has(tabId)) {
                const featureId = FEATURE_TO_TAB.get(tabId)!;
                if (enabledFeatureIds.has(featureId)) set.add(tabId);
              } else {
                set.add(tabId);
              }
            }
          } else {
            for (const tabId of tabs) set.add(tabId);
          }
        }
      }
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
  if (req === 'apps') return req;

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
  if (!known) {
    // Fallback: check if it's a valid tab in MERCHANT_DASHBOARD_TABS (bypasses module gating)
    const allKnown = MERCHANT_DASHBOARD_TABS.find((t) => t.id === req);
    if (allKnown) return allKnown.id;
    return tabs[0]?.id || 'overview';
  }
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
  if (tab.id === 'employees') return i18n.t('business.dashboardTabs.employees') || 'الموظفون';
  if (tab.id === 'attendance') return i18n.t('business.dashboardTabs.attendance') || 'الحضور';
  if (tab.id === 'payroll') return i18n.t('business.dashboardTabs.payroll') || 'الرواتب';
  if (tab.id === 'expenses') return i18n.t('business.dashboardTabs.expenses') || 'المصروفات';
  if (tab.id === 'invoice') return i18n.t('business.dashboardTabs.invoice') || 'الفواتير';
  if (tab.id === 'abandonedCart') return i18n.t('business.dashboardTabs.abandonedCart') || 'السلة المتروكة';
  if (tab.id === 'pos') return i18n.t('business.dashboardTabs.pos') || 'الكاشير';
  if (tab.id === 'notifications') return i18n.t('business.dashboardTabs.notifications') || 'الإشعارات';
  if (tab.id === 'restaurantTables') return i18n.t('business.dashboardTabs.restaurantTables') || 'الطاولات والقاعات';
  if (tab.id === 'reservations') return i18n.t('business.dashboardTabs.reservations') || 'الحجوزات';
  if (tab.id === 'builder') return i18n.t('business.dashboardTabs.builder') || 'التصميم';

  // New sub-module tabs
  if (tab.id === 'quotes') return i18n.t('business.dashboardTabs.quotes') || 'عروض الأسعار';
  if (tab.id === 'payments') return i18n.t('business.dashboardTabs.payments') || 'المدفوعات';
  if (tab.id === 'returns') return i18n.t('business.dashboardTabs.returns') || 'المرتجعات';
  if (tab.id === 'loyalty') return i18n.t('business.dashboardTabs.loyalty') || 'نقاط الولاء';
  if (tab.id === 'subscriptions') return i18n.t('business.dashboardTabs.subscriptions') || 'الاشتراكات';
  if (tab.id === 'epayment') return i18n.t('business.dashboardTabs.epayment') || 'الدفع الإلكتروني';
  if (tab.id === 'orderStatus') return i18n.t('business.dashboardTabs.orderStatus') || 'حالات الطلب';
  if (tab.id === 'categories') return i18n.t('business.dashboardTabs.categories') || 'الفئات';
  if (tab.id === 'variants') return i18n.t('business.dashboardTabs.variants') || 'المتغيرات';
  if (tab.id === 'warehouses') return i18n.t('business.dashboardTabs.warehouses') || 'المخازن';
  if (tab.id === 'stocktake') return i18n.t('business.dashboardTabs.stocktake') || 'الجرد';
  if (tab.id === 'suppliers') return i18n.t('business.dashboardTabs.suppliers') || 'الموردين';
  if (tab.id === 'purchaseOrders') return i18n.t('business.dashboardTabs.purchaseOrders') || 'أوامر الشراء';
  if (tab.id === 'transfers') return i18n.t('business.dashboardTabs.transfers') || 'النقل بين المخازن';
  if (tab.id === 'barcode') return i18n.t('business.dashboardTabs.barcode') || 'الباركود';
  if (tab.id === 'qrCode') return i18n.t('business.dashboardTabs.qrCode') || 'QR Code';
  if (tab.id === 'stockTracking') return i18n.t('business.dashboardTabs.stockTracking') || 'تتبع الكميات';
  if (tab.id === 'lowStockAlerts') return i18n.t('business.dashboardTabs.lowStockAlerts') || 'تنبيهات النفاد';
  if (tab.id === 'revenue') return i18n.t('business.dashboardTabs.revenue') || 'الإيرادات';
  if (tab.id === 'profits') return i18n.t('business.dashboardTabs.profits') || 'الأرباح';
  if (tab.id === 'taxes') return i18n.t('business.dashboardTabs.taxes') || 'الضرائب';
  if (tab.id === 'journal') return i18n.t('business.dashboardTabs.journal') || 'القيود';
  if (tab.id === 'cashflow') return i18n.t('business.dashboardTabs.cashflow') || 'التدفقات النقدية';
  if (tab.id === 'accounts') return i18n.t('business.dashboardTabs.accounts') || 'الحسابات';
  if (tab.id === 'wallets') return i18n.t('business.dashboardTabs.wallets') || 'المحافظ';
  if (tab.id === 'financialReports') return i18n.t('business.dashboardTabs.financialReports') || 'التقارير المالية';
  if (tab.id === 'campaigns') return i18n.t('business.dashboardTabs.campaigns') || 'الحملات';
  if (tab.id === 'coupons') return i18n.t('business.dashboardTabs.coupons') || 'الكوبونات';
  if (tab.id === 'discounts') return i18n.t('business.dashboardTabs.discounts') || 'الخصومات';
  if (tab.id === 'messages') return i18n.t('business.dashboardTabs.messages') || 'الرسائل';
  if (tab.id === 'emailCampaigns') return i18n.t('business.dashboardTabs.emailCampaigns') || 'البريد الإلكتروني';
  if (tab.id === 'pushNotifications') return i18n.t('business.dashboardTabs.pushNotifications') || 'Push Notifications';
  if (tab.id === 'smsCampaigns') return i18n.t('business.dashboardTabs.smsCampaigns') || 'SMS';
  if (tab.id === 'loyaltyPrograms') return i18n.t('business.dashboardTabs.loyaltyPrograms') || 'برامج الولاء';
  if (tab.id === 'seasonalOffers') return i18n.t('business.dashboardTabs.seasonalOffers') || 'العروض الموسمية';
  if (tab.id === 'chats') return i18n.t('business.dashboardTabs.chats') || 'المحادثات';
  if (tab.id === 'tickets') return i18n.t('business.dashboardTabs.tickets') || 'التذاكر';
  if (tab.id === 'complaints') return i18n.t('business.dashboardTabs.complaints') || 'الشكاوى';
  if (tab.id === 'reviews') return i18n.t('business.dashboardTabs.reviews') || 'التقييمات';
  if (tab.id === 'notes') return i18n.t('business.dashboardTabs.notes') || 'الملاحظات';
  if (tab.id === 'followUps') return i18n.t('business.dashboardTabs.followUps') || 'المتابعة';
  if (tab.id === 'contactLog') return i18n.t('business.dashboardTabs.contactLog') || 'سجل التواصل';
  if (tab.id === 'appointments') return i18n.t('business.dashboardTabs.appointments') || 'المواعيد';
  if (tab.id === 'calendar') return i18n.t('business.dashboardTabs.calendar') || 'التقويم';
  if (tab.id === 'rooms') return i18n.t('business.dashboardTabs.rooms') || 'الغرف';
  if (tab.id === 'doctors') return i18n.t('business.dashboardTabs.doctors') || 'الأطباء';
  if (tab.id === 'bookingConfirm') return i18n.t('business.dashboardTabs.bookingConfirm') || 'تأكيد الحجز';
  if (tab.id === 'bookingCancel') return i18n.t('business.dashboardTabs.bookingCancel') || 'إلغاء الحجز';
  if (tab.id === 'bookingReminder') return i18n.t('business.dashboardTabs.bookingReminder') || 'تذكير الحجز';
  if (tab.id === 'permissions') return i18n.t('business.dashboardTabs.permissions') || 'الصلاحيات';
  if (tab.id === 'checkOut') return i18n.t('business.dashboardTabs.checkOut') || 'الانصراف';
  if (tab.id === 'leaves') return i18n.t('business.dashboardTabs.leaves') || 'الإجازات';
  if (tab.id === 'tasks') return i18n.t('business.dashboardTabs.tasks') || 'المهام';
  if (tab.id === 'pages') return i18n.t('business.dashboardTabs.pages') || 'الصفحات';
  if (tab.id === 'templates') return i18n.t('business.dashboardTabs.templates') || 'القوالب';
  if (tab.id === 'seo') return i18n.t('business.dashboardTabs.seo') || 'SEO';
  if (tab.id === 'blog') return i18n.t('business.dashboardTabs.blog') || 'المدونة';
  if (tab.id === 'forms') return i18n.t('business.dashboardTabs.forms') || 'النماذج';
  if (tab.id === 'media') return i18n.t('business.dashboardTabs.media') || 'الوسائط';
  if (tab.id === 'domains') return i18n.t('business.dashboardTabs.domains') || 'الدومينات';
  if (tab.id === 'publishing') return i18n.t('business.dashboardTabs.publishing') || 'النشر';
  if (tab.id === 'kpi') return i18n.t('business.dashboardTabs.kpi') || 'مؤشرات الأداء';
  if (tab.id === 'charts') return i18n.t('business.dashboardTabs.charts') || 'الرسوم البيانية';
  if (tab.id === 'salesPerformance') return i18n.t('business.dashboardTabs.salesPerformance') || 'أداء المبيعات';
  if (tab.id === 'productPerformance') return i18n.t('business.dashboardTabs.productPerformance') || 'أداء المنتجات';
  if (tab.id === 'visitors') return i18n.t('business.dashboardTabs.visitors') || 'الزوار';
  if (tab.id === 'conversions') return i18n.t('business.dashboardTabs.conversions') || 'التحويلات';
  if (tab.id === 'aiContent') return i18n.t('business.dashboardTabs.aiContent') || 'كتابة المحتوى';
  if (tab.id === 'aiImages') return i18n.t('business.dashboardTabs.aiImages') || 'إنشاء الصور';
  if (tab.id === 'aiSEO') return i18n.t('business.dashboardTabs.aiSEO') || 'تحسين SEO';
  if (tab.id === 'aiAnalysis') return i18n.t('business.dashboardTabs.aiAnalysis') || 'تحليل النشاط';
  if (tab.id === 'aiReplies') return i18n.t('business.dashboardTabs.aiReplies') || 'الردود التلقائية';
  if (tab.id === 'aiSuggestions') return i18n.t('business.dashboardTabs.aiSuggestions') || 'الاقتراحات';
  if (tab.id === 'aiPages') return i18n.t('business.dashboardTabs.aiPages') || 'إنشاء الصفحات';
  if (tab.id === 'aiDataAnalysis') return i18n.t('business.dashboardTabs.aiDataAnalysis') || 'تحليل البيانات';

  const category = shop?.category;
  return tab.dynamicLabel ? tab.dynamicLabel(category) : tab.label;
};
