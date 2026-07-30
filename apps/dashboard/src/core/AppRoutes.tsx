import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { suspense } from './routerHelpers';

const BusinessLayout = React.lazy(() => import('../layouts/BusinessLayout'));
const BusinessHero = React.lazy(() => import('../pages/business/BusinessHero'));
const MerchantOnboarding = React.lazy(() => import('../pages/business/MerchantOnboarding'));
const OnboardingWizard = React.lazy(() => import('../pages/business/OnboardingWizard'));
const MerchantDashboard = React.lazy(() => import('../pages/business/merchant-dashboard'));
const MerchantProfilePage = React.lazy(() => import('../pages/business/MerchantProfilePage'));
const BusinessPendingApproval = React.lazy(() => import('../pages/business/BusinessPendingApproval'));
const CourierSignupPage = React.lazy(() => import('../pages/business/CourierSignupPage'));
const BuilderPreviewPage = React.lazy(() => import('../pages/business/builder/BuilderPreviewPage'));
const BookingActivityPage = React.lazy(() => import('../pages/business/bookings/BookingActivityPage'));

const AdminLayout = React.lazy(() => import('../layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('../pages/admin/AdminLogin'));
const AdminApprovals = React.lazy(() => import('../pages/admin/AdminApprovals'));
const AdminShops = React.lazy(() => import('../pages/admin/AdminShops'));
const AdminUsers = React.lazy(() => import('../pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('../pages/admin/AdminOrders'));
const AdminDelivery = React.lazy(() => import('../pages/admin/AdminDelivery'));
const AdminFeedback = React.lazy(() => import('../pages/admin/AdminFeedback'));
const AdminCustomerService = React.lazy(() => import('../pages/admin/AdminCustomerService'));
const AdminAnalytics = React.lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminNotifications = React.lazy(() => import('../pages/admin/AdminNotifications'));
const AdminContent = React.lazy(() => import('../pages/admin/AdminContent'));
const AdminSettings = React.lazy(() => import('../pages/admin/AdminSettings'));
const CourierOrders = React.lazy(() => import('../pages/courier/CourierOrders'));
const Page404 = React.lazy(() => import('../pages/shared/404'));
const PortalLoginPage = React.lazy(() => import('../pages/portal/PortalLoginPage'));
const PortalLayout = React.lazy(() => import('../pages/portal/PortalLayout'));
const PortalDashboard = React.lazy(() => import('../pages/portal/PortalDashboard'));
const PortalListingsPage = React.lazy(() => import('../pages/portal/PortalListingsPage'));
const PortalEditListingPage = React.lazy(() => import('../pages/portal/PortalEditListingPage'));
const PortalBranchesPage = React.lazy(() => import('../pages/portal/PortalBranchesPage'));
const PortalAnalyticsPage = React.lazy(() => import('../pages/portal/PortalAnalyticsPage'));
const PortalProfilePage = React.lazy(() => import('../pages/portal/PortalProfilePage'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/business/:shopId/hero" element={suspense(<BusinessHero />)} />
      <Route path="/business/builder/preview" element={suspense(<BuilderPreviewPage />)} />
      <Route path="/business/pending" element={suspense(<BusinessLayout />)}>
        <Route index element={suspense(<BusinessPendingApproval />)} />
      </Route>
      <Route path="/business" element={suspense(<BusinessLayout />)}>
        <Route index element={<Navigate to="/business/dashboard" replace />} />
        <Route path="onboarding" element={suspense(<MerchantOnboarding />)} />
        <Route path="setup" element={suspense(<OnboardingWizard />)} />
        <Route path="dashboard" element={suspense(<MerchantDashboard />)} />
        <Route path="profile" element={suspense(<MerchantProfilePage />)} />
        <Route path="pending" element={suspense(<BusinessPendingApproval />)} />
        <Route path="courier-signup" element={suspense(<CourierSignupPage />)} />
        <Route path=":activity" element={suspense(<BookingActivityPage />)} />
      </Route>
      <Route path="/admin/gate" element={suspense(<AdminLogin />)} />
      <Route path="/admin" element={suspense(<AdminLayout />)}>
        <Route path="dashboard" element={suspense(<AdminDashboard />)} />
        <Route path="approvals" element={suspense(<AdminApprovals />)} />
        <Route path="shops" element={suspense(<AdminShops />)} />
        <Route path="users" element={suspense(<AdminUsers />)} />
        <Route path="orders" element={suspense(<AdminOrders />)} />
        <Route path="delivery" element={suspense(<AdminDelivery />)} />
        <Route path="feedback" element={suspense(<AdminFeedback />)} />
        <Route path="customer-service" element={suspense(<AdminCustomerService />)} />
        <Route path="analytics" element={suspense(<AdminAnalytics />)} />
        <Route path="notifications" element={suspense(<AdminNotifications />)} />
        <Route path="content" element={suspense(<AdminContent />)} />
        <Route path="settings" element={suspense(<AdminSettings />)} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      <Route path="/portal/login" element={suspense(<PortalLoginPage />)} />
      <Route path="/portal" element={suspense(<PortalLayout />)}>
        <Route index element={suspense(<PortalDashboard />)} />
        <Route path="listings" element={suspense(<PortalListingsPage />)} />
        <Route path="listings/:id/edit" element={suspense(<PortalEditListingPage />)} />
        <Route path="listings/:id/branches" element={suspense(<PortalBranchesPage />)} />
        <Route path="analytics" element={suspense(<PortalAnalyticsPage />)} />
        <Route path="profile" element={suspense(<PortalProfilePage />)} />
      </Route>
      <Route path="/courier/orders" element={suspense(<CourierOrders />)} />
      <Route path="/404" element={suspense(<Page404 />)} />
      <Route path="*" element={<Navigate to="/business" replace />} />
    </Routes>
  );
};

export default AppRoutes;
