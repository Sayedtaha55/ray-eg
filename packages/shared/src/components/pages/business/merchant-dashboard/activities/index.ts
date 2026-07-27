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
  bookingActivityType?: BookingActivityType; // ربط مع نظام الحجوزات الجديد
  tabs: MerchantDashboardTabDefinition[];
  defaultTab: MerchantDashboardTabId;
  features: ActivityFeatures;
};

// ============================================
// خريطة ربطShop Categories مع Booking Activity Types
// ============================================
const CATEGORY_TO_BOOKING_ACTIVITY: Record<string, BookingActivityType> = {
  'RESTAURANT': 'restaurants_tables',
  'SERVICE': 'clinic',
  'FASHION': 'salon_barber',      // صالونات/حلاقين
  'RETAIL': 'general_appointments', // مواعيد عامة
  'ELECTRONICS': 'general_appointments',
  'HEALTH': 'clinic',              // عيادات
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
    bookingActivityType: 'restaurants_tables',
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
    bookingActivityType: 'salon_barber',
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
    bookingActivityType: 'general_appointments',
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
    bookingActivityType: 'general_appointments',
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
    bookingActivityType: 'clinic',
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
  service: {
    id: 'service',
    name: i18n.t('business.activities.service'),
    category: Category.SERVICE,
    bookingActivityType: 'clinic',
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'reservations', label: 'حجوزات' },
      { id: 'builder', label: 'التصميم' },
      { id: 'settings', label: 'الإعدادات' },
    ],
    defaultTab: 'reservations',
    features: {
      showReservations: true,
      showMenuBuilder: false,
      showFashionSizes: false,
      showPOS: false,
      showAnalytics: true,
      showTableManagement: false,
      showDeliveryManagement: false,
      showInventoryTracking: false,
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

export const getAllowedTabIdsForCategory = (category?: Category): Set<MerchantDashboardTabId> => {
  const cat = String(category || '').toUpperCase();
  if (cat === 'SERVICE') {
    return new Set<MerchantDashboardTabId>([
      'overview',
      'reservations',
      'builder',
      'settings',
    ]);
  }

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
// ============================================
export const getBookingActivityTypeFromCategory = (category?: Category): BookingActivityType => {
  const cat = String(category || '').toUpperCase();
  return CATEGORY_TO_BOOKING_ACTIVITY[cat] || 'clinic';
};