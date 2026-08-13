import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const ReportsTab = lazy(() => import('../../modules/analytics/pages/ReportsTab'));
const CashierReportsTab = lazy(() => import('../../modules/analytics/pages/CashierReportsTab'));
const AnalyticsOverviewPage = lazy(() => import('../../modules/analytics/pages/overview/OverviewPage'));
const SalesReportPage = lazy(() => import('../../modules/analytics/pages/salesReport/SalesReportPage'));
const CustomerInsightsPage = lazy(() => import('../../modules/analytics/pages/customerInsights/CustomerInsightsPage'));
const TrafficPage = lazy(() => import('../../modules/analytics/pages/traffic/TrafficPage'));
const ConversionsPage = lazy(() => import('../../modules/analytics/pages/conversions/ConversionsPage'));
const ProductPerformancePage = lazy(() => import('../../modules/analytics/pages/productPerformance/ProductPerformancePage'));

export const analyticsTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  reports: ({ shop, sales, reservations }) => (
    <ReportsTab analytics={null} sales={sales} reservations={reservations} posEnabled={false} shop={shop} />
  ),
  kpi: ({ shopId, shop }) => <AnalyticsOverviewPage shopId={shopId} shop={shop} />,
  charts: ({ shop, sales, reservations }) => (
    <ReportsTab analytics={null} sales={sales} reservations={reservations} posEnabled={false} shop={shop} />
  ),
  salesPerformance: ({ shopId, shop }) => <SalesReportPage shopId={shopId} shop={shop} />,
  productPerformance: ({ shopId, shop }) => <ProductPerformancePage shopId={shopId} shop={shop} />,
  visitors: ({ shopId, shop }) => <TrafficPage shopId={shopId} shop={shop} />,
  conversions: ({ shopId, shop }) => <ConversionsPage shopId={shopId} shop={shop} />,
};
