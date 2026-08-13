import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const PagesPage = lazy(() => import('../../modules/website/pages/pages/PagesPage'));
const BlogPage = lazy(() => import('../../modules/website/pages/blog/BlogPage'));
const SeoPage = lazy(() => import('../../modules/website/pages/seo/SeoPage'));
const DomainsPage = lazy(() => import('../../modules/website/pages/domains/DomainsPage'));

export const websiteTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  pages: ({ shopId, shop }) => <PagesPage shopId={shopId} shop={shop} />,
  blog: ({ shopId, shop }) => <BlogPage shopId={shopId} shop={shop} />,
  seo: ({ shopId, shop }) => <SeoPage shopId={shopId} shop={shop} />,
  domains: ({ shopId, shop }) => <DomainsPage shopId={shopId} shop={shop} />,
};
