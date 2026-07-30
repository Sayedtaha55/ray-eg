import { LucideIcon } from 'lucide-react';

export type ModuleId =
  | 'core'
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'crm'
  | 'marketing'
  | 'bookings'
  | 'hr'
  | 'website'
  | 'analytics'
  | 'ai'
  // Sales sub-modules
  | 'orders' | 'quotes' | 'payments' | 'returns' | 'loyalty' | 'subscriptions' | 'posCheckout' | 'epayment' | 'orderStatus'
  // Inventory sub-modules
  | 'categories' | 'variants' | 'warehouses' | 'stocktake' | 'suppliers' | 'purchaseOrders' | 'transfers' | 'barcode' | 'qrCode' | 'stockTracking' | 'lowStockAlerts'
  // Finance sub-modules
  | 'revenue' | 'profits' | 'taxes' | 'journal' | 'cashflow' | 'accounts' | 'wallets' | 'financialReports'
  // Marketing sub-modules
  | 'campaigns' | 'coupons' | 'discounts' | 'messages' | 'emailCampaigns' | 'pushNotifications' | 'smsCampaigns' | 'loyaltyPrograms' | 'seasonalOffers'
  // CRM sub-modules
  | 'chats' | 'tickets' | 'complaints' | 'reviews' | 'notes' | 'followUps' | 'contactLog'
  // Bookings sub-modules
  | 'appointments' | 'calendar' | 'rooms' | 'doctors' | 'bookingConfirm' | 'bookingCancel' | 'bookingReminder'
  // HR sub-modules
  | 'permissions' | 'checkOut' | 'leaves' | 'tasks'
  // Website sub-modules
  | 'pages' | 'templates' | 'seo' | 'blog' | 'forms' | 'media' | 'domains' | 'publishing'
  // Analytics sub-modules
  | 'kpi' | 'charts' | 'salesPerformance' | 'productPerformance' | 'visitors' | 'conversions'
  // AI sub-modules
  | 'aiContent' | 'aiImages' | 'aiSEO' | 'aiAnalysis' | 'aiReplies' | 'aiSuggestions' | 'aiPages' | 'aiDataAnalysis';

export type ModuleCategory = 'core' | 'operations' | 'growth' | 'management' | 'intelligence' | 'sales' | 'inventory' | 'finance' | 'marketing' | 'crm' | 'bookings' | 'hr' | 'website' | 'analytics' | 'ai';

export type FeatureDef = {
  id: string;
  label: string;
  labelAr?: string;
  description?: string;
  defaultEnabled?: boolean;
};

export type NavigationItemDef = {
  id: string;
  label: string;
  labelKey?: string;
  route: string;
  tabId?: string;
  icon?: string;
  badge?: string;
  order?: number;
};

export type NavigationSectionDef = {
  id: string;
  title: string;
  titleKey?: string;
  items: NavigationItemDef[];
  order?: number;
};

export type DashboardWidgetDef = {
  id: string;
  label: string;
  labelKey?: string;
  component?: string;
  order?: number;
  size?: 'small' | 'medium' | 'large' | 'full';
};

export type PageDef = {
  id: string;
  label: string;
  route: string;
  tabId?: string;
  existing?: boolean;
};

export type PermissionDef = {
  id: string;
  label: string;
  description?: string;
};

export type SettingsSectionDef = {
  id: string;
  label: string;
  labelKey?: string;
};

export type ModuleDef = {
  id: ModuleId;
  name: string;
  nameKey?: string;
  nameAr?: string;
  description: string;
  descriptionKey?: string;
  descriptionAr?: string;
  icon: LucideIcon;
  category: ModuleCategory;
  color: string;
  dependencies: ModuleId[];
  features: FeatureDef[];
  pages: PageDef[];
  navigation: NavigationSectionDef[];
  dashboardWidgets: DashboardWidgetDef[];
  permissions: PermissionDef[];
  settingsSections: SettingsSectionDef[];
  defaultEnabled: boolean;
  optional: boolean;
  estimatedSetupMinutes: number;
};

export type BusinessCategoryDef = {
  id: string;
  title: string;
  titleKey?: string;
  titleAr?: string;
  description: string;
  descriptionKey?: string;
  descriptionAr?: string;
  icon: string;
  color: string;
};

export type ModuleRecommendation = {
  moduleId: ModuleId;
  reason: string;
  reasonKey?: string;
  reasonAr?: string;
  priority: 'required' | 'recommended' | 'optional';
};

export type BusinessTypeDef = {
  id: string;
  categoryId: string;
  title: string;
  titleKey?: string;
  titleAr?: string;
  description: string;
  descriptionKey?: string;
  descriptionAr?: string;
  category: string;
  specialties: string[];
  recommendedModules: ModuleRecommendation[];
  themeActivityId?: string;
};

export type SystemSummaryData = {
  enabledModules: { id: ModuleId; name: string; nameAr?: string; icon: LucideIcon; color: string; features: number }[];
  totalFeatures: number;
  totalPages: number;
  totalDashboardWidgets: number;
  totalNavigationItems: number;
  estimatedSetupMinutes: number;
  moduleCount: number;
};
