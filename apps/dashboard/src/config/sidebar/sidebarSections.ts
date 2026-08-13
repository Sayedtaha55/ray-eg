import React from 'react';
import { MerchantDashboardTabId, getTabLabel, MERCHANT_DASHBOARD_TABS } from '../../pages/business/merchant-dashboard/dashboardTabs';

export type SidebarNavItem = {
  id: MerchantDashboardTabId;
  icon?: React.ReactNode;
  label: string;
  route?: string;
  tabId?: string;
  children?: SidebarNavItem[];
};

export type SidebarSection = {
  title: string;
  moduleId?: string;
  items: SidebarNavItem[];
};

export type SidebarConfigContext = {
  isArabic: boolean;
  shopForModules: any;
  shopCategory: string;
  t: (key: string) => string;
  iconByTabId: Partial<Record<MerchantDashboardTabId, React.ReactNode>>;
};

export function buildSidebarSections(ctx: SidebarConfigContext): SidebarSection[] {
  const { isArabic, shopForModules, shopCategory, t, iconByTabId } = ctx;

  const allTabs = MERCHANT_DASHBOARD_TABS.map((tab) => ({
    ...tab,
    icon: iconByTabId[tab.id],
    label: getTabLabel(tab, shopForModules || { category: shopCategory }),
  }));

  const byId = new Map<string, any>();
  for (const tab of allTabs) byId.set(String(tab.id), tab);

  const pick = (...ids: MerchantDashboardTabId[]) =>
    ids.map((id) => byId.get(String(id))).filter(Boolean);

  const sections: SidebarSection[] = [];

  // Dashboard (no moduleId — always expanded)
  const dashboardItems = pick('overview', 'notifications');
  if (dashboardItems.length > 0) {
    sections.push({ title: t('dashboard.sections.dashboard'), items: dashboardItems });
  }

  // Sales
  const salesItems = pick('sales', 'abandonedCart', 'quotes', 'payments', 'loyalty', 'subscriptions', 'pos', 'epayment', 'orderStatus');
  const returnsTab = byId.get('returns');
  if (returnsTab && salesItems.length > 0) {
    salesItems[0] = { ...salesItems[0], children: [returnsTab] };
  }
  sections.push({ title: isArabic ? 'المبيعات' : 'Sales', moduleId: 'sales', items: salesItems });

  // Inventory
  sections.push({
    title: isArabic ? 'المخزون' : 'Inventory',
    moduleId: 'inventory',
    items: pick('products', 'categories', 'variants', 'warehouses', 'stocktake', 'suppliers', 'purchaseOrders', 'transfers', 'barcode', 'qrCode', 'stockTracking', 'lowStockAlerts'),
  });

  // Finance
  sections.push({
    title: isArabic ? 'المالية' : 'Finance',
    moduleId: 'finance',
    items: pick('invoice', 'expenses', 'revenue', 'profits', 'taxes', 'journal', 'cashflow', 'accounts', 'wallets', 'financialReports'),
  });

  // Marketing
  sections.push({
    title: isArabic ? 'التسويق' : 'Marketing',
    moduleId: 'marketing',
    items: pick('promotions', 'marketing', 'campaigns', 'coupons', 'discounts', 'messages', 'emailCampaigns', 'pushNotifications', 'smsCampaigns', 'loyaltyPrograms', 'seasonalOffers'),
  });

  // CRM
  sections.push({
    title: isArabic ? 'خدمة العملاء' : 'Customer Service',
    moduleId: 'crm',
    items: pick('customers', 'chats', 'tickets', 'complaints', 'reviews', 'notes', 'followUps', 'contactLog'),
  });

  // Bookings
  sections.push({
    title: isArabic ? 'إدارة نشاط الحجوزات' : 'Booking Management',
    moduleId: 'bookings',
    items: pick('reservations', 'providers', 'services', 'activityRooms', 'activityPatients', 'activityInventory', 'restaurantTables', 'appointments', 'calendar', 'rooms', 'doctors', 'bookingConfirm', 'bookingCancel', 'bookingReminder'),
  });

  // HR
  sections.push({
    title: isArabic ? 'الموارد البشرية' : 'Human Resources',
    moduleId: 'hr',
    items: pick('employees', 'permissions', 'attendance', 'checkOut', 'payroll', 'leaves', 'tasks'),
  });

  // Website
  sections.push({
    title: isArabic ? 'الموقع الإلكتروني' : 'Website',
    moduleId: 'website',
    items: pick('builder', 'gallery', 'pages', 'templates', 'seo', 'blog', 'forms', 'media', 'domains', 'publishing'),
  });

  // Analytics
  sections.push({
    title: isArabic ? 'التحليلات' : 'Analytics',
    moduleId: 'analytics',
    items: pick('reports', 'kpi', 'charts', 'salesPerformance', 'productPerformance', 'visitors', 'conversions'),
  });

  // AI
  sections.push({
    title: isArabic ? 'الذكاء الاصطناعي' : 'AI Assistant',
    moduleId: 'ai',
    items: pick('aiContent', 'aiImages', 'aiSEO', 'aiAnalysis', 'aiReplies', 'aiSuggestions', 'aiPages', 'aiDataAnalysis', 'aiInsights', 'aiRecommendations', 'aiAutomations'),
  });

  // Settings (no moduleId — always expanded)
  const setupItems = pick('settings');
  if (setupItems.length > 0) {
    sections.push({ title: isArabic ? 'الإعدادات' : 'Settings', items: setupItems });
  }

  return sections;
}
