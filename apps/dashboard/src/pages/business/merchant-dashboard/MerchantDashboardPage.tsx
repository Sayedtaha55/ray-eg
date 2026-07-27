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

} from 'lucide-react';

import * as ReactRouterDOM from 'react-router-dom';

import { ApiService } from '@/services/api.service';

import { RayDB } from '@/constants';

import { Category, Offer, Product, Reservation, ShopGallery } from '@/types';

import { useToast } from '@/components/common/feedback/Toaster';

import { useSmartRefresh } from '@/hooks/useSmartRefresh';

import { useTranslation } from 'react-i18next';



// Lazy load components

const POSSystem = lazy(() => import('../POSSystem'));

const PageBuilder = lazy(() => import('../builder/PageBuilder'));



const MerchantSettings = lazy(() => import('../../../components/MerchantDashboard/Settings'));

const AddProductModal = lazy(() => import('./modals/AddProductModal'));

const CreateOfferModal = lazy(() => import('./modals/CreateOfferModal'));



const CustomersTab = lazy(() => import('./tabs/CustomersTab'));

const GalleryTab = lazy(() => import('./tabs/GalleryTab'));

const OverviewTab = lazy(() => import('./tabs/OverviewTab'));

const ProductsTab = lazy(() => import('@/components/pages/business/merchant-dashboard/tabs/ProductsTab'));

const PromotionsTab = lazy(() => import('./tabs/PromotionsTab'));

const ReportsTab = lazy(() => import('./tabs/ReportsTab'));

const CashierReportsTab = lazy(() => import('./tabs/CashierReportsTab'));

const ReservationsTab = lazy(() => import('./tabs/ReservationsTab').then(m => ({ default: m.ReservationsTab })));

const RestaurantTablesTab = lazy(() => import('./tabs/RestaurantTablesTab'));

const SalesTab = lazy(() => import('./tabs/SalesTab'));

const InvoiceTab = lazy(() => import('./tabs/InvoiceTab'));

const NotificationsTab = lazy(() => import('./tabs/NotificationsTab'));

const AbandonedCartTab = lazy(() => import('./tabs/AbandonedCartTab'));

const MarketingTab = lazy(() => import('./tabs/MarketingTab'));

const ExpensesTab = lazy(() => import('./tabs/ExpensesTab'));



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



import TabButton from './components/TabButton';

import AiAssistantPanel from './AiAssistantPanel';

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



const { useSearchParams, useNavigate } = ReactRouterDOM as any;

const MotionDiv = motion.div as any;

const DASHBOARD_TAB_PRELOADERS: Partial<Record<MerchantDashboardTabId, () => Promise<unknown>>> = {

  overview: () => import('./tabs/OverviewTab'),

  notifications: () => import('./tabs/NotificationsTab'),

  gallery: () => import('./tabs/GalleryTab'),

  reports: () => import('./tabs/ReportsTab'),

  expenses: () => import('./tabs/ExpensesTab'),

  customers: () => import('./tabs/CustomersTab'),

  products: () => import('./tabs/ProductsTab'),

  promotions: () => import('./tabs/PromotionsTab'),

  reservations: () => import('./tabs/ReservationsTab'),

  restaurantTables: () => import('./tabs/RestaurantTablesTab'),

  invoice: () => import('./tabs/InvoiceTab'),

  sales: () => import('./tabs/SalesTab'),

  builder: () => import('../builder/PageBuilder'),

  pos: () => import('../POSSystem'),

  providers: () => import('../bookings/shared/BookingProvidersPage'),

  services: () => import('../bookings/shared/BookingServicesPage'),

  activityRooms: () => import('../bookings/activity/ActivityRoomsPage'),

  activityPatients: () => import('../bookings/activity/ActivityPatientsPage'),

  activityInventory: () => import('../bookings/activity/ActivityInventoryPage'),

  marketing: () => import('./tabs/MarketingTab'),

};



type TabType = MerchantDashboardTabId;



const ICON_BY_TAB_ID: Record<MerchantDashboardTabId, React.ReactNode> = {

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

  settings: <Settings size={18} />,

  pos: <Smartphone size={18} />,

  providers: <Users size={18} />,

  services: <ListChecks size={18} />,

  activityRooms: <Store size={18} />,

  activityPatients: <FileText size={18} />,

  activityInventory: <Package size={18} />,

  restaurantTables: <LayoutGrid size={18} />,

  expenses: <Wallet size={18} />,

  marketing: <Megaphone size={18} />,

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

      } else if (tab === 'sales') {

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

                return <SalesTab sales={sales} posEnabled={hasPosTab} shop={currentShop} />;

              case 'abandonedCart':

                return <AbandonedCartTab shopId={currentShop.id} shop={currentShop} />;

              case 'marketing':

                return <MarketingTab shopId={currentShop.id} shop={currentShop} onNavigate={(tab) => setTab(tab as any)} />;

              case 'pos':

                return <POSSystem shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />;

              default:

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

              return <SalesTab sales={sales} posEnabled={hasPosTab} shop={currentShop} />;

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

            default:

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



      <div className="flex flex-col gap-1">

        <h1 className="text-2xl md:text-3xl font-black text-slate-900">{activityVocab.dashboardTitle}</h1>

        <p className="text-sm md:text-base text-slate-500 font-medium">{activityVocab.dashboardSubtitle}</p>

      </div>



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

                  <POSSystem shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />

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