import { BarChart3 } from 'lucide-react';
import type { ModuleDef } from '../../types';

export const analyticsModule: ModuleDef = {
  id: 'analytics',
  name: 'Analytics & Reports',
  nameKey: 'modules.analytics.name',
  nameAr: 'التحليلات والتقارير',
  description: 'Business intelligence dashboard, sales reports, customer insights, and trends.',
  descriptionKey: 'modules.analytics.description',
  descriptionAr: 'لوحة ذكاء أعمال، تقارير مبيعات، رؤى عملاء، واتجاهات.',
  icon: BarChart3,
  category: 'intelligence',
  color: '#059669',
  dependencies: ['core', 'sales'],
  features: [
    { id: 'reports', label: 'Reports', labelAr: 'التقارير', defaultEnabled: true },
    { id: 'kpi', label: 'KPI', labelAr: 'مؤشرات الأداء', defaultEnabled: false },
    { id: 'charts', label: 'Charts', labelAr: 'الرسوم البيانية', defaultEnabled: false },
    { id: 'salesPerformance', label: 'Sales Performance', labelAr: 'أداء المبيعات', defaultEnabled: false },
    { id: 'productPerformance', label: 'Product Performance', labelAr: 'أداء المنتجات', defaultEnabled: false },
    { id: 'visitors', label: 'Visitors', labelAr: 'الزوار', defaultEnabled: false },
    { id: 'conversions', label: 'Conversions', labelAr: 'التحويلات', defaultEnabled: false },
  ],
  pages: [
    { id: 'reports', label: 'Reports', route: '/business/dashboard?tab=reports', tabId: 'reports', existing: true },
    { id: 'kpi', label: 'KPI', route: '/business/dashboard?tab=kpi', tabId: 'kpi' },
    { id: 'charts', label: 'Charts', route: '/business/dashboard?tab=charts', tabId: 'charts' },
    { id: 'salesPerformance', label: 'Sales Performance', route: '/business/dashboard?tab=salesPerformance', tabId: 'salesPerformance' },
    { id: 'productPerformance', label: 'Product Performance', route: '/business/dashboard?tab=productPerformance', tabId: 'productPerformance' },
    { id: 'visitors', label: 'Visitors', route: '/business/dashboard?tab=visitors', tabId: 'visitors' },
    { id: 'conversions', label: 'Conversions', route: '/business/dashboard?tab=conversions', tabId: 'conversions' },
  ],
  navigation: [
    {
      id: 'analytics',
      title: 'Analytics',
      titleKey: 'dashboard.sections.analytics',
      order: 70,
      items: [
        { id: 'reports', label: 'Reports', labelKey: 'business.dashboardTabs.reports', route: '/business/dashboard?tab=reports', tabId: 'reports', icon: 'BarChart3', order: 0 },
        { id: 'kpi', label: 'KPI', labelKey: 'business.dashboardTabs.kpi', route: '/business/dashboard?tab=kpi', tabId: 'kpi', icon: 'TrendingUp', order: 1 },
        { id: 'charts', label: 'Charts', labelKey: 'business.dashboardTabs.charts', route: '/business/dashboard?tab=charts', tabId: 'charts', icon: 'PieChart', order: 2 },
        { id: 'salesPerformance', label: 'Sales Performance', labelKey: 'business.dashboardTabs.salesPerformance', route: '/business/dashboard?tab=salesPerformance', tabId: 'salesPerformance', icon: 'LineChart', order: 3 },
        { id: 'productPerformance', label: 'Product Performance', labelKey: 'business.dashboardTabs.productPerformance', route: '/business/dashboard?tab=productPerformance', tabId: 'productPerformance', icon: 'BarChart3', order: 4 },
        { id: 'visitors', label: 'Visitors', labelKey: 'business.dashboardTabs.visitors', route: '/business/dashboard?tab=visitors', tabId: 'visitors', icon: 'Eye', order: 5 },
        { id: 'conversions', label: 'Conversions', labelKey: 'business.dashboardTabs.conversions', route: '/business/dashboard?tab=conversions', tabId: 'conversions', icon: 'MousePointerClick', order: 6 },
      ],
    },
  ],
  dashboardWidgets: [
    { id: 'analytics_chart', label: 'Analytics Overview', labelKey: 'modules.analytics.widgetOverview', component: 'AnalyticsOverview', order: 16, size: 'large' },
    { id: 'top_products', label: 'Top Products', labelKey: 'modules.analytics.widgetTopProducts', component: 'TopProducts', order: 17, size: 'medium' },
  ],
  permissions: [
    { id: 'analytics.view', label: 'View Reports' },
    { id: 'analytics.export', label: 'Export Reports' },
  ],
  settingsSections: [
    { id: 'analytics', label: 'Analytics Settings', labelKey: 'dashboard.settings.analytics' },
  ],
  defaultEnabled: false,
  optional: true,
  estimatedSetupMinutes: 3,
};
