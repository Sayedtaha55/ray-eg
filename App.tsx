import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const PublicLayout = React.lazy(() => import('./components/layouts/PublicLayout'));

const HomeFeed = React.lazy(() => import('./components/pages/public/HomeFeed'));
const OffersPage = React.lazy(() => import('./components/pages/public/OffersPage'));
const MapPage = React.lazy(() => import('./components/pages/public/MapPage'));
const LoginPage = React.lazy(() => import('./components/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./components/pages/auth/SignupPage'));
const GoogleCallbackPage = React.lazy(() => import('./components/pages/auth/GoogleCallbackPage'));
const ResetPasswordPage = React.lazy(() => import('./components/pages/auth/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('./components/pages/public/ProfilePage'));
const AboutPage = React.lazy(() => import('./components/pages/public/AboutPage'));
const SupportPage = React.lazy(() => import('./components/pages/public/SupportPage'));
const TermsPage = React.lazy(() => import('./components/pages/public/TermsPage'));
const PrivacyPage = React.lazy(() => import('./components/pages/public/PrivacyPage'));
const ContactPage = React.lazy(() => import('./components/pages/public/ContactPage'));
const ProductPage = React.lazy(() => import('./components/pages/public/ProductPage'));
const ShopProfile = React.lazy(() => import('./components/pages/public/ShopProfile'));
const ShopImageMapPurchaseView = React.lazy(() => import('./src/features/shop-image-map/components/ShopImageMapPurchaseView'));

const BusinessLayout = React.lazy(() => import('./components/layouts/BusinessLayout'));
const BusinessLanding = React.lazy(() => import('./components/pages/business/BusinessLanding'));
const BusinessHero = React.lazy(() => import('./components/pages/business/BusinessHero'));
const MerchantOnboarding = React.lazy(() => import('./components/pages/business/MerchantOnboarding'));
const MerchantDashboard = React.lazy(() => import('./components/pages/business/merchant-dashboard'));
const MerchantProfilePage = React.lazy(() => import('./components/pages/business/MerchantProfilePage'));
const BusinessPendingApproval = React.lazy(() => import('./components/pages/business/BusinessPendingApproval'));
const CourierSignupPage = React.lazy(() => import('./components/pages/business/CourierSignupPage'));
const BuilderPreviewPage = React.lazy(() => import('./components/pages/business/builder/BuilderPreviewPage'));

const AdminLayout = React.lazy(() => import('./components/layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./components/pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./components/pages/auth/AdminLogin'));
const AdminApprovals = React.lazy(() => import('./components/pages/admin/AdminApprovals'));
const AdminShops = React.lazy(() => import('./components/pages/admin/AdminShops'));
const AdminUsers = React.lazy(() => import('./components/pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('./components/pages/admin/AdminOrders'));
const AdminDelivery = React.lazy(() => import('./components/pages/admin/AdminDelivery'));
const AdminFeedback = React.lazy(() => import('./components/pages/admin/AdminFeedback'));
const AdminAnalytics = React.lazy(() => import('./components/pages/admin/AdminAnalytics'));
const AdminNotifications = React.lazy(() => import('./components/pages/admin/AdminNotifications'));
const AdminContent = React.lazy(() => import('./components/pages/admin/AdminContent'));
const AdminSettings = React.lazy(() => import('./components/pages/admin/AdminSettings'));

const CourierOrders = React.lazy(() => import('./components/pages/courier/CourierOrders'));
const Page404 = React.lazy(() => import('./components/pages/shared/404'));

const { HashRouter, BrowserRouter, Routes, Route, useLocation, useParams, useNavigate, Navigate } = ReactRouterDOM as any;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const RoleRedirector: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const onAuthChange = () => setAuthTick((t) => t + 1);
    try {
      window.addEventListener('auth-change', onAuthChange as any);
    } catch {
    }
    return () => {
      try {
        window.removeEventListener('auth-change', onAuthChange as any);
      } catch {
      }
    };
  }, []);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : {};
      const role = String(user?.role || '').toLowerCase();

      if (role === 'courier' && !String(location?.pathname || '').startsWith('/courier')) {
        navigate('/courier/orders', { replace: true });
      }
    } catch {
    }
  }, [location?.pathname, authTick, navigate]);

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

const RedirectSShop: React.FC = () => {
  const { slug } = useParams();
  return <ReactRouterDOM.Navigate to={`/shop/${slug}`} replace />;
};

const RedirectSShopProduct: React.FC = () => {
  const { slug, id } = useParams();
  return <ReactRouterDOM.Navigate to={`/shop/${slug}/product/${id}`} replace />;
};

const RedirectShopImageMapToShopProfile: React.FC = () => {
  const { slug } = useParams();
  return suspense(<ShopImageMapPurchaseView />);
};

const suspense = (element: React.ReactElement) => (
  <React.Suspense fallback={<AppLoadingFallback />}>{element}</React.Suspense>
);

