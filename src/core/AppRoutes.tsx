import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  RedirectSShop,
  RedirectSShopProduct,
  RedirectShopImageMapToShopProfile,
  suspense,
} from './routerHelpers';

const PublicLayout = React.lazy(() => import('../shared/components/layouts/PublicLayout'));
// Legacy homepage kept at ../shared/components/pages/public/HomeFeed.tsx
const NewHomePage = React.lazy(() => import('../shared/components/pages/public/NewHomePage'));
const OffersPage = React.lazy(() => import('../shared/components/pages/public/OffersPage'));
const RestaurantsOffersPage = React.lazy(() => import('../shared/components/pages/public/offers/RestaurantsOffersPage'));
const FashionOffersPage = React.lazy(() => import('../shared/components/pages/public/offers/FashionOffersPage'));
const SupermarketOffersPage = React.lazy(() => import('../shared/components/pages/public/offers/SupermarketOffersPage'));
const CarsActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/CarsActivityPage'));
const RealEstateActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/RealEstateActivityPage'));
const AgricultureActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/AgricultureActivityPage'));
const MedicalActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/MedicalActivityPage'));
const FactoriesActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/FactoriesActivityPage'));
const ConstructionActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/ConstructionActivityPage'));
const TradeActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/TradeActivityPage'));
const TourismActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/TourismActivityPage'));
const AnimalActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/AnimalActivityPage'));
const FishActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/FishActivityPage'));
const EnergyActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/EnergyActivityPage'));
const ProfessionalActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/ProfessionalActivityPage'));
const HomeActivityPage = React.lazy(() => import('../shared/components/pages/public/activities/HomeActivityPage'));
const MapPage = React.lazy(() => import('../shared/components/pages/public/MapPage'));
const AddMapListingPage = React.lazy(() => import('../shared/components/pages/public/AddMapListingPage'));
const MapListingDetailPage = React.lazy(() => import('../shared/components/pages/public/MapListingDetailPage'));
const LoginPage = React.lazy(() => import('../shared/components/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('../shared/components/pages/auth/SignupPage'));
const GoogleCallbackPage = React.lazy(() => import('../shared/components/pages/auth/GoogleCallbackPage'));
const ResetPasswordPage = React.lazy(() => import('../shared/components/pages/auth/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('../shared/components/pages/public/ProfilePage'));
const AboutPage = React.lazy(() => import('../shared/components/pages/public/AboutPage'));
const SupportPage = React.lazy(() => import('../shared/components/pages/public/SupportPage'));
const TermsPage = React.lazy(() => import('../shared/components/pages/public/TermsPage'));
const PrivacyPage = React.lazy(() => import('../shared/components/pages/public/PrivacyPage'));
const ContactPage = React.lazy(() => import('../shared/components/pages/public/ContactPage'));
const SuggestionsPage = React.lazy(() => import('../shared/components/pages/public/SuggestionsPage'));
const CustomerServicePage = React.lazy(() => import('../shared/components/pages/public/CustomerServicePage'));
const ReturnPolicyPage = React.lazy(() => import('../shared/components/pages/public/ReturnPolicyPage'));
const SeoDirectoryPage = React.lazy(() => import('../shared/components/pages/public/SeoDirectoryPage'));
const ProductPage = React.lazy(() => import('../shared/components/pages/public/ProductPage'));
const ProductLandingPage = React.lazy(() => import('../shared/components/pages/public/ProductLandingPage'));
const ShopProfile = React.lazy(() => import('../shared/components/pages/public/ShopProfile'));
const CustomPageView = React.lazy(() => import('../shared/components/pages/public/ShopProfile/CustomPageView'));
const CourierIntroPage = React.lazy(() => import('../shared/components/pages/public/CourierIntroPage'));
const DownloadAppPage = React.lazy(() => import('../shared/components/pages/public/DownloadAppPage'));
const BlogPage = React.lazy(() => import('../shared/components/pages/public/BlogPage'));
const BlogPostPage = React.lazy(() => import('../shared/components/pages/public/BlogPostPage'));
const BusinessLayout = React.lazy(() => import('../shared/components/layouts/BusinessLayout'));
const BusinessLanding = React.lazy(() => import('../shared/components/pages/business/BusinessLanding'));
const BusinessHero = React.lazy(() => import('../shared/components/pages/business/BusinessHero'));
const MerchantOnboarding = React.lazy(() => import('../shared/components/pages/business/MerchantOnboarding'));
const MerchantDashboard = React.lazy(() => import('../shared/components/pages/business/merchant-dashboard'));
const MerchantProfilePage = React.lazy(() => import('../shared/components/pages/business/MerchantProfilePage'));
const BusinessPendingApproval = React.lazy(() => import('../shared/components/pages/business/BusinessPendingApproval'));
const CourierSignupPage = React.lazy(() => import('../shared/components/pages/business/CourierSignupPage'));
const BuilderPreviewPage = React.lazy(() => import('../shared/components/pages/business/builder/BuilderPreviewPage'));
const BookingActivityPage = React.lazy(() => import('../shared/components/pages/business/bookings/BookingActivityPage'));

const AdminLayout = React.lazy(() => import('../shared/components/layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('../shared/components/pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('../shared/components/pages/auth/AdminLogin'));
const AdminApprovals = React.lazy(() => import('../shared/components/pages/admin/AdminApprovals'));
const AdminShops = React.lazy(() => import('../shared/components/pages/admin/AdminShops'));
const AdminUsers = React.lazy(() => import('../shared/components/pages/admin/AdminUsers'));
const AdminOrders = React.lazy(() => import('../shared/components/pages/admin/AdminOrders'));
const AdminDelivery = React.lazy(() => import('../shared/components/pages/admin/AdminDelivery'));
const AdminFeedback = React.lazy(() => import('../shared/components/pages/admin/AdminFeedback'));
const AdminCustomerService = React.lazy(() => import('../shared/components/pages/admin/AdminCustomerService'));
const AdminAnalytics = React.lazy(() => import('../shared/components/pages/admin/AdminAnalytics'));
const AdminNotifications = React.lazy(() => import('../shared/components/pages/admin/AdminNotifications'));
const AdminContent = React.lazy(() => import('../shared/components/pages/admin/AdminContent'));
const AdminSettings = React.lazy(() => import('../shared/components/pages/admin/AdminSettings'));
const CourierOrders = React.lazy(() => import('../shared/components/pages/courier/CourierOrders'));
const Page404 = React.lazy(() => import('../shared/components/pages/shared/404'));
const PortalLoginPage = React.lazy(() => import('../shared/components/pages/portal/PortalLoginPage'));
const PortalLayout = React.lazy(() => import('../shared/components/pages/portal/PortalLayout'));
const PortalDashboard = React.lazy(() => import('../shared/components/pages/portal/PortalDashboard'));
const PortalListingsPage = React.lazy(() => import('../shared/components/pages/portal/PortalListingsPage'));
const PortalEditListingPage = React.lazy(() => import('../shared/components/pages/portal/PortalEditListingPage'));
const PortalBranchesPage = React.lazy(() => import('../shared/components/pages/portal/PortalBranchesPage'));
const PortalAnalyticsPage = React.lazy(() => import('../shared/components/pages/portal/PortalAnalyticsPage'));
const PortalProfilePage = React.lazy(() => import('../shared/components/pages/portal/PortalProfilePage'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={suspense(<PublicLayout />)}>
        <Route index element={suspense(<NewHomePage />)} />
        <Route path="shops" element={<Navigate to="/" replace />} />
        <Route path="restaurants" element={<Navigate to="/" replace />} />
        <Route path="offers" element={suspense(<OffersPage />)} />
        <Route path="offers/restaurants" element={suspense(<RestaurantsOffersPage />)} />
        <Route path="offers/fashion" element={suspense(<FashionOffersPage />)} />
        <Route path="offers/supermarket" element={suspense(<SupermarketOffersPage />)} />
        <Route path="activity/cars" element={suspense(<CarsActivityPage />)} />
        <Route path="activity/real-estate" element={suspense(<RealEstateActivityPage />)} />
        <Route path="activity/agriculture" element={suspense(<AgricultureActivityPage />)} />
        <Route path="activity/medical" element={suspense(<MedicalActivityPage />)} />
        <Route path="activity/factories" element={suspense(<FactoriesActivityPage />)} />
        <Route path="activity/construction" element={suspense(<ConstructionActivityPage />)} />
        <Route path="activity/trade" element={suspense(<TradeActivityPage />)} />
        <Route path="activity/tourism" element={suspense(<TourismActivityPage />)} />
        <Route path="activity/animal" element={suspense(<AnimalActivityPage />)} />
        <Route path="activity/fish" element={suspense(<FishActivityPage />)} />
        <Route path="activity/energy" element={suspense(<EnergyActivityPage />)} />
        <Route path="activity/professional" element={suspense(<ProfessionalActivityPage />)} />
        <Route path="activity/home" element={suspense(<HomeActivityPage />)} />
        <Route path="map" element={suspense(<MapPage />)} />
        <Route path="map/listing/:id" element={suspense(<MapListingDetailPage />)} />
        <Route path="map/add-listing" element={suspense(<AddMapListingPage />)} />
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
        <Route path="suggestions" element={suspense(<SuggestionsPage />)} />
        <Route path="customer-service" element={suspense(<CustomerServicePage />)} />
        <Route path="dalil" element={suspense(<SeoDirectoryPage />)} />
        <Route path="dalil-almahalat" element={<Navigate to="/dalil" replace />} />
        <Route path="dalil-almat3am" element={<Navigate to="/dalil" replace />} />
        <Route path="dalil-alanshta" element={<Navigate to="/dalil" replace />} />
        <Route path="menmakank" element={<Navigate to="/dalil" replace />} />
        <Route path="mnmknk" element={<Navigate to="/dalil" replace />} />
        <Route path="product/:id" element={suspense(<ProductPage />)} />
        <Route path="landing/:id" element={suspense(<ProductLandingPage />)} />
        <Route path="blog" element={suspense(<BlogPage />)} />
        <Route path="blog/:slug" element={suspense(<BlogPostPage />)} />
        <Route path="courier" element={suspense(<CourierIntroPage />)} />
        <Route path="download-app" element={suspense(<DownloadAppPage />)} />
        <Route path="delivery" element={<Navigate to="/courier" replace />} />
      </Route>

      <Route path="/s/:slug" element={<RedirectSShop />} />
      <Route path="/s/:slug/product/:id" element={<RedirectSShopProduct />} />
      <Route path="/shop/:slug" element={suspense(<ShopProfile />)} />
      <Route path="/shop/:slug/image-map" element={<RedirectShopImageMapToShopProfile />} />
      <Route path="/shop/:slug/product/:id" element={suspense(<ProductPage />)} />
      <Route path="/shop/:slug/landing/:id" element={suspense(<ProductLandingPage />)} />
      <Route path="/shop/:slug/page/:pageId" element={suspense(<CustomPageView />)} />
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
      <Route path="*" element={suspense(<Page404 />)} />
    </Routes>
  );
};

export default AppRoutes;
