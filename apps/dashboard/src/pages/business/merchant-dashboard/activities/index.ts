/**
 * ═══════════════════════════════════════════
 * merchant-dashboard/activities/index.ts
 * ربط بين الأنشطة القديمة和新书 نظام الحجوزات
 * ═══════════════════════════════════════════
 */

import { Category } from '@/types';
import { CORE_MERCHANT_MODULES } from '../coreModules';
import i18n from '@/i18n';
import { BookingActivityType, BOOKING_ACTIVITIES } from '../../bookings/config';
import type { MerchantDashboardTabId } from '../dashboardTabs';

export type MerchantDashboardTabDefinition = {
  id: MerchantDashboardTabId;
  label: string;
  visibleFor?: Category[];
  dynamicLabel?: (category?: string) => string;
  bookingTabType?: 'providers' | 'services' | 'activityRooms' | 'activityPatients'; // ربط مع booking system
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

// ============================================
// خريطة ربط Shop Categories مع Booking Activity Types
// هذه الخريطة تُستخدم فقط كـ fallback لاقتراح نشاط حجوزات محتمل
// عند إنشاء متجر جديد. لا تُستخدم لتحديد ما إذا كان المتجر نشاط حجوزات أم لا
// (ذلك يحدده isShopBookingActivity في bookings/config.ts).
// ============================================
const CATEGORY_TO_BOOKING_ACTIVITY: Partial<Record<string, BookingActivityType>> = {
  'HEALTH': 'clinic',
  'HOTEL': 'hotels_rooms',
  'CAFE': 'restaurants_tables',
};

// ============================================
// Activity configs with booking system integration
// ============================================
export const ACTIVITY_CONFIGS: Record<string, MerchantDashboardActivityConfig> = {
  restaurant: {
    id: 'restaurant',
    name: i18n.t('business.activities.restaurant'),
    category: Category.RESTAURANT,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.menu') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'restaurantTables', label: i18n.t('business.dashboardTabs.restaurantTables') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
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
  fashion: {
    id: 'fashion',
    name: i18n.t('business.activities.fashion'),
    category: Category.FASHION,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'overview',
    features: {
      showReservations: true,
      showMenuBuilder: false,
      showFashionSizes: true,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  retail: {
    id: 'retail',
    name: i18n.t('business.activities.retail'),
    category: Category.RETAIL,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
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
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
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
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
      { id: 'pos', label: i18n.t('business.activities.pos') },
      { id: 'settings', label: i18n.t('business.dashboardTabs.settings') },
    ],
    defaultTab: 'reservations',
    features: {
      showReservations: true,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: true,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
  // ملحوظة: هذا الكونفيج الآن خاص فقط بأنشطة النظام القديم (أثاث، عقارات، مقاولين...)
  // التي تحمل فئة SERVICE بدون أن تكون نشاط حجوزات فعلي (isShopBookingActivity = false).
  // أنشطة الحجوزات الحقيقية (عيادات، صالونات...) لها مسارها المستقل بالكامل
  // في dashboardTabs.ts ولا تستخدم هذا الكونفيج أبداً.
  service: {
    id: 'service',
    name: i18n.t('business.activities.service'),
    category: Category.SERVICE,
    tabs: [
      { id: 'overview', label: i18n.t('business.dashboardTabs.overview') },
      { id: 'products', label: i18n.t('business.dashboardTabs.inventory') },
      { id: 'reservations', label: i18n.t('business.dashboardTabs.reservations') },
      { id: 'invoice', label: i18n.t('business.dashboardTabs.invoice') },
      { id: 'sales', label: i18n.t('business.dashboardTabs.sales') },
      { id: 'promotions', label: i18n.t('business.dashboardTabs.promotions') },
      { id: 'customers', label: i18n.t('business.dashboardTabs.customers') },
      { id: 'gallery', label: i18n.t('business.activities.gallery') },
      { id: 'reports', label: i18n.t('business.dashboardTabs.reports') },
      { id: 'abandonedCart', label: i18n.t('business.dashboardTabs.abandonedCart') },
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
      showDeliveryManagement: true,
      showInventoryTracking: true,
    },
  },
};

// ============================================
// Helper functions
// ============================================
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

// ملحوظة: هذه الدالة تُستخدم فقط لأنشطة النظام القديم (غير أنشطة الحجوزات).
// نظام الحجوزات له مساره الخاص بالكامل في dashboardTabs.ts عبر isShopBookingActivity()
// ولا يعتمد على الـ Category نهائياً، لمنع أي تخالط بين النظامين.
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

// ============================================
// Helper: Get booking activity type from shop category
// Returns undefined for categories that are NOT inherently booking activities.
// Only HEALTH, HOTEL, and CAFE have a natural booking affinity.
// ============================================
export const getBookingActivityTypeFromCategory = (category?: Category): BookingActivityType | undefined => {
  const cat = String(category || '').toUpperCase();
  return CATEGORY_TO_BOOKING_ACTIVITY[cat];
};