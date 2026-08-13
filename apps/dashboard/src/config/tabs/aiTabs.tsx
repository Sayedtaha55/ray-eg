import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const AiAssistantPanelLazy = lazy(() => import('../../modules/ai/pages/AiAssistantPanel'));
const AiInsightsPage = lazy(() => import('../../modules/ai/pages/insights/InsightsPage'));
const AiRecommendationsPage = lazy(() => import('../../modules/ai/pages/recommendations/RecommendationsPage'));
const AiAutomationsPage = lazy(() => import('../../modules/ai/pages/automations/AutomationsPage'));

export const aiTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  aiContent: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiContent" />,
  aiImages: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiImages" />,
  aiSEO: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiSEO" />,
  aiAnalysis: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiAnalysis" />,
  aiReplies: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiReplies" />,
  aiSuggestions: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiSuggestions" />,
  aiPages: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiPages" />,
  aiDataAnalysis: ({ shopId, shop }) => <AiAssistantPanelLazy shopId={shopId} shop={shop} currentPage="aiDataAnalysis" />,
  aiInsights: ({ shopId, shop }) => <AiInsightsPage shopId={shopId} shop={shop} />,
  aiRecommendations: ({ shopId, shop }) => <AiRecommendationsPage shopId={shopId} shop={shop} />,
  aiAutomations: ({ shopId, shop }) => <AiAutomationsPage shopId={shopId} shop={shop} />,
};
