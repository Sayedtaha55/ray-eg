import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { clearSession, getStoredToken } from '@/services/authStorage';

import {

  BarChart3,

  Bell,

  CalendarCheck,

  Camera,

  CreditCard,

  FileText,

  Loader2,

  Megaphone,

  Package,

  Palette,

  Settings,

  ShoppingCart,

  Smartphone,

  TrendingUp,

  Users,

  Store,

  Stethoscope,

  ListChecks,

  LayoutGrid,

  Wallet,

  UserCog,

  Clock,

  RotateCcw,
  Gift,
  RefreshCw,
  ClipboardList,
  FolderTree,
  Tag,
  Warehouse,
  ClipboardCheck,
  Truck,
  ArrowLeftRight,
  Barcode,
  QrCode,
  AlertTriangle,
  DollarSign,
  Receipt,
  BookOpen,
  Banknote,
  PiggyBank,
  BarChart,
  Ticket,
  Percent,
  MessageSquare,
  Mail,
  PartyPopper,
  ShieldAlert,
  Star,
  NotebookPen,
  PhoneCall,
  Phone,
  CalendarDays,
  DoorOpen,
  CheckCircle2,
  CalendarX,
  BellRing,
  Lock,
  LogIn,
  Plane,
  CheckSquare,
  FileEdit,
  Layout,
  Search,
  Newspaper,
  Globe,
  Send,
  Eye,
  TrendingDown,
  Sparkles,
  Lightbulb,
  Zap,
  Bot,

} from 'lucide-react';

import * as ReactRouterDOM from 'react-router-dom';

import { ApiService } from '@/services/api.service';

import { RayDB } from '@/constants';

import { Category, Offer, Product, Reservation, ShopGallery } from '@/types';

import { useToast } from '@/components/common/feedback/Toaster';

import { useSmartRefresh } from '@/hooks/useSmartRefresh';

import { useTranslation } from 'react-i18next';



// Lazy load components

const POSSystem = lazy(() => import('../../../modules/sales/pages/POSSystem'));

const POSSection = lazy(() => import('../../../modules/sales/pages/POSSection'));

const PageBuilder = lazy(() => import('../builder/PageBuilder'));



const MerchantSettings = lazy(() => import('../../../components/MerchantDashboard/Settings'));

const AddProductModal = lazy(() => import('../../../modules/inventory/components/AddProductModal'));

const CreateOfferModal = lazy(() => import('../../../modules/marketing/components/CreateOfferModal'));



const CustomersTab = lazy(() => import('../../../modules/crm/pages/CustomersTab'));

const GalleryTab = lazy(() => import('../../../modules/core/pages/GalleryTab'));

const OverviewTab = lazy(() => import('../../../modules/core/pages/OverviewTab'));

const ProductsTab = lazy(() => import('../../../modules/inventory/pages/ProductsTab'));

const PromotionsTab = lazy(() => import('../../../modules/marketing/pages/PromotionsTab'));

const ReportsTab = lazy(() => import('../../../modules/analytics/pages/ReportsTab'));

const CashierReportsTab = lazy(() => import('../../../modules/analytics/pages/CashierReportsTab'));

const ReservationsTab = lazy(() => import('../../../modules/bookings/pages/ReservationsTab').then(m => ({ default: m.ReservationsTab })));

const RestaurantTablesTab = lazy(() => import('../../../modules/bookings/pages/RestaurantTablesTab'));

const SalesTab = lazy(() => import('../../../modules/sales/pages/SalesTab'));

const SalesReturnsView = lazy(() => import('../../../modules/sales/pages/sales/SalesReturnsView'));

const ChatsTab = lazy(() => import('../../../modules/crm/pages/ChatsTab'));

const AiAssistantPanelLazy = lazy(() => import('../../../modules/ai/pages/AiAssistantPanel'));

const InvoiceTab = lazy(() => import('../../../modules/finance/pages/InvoiceTab'));

const NotificationsTab = lazy(() => import('../../../modules/core/pages/NotificationsTab'));

const AbandonedCartTab = lazy(() => import('../../../modules/sales/pages/AbandonedCartTab'));

const MarketingTab = lazy(() => import('../../../modules/marketing/pages/MarketingTab'));

const ExpensesTab = lazy(() => import('../../../modules/finance/pages/ExpensesTab'));

const EmployeesTab = lazy(() => import('../../../modules/hr/pages/EmployeesTab'));

const AttendanceTab = lazy(() => import('../../../modules/hr/pages/AttendanceTab'));

const PayrollTab = lazy(() => import('../../../modules/hr/pages/PayrollTab'));

const PlaceholderTab = lazy(() => import('../../../modules/shared/pages/PlaceholderTab'));

// Marketing module pages
const CampaignsPage = lazy(() => import('../../../modules/marketing/pages/campaigns/CampaignsPage'));
const CouponsPage = lazy(() => import('../../../modules/marketing/pages/coupons/CouponsPage'));
const DiscountsPage = lazy(() => import('../../../modules/marketing/pages/discounts/DiscountsPage'));
const MessagesPage = lazy(() => import('../../../modules/marketing/pages/messages/MessagesPage'));
const EmailCampaignsPage = lazy(() => import('../../../modules/marketing/pages/emailCampaigns/EmailCampaignsPage'));
const PushNotificationsPage = lazy(() => import('../../../modules/marketing/pages/pushNotifications/PushNotificationsPage'));
const SmsCampaignsPage = lazy(() => import('../../../modules/marketing/pages/smsCampaigns/SmsCampaignsPage'));
const LoyaltyProgramsPage = lazy(() => import('../../../modules/marketing/pages/loyaltyPrograms/LoyaltyProgramsPage'));
const SeasonalOffersPage = lazy(() => import('../../../modules/marketing/pages/seasonalOffers/SeasonalOffersPage'));

// Finance module pages
const RevenuePage = lazy(() => import('../../../modules/finance/pages/revenue/RevenuePage'));
const ProfitsPage = lazy(() => import('../../../modules/finance/pages/profits/ProfitsPage'));
const TaxesPage = lazy(() => import('../../../modules/finance/pages/taxes/TaxesPage'));
const JournalPage = lazy(() => import('../../../modules/finance/pages/journal/JournalPage'));
const CashflowPage = lazy(() => import('../../../modules/finance/pages/cashflow/CashflowPage'));
const AccountsPage = lazy(() => import('../../../modules/finance/pages/accounts/AccountsPage'));
const WalletsPage = lazy(() => import('../../../modules/finance/pages/wallets/WalletsPage'));
const FinancialReportsPage = lazy(() => import('../../../modules/finance/pages/financialReports/FinancialReportsPage'));

