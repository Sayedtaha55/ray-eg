import { UserCog } from 'lucide-react';
import type { ModuleDef } from '../../types';

export const hrModule: ModuleDef = {
  id: 'hr',
  name: 'Human Resources',
  nameKey: 'modules.hr.name',
  nameAr: 'الموارد البشرية',
  description: 'Employee management, attendance tracking, payroll, and shift scheduling.',
  descriptionKey: 'modules.hr.description',
  descriptionAr: 'إدارة الموظفين، تتبع الحضور، الرواتب، وجدولة الورديات.',
  icon: UserCog,
  category: 'management',
  color: '#9333EA',
  dependencies: ['core'],
  features: [
    { id: 'employees', label: 'Employees', labelAr: 'الموظفين', defaultEnabled: true },
    { id: 'permissions', label: 'Permissions', labelAr: 'الصلاحيات', defaultEnabled: false },
    { id: 'attendance', label: 'Attendance', labelAr: 'الحضور', defaultEnabled: false },
    { id: 'checkOut', label: 'Check-out', labelAr: 'الانصراف', defaultEnabled: false },
    { id: 'payroll', label: 'Payroll', labelAr: 'الرواتب', defaultEnabled: false },
    { id: 'leaves', label: 'Leaves', labelAr: 'الإجازات', defaultEnabled: false },
    { id: 'tasks', label: 'Tasks', labelAr: 'المهام', defaultEnabled: false },
  ],
  pages: [
    { id: 'employees', label: 'Employees', route: '/business/dashboard?tab=employees', tabId: 'employees' },
    { id: 'attendance', label: 'Attendance', route: '/business/dashboard?tab=attendance', tabId: 'attendance' },
    { id: 'payroll', label: 'Payroll', route: '/business/dashboard?tab=payroll', tabId: 'payroll' },
    { id: 'permissions', label: 'Permissions', route: '/business/dashboard?tab=permissions', tabId: 'permissions' },
    { id: 'checkOut', label: 'Check-out', route: '/business/dashboard?tab=checkOut', tabId: 'checkOut' },
    { id: 'leaves', label: 'Leaves', route: '/business/dashboard?tab=leaves', tabId: 'leaves' },
    { id: 'tasks', label: 'Tasks', route: '/business/dashboard?tab=tasks', tabId: 'tasks' },
  ],
  navigation: [
    {
      id: 'hr',
      title: 'Human Resources',
      titleKey: 'dashboard.sections.hr',
      order: 50,
      items: [
        { id: 'employees', label: 'Employees', labelKey: 'business.dashboardTabs.employees', route: '/business/dashboard?tab=employees', tabId: 'employees', icon: 'UserCog', order: 0 },
        { id: 'permissions', label: 'Permissions', labelKey: 'business.dashboardTabs.permissions', route: '/business/dashboard?tab=permissions', tabId: 'permissions', icon: 'ShieldCheck', order: 1 },
        { id: 'attendance', label: 'Attendance', labelKey: 'business.dashboardTabs.attendance', route: '/business/dashboard?tab=attendance', tabId: 'attendance', icon: 'Clock', order: 2 },
        { id: 'checkOut', label: 'Check-out', labelKey: 'business.dashboardTabs.checkOut', route: '/business/dashboard?tab=checkOut', tabId: 'checkOut', icon: 'Clock', order: 3 },
        { id: 'payroll', label: 'Payroll', labelKey: 'business.dashboardTabs.payroll', route: '/business/dashboard?tab=payroll', tabId: 'payroll', icon: 'Coins', order: 4 },
        { id: 'leaves', label: 'Leaves', labelKey: 'business.dashboardTabs.leaves', route: '/business/dashboard?tab=leaves', tabId: 'leaves', icon: 'CalendarOff', order: 5 },
        { id: 'tasks', label: 'Tasks', labelKey: 'business.dashboardTabs.tasks', route: '/business/dashboard?tab=tasks', tabId: 'tasks', icon: 'CheckSquare', order: 6 },
      ],
    },
  ],
  dashboardWidgets: [
    { id: 'employee_count', label: 'Employee Count', labelKey: 'modules.hr.widgetEmployeeCount', component: 'EmployeeCount', order: 13, size: 'small' },
    { id: 'attendance_today', label: "Today's Attendance", labelKey: 'modules.hr.widgetAttendance', component: 'AttendanceToday', order: 14, size: 'medium' },
  ],
  permissions: [
    { id: 'hr.view', label: 'View HR Data' },
    { id: 'hr.manage', label: 'Manage Employees' },
    { id: 'hr.payroll', label: 'Manage Payroll' },
  ],
  settingsSections: [
    { id: 'hr', label: 'HR Settings', labelKey: 'dashboard.settings.hr' },
  ],
  defaultEnabled: false,
  optional: true,
  estimatedSetupMinutes: 10,
};
