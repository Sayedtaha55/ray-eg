// Main components index file
// This file provides centralized exports for all components

// Layouts
export { default as PublicLayout } from './layouts/PublicLayout';
export { default as AdminLayout } from './layouts/AdminLayout';
export { default as BusinessLayout } from './layouts/BusinessLayout';

// Pages - Auth
export { default as LoginPage } from './pages/auth/LoginPage';
export { default as SignupPage } from './pages/auth/SignupPage';
export { default as AdminLogin } from './pages/auth/AdminLogin';
export { default as ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Pages - Public
export { default as HomeFeed } from './pages/public/HomeFeed';
export { default as ShopsPage } from './pages/public/ShopsPage';
export { default as RestaurantsPage } from './pages/public/RestaurantsPage';
export { default as OffersPage } from './pages/public/OffersPage';
export { default as FilterPage } from './pages/public/FilterPage';
export { default as MapPage } from './pages/public/MapPage';
export { default as ProductPage } from './pages/public/ProductPage';
export { default as ShopProfile } from './pages/public/ShopProfile';
export { default as AboutPage } from './pages/public/AboutPage';
export { default as ProfilePage } from './pages/public/ProfilePage';

// Pages - Admin
export { default as AdminDashboard } from './pages/admin/AdminDashboard';
export { default as AdminApprovals } from './pages/admin/AdminApprovals';
export { default as AdminUsers } from './pages/admin/AdminUsers';
export { default as AdminOrders } from './pages/admin/AdminOrders';
export { default as AdminFeedback } from './pages/admin/AdminFeedback';
export { default as AdminSettings } from './pages/admin/AdminSettings';

// Pages - Courier
export { default as CourierOrders } from './pages/courier/CourierOrders';

// Pages - Business
export { default as BusinessLanding } from './pages/business/BusinessLanding';
export { default as BusinessHero } from './pages/business/BusinessHero';
export { default as MerchantDashboard } from './pages/business/merchant-dashboard';
export { default as POSSystem } from './pages/business/POSSystem';
export { default as PageBuilder } from './pages/business/PageBuilder';
export { default as GalleryManager } from './pages/business/GalleryManager';
export { default as BusinessPendingApproval } from './pages/business/BusinessPendingApproval';

// Pages - Shared
export { default as CartDrawer } from './pages/shared/CartDrawer';
export { default as ReservationModal } from './pages/shared/ReservationModal';
export { default as RayAssistant } from './pages/shared/RayAssistant';
export { default as NotFoundPage } from './pages/shared/NotFoundPage';

// Features - Shop
export { default as ShopGallery } from './features/shop/ShopGallery';

// Features - Product
export { default as ProductCard } from './features/product/ProductCard';
export { default as ProductList } from './features/product/ProductList';

// Features - Cart
export { default as CartItem } from './features/cart/CartItem';
export { default as CartSummary } from './features/cart/CartSummary';

// Features - Reservation
export { default as ReservationForm } from './features/reservation/ReservationForm';

// Features - Analytics
export { default as StatsCard } from './features/analytics/StatsCard';
export { default as Chart } from './features/analytics/Chart';

// Common - UI
export { default as Button } from './common/ui/Button';
export { default as Input } from './common/ui/Input';
export { default as Modal } from './common/ui/Modal';
export { default as Card } from './common/ui/Card';
export { default as Badge } from './common/ui/Badge';
export { default as Loading } from './common/ui/Loading';

// Common - Forms
export { default as LoginForm } from './common/forms/LoginForm';
export { default as SignupForm } from './common/forms/SignupForm';
export { default as ShopForm } from './common/forms/ShopForm';

// Common - Navigation
export { default as Header } from './common/navigation/Header';
export { default as Footer } from './common/navigation/Footer';
export { default as Sidebar } from './common/navigation/Sidebar';

// Common - Feedback
export { default as Toaster } from './common/feedback/Toaster';
export { useToast, ToastProvider } from './common/feedback/Toaster';
export { default as ErrorBoundary } from './common/feedback/ErrorBoundary';
export { default as BackendStatusBanner } from './common/feedback/BackendStatusBanner';
