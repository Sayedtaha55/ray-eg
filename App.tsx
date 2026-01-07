
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import HomeFeed from './components/HomeFeed';
import ShopProfile from './components/ShopProfile';
import BusinessLayout from './components/BusinessLayout';
import BusinessLanding from './components/BusinessLanding';
import MerchantDashboard from './components/MerchantDashboard';
import ShopsPage from './components/ShopsPage';
import RestaurantsPage from './components/RestaurantsPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import AboutPage from './components/AboutPage';
import ProductPage from './components/ProductPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AdminApprovals from './components/AdminApprovals';
import AdminUsers from './components/AdminUsers';
import AdminSettings from './components/AdminSettings';
import AdminFeedback from './components/AdminFeedback';
import AdminOrders from './components/AdminOrders';

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