// Inventory module pages
const CategoriesPage = lazy(() => import('../../../modules/inventory/pages/categories/CategoriesPage'));
const VariantsPage = lazy(() => import('../../../modules/inventory/pages/variants/VariantsPage'));
const WarehousesPage = lazy(() => import('../../../modules/inventory/pages/warehouses/WarehousesPage'));
const StocktakePage = lazy(() => import('../../../modules/inventory/pages/stocktake/StocktakePage'));
const SuppliersPage = lazy(() => import('../../../modules/inventory/pages/suppliers/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('../../../modules/inventory/pages/purchaseOrders/PurchaseOrdersPage'));
const TransfersPage = lazy(() => import('../../../modules/inventory/pages/transfers/TransfersPage'));
const BarcodePage = lazy(() => import('../../../modules/inventory/pages/barcode/BarcodePage'));
const QrCodePage = lazy(() => import('../../../modules/inventory/pages/qrCode/QrCodePage'));
const StockTrackingPage = lazy(() => import('../../../modules/inventory/pages/stockTracking/StockTrackingPage'));
const LowStockAlertsPage = lazy(() => import('../../../modules/inventory/pages/lowStockAlerts/LowStockAlertsPage'));

// CRM module pages
const TicketsPage = lazy(() => import('../../../modules/crm/pages/tickets/TicketsPage'));
const ComplaintsPage = lazy(() => import('../../../modules/crm/pages/complaints/ComplaintsPage'));
const ReviewsPage = lazy(() => import('../../../modules/crm/pages/reviews/ReviewsPage'));
const NotesPage = lazy(() => import('../../../modules/crm/pages/notes/NotesPage'));
const FollowUpsPage = lazy(() => import('../../../modules/crm/pages/followUps/FollowUpsPage'));
const ContactLogPage = lazy(() => import('../../../modules/crm/pages/contactLog/ContactLogPage'));

// Bookings module pages
const AppointmentsPage = lazy(() => import('../../../modules/bookings/pages/appointments/AppointmentsPage'));
const CalendarPage = lazy(() => import('../../../modules/bookings/pages/calendar/CalendarPage'));
const RoomsPage = lazy(() => import('../../../modules/bookings/pages/rooms/RoomsPage'));
const DoctorsPage = lazy(() => import('../../../modules/bookings/pages/doctors/DoctorsPage'));
const BookingConfirmPage = lazy(() => import('../../../modules/bookings/pages/bookingConfirm/BookingConfirmPage'));
const BookingCancelPage = lazy(() => import('../../../modules/bookings/pages/bookingCancel/BookingCancelPage'));
const BookingReminderPage = lazy(() => import('../../../modules/bookings/pages/bookingReminder/BookingReminderPage'));

// HR module pages
const PermissionsPage = lazy(() => import('../../../modules/hr/pages/permissions/PermissionsPage'));
const CheckOutPage = lazy(() => import('../../../modules/hr/pages/checkOut/CheckOutPage'));
const LeavesPage = lazy(() => import('../../../modules/hr/pages/leaves/LeavesPage'));
const TasksPage = lazy(() => import('../../../modules/hr/pages/tasks/TasksPage'));

// Website module pages
const PagesPage = lazy(() => import('../../../modules/website/pages/pages/PagesPage'));
const BlogPage = lazy(() => import('../../../modules/website/pages/blog/BlogPage'));
const SeoPage = lazy(() => import('../../../modules/website/pages/seo/SeoPage'));
const DomainsPage = lazy(() => import('../../../modules/website/pages/domains/DomainsPage'));

// Analytics module pages
const AnalyticsOverviewPage = lazy(() => import('../../../modules/analytics/pages/overview/OverviewPage'));
const SalesReportPage = lazy(() => import('../../../modules/analytics/pages/salesReport/SalesReportPage'));
const CustomerInsightsPage = lazy(() => import('../../../modules/analytics/pages/customerInsights/CustomerInsightsPage'));
const TrafficPage = lazy(() => import('../../../modules/analytics/pages/traffic/TrafficPage'));
const ConversionsPage = lazy(() => import('../../../modules/analytics/pages/conversions/ConversionsPage'));
const ProductPerformancePage = lazy(() => import('../../../modules/analytics/pages/productPerformance/ProductPerformancePage'));

// AI module pages
const AiInsightsPage = lazy(() => import('../../../modules/ai/pages/insights/InsightsPage'));
const AiRecommendationsPage = lazy(() => import('../../../modules/ai/pages/recommendations/RecommendationsPage'));
const AiAutomationsPage = lazy(() => import('../../../modules/ai/pages/automations/AutomationsPage'));

// Booking shared pages

const BookingOverviewPage = lazy(() => import('../bookings/shared/BookingOverviewPage'));

const BookingBookingsPage = lazy(() => import('../bookings/shared/BookingBookingsPage'));

const BookingSettingsPage = lazy(() => import('../bookings/shared/BookingSettingsPage'));

const BookingProvidersPage = lazy(() => import('../bookings/shared/BookingProvidersPage'));

const BookingServicesPage = lazy(() => import('../bookings/shared/BookingServicesPage'));



// Activity-specific pages

const ActivityRoomsPage = lazy(() => import('../bookings/activity/ActivityRoomsPage'));

const ActivityPatientsPage = lazy(() => import('../bookings/activity/ActivityPatientsPage'));

const ActivityInventoryPage = lazy(() => import('../bookings/activity/ActivityInventoryPage'));

const ActivityPackagesPage = lazy(() => import('../bookings/activity/ActivityPackagesPage'));

const ActivitySeasonsPage = lazy(() => import('../bookings/activity/ActivitySeasonsPage'));

const ActivityPoliciesPage = lazy(() => import('../bookings/activity/ActivityPoliciesPage'));

const ActivityAvailabilityPage = lazy(() => import('../bookings/activity/ActivityAvailabilityPage'));

const ActivityCapacityPage = lazy(() => import('../bookings/activity/ActivityCapacityPage'));

const ActivityRequestsPage = lazy(() => import('../bookings/activity/ActivityRequestsPage'));

const ActivityTicketsPage = lazy(() => import('../bookings/activity/ActivityTicketsPage'));

const ActivitySchedulePage = lazy(() => import('../bookings/activity/ActivitySchedulePage'));

const ActivityInsurancePage = lazy(() => import('../bookings/activity/ActivityInsurancePage'));

const ActivityLocationsPage = lazy(() => import('../bookings/activity/ActivityLocationsPage'));

const ActivitySubscriptionsPage = lazy(() => import('../bookings/activity/ActivitySubscriptionsPage'));

const ActivityLevelsPage = lazy(() => import('../bookings/activity/ActivityLevelsPage'));

const ActivityZonesPage = lazy(() => import('../bookings/activity/ActivityZonesPage'));

const ActivityFeesPage = lazy(() => import('../bookings/activity/ActivityFeesPage'));



// Activity route page map

const ACTIVITY_ROUTE_PAGE_MAP: Record<string, React.FC<{ activityType: any }>> = {

  'activity/rooms': ActivityRoomsPage,

  'activity/chairs': ActivityRoomsPage,

  'activity/patients': ActivityPatientsPage,

  'activity/inventory': ActivityInventoryPage,

  'activity/packages': ActivityPackagesPage,

  'activity/seasons': ActivitySeasonsPage,

  'activity/policies': ActivityPoliciesPage,

  'activity/rules': ActivityPoliciesPage,

  'activity/availability': ActivityAvailabilityPage,

  'activity/capacity': ActivityCapacityPage,

  'activity/special': ActivityRequestsPage,

  'activity/tickets': ActivityTicketsPage,

  'activity/schedule': ActivitySchedulePage,

  'activity/insurance': ActivityInsurancePage,

  'activity/locations': ActivityLocationsPage,

  'activity/branches': ActivityLocationsPage,

  'activity/subscriptions': ActivitySubscriptionsPage,

  'activity/levels': ActivityLevelsPage,

  'activity/zones': ActivityZonesPage,

  'activity/fees': ActivityFeesPage,

};



import TabButton from '../../../modules/shared/components/TabButton';

import AiAssistantPanel from '../../../modules/ai/pages/AiAssistantPanel';

import {

  MerchantDashboardTabId,

  getMerchantDashboardTabsForShop,

  resolveMerchantDashboardTabForShop,

  getTabLabel,

} from './dashboardTabs';

import { getBookingActivityTypeFromCategory } from './activities';

import { getBookingActivityById, isShopBookingActivity, getShopBookingActivityType } from '../bookings/config';

import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';

import { applyDevActivityContext } from '@/utils/devActivityContext';

import AppsTab from '../../../modules/shared/pages/AppsTab';

import { renderTab } from '../../../config/tabs';



const { useSearchParams, useNavigate } = ReactRouterDOM as any;

const MotionDiv = motion.div as any;

const DASHBOARD_TAB_PRELOADERS: Partial<Record<MerchantDashboardTabId, () => Promise<unknown>>> = {

  overview: () => import('../../../modules/core/pages/OverviewTab'),

  notifications: () => import('../../../modules/core/pages/NotificationsTab'),

  gallery: () => import('../../../modules/core/pages/GalleryTab'),

  reports: () => import('../../../modules/analytics/pages/ReportsTab'),

  expenses: () => import('../../../modules/finance/pages/ExpensesTab'),

  customers: () => import('../../../modules/crm/pages/CustomersTab'),

  products: () => import('../../../modules/inventory/pages/ProductsTab'),

  promotions: () => import('../../../modules/marketing/pages/PromotionsTab'),

  reservations: () => import('../../../modules/bookings/pages/ReservationsTab'),

  restaurantTables: () => import('../../../modules/bookings/pages/RestaurantTablesTab'),

  invoice: () => import('../../../modules/finance/pages/InvoiceTab'),

  sales: () => import('../../../modules/sales/pages/SalesTab'),

  returns: () => import('../../../modules/sales/pages/sales/SalesReturnsView'),

  chats: () => import('../../../modules/crm/pages/ChatsTab'),

  aiContent: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiImages: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiSEO: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiAnalysis: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiReplies: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiSuggestions: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiPages: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiDataAnalysis: () => import('../../../modules/ai/pages/AiAssistantPanel'),
  aiInsights: () => import('../../../modules/ai/pages/insights/InsightsPage'),
  aiRecommendations: () => import('../../../modules/ai/pages/recommendations/RecommendationsPage'),
  aiAutomations: () => import('../../../modules/ai/pages/automations/AutomationsPage'),

  campaigns: () => import('../../../modules/marketing/pages/campaigns/CampaignsPage'),
  coupons: () => import('../../../modules/marketing/pages/coupons/CouponsPage'),
  discounts: () => import('../../../modules/marketing/pages/discounts/DiscountsPage'),
  messages: () => import('../../../modules/marketing/pages/messages/MessagesPage'),
  emailCampaigns: () => import('../../../modules/marketing/pages/emailCampaigns/EmailCampaignsPage'),
  pushNotifications: () => import('../../../modules/marketing/pages/pushNotifications/PushNotificationsPage'),
  smsCampaigns: () => import('../../../modules/marketing/pages/smsCampaigns/SmsCampaignsPage'),
  loyaltyPrograms: () => import('../../../modules/marketing/pages/loyaltyPrograms/LoyaltyProgramsPage'),
  seasonalOffers: () => import('../../../modules/marketing/pages/seasonalOffers/SeasonalOffersPage'),

  quotes: () => import('../../../modules/sales/pages/SalesTab'),
  loyalty: () => import('../../../modules/sales/pages/SalesTab'),
  subscriptions: () => import('../../../modules/sales/pages/SalesTab'),
  epayment: () => import('../../../modules/sales/pages/SalesTab'),
  orderStatus: () => import('../../../modules/sales/pages/SalesTab'),

  categories: () => import('../../../modules/inventory/pages/categories/CategoriesPage'),
  variants: () => import('../../../modules/inventory/pages/variants/VariantsPage'),
  warehouses: () => import('../../../modules/inventory/pages/warehouses/WarehousesPage'),
  stocktake: () => import('../../../modules/inventory/pages/stocktake/StocktakePage'),
  suppliers: () => import('../../../modules/inventory/pages/suppliers/SuppliersPage'),
  purchaseOrders: () => import('../../../modules/inventory/pages/purchaseOrders/PurchaseOrdersPage'),
  transfers: () => import('../../../modules/inventory/pages/transfers/TransfersPage'),
  barcode: () => import('../../../modules/inventory/pages/barcode/BarcodePage'),
  qrCode: () => import('../../../modules/inventory/pages/qrCode/QrCodePage'),
  stockTracking: () => import('../../../modules/inventory/pages/stockTracking/StockTrackingPage'),
  lowStockAlerts: () => import('../../../modules/inventory/pages/lowStockAlerts/LowStockAlertsPage'),

  revenue: () => import('../../../modules/finance/pages/revenue/RevenuePage'),
  profits: () => import('../../../modules/finance/pages/profits/ProfitsPage'),
  taxes: () => import('../../../modules/finance/pages/taxes/TaxesPage'),
  journal: () => import('../../../modules/finance/pages/journal/JournalPage'),
  cashflow: () => import('../../../modules/finance/pages/cashflow/CashflowPage'),
  accounts: () => import('../../../modules/finance/pages/accounts/AccountsPage'),
  wallets: () => import('../../../modules/finance/pages/wallets/WalletsPage'),
  financialReports: () => import('../../../modules/finance/pages/financialReports/FinancialReportsPage'),

  tickets: () => import('../../../modules/crm/pages/tickets/TicketsPage'),
  complaints: () => import('../../../modules/crm/pages/complaints/ComplaintsPage'),
  reviews: () => import('../../../modules/crm/pages/reviews/ReviewsPage'),
  notes: () => import('../../../modules/crm/pages/notes/NotesPage'),
  followUps: () => import('../../../modules/crm/pages/followUps/FollowUpsPage'),
  contactLog: () => import('../../../modules/crm/pages/contactLog/ContactLogPage'),

  appointments: () => import('../../../modules/bookings/pages/appointments/AppointmentsPage'),
  calendar: () => import('../../../modules/bookings/pages/calendar/CalendarPage'),
  rooms: () => import('../../../modules/bookings/pages/rooms/RoomsPage'),
  doctors: () => import('../../../modules/bookings/pages/doctors/DoctorsPage'),
  bookingConfirm: () => import('../../../modules/bookings/pages/bookingConfirm/BookingConfirmPage'),
  bookingCancel: () => import('../../../modules/bookings/pages/bookingCancel/BookingCancelPage'),
  bookingReminder: () => import('../../../modules/bookings/pages/bookingReminder/BookingReminderPage'),

  permissions: () => import('../../../modules/hr/pages/permissions/PermissionsPage'),
  checkOut: () => import('../../../modules/hr/pages/checkOut/CheckOutPage'),
  leaves: () => import('../../../modules/hr/pages/leaves/LeavesPage'),
  tasks: () => import('../../../modules/hr/pages/tasks/TasksPage'),

  pages: () => import('../../../modules/website/pages/pages/PagesPage'),
  templates: () => import('../builder/PageBuilder'),
  seo: () => import('../../../modules/website/pages/seo/SeoPage'),
  blog: () => import('../../../modules/website/pages/blog/BlogPage'),
  forms: () => import('../builder/PageBuilder'),
  media: () => import('../builder/PageBuilder'),
  domains: () => import('../../../modules/website/pages/domains/DomainsPage'),
  publishing: () => import('../builder/PageBuilder'),

  kpi: () => import('../../../modules/analytics/pages/overview/OverviewPage'),
  charts: () => import('../../../modules/analytics/pages/ReportsTab'),
  salesPerformance: () => import('../../../modules/analytics/pages/salesReport/SalesReportPage'),
  productPerformance: () => import('../../../modules/analytics/pages/productPerformance/ProductPerformancePage'),
  visitors: () => import('../../../modules/analytics/pages/traffic/TrafficPage'),
  conversions: () => import('../../../modules/analytics/pages/conversions/ConversionsPage'),

  builder: () => import('../builder/PageBuilder'),

  pos: () => import('../../../modules/sales/pages/POSSection'),

  providers: () => import('../bookings/shared/BookingProvidersPage'),

  services: () => import('../bookings/shared/BookingServicesPage'),

  activityRooms: () => import('../bookings/activity/ActivityRoomsPage'),

  activityPatients: () => import('../bookings/activity/ActivityPatientsPage'),

  activityInventory: () => import('../bookings/activity/ActivityInventoryPage'),

  marketing: () => import('../../../modules/marketing/pages/MarketingTab'),

  employees: () => import('../../../modules/hr/pages/EmployeesTab'),

  attendance: () => import('../../../modules/hr/pages/AttendanceTab'),

  payroll: () => import('../../../modules/hr/pages/PayrollTab'),

};



type TabType = MerchantDashboardTabId;



const ICON_BY_TAB_ID: Partial<Record<MerchantDashboardTabId, React.ReactNode>> = {

  overview: <TrendingUp size={18} />,

  notifications: <Bell size={18} />,

  gallery: <Camera size={18} />,

  reports: <BarChart3 size={18} />,

  customers: <Users size={18} />,

  products: <Package size={18} />,

  promotions: <Megaphone size={18} />,

  reservations: <CalendarCheck size={18} />,

  invoice: <FileText size={18} />,

  sales: <CreditCard size={18} />,

  abandonedCart: <ShoppingCart size={18} />,

  builder: <Palette size={18} />,

  returns: <RotateCcw size={18} />,

  quotes: <FileText size={18} />,

  payments: <CreditCard size={18} />,

  loyalty: <Gift size={18} />,

  subscriptions: <RefreshCw size={18} />,

  epayment: <Smartphone size={18} />,

  orderStatus: <ClipboardList size={18} />,

  categories: <FolderTree size={18} />,

  variants: <Tag size={18} />,

  warehouses: <Warehouse size={18} />,

  stocktake: <ClipboardCheck size={18} />,

  suppliers: <Truck size={18} />,

  purchaseOrders: <ShoppingCart size={18} />,

  transfers: <ArrowLeftRight size={18} />,

  barcode: <Barcode size={18} />,

  qrCode: <QrCode size={18} />,

  stockTracking: <TrendingUp size={18} />,

  lowStockAlerts: <AlertTriangle size={18} />,

  revenue: <DollarSign size={18} />,

  taxes: <Receipt size={18} />,

  journal: <BookOpen size={18} />,

  cashflow: <Banknote size={18} />,

  accounts: <PiggyBank size={18} />,

  wallets: <Wallet size={18} />,

  financialReports: <BarChart size={18} />,

  campaigns: <Megaphone size={18} />,

  coupons: <Ticket size={18} />,

  discounts: <Percent size={18} />,

  messages: <MessageSquare size={18} />,

  emailCampaigns: <Mail size={18} />,

  pushNotifications: <Smartphone size={18} />,

  smsCampaigns: <MessageSquare size={18} />,

  loyaltyPrograms: <Gift size={18} />,

  seasonalOffers: <PartyPopper size={18} />,

  chats: <MessageSquare size={18} />,

  tickets: <Ticket size={18} />,

  complaints: <ShieldAlert size={18} />,

  reviews: <Star size={18} />,

  notes: <NotebookPen size={18} />,

  followUps: <PhoneCall size={18} />,

  contactLog: <Phone size={18} />,

  appointments: <CalendarCheck size={18} />,

  calendar: <CalendarDays size={18} />,

  rooms: <DoorOpen size={18} />,

  doctors: <Stethoscope size={18} />,

  bookingConfirm: <CheckCircle2 size={18} />,

  bookingCancel: <CalendarX size={18} />,

  bookingReminder: <BellRing size={18} />,

  permissions: <Lock size={18} />,

  checkOut: <LogIn size={18} />,

  leaves: <Plane size={18} />,

  tasks: <CheckSquare size={18} />,

  pages: <FileEdit size={18} />,

  templates: <Layout size={18} />,

  seo: <Search size={18} />,

  blog: <Newspaper size={18} />,

  forms: <ClipboardList size={18} />,

  media: <Camera size={18} />,

  domains: <Globe size={18} />,

  publishing: <Send size={18} />,

  kpi: <TrendingUp size={18} />,

  charts: <BarChart3 size={18} />,

  salesPerformance: <TrendingUp size={18} />,

  productPerformance: <Package size={18} />,

  visitors: <Eye size={18} />,

  conversions: <TrendingDown size={18} />,

  aiContent: <Sparkles size={18} />,

  aiImages: <Sparkles size={18} />,

  aiSEO: <Search size={18} />,

  aiAnalysis: <BarChart3 size={18} />,

  aiReplies: <MessageSquare size={18} />,

  aiSuggestions: <Lightbulb size={18} />,

  aiPages: <FileEdit size={18} />,

  aiDataAnalysis: <BarChart3 size={18} />,

  aiInsights: <Lightbulb size={18} />,

  aiRecommendations: <Zap size={18} />,

  aiAutomations: <Bot size={18} />,

  pos: <Smartphone size={18} />,

  providers: <Users size={18} />,

  services: <ListChecks size={18} />,

  activityRooms: <Store size={18} />,

  activityPatients: <FileText size={18} />,

  activityInventory: <Package size={18} />,

  restaurantTables: <LayoutGrid size={18} />,

  expenses: <Wallet size={18} />,

  marketing: <Megaphone size={18} />,

  employees: <UserCog size={18} />,

  attendance: <Clock size={18} />,

  payroll: <Wallet size={18} />,

};



const MerchantDashboardPage: React.FC = () => {

  const { t, i18n } = useTranslation();

  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');

  const impersonateShopId = searchParams.get('impersonateShopId');

  const [activeTab, setActiveTab] = useState<MerchantDashboardTabId>((tabParam as MerchantDashboardTabId) || 'overview');

  const [showCashierReports, setShowCashierReports] = useState(false);



  const [currentShop, setCurrentShop] = useState<any>(null);

  const [analytics, setAnalytics] = useState<any>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [sales, setSales] = useState<any[]>([]);

  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  const [notifications, setNotifications] = useState<any[]>([]);

  const [galleryImages, setGalleryImages] = useState<ShopGallery[]>([]);

  const [loading, setLoading] = useState(true);



  const [showProductModal, setShowProductModal] = useState(false);

  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const [offerSeedProduct, setOfferSeedProduct] = useState<Product | null>(null);



  const hasInitializedOrdersRef = useRef(false);

  const knownOrderIdsRef = useRef<Set<string>>(new Set());



  const navigate = useNavigate();

  const { addToast } = useToast();



  const addToastRef = useRef(addToast);

  useEffect(() => {

    addToastRef.current = addToast;

  }, [addToast]);



  const syncInFlightRef = useRef(false);

  const loadRequestIdRef = useRef(0);



  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});

  const getDateRanges = () => {

    const now = new Date();

    const salesFrom = new Date(now);

    salesFrom.setFullYear(salesFrom.getFullYear() - 2);

    const analyticsFrom = new Date(now);

    analyticsFrom.setDate(analyticsFrom.getDate() - 30);

    return { now, salesFrom, analyticsFrom };

  };



  const shopCategory = currentShop?.category;

  const visibleTabs = getMerchantDashboardTabsForShop(currentShop || { category: shopCategory }).map((t) => ({

    ...t,

    icon: ICON_BY_TAB_ID[t.id],

    label: getTabLabel(t, currentShop || { category: shopCategory }),

  }));

  const hasPosTab = visibleTabs.some((t) => t.id === 'pos');

  const effectiveTab = resolveMerchantDashboardTabForShop(activeTab, currentShop || { category: shopCategory });

  const activityVocab = getShopActivityVocabulary(currentShop, i18n.language);



  const setTab = useCallback((tab: TabType) => {

    const next = new URLSearchParams(searchParams);

    if (!tab || tab === 'overview') {

      next.delete('tab');

    } else {

      next.set('tab', tab);

    }

    next.delete('bookingModule');

    next.delete('activityRoute'); // Clear dynamic activity route when switching tabs

    // Preserve the activity param so activity type doesn't reset on tab switch

    setSearchParams(next as any, { replace: true } as any);

    setActiveTab(tab);

  }, [searchParams, setSearchParams, setActiveTab]);





  useEffect(() => {

    if (tabParam === 'growth') {

      setTab('overview');

    }

  }, [tabParam]);



  useEffect(() => {

    if (!currentShop) return;

    const urlTab = (tabParam as MerchantDashboardTabId) || 'overview';

    // Sync activeTab state from URL (e.g., sidebar navigation updates the URL)

    if (urlTab !== activeTab) {

      setActiveTab(urlTab);

    }

  }, [currentShop, tabParam]);



  // ✅ FIX: Resolve the sidebar's `bookingModule` query param (set by BusinessLayout's

  // activity nav links) into the tab/activityRoute state that renderContent() actually

  // reads. Without this, clicking activity-specific sidebar links (e.g. "غرف/عيادات

  // فرعية") only changed the URL but never rendered the intended activity page.

  const bookingModuleParam = searchParams.get('bookingModule');

  useEffect(() => {

    if (!bookingModuleParam) return;

    const route = String(bookingModuleParam || '').trim();

    const PROVIDER_ROUTES = new Set(['providers', 'doctors', 'experts', 'therapists', 'coaches', 'instructors', 'technicians', 'vehicles', 'units', 'venues', 'rooms', 'tables']);



    const next = new URLSearchParams(searchParams);

    next.delete('bookingModule');



    if (route === 'services') {

      next.set('tab', 'services');

      next.delete('activityRoute');

      setActiveTab('services' as any);

    } else if (route.startsWith('activity/rooms') || route.startsWith('activity/chairs')) {

      next.set('tab', 'activityRooms');

      next.delete('activityRoute');

      setActiveTab('activityRooms' as any);

    } else if (route.startsWith('activity/patients')) {

      next.set('tab', 'activityPatients');

      next.delete('activityRoute');

      setActiveTab('activityPatients' as any);

    } else if (route.startsWith('activity/inventory')) {

      next.set('tab', 'activityInventory');

      next.delete('activityRoute');

      setActiveTab('activityInventory' as any);

    } else if (route.startsWith('activity/')) {

      next.set('tab', 'reservations');

      next.set('activityRoute', route);

      setActiveTab('reservations' as any);

    } else if (PROVIDER_ROUTES.has(route)) {

      next.set('tab', 'providers');

      next.delete('activityRoute');

      setActiveTab('providers' as any);

    } else {

      next.set('tab', 'overview');

      next.delete('activityRoute');

      setActiveTab('overview');

    }



    setSearchParams(next as any, { replace: true } as any);

  }, [bookingModuleParam]);



  useEffect(() => {

    try {

      const targetTab = localStorage.getItem('ray_dev_activity_target_tab');

      if (targetTab) {

        localStorage.removeItem('ray_dev_activity_target_tab');

        setTab(targetTab as any);

      }

    } catch { }

  }, [currentShop]);



  const savedUserForView = (() => {

    try {

      return JSON.parse(localStorage.getItem('ray_user') || '{}');

    } catch {

      return {};

    }

  })();

  const isAdminView = String(savedUserForView?.role || '').toLowerCase() === 'admin';

  const adminTargetShopId = isAdminView && impersonateShopId ? impersonateShopId : undefined;



  const readCachedShop = () => {

    try {

      const raw = localStorage.getItem('ray_last_shop');

      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (!parsed || !parsed?.id) return null;

      return parsed;

    } catch {

      return null;

    }

  };



  const injectDevActivityId = (shop: any): any => applyDevActivityContext(shop);



  const loadShop = useCallback(async () => {

    if (syncInFlightRef.current) return;

    syncInFlightRef.current = true;

    const requestId = ++loadRequestIdRef.current;

    const isStale = () => requestId !== loadRequestIdRef.current;

    let redirected = false;

    setLoading(true);



    try {

      const savedUserStr = localStorage.getItem('ray_user');

      if (!savedUserStr) {

        navigate('/login');

        return;

      }



      const isOffline = (() => {

        try {

          return typeof navigator !== 'undefined' && navigator?.onLine === false;

        } catch {

          return false;

        }

      })();



      if (isOffline) {

        const cachedShop = readCachedShop();

        if (cachedShop) {

          const injected = injectDevActivityId(cachedShop);

          setCurrentShop(injected);

          return injected;

        }

      }



      const savedUser = JSON.parse(savedUserStr);

      const role = String(savedUser?.role || '').toLowerCase();

      if (role !== 'merchant' && !(role === 'admin' && impersonateShopId)) {

        addToastRef.current(t('business.dashboard.merchantsOnly'), 'error');

        navigate('/login');

        return;

      }



      const effectiveShop =

        savedUser?.role === 'admin' && impersonateShopId

          ? await ApiService.getShopAdminById(String(impersonateShopId))

          : await ApiService.getMyShop();



      if (isStale()) return null;



      const injectedShop = injectDevActivityId(effectiveShop);

      setCurrentShop(injectedShop);



      try {

        if (effectiveShop?.id) {

          localStorage.setItem('ray_last_shop', JSON.stringify(effectiveShop));

        }

      } catch { }



      const status = String(effectiveShop?.status || '').toLowerCase();

      if (status !== 'approved') {

        redirected = true;

        navigate('/business/pending');

        return;

      }



      return effectiveShop;

    } catch (e) {

      const status = typeof (e as any)?.status === 'number' ? (e as any).status : undefined;

      if (status === 404) {

        clearSession('merchant-dashboard-missing-shop');

        redirected = true;

        navigate('/login');

        return;

      }



      const isOfflineError = (() => {

        try {

          if (typeof navigator !== 'undefined' && navigator?.onLine === false) return true;

        } catch { }

        const name = String((e as any)?.name || '');

        if (name === 'TypeError') return true;

        const msg = String((e as any)?.message || '').toLowerCase();

        if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network request failed')) return true;

        return false;

      })();



      if (isOfflineError) {

        const cachedShop = readCachedShop();

        if (cachedShop) {

          const injected = injectDevActivityId(cachedShop);

          setCurrentShop(injected);

          return injected;

        }

      }



      const message = (e as any)?.message || t('business.dashboard.dataLoadError');

      addToastRef.current(message, 'error');

    } finally {

      if (!redirected && !isStale()) {

        setLoading(false);

      }

      syncInFlightRef.current = false;

    }

    return null;

  }, [impersonateShopId, navigate]);



  const loadBookingDashboardRecords = useCallback(async (shopId: string) => {

    const [reservationsResult, bookingsResult] = await Promise.allSettled([

      ApiService.getReservations(shopId),

      ApiService.getBookings(shopId),

    ]);



    const reservationsList = reservationsResult.status === 'fulfilled' && Array.isArray(reservationsResult.value)

      ? reservationsResult.value

      : [];

    const bookingsList = bookingsResult.status === 'fulfilled' && Array.isArray(bookingsResult.value)

      ? bookingsResult.value.map((booking: any) => ({ ...booking, __recordType: 'booking' }))

      : [];



    const seen = new Set<string>();

    return [...bookingsList, ...reservationsList]

      .filter((record: any) => {

        const id = record?.id != null ? String(record.id).trim() : '';

        if (!id || seen.has(id)) return false;

        seen.add(id);

        return true;

      })

      .sort((a: any, b: any) => new Date(b?.createdAt || b?.created_at || 0).getTime() - new Date(a?.createdAt || a?.created_at || 0).getTime());

  }, []);



  const ensureTabData = useCallback(async (tab: TabType, shop: any, force = false) => {

    const shopId = shop?.id ? String(shop.id) : '';

    if (!shopId) return;



    const key = `${tab}:${shopId}`;

    const state = tabLoadStateRef.current[key] || { loaded: false, inFlight: false };

    if (!force && state.loaded) return;

    if (state.inFlight) return;



    tabLoadStateRef.current[key] = { ...state, inFlight: true };

    try {

      const { now, salesFrom, analyticsFrom } = getDateRanges();



      const dedupeProductsById = (items: any[]) => {

        const seen = new Set<string>();

        const out: any[] = [];

        for (const p of Array.isArray(items) ? items : []) {

          const id = p?.id != null ? String(p.id).trim() : '';

          if (!id) continue;

          if (seen.has(id)) continue;

          seen.add(id);

          out.push(p);

        }

        return out;

      };



      if (tab === 'products') {

        const list = await (ApiService as any).getProductsForManage(shopId);

        setProducts(dedupeProductsById(list));

      } else if (tab === 'reservations') {

        const list = await loadBookingDashboardRecords(shopId);

        setReservations(list as any);

      } else if (tab === 'sales' || tab === 'quotes' || tab === 'loyalty' || tab === 'subscriptions' || tab === 'epayment' || tab === 'orderStatus' || tab === 'returns' || tab === 'abandonedCart') {

        const list = await ApiService.getAllOrders({ shopId, from: salesFrom.toISOString(), to: now.toISOString() });

        setSales(list);

      } else if (tab === 'overview') {

        const [notif, analytics] = await Promise.all([

          ApiService.getNotifications(shopId),

          ApiService.getShopAnalytics(shopId, { from: analyticsFrom.toISOString(), to: now.toISOString() }),

        ]);

        setNotifications((notif || []).slice(0, 5));

        setAnalytics(analytics);

      } else if (tab === 'reports') {

        const [orders, analytics, reservations] = await Promise.all([

          ApiService.getAllOrders({ shopId, from: salesFrom.toISOString(), to: now.toISOString() }),

          ApiService.getShopAnalytics(shopId, { from: analyticsFrom.toISOString(), to: now.toISOString() }),

          loadBookingDashboardRecords(shopId),

        ]);

        setSales(orders);

        setAnalytics(analytics);

        setReservations((reservations || []) as any);

      } else if (tab === 'promotions') {

        const offers = await ApiService.getOffers();

        setActiveOffers((offers || []).filter((o: any) => o.shopId === shopId));

      } else if (tab === 'gallery') {

        const images = await ApiService.getShopGallery(shopId);

        setGalleryImages(images || []);

      }

    } catch (e) {

      const message = (e as any)?.message || t('business.dashboard.dataLoadError');

      addToastRef.current(message, 'error');

    } finally {

      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };

    }

  }, [loadBookingDashboardRecords]);



  const refreshShopAndActiveTab = useCallback(async (forceTab = true) => {

    const shop = (await loadShop()) || currentShop;

    if (!shop) return;

    await ensureTabData(resolveMerchantDashboardTabForShop(searchParams.get('tab'), shop), shop, forceTab);

  }, [currentShop, ensureTabData, loadShop, searchParams]);



  useEffect(() => {

    loadShop();

  }, [loadShop]);



  useEffect(() => {

    if (!currentShop) return;

    ensureTabData(resolveMerchantDashboardTabForShop(tabParam, currentShop), currentShop);

  }, [currentShop, ensureTabData, tabParam]);



  useSmartRefresh({

    shopId: currentShop?.id,

    role: 'merchant',

    scopes: ['orders', 'products', 'shop', 'reservations'],

    enabled: !!currentShop,

    token: getStoredToken(),

    onRefresh: (scope) => {

      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      if (scope === 'orders' || scope === 'all') {

        refreshShopAndActiveTab(true);

      } else if (scope === 'products') {

        ensureTabData('products', currentShop, true);

      } else if (scope === 'reservations') {

        ensureTabData('reservations', currentShop, true);

      } else {

        refreshShopAndActiveTab(true);

      }

    },

  });



  useEffect(() => {

    if (loading) return;

    const ids = new Set(

      (sales || [])

        .map((o: any) => String(o?.id || o?.orderId || o?.order_id || '').trim())

        .filter((id: string) => Boolean(id))

    );

    if (!hasInitializedOrdersRef.current) {

      knownOrderIdsRef.current = ids;

      hasInitializedOrdersRef.current = true;

      return;

    }

    let hasNew = false;

    for (const id of ids) {

      if (!knownOrderIdsRef.current.has(id)) {

        hasNew = true;

        break;

      }

    }

    knownOrderIdsRef.current = ids;

    if (!hasNew) return;

  }, [loading, sales]);



  useEffect(() => {

    if (!currentShop) return;

    if (!searchParams.get('tab')) {

      setTab('overview');

    }

  }, [currentShop, searchParams, setTab]);



  const handleDeleteProduct = async (id: string) => {

    if (!confirm(t('business.dashboard.confirmDeleteProduct'))) return;

    try {

      await ApiService.deleteProduct(id);

      addToast(t('business.dashboard.productDeleted'), 'success');

      if (currentShop) {

        await ensureTabData('products', currentShop, true);

      }

    } catch {

      addToast(t('business.dashboard.productDeleteFailed'), 'error');

    }

  };



  const handleUpdateProduct = async (updatedProduct: any) => {

    try {

      addToast(t('business.dashboard.productUpdated'), 'success');

      if (currentShop?.id) {

        const list = await (ApiService as any).getProductsForManage(currentShop.id);

        const seen = new Set<string>();

        const out: any[] = [];

        for (const p of Array.isArray(list) ? list : []) {

          const id = p?.id != null ? String(p.id).trim() : '';

          if (!id) continue;

          if (seen.has(id)) continue;

          seen.add(id);

          out.push(p);

        }

        setProducts(out);

      }

    } catch (err: any) {

      const msg = err?.message ? String(err.message) : t('business.dashboard.productUpdateFailed');

      addToast(msg, 'error');

    }

  };



  const handleUpdateResStatus = async (id: string, status: string) => {

    try {

      const reservation = reservations.find((r: any) => String(r.id) === String(id)) as any;

      const isBookingRecord = reservation?.__recordType === 'booking' || reservation?.__type === 'booking' || String(id || '').startsWith('booking-') || Boolean(reservation?.bookingNumber || reservation?.serviceId || reservation?.slotId);



      if (isBookingRecord) {

        await ApiService.updateBookingStatus(id, status);

      } else {

        await ApiService.updateReservationStatus(id, status);

      }



      if ((status === 'confirmed' || status === 'completed') && reservation) {

        await ApiService.convertReservationToCustomer({

          customerName: reservation.customerName,

          customerPhone: reservation.customerPhone,

          customerEmail: reservation.customerEmail || '',

          shopId: currentShop.id,

          firstPurchaseAmount: reservation.itemPrice,

          firstPurchaseItem: reservation.itemName,

        });

        addToast(t('business.dashboard.customerConverted'), 'success');

      }



      addToast(t('business.dashboard.reservationStatusUpdated'), 'success');

      if (currentShop) {

        await ensureTabData('reservations', currentShop, true);

      }

    } catch {

      addToast(t('business.dashboard.updateFailed'), 'error');

    }

  };



  const TabFallback = (

    <div className="py-20 flex flex-col items-center justify-center gap-4">

      <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />

      <p className="font-bold text-slate-400">{t('business.dashboard.loadingSection')}</p>

    </div>

  );



  const renderContent = () => {

    // Map activity module routes to dashboard tab IDs

    const PROVIDER_ROUTES = new Set(['providers', 'doctors', 'experts', 'therapists', 'coaches', 'instructors', 'technicians', 'vehicles', 'units', 'venues', 'rooms', 'tables']);



    const handleNavigate = (route: string) => {

      if (route === 'overview') {

        setTab('overview');

      } else if (route === 'bookings') {

        setTab('reservations');

      } else if (route === 'design') {

        setTab('builder');

      } else if (route === 'settings') {

        setTab('settings');

      } else if (route === 'services') {

        setTab('services');

      } else if (route.startsWith('activity/rooms') || route.startsWith('activity/chairs')) {

        setTab('activityRooms');

      } else if (route.startsWith('activity/patients')) {

        setTab('activityPatients');

      } else if (route.startsWith('activity/inventory')) {

        setTab('activityInventory');

      } else if (route.startsWith('activity/')) {

        // All other activity/* routes — store the route in the URL and render dynamically

        const next = new URLSearchParams(searchParams);

        next.set('tab', 'reservations');

        next.set('activityRoute', route);

        setSearchParams(next as any, { replace: true } as any);

        setActiveTab('reservations' as any); // Use a valid tab so effectiveTab resolves

      } else if (PROVIDER_ROUTES.has(route)) {

        setTab('providers');

      } else {

        setTab('overview');

      }

    };



    return (

      <Suspense fallback={TabFallback}>

        {(() => {

          const rawActivityType = searchParams.get('activity') || currentShop?.pageDesign?.bookingActivityType || getBookingActivityTypeFromCategory(currentShop?.category) || 'clinic';

          const activityType = (getBookingActivityById(rawActivityType) ? rawActivityType : getBookingActivityTypeFromCategory(currentShop?.category) || 'clinic') as any;

          // Check if there's a dynamic activity route to render

          const activityRoute = searchParams.get('activityRoute');

          if (activityRoute && ACTIVITY_ROUTE_PAGE_MAP[activityRoute]) {

            const ActivityPageComponent = ACTIVITY_ROUTE_PAGE_MAP[activityRoute];

            return <ActivityPageComponent activityType={activityType} />;

          }



          // Only use booking dashboard if the shop's activity is a recognized booking activity

          const isBookingActivity = isShopBookingActivity(currentShop);



          if (isBookingActivity) {

            switch (effectiveTab) {

              case 'overview':

                return <BookingOverviewPage activityType={activityType} shop={currentShop} bookings={reservations as any} onNavigate={handleNavigate} />;

              case 'settings':

                return <BookingSettingsPage activityType={activityType} shop={currentShop} onSaved={refreshShopAndActiveTab as any} adminShopId={adminTargetShopId} />;

              case 'apps':

                return <AppsTab shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} adminShopId={adminTargetShopId} />;

              case 'reservations':

                return <BookingBookingsPage activityType={activityType} shop={currentShop} bookings={reservations as any} />;

              case 'builder':

                return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={activityType} />;

              case 'providers':

                return <BookingProvidersPage activityType={activityType} shop={currentShop} />;

              case 'services':

                return <BookingServicesPage activityType={activityType} shop={currentShop} />;

              case 'activityRooms':

                return <ActivityRoomsPage activityType={activityType} />;

              case 'activityPatients':

                return <ActivityPatientsPage activityType={activityType} />;

              case 'activityInventory':

                return <ActivityInventoryPage activityType={activityType} />;

              case 'restaurantTables':

                return <RestaurantTablesTab shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} />;

              case 'notifications':

                return <NotificationsTab shopId={String(currentShop.id)} />;

              case 'gallery':

                return (

                  <GalleryTab

                    images={galleryImages}

                    onImagesChange={setGalleryImages}

                    shopId={currentShop.id}

                    primaryColor={currentShop.pageDesign?.primaryColor || '#00E5FF'}

                  />

                );

              case 'reports':

                if (showCashierReports) {

                  return <CashierReportsTab sales={sales} onBack={() => setShowCashierReports(false)} />;

                }

                return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} posEnabled={hasPosTab} onOpenCashierReports={() => setShowCashierReports(true)} shop={currentShop} />;

              case 'expenses':

                return <ExpensesTab shopId={currentShop.id} shop={currentShop} reservations={reservations as any} sales={sales} />;

              case 'customers':

                return <CustomersTab shopId={currentShop.id} shop={currentShop} />;

              case 'invoice':

                return <InvoiceTab shopId={currentShop.id} shop={currentShop} />;

              case 'sales':

                return <SalesTab sales={sales} shop={currentShop} />;

              case 'abandonedCart':

                return <AbandonedCartTab shopId={currentShop.id} shop={currentShop} />;

              case 'marketing':

                return <MarketingTab shopId={currentShop.id} shop={currentShop} onNavigate={(tab) => setTab(tab as any)} />;

              case 'pos':

                return <POSSection shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />;

              case 'employees':

                return <EmployeesTab shopId={currentShop.id} shop={currentShop} />;

              case 'attendance':

                return <AttendanceTab shopId={currentShop.id} shop={currentShop} />;

              case 'payroll':

                return <PayrollTab shopId={currentShop.id} shop={currentShop} />;

              // Sub-module tabs (same as non-booking switch)
              case 'quotes': return <SalesTab sales={sales} shop={currentShop} />;
              case 'payments': return <PlaceholderTab tabId="payments" title={isArabic ? 'المدفوعات' : 'Payments'} />;
              case 'returns': return (
                <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                  <SalesReturnsView sales={sales} />
                </div>
              );
              case 'loyalty': return <SalesTab sales={sales} shop={currentShop} />;
              case 'subscriptions': return <SalesTab sales={sales} shop={currentShop} />;
              case 'epayment': return <SalesTab sales={sales} shop={currentShop} />;
              case 'orderStatus': return <SalesTab sales={sales} shop={currentShop} />;
              case 'categories': return <CategoriesPage shopId={currentShop.id} shop={currentShop} />;
              case 'variants': return <VariantsPage shopId={currentShop.id} shop={currentShop} />;
              case 'warehouses': return <WarehousesPage shopId={currentShop.id} shop={currentShop} />;
              case 'stocktake': return <StocktakePage shopId={currentShop.id} shop={currentShop} />;
              case 'suppliers': return <SuppliersPage shopId={currentShop.id} shop={currentShop} />;
              case 'purchaseOrders': return <PurchaseOrdersPage shopId={currentShop.id} shop={currentShop} />;
              case 'transfers': return <TransfersPage shopId={currentShop.id} shop={currentShop} />;
              case 'barcode': return <BarcodePage shopId={currentShop.id} shop={currentShop} />;
              case 'qrCode': return <QrCodePage shopId={currentShop.id} shop={currentShop} />;
              case 'stockTracking': return <StockTrackingPage shopId={currentShop.id} shop={currentShop} />;
              case 'lowStockAlerts': return <LowStockAlertsPage shopId={currentShop.id} shop={currentShop} />;
              case 'revenue': return <RevenuePage shopId={currentShop.id} shop={currentShop} />;
              case 'profits': return <ProfitsPage shopId={currentShop.id} shop={currentShop} />;
              case 'taxes': return <TaxesPage shopId={currentShop.id} shop={currentShop} />;
              case 'journal': return <JournalPage shopId={currentShop.id} shop={currentShop} />;
              case 'cashflow': return <CashflowPage shopId={currentShop.id} shop={currentShop} />;
              case 'accounts': return <AccountsPage shopId={currentShop.id} shop={currentShop} />;
              case 'wallets': return <WalletsPage shopId={currentShop.id} shop={currentShop} />;
              case 'financialReports': return <FinancialReportsPage shopId={currentShop.id} shop={currentShop} />;
              case 'campaigns': return <CampaignsPage shopId={currentShop.id} shop={currentShop} />;
              case 'coupons': return <CouponsPage shopId={currentShop.id} shop={currentShop} />;
              case 'discounts': return <DiscountsPage shopId={currentShop.id} shop={currentShop} />;
              case 'messages': return <MessagesPage shopId={currentShop.id} shop={currentShop} />;
              case 'emailCampaigns': return <EmailCampaignsPage shopId={currentShop.id} shop={currentShop} />;
              case 'pushNotifications': return <PushNotificationsPage shopId={currentShop.id} shop={currentShop} />;
              case 'smsCampaigns': return <SmsCampaignsPage shopId={currentShop.id} shop={currentShop} />;
              case 'loyaltyPrograms': return <LoyaltyProgramsPage shopId={currentShop.id} shop={currentShop} />;
              case 'seasonalOffers': return <SeasonalOffersPage shopId={currentShop.id} shop={currentShop} />;
              case 'chats': return <ChatsTab shopId={currentShop.id} />;
              case 'tickets': return <TicketsPage shopId={currentShop.id} shop={currentShop} />;
              case 'complaints': return <ComplaintsPage shopId={currentShop.id} shop={currentShop} />;
              case 'reviews': return <ReviewsPage shopId={currentShop.id} shop={currentShop} />;
              case 'notes': return <NotesPage shopId={currentShop.id} shop={currentShop} />;
              case 'followUps': return <FollowUpsPage shopId={currentShop.id} shop={currentShop} />;
              case 'contactLog': return <ContactLogPage shopId={currentShop.id} shop={currentShop} />;
              case 'appointments': return <AppointmentsPage shopId={currentShop.id} shop={currentShop} />;
              case 'calendar': return <CalendarPage shopId={currentShop.id} shop={currentShop} />;
              case 'rooms': return <RoomsPage shopId={currentShop.id} shop={currentShop} />;
              case 'doctors': return <DoctorsPage shopId={currentShop.id} shop={currentShop} />;
              case 'bookingConfirm': return <BookingConfirmPage shopId={currentShop.id} shop={currentShop} />;
              case 'bookingCancel': return <BookingCancelPage shopId={currentShop.id} shop={currentShop} />;
              case 'bookingReminder': return <BookingReminderPage shopId={currentShop.id} shop={currentShop} />;
              case 'permissions': return <PermissionsPage shopId={currentShop.id} shop={currentShop} />;
              case 'checkOut': return <CheckOutPage shopId={currentShop.id} shop={currentShop} />;
              case 'leaves': return <LeavesPage shopId={currentShop.id} shop={currentShop} />;
              case 'tasks': return <TasksPage shopId={currentShop.id} shop={currentShop} />;
              case 'pages': return <PagesPage shopId={currentShop.id} shop={currentShop} />;
              case 'templates': return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={activityType} />;
              case 'seo': return <SeoPage shopId={currentShop.id} shop={currentShop} />;
              case 'blog': return <BlogPage shopId={currentShop.id} shop={currentShop} />;
              case 'forms': return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={activityType} />;
              case 'media': return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={activityType} />;
              case 'domains': return <DomainsPage shopId={currentShop.id} shop={currentShop} />;
              case 'publishing': return <PageBuilder onClose={() => setTab('overview')} integrated forceBookingMode bookingActivityType={activityType} />;
              case 'kpi': return <AnalyticsOverviewPage shopId={currentShop.id} shop={currentShop} />;
              case 'charts': return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} posEnabled={hasPosTab} onOpenCashierReports={() => setShowCashierReports(true)} shop={currentShop} />;
              case 'salesPerformance': return <SalesReportPage shopId={currentShop.id} shop={currentShop} />;
              case 'productPerformance': return <ProductPerformancePage shopId={currentShop.id} shop={currentShop} />;
              case 'visitors': return <TrafficPage shopId={currentShop.id} shop={currentShop} />;
              case 'conversions': return <ConversionsPage shopId={currentShop.id} shop={currentShop} />;
              case 'aiContent':
              case 'aiImages':
              case 'aiSEO':
              case 'aiAnalysis':
              case 'aiReplies':
              case 'aiSuggestions':
              case 'aiPages':
              case 'aiDataAnalysis':
                return <AiAssistantPanelLazy shopId={currentShop.id} shop={currentShop} currentPage={effectiveTab} onActionExecuted={() => refreshShopAndActiveTab(true)} />;
              case 'aiInsights': return <AiInsightsPage shopId={currentShop.id} shop={currentShop} />;
              case 'aiRecommendations': return <AiRecommendationsPage shopId={currentShop.id} shop={currentShop} />;
              case 'aiAutomations': return <AiAutomationsPage shopId={currentShop.id} shop={currentShop} />;

              default:

                // Try the tab registry for non-booking-specific tabs

                const bookingRegistryResult = renderTab(effectiveTab, {

                  shopId: currentShop.id,

                  shop: currentShop,

                  sales,

                  reservations: reservations as any,

                  isArabic,

                });

                if (bookingRegistryResult) return bookingRegistryResult;

                return <BookingOverviewPage activityType={activityType} shop={currentShop} bookings={reservations as any} onNavigate={handleNavigate} />;

            }

          }



          switch (effectiveTab) {

            case 'overview':

              return (

                <OverviewTab

                  shop={currentShop}

                  analytics={analytics}

                  notifications={notifications}

                  onViewAllNotifications={() => setTab('notifications')}

                  onNavigate={(tab) => setTab(tab as any)}

                />

              );

            case 'notifications':

              return <NotificationsTab shopId={String(currentShop.id)} />;

            case 'products':

              return (

                <ProductsTab

                  products={products}

                  onAdd={() => setShowProductModal(true)}

                  onDelete={handleDeleteProduct}

                  onUpdate={handleUpdateProduct}

                  shopId={currentShop.id}

                  shopCategory={currentShop?.category}

                  shop={currentShop}

                />

              );

            case 'gallery':

              return (

                <GalleryTab

                  images={galleryImages}

                  onImagesChange={setGalleryImages}

                  shopId={currentShop.id}

                  primaryColor={currentShop.pageDesign?.primaryColor || '#00E5FF'}

                />

              );

            case 'promotions':

              return (

                <PromotionsTab

                  offers={activeOffers}

                  shop={currentShop}

                  onDelete={(id) => ApiService.deleteOffer(id).then(() => currentShop ? ensureTabData('promotions', currentShop, true) : undefined)}

                  onCreate={() => {

                    setOfferSeedProduct(null);

                    setOfferModalOpen(true);

                  }}

                />

              );

            case 'reservations': {

              return <ReservationsTab reservations={reservations} onUpdateStatus={handleUpdateResStatus} />;

            }

            case 'restaurantTables':

              return <RestaurantTablesTab shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} />;

            case 'invoice':

              return <InvoiceTab shopId={currentShop.id} shop={currentShop} />;

            case 'sales':

              return <SalesTab sales={sales} shop={currentShop} />;

            case 'abandonedCart':

              return <AbandonedCartTab shopId={currentShop.id} shop={currentShop} />;

            case 'marketing':

              return <MarketingTab shopId={currentShop.id} shop={currentShop} onNavigate={(tab) => setTab(tab as any)} />;

            case 'expenses':

              return <ExpensesTab shopId={currentShop.id} shop={currentShop} reservations={reservations as any} sales={sales} />;

            case 'reports':

              if (showCashierReports) {

                return <CashierReportsTab sales={sales} onBack={() => setShowCashierReports(false)} />;

              }

              return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} posEnabled={hasPosTab} onOpenCashierReports={() => setShowCashierReports(true)} shop={currentShop} />;

            case 'customers':

              return <CustomersTab shopId={currentShop.id} shop={currentShop} />;

            case 'settings':

              return <MerchantSettings shop={currentShop} onSaved={refreshShopAndActiveTab as any} adminShopId={adminTargetShopId} />;

            case 'apps':

              return <AppsTab shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} adminShopId={adminTargetShopId} />;

            case 'builder':

              return <PageBuilder onClose={() => setTab('overview')} integrated />;

            case 'pos':

              return <POSSection shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />;

            case 'employees':

              return <EmployeesTab shopId={currentShop.id} shop={currentShop} />;

            case 'attendance':

              return <AttendanceTab shopId={currentShop.id} shop={currentShop} />;

            case 'payroll':

              return <PayrollTab shopId={currentShop.id} shop={currentShop} />;

            // Placeholder tabs for new sub-modules
            case 'quotes': return <SalesTab sales={sales} shop={currentShop} />;
            case 'payments': return <PlaceholderTab tabId="payments" title={isArabic ? 'المدفوعات' : 'Payments'} />;
            case 'returns': return (
              <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
                <SalesReturnsView sales={sales} />
              </div>
            );
            case 'loyalty': return <SalesTab sales={sales} shop={currentShop} />;
            case 'subscriptions': return <SalesTab sales={sales} shop={currentShop} />;
            case 'epayment': return <SalesTab sales={sales} shop={currentShop} />;
            case 'orderStatus': return <SalesTab sales={sales} shop={currentShop} />;
            case 'categories': return <CategoriesPage shopId={currentShop.id} shop={currentShop} />;
            case 'variants': return <VariantsPage shopId={currentShop.id} shop={currentShop} />;
            case 'warehouses': return <WarehousesPage shopId={currentShop.id} shop={currentShop} />;
            case 'stocktake': return <StocktakePage shopId={currentShop.id} shop={currentShop} />;
            case 'suppliers': return <SuppliersPage shopId={currentShop.id} shop={currentShop} />;
            case 'purchaseOrders': return <PurchaseOrdersPage shopId={currentShop.id} shop={currentShop} />;
            case 'transfers': return <TransfersPage shopId={currentShop.id} shop={currentShop} />;
            case 'barcode': return <BarcodePage shopId={currentShop.id} shop={currentShop} />;
            case 'qrCode': return <QrCodePage shopId={currentShop.id} shop={currentShop} />;
            case 'stockTracking': return <StockTrackingPage shopId={currentShop.id} shop={currentShop} />;
            case 'lowStockAlerts': return <LowStockAlertsPage shopId={currentShop.id} shop={currentShop} />;
            case 'revenue': return <RevenuePage shopId={currentShop.id} shop={currentShop} />;
            case 'profits': return <ProfitsPage shopId={currentShop.id} shop={currentShop} />;
            case 'taxes': return <TaxesPage shopId={currentShop.id} shop={currentShop} />;
            case 'journal': return <JournalPage shopId={currentShop.id} shop={currentShop} />;
            case 'cashflow': return <CashflowPage shopId={currentShop.id} shop={currentShop} />;
            case 'accounts': return <AccountsPage shopId={currentShop.id} shop={currentShop} />;
            case 'wallets': return <WalletsPage shopId={currentShop.id} shop={currentShop} />;
            case 'financialReports': return <FinancialReportsPage shopId={currentShop.id} shop={currentShop} />;
            case 'campaigns': return <CampaignsPage shopId={currentShop.id} shop={currentShop} />;
            case 'coupons': return <CouponsPage shopId={currentShop.id} shop={currentShop} />;
            case 'discounts': return <DiscountsPage shopId={currentShop.id} shop={currentShop} />;
            case 'messages': return <MessagesPage shopId={currentShop.id} shop={currentShop} />;
            case 'emailCampaigns': return <EmailCampaignsPage shopId={currentShop.id} shop={currentShop} />;
            case 'pushNotifications': return <PushNotificationsPage shopId={currentShop.id} shop={currentShop} />;
            case 'smsCampaigns': return <SmsCampaignsPage shopId={currentShop.id} shop={currentShop} />;
            case 'loyaltyPrograms': return <LoyaltyProgramsPage shopId={currentShop.id} shop={currentShop} />;
            case 'seasonalOffers': return <SeasonalOffersPage shopId={currentShop.id} shop={currentShop} />;
            case 'chats': return <ChatsTab shopId={currentShop.id} />;
            case 'tickets': return <TicketsPage shopId={currentShop.id} shop={currentShop} />;
            case 'complaints': return <ComplaintsPage shopId={currentShop.id} shop={currentShop} />;
            case 'reviews': return <ReviewsPage shopId={currentShop.id} shop={currentShop} />;
            case 'notes': return <NotesPage shopId={currentShop.id} shop={currentShop} />;
            case 'followUps': return <FollowUpsPage shopId={currentShop.id} shop={currentShop} />;
            case 'contactLog': return <ContactLogPage shopId={currentShop.id} shop={currentShop} />;
            case 'appointments': return <AppointmentsPage shopId={currentShop.id} shop={currentShop} />;
            case 'calendar': return <CalendarPage shopId={currentShop.id} shop={currentShop} />;
            case 'rooms': return <RoomsPage shopId={currentShop.id} shop={currentShop} />;
            case 'doctors': return <DoctorsPage shopId={currentShop.id} shop={currentShop} />;
            case 'bookingConfirm': return <BookingConfirmPage shopId={currentShop.id} shop={currentShop} />;
            case 'bookingCancel': return <BookingCancelPage shopId={currentShop.id} shop={currentShop} />;
            case 'bookingReminder': return <BookingReminderPage shopId={currentShop.id} shop={currentShop} />;
            case 'permissions': return <PermissionsPage shopId={currentShop.id} shop={currentShop} />;
            case 'checkOut': return <CheckOutPage shopId={currentShop.id} shop={currentShop} />;
            case 'leaves': return <LeavesPage shopId={currentShop.id} shop={currentShop} />;
            case 'tasks': return <TasksPage shopId={currentShop.id} shop={currentShop} />;
            case 'pages': return <PagesPage shopId={currentShop.id} shop={currentShop} />;
            case 'templates': return <PageBuilder onClose={() => setTab('overview')} integrated />;
            case 'seo': return <SeoPage shopId={currentShop.id} shop={currentShop} />;
            case 'blog': return <BlogPage shopId={currentShop.id} shop={currentShop} />;
            case 'forms': return <PageBuilder onClose={() => setTab('overview')} integrated />;
            case 'media': return <PageBuilder onClose={() => setTab('overview')} integrated />;
            case 'domains': return <DomainsPage shopId={currentShop.id} shop={currentShop} />;
            case 'publishing': return <PageBuilder onClose={() => setTab('overview')} integrated />;
            case 'kpi': return <AnalyticsOverviewPage shopId={currentShop.id} shop={currentShop} />;
            case 'charts': return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} posEnabled={hasPosTab} onOpenCashierReports={() => setShowCashierReports(true)} shop={currentShop} />;
            case 'salesPerformance': return <SalesReportPage shopId={currentShop.id} shop={currentShop} />;
            case 'productPerformance': return <ProductPerformancePage shopId={currentShop.id} shop={currentShop} />;
            case 'visitors': return <TrafficPage shopId={currentShop.id} shop={currentShop} />;
            case 'conversions': return <ConversionsPage shopId={currentShop.id} shop={currentShop} />;
            case 'aiContent':
            case 'aiImages':
            case 'aiSEO':
            case 'aiAnalysis':
            case 'aiReplies':
            case 'aiSuggestions':
            case 'aiPages':
            case 'aiDataAnalysis':
              return <AiAssistantPanelLazy shopId={currentShop.id} shop={currentShop} currentPage={effectiveTab} onActionExecuted={() => refreshShopAndActiveTab(true)} />;
            case 'aiInsights': return <AiInsightsPage shopId={currentShop.id} shop={currentShop} />;
            case 'aiRecommendations': return <AiRecommendationsPage shopId={currentShop.id} shop={currentShop} />;
            case 'aiAutomations': return <AiAutomationsPage shopId={currentShop.id} shop={currentShop} />;

            default:

              // Try the tab registry first

              const registryResult = renderTab(effectiveTab, {

                shopId: currentShop.id,

                shop: currentShop,

                sales,

                reservations: reservations as any,

                isArabic,

              });

              if (registryResult) return registryResult;

              return (

                <OverviewTab

                  shop={currentShop}

                  analytics={analytics}

                  notifications={notifications}

                  onViewAllNotifications={() => setTab('notifications')}

                  onNavigate={(tab) => setTab(tab as any)}

                />

              );

          }

        })()}

      </Suspense>

    );

  };



  const preloadTab = useCallback((tabId: MerchantDashboardTabId) => {

    const preloader = DASHBOARD_TAB_PRELOADERS[tabId];

    if (!preloader) return;

    void preloader();

  }, []);



  const handleTabPointerEnter = useCallback((tabId: MerchantDashboardTabId) => {

    preloadTab(tabId);

    if (!currentShop) return;

    void ensureTabData(tabId, currentShop);

  }, [currentShop, ensureTabData, preloadTab]);



  useEffect(() => {

    if (!currentShop) return;

    const idleCallback = (window as any).requestIdleCallback as ((cb: () => void) => number) | undefined;

    const run = () => {

      for (const tab of visibleTabs) {

        if (tab.id === effectiveTab) continue;

        preloadTab(tab.id);

      }

    };



    if (typeof idleCallback === 'function') {

      const id = idleCallback(run);

      return () => {

        const cancelIdleCallback = (window as any).cancelIdleCallback as ((callbackId: number) => void) | undefined;

        if (typeof cancelIdleCallback === 'function') {

          cancelIdleCallback(id);

        }

      };

    }



    const timeoutId = window.setTimeout(run, 250);

    return () => window.clearTimeout(timeoutId);

  }, [currentShop, effectiveTab, preloadTab, visibleTabs]);



  if (loading) {

    return (

      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">

        <Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" />

        <p className="font-black text-slate-400">{t('business.dashboard.loadingOperations')}</p>

      </div>

    );

  }



  if (!currentShop) {

    return (

      <div className={`h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>

        <p className="font-black text-slate-600">{t('business.dashboard.noShopFound')}</p>

        <button

          onClick={() => {

            clearSession('merchant-dashboard-empty-shop');

            navigate('/login');

          }}

          className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black"

        >

          {t('business.dashboard.login')}

        </button>

      </div>

    );

  }



  return (

    <div className={`max-w-[1600px] mx-auto space-y-5 md:space-y-10 pb-28 md:pb-32 px-3 sm:px-4 md:px-6 font-sans ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>






      <div className={`flex items-start gap-4 md:gap-6 ${isArabic ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

        <div className="min-w-0 flex-1">

          <AnimatePresence mode="wait">

            <MotionDiv

              key={effectiveTab}

              initial={{ opacity: 0, y: 20 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: -20 }}

            >

              <Suspense fallback={TabFallback}>

                {effectiveTab === 'pos' ? (

                  <POSSection shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />

                ) : effectiveTab === 'builder' ? (

                  <PageBuilder onClose={() => setTab('overview')} integrated bookingActivityType={getShopBookingActivityType(currentShop)} />

                ) : (

                  renderContent()

                )}

              </Suspense>

            </MotionDiv>

          </AnimatePresence>

        </div>

      </div>



      {import.meta.env.DEV && effectiveTab !== 'builder' && (

        <AiAssistantPanel

          shopId={currentShop.id}

          shop={currentShop}

          currentPage={effectiveTab}

          onActionExecuted={() => refreshShopAndActiveTab(true)}

        />

      )}



      <Suspense fallback={null}>

        <AddProductModal isOpen={showProductModal} onClose={() => {

          setShowProductModal(false);

          if (currentShop) {

            ensureTabData('products', currentShop, true);

          }

        }} shopId={currentShop.id} shopCategory={currentShop?.category} />



        <CreateOfferModal isOpen={offerModalOpen} product={offerSeedProduct} onClose={() => {

          setOfferModalOpen(false);

          setOfferSeedProduct(null);

          if (currentShop) {

            ensureTabData('promotions', currentShop, true);

            ensureTabData('products', currentShop, true);

          }

        }} shopId={currentShop.id} products={products} />

      </Suspense>

    </div>

  );

};



export default MerchantDashboardPage;