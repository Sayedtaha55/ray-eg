import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

const PublicLayout = React.lazy(() => import('./components/layouts/PublicLayout'));

const HomeFeed = React.lazy(() => import('./components/pages/public/HomeFeed'));
const ShopsPage = React.lazy(() => import('./components/pages/public/ShopsPage'));
const RestaurantsPage = React.lazy(() => import('./components/pages/public/RestaurantsPage'));
const OffersPage = React.lazy(() => import('./components/pages/public/OffersPage'));
const MapPage = React.lazy(() => import('./components/pages/public/MapPage'));
const LoginPage = React.lazy(() => import('./components/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./components/pages/auth/SignupPage'));
const GoogleCallbackPage = React.lazy(() => import('./components/pages/auth/GoogleCallbackPage'));
const ResetPasswordPage = React.lazy(() => import('./components/pages/auth/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('./components/pages/public/ProfilePage'));
const AboutPage = React.lazy(() => import('./components/pages/public/AboutPage'));
const ProductPage = React.lazy(() => import('./components/pages/public/ProductPage'));
const ShopProfile = React.lazy(() => import('./components/pages/public/ShopProfile'));
const ShopProductPage = React.lazy(() => import('./components/pages/public/ShopProductPage'));

const BusinessLayout = React.lazy(() => import('./components/layouts/BusinessLayout'));
const BusinessLanding = React.lazy(() => import('./components/pages/business/BusinessLanding'));
const BusinessHero = React.lazy(() => import('./components/pages/business/BusinessHero'));
const MerchantDashboard = React.lazy(() => import('./components/pages/business/merchant-dashboard'));
const MerchantProfilePage = React.lazy(() => import('./components/pages/business/MerchantProfilePage'));
const BusinessPendingApproval = React.lazy(() => import('./components/pages/business/BusinessPendingApproval'));

const AdminLayout = React.lazy(() => import('./components/layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./components/pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./components/pages/auth/AdminLogin'));
const AdminApprovals = React.lazy(() => import('./components/pages/admin/AdminApprovals'));
const AdminUsers = React.lazy(() => import('./components/pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('./components/pages/admin/AdminOrders'));
const AdminFeedback = React.lazy(() => import('./components/pages/admin/AdminFeedback'));
const AdminSettings = React.lazy(() => import('./components/pages/admin/AdminSettings'));

const CourierOrders = React.lazy(() => import('./components/pages/courier/CourierOrders'));
const NotFoundPage = React.lazy(() => import('./components/pages/shared/NotFoundPage'));

const { HashRouter, BrowserRouter, Routes, Route, useLocation } = ReactRouterDOM as any;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const AppLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center px-6 py-16">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
      <div className="text-slate-500 font-bold text-sm">جاري التحميل...</div>
    </div>
  </div>
);

const suspense = (element: React.ReactElement) => (
  <React.Suspense fallback={<AppLoadingFallback />}>{element}</React.Suspense>
);

const App: React.FC = () => {
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const Router = routerMode === 'browser' ? BrowserRouter : HashRouter;
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={suspense(<PublicLayout />)}>
          <Route index element={suspense(<HomeFeed />)} />
          <Route path="shops" element={suspense(<ShopsPage />)} />
          <Route path="restaurants" element={suspense(<RestaurantsPage />)} />
          <Route path="offers" element={suspense(<OffersPage />)} />
          <Route path="map" element={suspense(<MapPage />)} />
          <Route path="login" element={suspense(<LoginPage />)} />
          <Route path="signup" element={suspense(<SignupPage />)} />
          <Route path="auth/google/callback" element={suspense(<GoogleCallbackPage />)} />
          <Route path="reset-password" element={suspense(<ResetPasswordPage />)} />
          <Route path="profile" element={suspense(<ProfilePage />)} />
          <Route path="about" element={suspense(<AboutPage />)} />
          <Route path="product/:id" element={suspense(<ProductPage />)} />
        </Route>
        
        <Route path="/shop/:slug" element={suspense(<ShopProfile />)} />

        <Route path="/shop/:slug/product/:id" element={suspense(<ShopProductPage />)} />

        <Route path="/s/:slug" element={suspense(<ShopProfile />)} />

        <Route path="/s/:slug/product/:id" element={suspense(<ShopProductPage />)} />

        <Route path="/business/:shopId/hero" element={suspense(<BusinessHero />)} />

        <Route path="/business/pending" element={suspense(<BusinessLayout />)}>
          <Route index element={suspense(<BusinessPendingApproval />)} />
        </Route>
        
        <Route path="/business" element={suspense(<BusinessLayout />)}>
          <Route index element={suspense(<BusinessLanding />)} />
          <Route path="dashboard" element={suspense(<MerchantDashboard />)} />
          <Route path="profile" element={suspense(<MerchantProfilePage />)} />
          <Route path="pending" element={suspense(<BusinessPendingApproval />)} />
        </Route>

        <Route path="/admin/gate" element={suspense(<AdminLogin />)} />
        <Route path="/admin" element={suspense(<AdminLayout />)}>
          <Route path="dashboard" element={suspense(<AdminDashboard />)} />
          <Route path="approvals" element={suspense(<AdminApprovals />)} />
          <Route path="shops" element={suspense(<AdminDashboard />)} />
          <Route path="users" element={suspense(<AdminUsers />)} />
          <Route path="orders" element={suspense(<AdminOrders />)} />
          <Route path="feedback" element={suspense(<AdminFeedback />)} />
          <Route path="settings" element={suspense(<AdminSettings />)} />
        </Route>

        <Route path="/courier/orders" element={suspense(<CourierOrders />)} />

        <Route path="*" element={suspense(<NotFoundPage />)} />
      </Routes>
      <Analytics />
    </Router>
  );
};

export default App;
