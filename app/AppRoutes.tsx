import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RedirectSShop,
  RedirectSShopProduct,
  RedirectShopImageMapToShopProfile,
  suspense,
} from './routerHelpers';

const PublicLayout = React.lazy(() => import('@/components/layouts/PublicLayout'));
const HomeFeed = React.lazy(() => import('@/components/pages/public/HomeFeed'));
const OffersPage = React.lazy(() => import('@/components/pages/public/OffersPage'));
const RestaurantsOffersPage = React.lazy(() => import('@/components/pages/public/offers/RestaurantsOffersPage'));
const FashionOffersPage = React.lazy(() => import('@/components/pages/public/offers/FashionOffersPage'));
const SupermarketOffersPage = React.lazy(() => import('@/components/pages/public/offers/SupermarketOffersPage'));
const MapPage = React.lazy(() => import('@/components/pages/public/MapPage'));
const LoginPage = React.lazy(() => import('@/components/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('@/components/pages/auth/SignupPage'));
const GoogleCallbackPage = React.lazy(() => import('@/components/pages/auth/GoogleCallbackPage'));
const ResetPasswordPage = React.lazy(() => import('@/components/pages/auth/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('@/components/pages/public/ProfilePage'));
const AboutPage = React.lazy(() => import('@/components/pages/public/AboutPage'));
const SupportPage = React.lazy(() => import('@/components/pages/public/SupportPage'));
const TermsPage = React.lazy(() => import('@/components/pages/public/TermsPage'));
const PrivacyPage = React.lazy(() => import('@/components/pages/public/PrivacyPage'));
const ContactPage = React.lazy(() => import('@/components/pages/public/ContactPage'));
const ReturnPolicyPage = React.lazy(() => import('@/components/pages/public/ReturnPolicyPage'));
const SeoDirectoryPage = React.lazy(() => import('@/components/pages/public/SeoDirectoryPage'));
const ProductPage = React.lazy(() => import('@/components/pages/public/ProductPage'));
const ShopProfile = React.lazy(() => import('@/components/pages/public/ShopProfile'));
const CourierIntroPage = React.lazy(() => import('@/components/pages/public/CourierIntroPage'));
const BusinessLayout = React.lazy(() => import('@/components/layouts/BusinessLayout'));
const BusinessLanding = React.lazy(() => import('@/components/pages/business/BusinessLanding'));
const BusinessHero = React.lazy(() => import('@/components/pages/business/BusinessHero'));
const MerchantOnboarding = React.lazy(() => import('@/components/pages/business/MerchantOnboarding'));
const MerchantDashboard = React.lazy(() => import('@/components/pages/business/merchant-dashboard'));
const MerchantProfilePage = React.lazy(() => import('@/components/pages/business/MerchantProfilePage'));
const BusinessPendingApproval = React.lazy(() => import('@/components/pages/business/BusinessPendingApproval'));
const CourierSignupPage = React.lazy(() => import('@/components/pages/business/CourierSignupPage'));
const BuilderPreviewPage = React.lazy(() => import('@/components/pages/business/builder/BuilderPreviewPage'));
const AdminLayout = React.lazy(() => import('@/components/layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('@/components/pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('@/components/pages/auth/AdminLogin'));
const AdminApprovals = React.lazy(() => import('@/components/pages/admin/AdminApprovals'));
const AdminShops = React.lazy(() => import('@/components/pages/admin/AdminShops'));
const AdminUsers = React.lazy(() => import('@/components/pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('@/components/pages/admin/AdminOrders'));
const AdminDelivery = React.lazy(() => import('@/components/pages/admin/AdminDelivery'));
const AdminFeedback = React.lazy(() => import('@/components/pages/admin/AdminFeedback'));
const AdminAnalytics = React.lazy(() => import('@/components/pages/admin/AdminAnalytics'));
const AdminNotifications = React.lazy(() => import('@/components/pages/admin/AdminNotifications'));
const AdminContent = React.lazy(() => import('@/components/pages/admin/AdminContent'));
const AdminSettings = React.lazy(() => import('@/components/pages/admin/AdminSettings'));
const CourierOrders = React.lazy(() => import('@/components/pages/courier/CourierOrders'));
const Page404 = React.lazy(() => import('@/components/pages/shared/404'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={suspense(<PublicLayout />)}>
        <Route index element={suspense(<HomeFeed />)} />
        <Route path="shops" element={<Navigate to="/" replace />} />
        <Route path="restaurants" element={<Navigate to="/" replace />} />
        <Route path="offers" element={suspense(<OffersPage />)} />
        <Route path="offers/restaurants" element={suspense(<RestaurantsOffersPage />)} />
        <Route path="offers/fashion" element={suspense(<FashionOffersPage />)} />
        <Route path="offers/supermarket" element={suspense(<SupermarketOffersPage />)} />
        <Route path="map" element={suspense(<MapPage />)} />
        <Route path="login" element={suspense(<LoginPage />)} />
        <Route path="signup" element={suspense(<SignupPage />)} />
        <Route path="auth/google/callback" element={suspense(<GoogleCallbackPage />)} />
        <Route path="reset-password" element={suspense(<ResetPasswordPage />)} />
        <Route path="profile" element={suspense(<ProfilePage />)} />
        <Route path="about" element={suspense(<AboutPage />)} />
        <Route path="support" element={suspense(<SupportPage />)} />
        <Route path="terms" element={suspense(<TermsPage />)} />
        <Route path="return-policy" element={suspense(<ReturnPolicyPage />)} />
        <Route path="privacy" element={suspense(<PrivacyPage />)} />
        <Route path="contact" element={suspense(<ContactPage />)} />
        <Route path="dalil" element={suspense(<SeoDirectoryPage />)} />
        <Route path="dalil-almahalat" element={<Navigate to="/dalil" replace />} />
        <Route path="dalil-almat3am" element={<Navigate to="/dalil" replace />} />
        <Route path="dalil-alanshta" element={<Navigate to="/dalil" replace />} />
        <Route path="menmakank" element={<Navigate to="/dalil" replace />} />
        <Route path="mnmknk" element={<Navigate to="/dalil" replace />} />
        <Route path="product/:id" element={suspense(<ProductPage />)} />
        <Route path="courier" element={suspense(<CourierIntroPage />)} />
        <Route path="delivery" element={<Navigate to="/courier" replace />} />
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
  );
};

export default AppRoutes;
