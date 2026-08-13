import { ShoppingCart } from 'lucide-react';
import type { ModuleDef } from '../../types';

export const posModule: ModuleDef = {
  id: 'pos',
  name: 'POS / Cashier',
  nameKey: 'modules.pos.name',
  nameAr: 'الكاشير',
  description: 'Point of sale checkout, invoices, shifts, and cashier reports.',
  descriptionKey: 'modules.pos.description',
  descriptionAr: 'نقطة البيع، الفواتير، الورديات، وتقارير الكاشير.',
  icon: ShoppingCart,
  category: 'operations',
  color: '#7C3AED',
  dependencies: ['core', 'sales'],
  features: [
    { id: 'posCheckout', label: 'Cashier Checkout', labelAr: 'الكاشير', defaultEnabled: true },
    { id: 'posInvoices', label: 'POS Invoices', labelAr: 'فواتير الكاشير', defaultEnabled: true },
    { id: 'posReturns', label: 'POS Returns', labelAr: 'مرتجعات الكاشير', defaultEnabled: false },
    { id: 'posWebsiteReturns', label: 'Website Returns', labelAr: 'مرتجعات الموقع', defaultEnabled: false },
    { id: 'posShifts', label: 'Shifts', labelAr: 'الورديات', defaultEnabled: true },
    { id: 'posReports', label: 'POS Reports', labelAr: 'تقارير الكاشير', defaultEnabled: false },
  ],
  pages: [
    { id: 'posCheckout', label: 'Cashier', route: '/business/dashboard?tab=pos', tabId: 'pos', existing: true },
    { id: 'posInvoices', label: 'POS Invoices', route: '/business/dashboard?tab=posInvoices', tabId: 'posInvoices' },
    { id: 'posReturns', label: 'POS Returns', route: '/business/dashboard?tab=posReturns', tabId: 'posReturns' },
    { id: 'posWebsiteReturns', label: 'Website Returns', route: '/business/dashboard?tab=posWebsiteReturns', tabId: 'posWebsiteReturns' },
    { id: 'posShifts', label: 'Shifts', route: '/business/dashboard?tab=posShifts', tabId: 'posShifts' },
    { id: 'posReports', label: 'POS Reports', route: '/business/dashboard?tab=posReports', tabId: 'posReports' },
  ],
  navigation: [
    {
      id: 'pos',
      title: 'POS / Cashier',
      titleKey: 'dashboard.sections.pos',
      order: 11,
      items: [
        { id: 'posCheckout', label: 'Cashier', labelKey: 'business.dashboardTabs.pos', route: '/business/dashboard?tab=pos', tabId: 'pos', icon: 'ScanLine', order: 0 },
        { id: 'posInvoices', label: 'POS Invoices', labelKey: 'business.dashboardTabs.posInvoices', route: '/business/dashboard?tab=posInvoices', tabId: 'posInvoices', icon: 'Receipt', order: 1 },
        { id: 'posReturns', label: 'POS Returns', labelKey: 'business.dashboardTabs.posReturns', route: '/business/dashboard?tab=posReturns', tabId: 'posReturns', icon: 'ArrowLeftRight', order: 2 },
        { id: 'posWebsiteReturns', label: 'Website Returns', labelKey: 'business.dashboardTabs.posWebsiteReturns', route: '/business/dashboard?tab=posWebsiteReturns', tabId: 'posWebsiteReturns', icon: 'Undo2', order: 3 },
        { id: 'posShifts', label: 'Shifts', labelKey: 'business.dashboardTabs.posShifts', route: '/business/dashboard?tab=posShifts', tabId: 'posShifts', icon: 'Clock', order: 4 },
        { id: 'posReports', label: 'POS Reports', labelKey: 'business.dashboardTabs.posReports', route: '/business/dashboard?tab=posReports', tabId: 'posReports', icon: 'BarChart3', order: 5 },
      ],
    },
  ],
  dashboardWidgets: [],
  permissions: [
    { id: 'pos.use', label: 'Use POS' },
    { id: 'pos.manage', label: 'Manage POS' },
    { id: 'pos.shifts', label: 'Manage Shifts' },
  ],
  settingsSections: [
    { id: 'pos', label: 'POS Settings', labelKey: 'dashboard.settings.pos' },
  ],
  defaultEnabled: true,
  optional: true,
  estimatedSetupMinutes: 3,
};
