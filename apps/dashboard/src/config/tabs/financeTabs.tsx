import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const InvoiceTab = lazy(() => import('../../modules/finance/pages/InvoiceTab'));
const ExpensesTab = lazy(() => import('../../modules/finance/pages/ExpensesTab'));
const RevenuePage = lazy(() => import('../../modules/finance/pages/revenue/RevenuePage'));
const ProfitsPage = lazy(() => import('../../modules/finance/pages/profits/ProfitsPage'));
const TaxesPage = lazy(() => import('../../modules/finance/pages/taxes/TaxesPage'));
const JournalPage = lazy(() => import('../../modules/finance/pages/journal/JournalPage'));
const CashflowPage = lazy(() => import('../../modules/finance/pages/cashflow/CashflowPage'));
const AccountsPage = lazy(() => import('../../modules/finance/pages/accounts/AccountsPage'));
const WalletsPage = lazy(() => import('../../modules/finance/pages/wallets/WalletsPage'));
const FinancialReportsPage = lazy(() => import('../../modules/finance/pages/financialReports/FinancialReportsPage'));

export const financeTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  invoice: ({ shopId, shop }) => <InvoiceTab shopId={shopId} shop={shop} />,
  expenses: ({ shopId, shop, sales, reservations }) => (
    <ExpensesTab shopId={shopId} shop={shop} reservations={reservations} sales={sales} />
  ),
  revenue: ({ shopId, shop }) => <RevenuePage shopId={shopId} shop={shop} />,
  profits: ({ shopId, shop }) => <ProfitsPage shopId={shopId} shop={shop} />,
  taxes: ({ shopId, shop }) => <TaxesPage shopId={shopId} shop={shop} />,
  journal: ({ shopId, shop }) => <JournalPage shopId={shopId} shop={shop} />,
  cashflow: ({ shopId, shop }) => <CashflowPage shopId={shopId} shop={shop} />,
  accounts: ({ shopId, shop }) => <AccountsPage shopId={shopId} shop={shop} />,
  wallets: ({ shopId, shop }) => <WalletsPage shopId={shopId} shop={shop} />,
  financialReports: ({ shopId, shop }) => <FinancialReportsPage shopId={shopId} shop={shop} />,
};
