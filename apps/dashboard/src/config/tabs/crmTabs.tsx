import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const CustomersTab = lazy(() => import('../../modules/crm/pages/CustomersTab'));
const ChatsTab = lazy(() => import('../../modules/crm/pages/ChatsTab'));
const TicketsPage = lazy(() => import('../../modules/crm/pages/tickets/TicketsPage'));
const ComplaintsPage = lazy(() => import('../../modules/crm/pages/complaints/ComplaintsPage'));
const ReviewsPage = lazy(() => import('../../modules/crm/pages/reviews/ReviewsPage'));
const NotesPage = lazy(() => import('../../modules/crm/pages/notes/NotesPage'));
const FollowUpsPage = lazy(() => import('../../modules/crm/pages/followUps/FollowUpsPage'));
const ContactLogPage = lazy(() => import('../../modules/crm/pages/contactLog/ContactLogPage'));

export const crmTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  customers: ({ shopId, shop }) => <CustomersTab shopId={shopId} shop={shop} />,
  chats: ({ shopId }) => <ChatsTab shopId={shopId} />,
  tickets: ({ shopId, shop }) => <TicketsPage shopId={shopId} shop={shop} />,
  complaints: ({ shopId, shop }) => <ComplaintsPage shopId={shopId} shop={shop} />,
  reviews: ({ shopId, shop }) => <ReviewsPage shopId={shopId} shop={shop} />,
  notes: ({ shopId, shop }) => <NotesPage shopId={shopId} shop={shop} />,
  followUps: ({ shopId, shop }) => <FollowUpsPage shopId={shopId} shop={shop} />,
  contactLog: ({ shopId, shop }) => <ContactLogPage shopId={shopId} shop={shop} />,
};
