import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const OverviewTab = lazy(() => import('../../modules/core/pages/OverviewTab'));
const NotificationsTab = lazy(() => import('../../modules/core/pages/NotificationsTab'));
const GalleryTab = lazy(() => import('../../modules/core/pages/GalleryTab'));
const AppsTab = lazy(() => import('../../modules/shared/pages/AppsTab'));
const MerchantSettings = lazy(() => import('../../components/MerchantDashboard/Settings'));

export const coreTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  overview: ({ shop }) => <OverviewTab shop={shop} analytics={null} notifications={[]} />,
  notifications: ({ shopId }) => <NotificationsTab shopId={shopId} />,
  gallery: ({ shop, shopId }) => (
    <GalleryTab
      images={[]}
      onImagesChange={() => {}}
      shopId={shopId}
      primaryColor={shop?.pageDesign?.primaryColor || '#00E5FF'}
    />
  ),
  apps: ({ shop }) => <AppsTab shop={shop} />,
  settings: ({ shop }) => <MerchantSettings shop={shop} onSaved={() => {}} />,
};
