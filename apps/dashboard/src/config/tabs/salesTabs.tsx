import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';

const SalesTab = lazy(() => import('../../modules/sales/pages/SalesTab'));
const QuotesPage = lazy(() => import('../../modules/sales/pages/quotes/QuotesPage'));
const AbandonedCartTab = lazy(() => import('../../modules/sales/pages/AbandonedCartTab'));
const SalesReturnsView = lazy(() => import('../../modules/sales/pages/sales/SalesReturnsView'));
const LoyaltyPage = lazy(() => import('../../modules/sales/pages/loyalty/LoyaltyPage'));
const SubscriptionsPage = lazy(() => import('../../modules/sales/pages/subscriptions/SubscriptionsPage'));
const EpaymentPage = lazy(() => import('../../modules/sales/pages/epayment/EpaymentPage'));
const PaymentsPage = lazy(() => import('../../modules/sales/pages/payments/PaymentsPage'));
const OrderStatusPage = lazy(() => import('../../modules/sales/pages/orderStatus/OrderStatusPage'));

export type TabRenderProps = {
  shopId: string;
  shop: any;
  sales: any[];
  reservations?: any[];
  isArabic: boolean;
};

export type TabRenderer = (props: TabRenderProps) => React.ReactNode;

export const salesTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  sales: ({ shop, sales }) => <SalesTab sales={sales} shop={shop} />,
  quotes: ({ shopId, shop }) => <QuotesPage shopId={shopId} shop={shop} />,
  loyalty: ({ shopId, shop }) => <LoyaltyPage shopId={shopId} shop={shop} />,
  subscriptions: ({ shopId, shop }) => <SubscriptionsPage shopId={shopId} shop={shop} />,
  epayment: ({ shopId, shop }) => <EpaymentPage shopId={shopId} shop={shop} />,
  orderStatus: ({ shopId, shop }) => <OrderStatusPage shopId={shopId} shop={shop} />,
  abandonedCart: ({ shopId, shop }) => <AbandonedCartTab shopId={shopId} shop={shop} />,
  returns: ({ sales }) => <SalesReturnsView sales={sales} />,
  payments: ({ shopId, shop }) => <PaymentsPage shopId={shopId} shop={shop} />,
};
