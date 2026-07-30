import { LayoutDashboard } from 'lucide-react';
import type { ModuleDef } from '../../types';

export const coreModule: ModuleDef = {
  id: 'core',
  name: 'Core Dashboard',
  nameKey: 'modules.core.name',
  nameAr: 'اللوحة الرئيسية',
  description: 'Overview, notifications, and system settings — always enabled.',
  descriptionKey: 'modules.core.description',
  descriptionAr: 'نظرة عامة، إشعارات، وإعدادات النظام — مفعّل دائماً.',
  icon: LayoutDashboard,
  category: 'core',
  color: '#0F172A',
  dependencies: [],
  features: [
    { id: 'overview', label: 'Dashboard Overview', labelAr: 'نظرة عامة', defaultEnabled: true },
    { id: 'notifications', label: 'Notifications Center', labelAr: 'مركز الإشعارات', defaultEnabled: true },
    { id: 'settings', label: 'System Settings', labelAr: 'إعدادات النظام', defaultEnabled: true },
    { id: 'profile', label: 'Account Profile', labelAr: 'ملف الحساب', defaultEnabled: true },
  ],
  pages: [
    { id: 'overview', label: 'Overview', route: '/business/dashboard', tabId: 'overview', existing: true },
    { id: 'notifications', label: 'Notifications', route: '/business/dashboard?tab=notifications', tabId: 'notifications', existing: true },
    { id: 'settings', label: 'Settings', route: '/business/dashboard?tab=settings', tabId: 'settings', existing: true },
    { id: 'profile', label: 'Profile', route: '/business/profile', existing: true },
  ],
  navigation: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      titleKey: 'dashboard.sections.dashboard',
      order: 0,
      items: [
        { id: 'overview', label: 'Overview', labelKey: 'business.dashboardTabs.overview', route: '/business/dashboard', tabId: 'overview', icon: 'LayoutDashboard', order: 0 },
        { id: 'notifications', label: 'Notifications', labelKey: 'business.dashboardTabs.notifications', route: '/business/dashboard?tab=notifications', tabId: 'notifications', icon: 'Bell', order: 1 },
      ],
    },
  ],
  dashboardWidgets: [
    { id: 'overview_stats', label: 'Revenue & Orders Stats', labelKey: 'modules.core.widgetStats', component: 'OverviewStats', order: 0, size: 'large' },
    { id: 'recent_notifications', label: 'Recent Notifications', labelKey: 'modules.core.widgetNotifications', component: 'RecentNotifications', order: 1, size: 'medium' },
  ],
  permissions: [
    { id: 'dashboard.view', label: 'View Dashboard' },
    { id: 'settings.manage', label: 'Manage Settings' },
  ],
  settingsSections: [
    { id: 'overview', label: 'General', labelKey: 'dashboard.settings.overview' },
    { id: 'store', label: 'Store Information', labelKey: 'dashboard.settings.store' },
    { id: 'account', label: 'Account', labelKey: 'dashboard.settings.account' },
    { id: 'notifications', label: 'Notifications', labelKey: 'dashboard.settings.notifications' },
    { id: 'modules', label: 'Modules', labelKey: 'dashboard.settings.modules' },
  ],
  defaultEnabled: true,
  optional: false,
  estimatedSetupMinutes: 0,
};
