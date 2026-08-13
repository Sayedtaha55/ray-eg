import React from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer, TabRenderProps } from './salesTabs';

import { salesTabRenderers } from './salesTabs';
import { inventoryTabRenderers } from './inventoryTabs';
import { financeTabRenderers } from './financeTabs';
import { marketingTabRenderers } from './marketingTabs';
import { crmTabRenderers } from './crmTabs';
import { hrTabRenderers } from './hrTabs';
import { analyticsTabRenderers } from './analyticsTabs';
import { websiteTabRenderers } from './websiteTabs';
import { aiTabRenderers } from './aiTabs';
import { bookingsTabRenderers } from './bookingsTabs';
import { coreTabRenderers } from './coreTabs';

export type { TabRenderer, TabRenderProps };

export const tabRegistry: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  ...coreTabRenderers,
  ...salesTabRenderers,
  ...inventoryTabRenderers,
  ...financeTabRenderers,
  ...marketingTabRenderers,
  ...crmTabRenderers,
  ...hrTabRenderers,
  ...analyticsTabRenderers,
  ...websiteTabRenderers,
  ...aiTabRenderers,
  ...bookingsTabRenderers,
};

export function renderTab(tabId: MerchantDashboardTabId, props: TabRenderProps): React.ReactNode {
  const renderer = tabRegistry[tabId];
  if (!renderer) return null;
  return renderer(props);
}
