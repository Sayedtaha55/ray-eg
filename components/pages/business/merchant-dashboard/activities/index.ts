import { Category } from '@/types';

export type MerchantDashboardTabId =
  | 'overview'
  | 'products'
  | 'reservations'
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
    name: 'ملابس وأزياء',
    category: Category.FASHION,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'products', label: 'المخزون' },
      { id: 'sales', label: 'المبيعات' },
      { id: 'promotions', label: 'العروض' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'pos', label: 'نقطة البيع' },
      { id: 'settings', label: 'الإعدادات' },
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
    name: 'مطعم',
    category: Category.RESTAURANT,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'products', label: 'المنيو' },
      { id: 'reservations', label: 'الحجوزات' },
      { id: 'sales', label: 'المبيعات' },
      { id: 'promotions', label: 'العروض' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'pos', label: 'نقطة البيع' },
      { id: 'settings', label: 'الإعدادات' },
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
    name: 'تجارة عامة',
    category: Category.RETAIL,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'products', label: 'المخزون' },
      { id: 'sales', label: 'المبيعات' },
      { id: 'promotions', label: 'العروض' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'settings', label: 'الإعدادات' },
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
    name: 'إلكترونيات',
    category: Category.ELECTRONICS,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'products', label: 'المنتجات' },
      { id: 'sales', label: 'المبيعات' },
      { id: 'promotions', label: 'العروض' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'settings', label: 'الإعدادات' },
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
    name: 'صحة ودواء',
    category: Category.HEALTH,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'products', label: 'الأدوية' },
      { id: 'sales', label: 'المبيعات' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'settings', label: 'الإعدادات' },
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
    name: 'خدمات',
    category: Category.SERVICE,
    tabs: [
      { id: 'overview', label: 'نظرة عامة' },
      { id: 'reservations', label: 'الحجوزات' },
      { id: 'sales', label: 'الفواتير' },
      { id: 'customers', label: 'العملاء' },
      { id: 'gallery', label: 'المعرض' },
      { id: 'reports', label: 'التقارير' },
      { id: 'settings', label: 'الإعدادات' },
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