const OfflineOrBackendDownRedirector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backendDownUntil, setBackendDownUntil] = useState<number>(0);

  useEffect(() => {
    const handleBackendStatus = (evt: Event) => {
      const detail = (evt as CustomEvent<{ status?: 'up' | 'down'; downUntil?: number }>)?.detail;
      if (!detail) return;
      if (detail.status === 'up') setBackendDownUntil(0);
      if (typeof detail.downUntil === 'number') setBackendDownUntil(detail.downUntil);
    };

    window.addEventListener('ray-backend-status', handleBackendStatus as any);
    return () => {
      window.removeEventListener('ray-backend-status', handleBackendStatus as any);
    };
  }, []);

  useEffect(() => {
    const isOn404 = String(location?.pathname || '') === '/404';
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      if (!isOn404) navigate('/404?reason=offline', { replace: true });
      return;
    }

    const isBackendDown = backendDownUntil > Date.now();
    if (isBackendDown) {
      if (!isOn404) navigate('/404?reason=service', { replace: true });
    }
  }, [backendDownUntil, location?.pathname, navigate]);

  useEffect(() => {
    const handleOffline = () => {
      const isOn404 = String(window.location?.pathname || '') === '/404';
      if (!isOn404) navigate('/404?reason=offline', { replace: true });
    };
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  const routerMode = String(((import.meta as any)?.env?.VITE_ROUTER_MODE as string) || '').trim().toLowerCase();
  const Router = routerMode === 'browser' ? BrowserRouter : HashRouter;

  return (
    <Router>
      <ScrollToTop />
      <RoleRedirector />
      <OfflineOrBackendDownRedirector />
      <Routes>
        <Route path="/" element={suspense(<PublicLayout />)}>
          <Route index element={suspense(<HomeFeed />)} />
          <Route path="shops" element={<Navigate to="/" replace />} />
          <Route path="restaurants" element={<Navigate to="/" replace />} />
          <Route path="offers" element={suspense(<OffersPage />)} />
          <Route path="map" element={suspense(<MapPage />)} />
          <Route path="login" element={suspense(<LoginPage />)} />
          <Route path="signup" element={suspense(<SignupPage />)} />
          <Route path="auth/google/callback" element={suspense(<GoogleCallbackPage />)} />
          <Route path="reset-password" element={suspense(<ResetPasswordPage />)} />
          <Route path="profile" element={suspense(<ProfilePage />)} />
          <Route path="about" element={suspense(<AboutPage />)} />
          <Route path="support" element={suspense(<SupportPage />)} />
          <Route path="terms" element={suspense(<TermsPage />)} />
          <Route path="privacy" element={suspense(<PrivacyPage />)} />
          <Route path="contact" element={suspense(<ContactPage />)} />
          <Route path="product/:id" element={suspense(<ProductPage />)} />
          <Route path="delivery" element={<Navigate to="/business/courier-signup" replace />} />
        </Route>
        
        <Route path="/s/:slug" element={<RedirectSShop />} />
        <Route path="/s/:slug/product/:id" element={<RedirectSShopProduct />} />

        <Route path="/shop/:slug" element={suspense(<ShopProfile />)} />
        <Route path="/shop/:slug/image-map" element={<RedirectShopImageMapToShopProfile />} />
        <Route path="/shop/:slug/product/:id" element={suspense(<ProductPage />)} />

        <Route path="/business/:shopId/hero" element={suspense(<BusinessHero />)} />

        <Route path="/business/builder/preview" element={suspense(<BuilderPreviewPage />)} />

        <Route path="/business/pending" element={suspense(<BusinessLayout />)}>
          <Route index element={suspense(<BusinessPendingApproval />)} />
        </Route>
        
        <Route path="/business" element={suspense(<BusinessLayout />)}>
          <Route index element={suspense(<BusinessLanding />)} />
          <Route path="login" element={suspense(<LoginPage />)} />
          <Route path="onboarding" element={suspense(<MerchantOnboarding />)} />
          <Route path="dashboard" element={suspense(<MerchantDashboard />)} />
          <Route path="profile" element={suspense(<MerchantProfilePage />)} />
          <Route path="pending" element={suspense(<BusinessPendingApproval />)} />
          <Route path="courier-signup" element={suspense(<CourierSignupPage />)} />
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
          <Route path="analytics" element={suspense(<AdminAnalytics />)} />
          <Route path="notifications" element={suspense(<AdminNotifications />)} />
          <Route path="content" element={suspense(<AdminContent />)} />
          <Route path="settings" element={suspense(<AdminSettings />)} />
        </Route>

        <Route path="/courier/orders" element={suspense(<CourierOrders />)} />

        <Route path="/404" element={suspense(<Page404 />)} />

        <Route path="*" element={suspense(<Page404 />)} />
      </Routes>
    </Router>
  );
};

export default App;
