import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const EmployeesTab = lazy(() => import('../../modules/hr/pages/EmployeesTab'));
const AttendanceTab = lazy(() => import('../../modules/hr/pages/AttendanceTab'));
const PayrollTab = lazy(() => import('../../modules/hr/pages/PayrollTab'));
const PermissionsPage = lazy(() => import('../../modules/hr/pages/permissions/PermissionsPage'));
const CheckOutPage = lazy(() => import('../../modules/hr/pages/checkOut/CheckOutPage'));
const LeavesPage = lazy(() => import('../../modules/hr/pages/leaves/LeavesPage'));
const TasksPage = lazy(() => import('../../modules/hr/pages/tasks/TasksPage'));

export const hrTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  employees: ({ shopId, shop }) => <EmployeesTab shopId={shopId} shop={shop} />,
  attendance: ({ shopId, shop }) => <AttendanceTab shopId={shopId} shop={shop} />,
  payroll: ({ shopId, shop }) => <PayrollTab shopId={shopId} shop={shop} />,
  permissions: ({ shopId, shop }) => <PermissionsPage shopId={shopId} shop={shop} />,
  checkOut: ({ shopId, shop }) => <CheckOutPage shopId={shopId} shop={shop} />,
  leaves: ({ shopId, shop }) => <LeavesPage shopId={shopId} shop={shop} />,
  tasks: ({ shopId, shop }) => <TasksPage shopId={shopId} shop={shop} />,
};
