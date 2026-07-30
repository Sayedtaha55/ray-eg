import { Users } from 'lucide-react';
import type { ModuleDef } from '../../types';

export const crmModule: ModuleDef = {
  id: 'crm',
  name: 'Customer Relations',
  nameKey: 'modules.crm.name',
  nameAr: 'علاقات العملاء',
  description: 'Customer profiles, groups, loyalty programs, and communication history.',
  descriptionKey: 'modules.crm.description',
  descriptionAr: 'ملفات العملاء، المجموعات، برامج الولاء، وسجل التواصل.',
  icon: Users,
  category: 'growth',
  color: '#DC2626',
  dependencies: ['core', 'sales'],
  features: [
    { id: 'customers', label: 'Customers', labelAr: 'العملاء', defaultEnabled: true },
    { id: 'chats', label: 'Chats', labelAr: 'المحادثات', defaultEnabled: false },
    { id: 'tickets', label: 'Tickets', labelAr: 'التذاكر', defaultEnabled: false },
    { id: 'complaints', label: 'Complaints', labelAr: 'الشكاوى', defaultEnabled: false },
    { id: 'reviews', label: 'Reviews', labelAr: 'التقييمات', defaultEnabled: false },
    { id: 'notes', label: 'Notes', labelAr: 'الملاحظات', defaultEnabled: false },
    { id: 'followUps', label: 'Follow-ups', labelAr: 'المتابعة', defaultEnabled: false },
    { id: 'contactLog', label: 'Contact Log', labelAr: 'سجل التواصل', defaultEnabled: false },
  ],
  pages: [
    { id: 'customers', label: 'Customers', route: '/business/dashboard?tab=customers', tabId: 'customers', existing: true },
    { id: 'chats', label: 'Chats', route: '/business/dashboard?tab=chats', tabId: 'chats' },
    { id: 'tickets', label: 'Tickets', route: '/business/dashboard?tab=tickets', tabId: 'tickets' },
    { id: 'complaints', label: 'Complaints', route: '/business/dashboard?tab=complaints', tabId: 'complaints' },
    { id: 'reviews', label: 'Reviews', route: '/business/dashboard?tab=reviews', tabId: 'reviews' },
    { id: 'notes', label: 'Notes', route: '/business/dashboard?tab=notes', tabId: 'notes' },
    { id: 'followUps', label: 'Follow-ups', route: '/business/dashboard?tab=followUps', tabId: 'followUps' },
    { id: 'contactLog', label: 'Contact Log', route: '/business/dashboard?tab=contactLog', tabId: 'contactLog' },
  ],
  navigation: [
    {
      id: 'crm',
      title: 'Customer Service',
      titleKey: 'dashboard.sections.crm',
      order: 45,
      items: [
        { id: 'customers', label: 'Customers', labelKey: 'business.dashboardTabs.customers', route: '/business/dashboard?tab=customers', tabId: 'customers', icon: 'Users', order: 0 },
        { id: 'chats', label: 'Chats', labelKey: 'business.dashboardTabs.chats', route: '/business/dashboard?tab=chats', tabId: 'chats', icon: 'MessageSquare', order: 1 },
        { id: 'tickets', label: 'Tickets', labelKey: 'business.dashboardTabs.tickets', route: '/business/dashboard?tab=tickets', tabId: 'tickets', icon: 'Ticket', order: 2 },
        { id: 'complaints', label: 'Complaints', labelKey: 'business.dashboardTabs.complaints', route: '/business/dashboard?tab=complaints', tabId: 'complaints', icon: 'Headphones', order: 3 },
        { id: 'reviews', label: 'Reviews', labelKey: 'business.dashboardTabs.reviews', route: '/business/dashboard?tab=reviews', tabId: 'reviews', icon: 'ThumbsUp', order: 4 },
        { id: 'notes', label: 'Notes', labelKey: 'business.dashboardTabs.notes', route: '/business/dashboard?tab=notes', tabId: 'notes', icon: 'StickyNote', order: 5 },
        { id: 'followUps', label: 'Follow-ups', labelKey: 'business.dashboardTabs.followUps', route: '/business/dashboard?tab=followUps', tabId: 'followUps', icon: 'PhoneCall', order: 6 },
        { id: 'contactLog', label: 'Contact Log', labelKey: 'business.dashboardTabs.contactLog', route: '/business/dashboard?tab=contactLog', tabId: 'contactLog', icon: 'ListChecks', order: 7 },
      ],
    },
  ],
  dashboardWidgets: [
    { id: 'customer_count', label: 'Total Customers', labelKey: 'modules.crm.widgetCustomerCount', component: 'CustomerCount', order: 8, size: 'small' },
    { id: 'top_customers', label: 'Top Customers', labelKey: 'modules.crm.widgetTopCustomers', component: 'TopCustomers', order: 9, size: 'medium' },
  ],
  permissions: [
    { id: 'crm.view', label: 'View Customers' },
    { id: 'crm.manage', label: 'Manage Customers' },
  ],
  settingsSections: [
    { id: 'crm', label: 'CRM Settings', labelKey: 'dashboard.settings.crm' },
    { id: 'loyalty', label: 'Loyalty Program', labelKey: 'dashboard.settings.loyalty' },
  ],
  defaultEnabled: false,
  optional: true,
  estimatedSetupMinutes: 5,
};
