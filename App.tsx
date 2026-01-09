
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  PublicLayout,
  HomeFeed,
  ShopProfile,
  BusinessLayout,
  BusinessLanding,
  MerchantDashboard,
  ShopsPage,
  RestaurantsPage,
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
} from './components';

const { HashRouter, Routes, Route, useLocation } = ReactRouterDOM as any;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomeFeed />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="restaurants" element={<RestaurantsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="product/:id" element={<ProductPage />} />
        </Route>
        
        <Route path="shop/:slug" element={<ShopProfile />} />
        
        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<BusinessLanding />} />
          <Route path="dashboard" element={<MerchantDashboard />} />
        </Route>

        <Route path="/admin/gate" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="shops" element={<AdminDashboard />} />
          <Route path="shop-management" element={<AdminDashboard />} />
          <Route path="themes" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
