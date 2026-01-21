
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  PublicLayout,
  HomeFeed,
  ShopProfile,
  BusinessLayout,
  BusinessLanding,
  BusinessHero,
  MerchantDashboard,
  BusinessPendingApproval,
  ShopsPage,
  RestaurantsPage,
  MapPage,
  LoginPage,
  SignupPage,
  ProfilePage,
  AboutPage,
  ProductPage,
  AdminLayout,
  AdminDashboard,
  AdminLogin,
  AdminApprovals,
  AdminUsers,
  AdminSettings,
  AdminFeedback,
  AdminOrders,
  CourierOrders,
  NotFoundPage,
  ResetPasswordPage,
} from './components';

const { HashRouter, BrowserRouter, Routes, Route, useLocation } = ReactRouterDOM as any;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const isDirectDeepLink = typeof window !== 'undefined' && window.location.hash === '' && window.location.pathname !== '/';
  const Router = routerMode === 'browser' || isDirectDeepLink ? BrowserRouter : HashRouter;
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomeFeed />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="product/:id" element={<ProductPage />} />
        </Route>
        
        <Route path="/shop/:slug" element={<ShopProfile />} />

        <Route path="/s/:slug" element={<ShopProfile />} />

        <Route path="/business/:shopId/hero" element={<BusinessHero />} />

        <Route path="/business/pending" element={<BusinessLayout />}>
          <Route index element={<BusinessPendingApproval />} />
        </Route>
        
        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<BusinessLanding />} />
          <Route path="dashboard" element={<MerchantDashboard />} />
          <Route path="pending" element={<BusinessPendingApproval />} />
        </Route>

        <Route path="/admin/gate" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="shops" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/courier/orders" element={<CourierOrders />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
