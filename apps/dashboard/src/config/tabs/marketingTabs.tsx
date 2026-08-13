import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const MarketingTab = lazy(() => import('../../modules/marketing/pages/MarketingTab'));
const PromotionsTab = lazy(() => import('../../modules/marketing/pages/PromotionsTab'));
const CampaignsPage = lazy(() => import('../../modules/marketing/pages/campaigns/CampaignsPage'));
const CouponsPage = lazy(() => import('../../modules/marketing/pages/coupons/CouponsPage'));
const DiscountsPage = lazy(() => import('../../modules/marketing/pages/discounts/DiscountsPage'));
const MessagesPage = lazy(() => import('../../modules/marketing/pages/messages/MessagesPage'));
const EmailCampaignsPage = lazy(() => import('../../modules/marketing/pages/emailCampaigns/EmailCampaignsPage'));
const PushNotificationsPage = lazy(() => import('../../modules/marketing/pages/pushNotifications/PushNotificationsPage'));
const SmsCampaignsPage = lazy(() => import('../../modules/marketing/pages/smsCampaigns/SmsCampaignsPage'));
const LoyaltyProgramsPage = lazy(() => import('../../modules/marketing/pages/loyaltyPrograms/LoyaltyProgramsPage'));
const SeasonalOffersPage = lazy(() => import('../../modules/marketing/pages/seasonalOffers/SeasonalOffersPage'));

export const marketingTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  marketing: ({ shopId, shop }) => <MarketingTab shopId={shopId} shop={shop} />,
  promotions: ({ shop, sales }) => <PromotionsTab offers={[]} shop={shop} onDelete={() => {}} onCreate={() => {}} />,
  campaigns: ({ shopId, shop }) => <CampaignsPage shopId={shopId} shop={shop} />,
  coupons: ({ shopId, shop }) => <CouponsPage shopId={shopId} shop={shop} />,
  discounts: ({ shopId, shop }) => <DiscountsPage shopId={shopId} shop={shop} />,
  messages: ({ shopId, shop }) => <MessagesPage shopId={shopId} shop={shop} />,
  emailCampaigns: ({ shopId, shop }) => <EmailCampaignsPage shopId={shopId} shop={shop} />,
  pushNotifications: ({ shopId, shop }) => <PushNotificationsPage shopId={shopId} shop={shop} />,
  smsCampaigns: ({ shopId, shop }) => <SmsCampaignsPage shopId={shopId} shop={shop} />,
  loyaltyPrograms: ({ shopId, shop }) => <LoyaltyProgramsPage shopId={shopId} shop={shop} />,
  seasonalOffers: ({ shopId, shop }) => <SeasonalOffersPage shopId={shopId} shop={shop} />,
};
