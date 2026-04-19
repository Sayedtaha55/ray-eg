import React, { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearSession } from '@/services/authStorage';
import {
  BarChart3,
  Bell,
  CalendarCheck,
  Camera,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Megaphone,
  Package,
  Palette,
  Settings,
  Smartphone,
  TrendingUp,
  Users,
  Eye,
} from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import { Category, Offer, Product, Reservation, ShopGallery } from '@/types';
import { useToast } from '@/components/common/feedback/Toaster';
import SmartImage from '@/components/common/ui/SmartImage';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { useTranslation } from 'react-i18next';

// Lazy load components
const MerchantSettings = lazy(() => import('@/src/components/MerchantDashboard/Settings'));
const POSSystem = lazy(() => import('../POSSystem'));
const PageBuilder = lazy(() => import('../builder/PageBuilder'));

const AddProductModal = lazy(() => import('./modals/AddProductModal'));
const CreateOfferModal = lazy(() => import('./modals/CreateOfferModal'));

const CustomersTab = lazy(() => import('./tabs/CustomersTab'));
const GalleryTab = lazy(() => import('./tabs/GalleryTab'));
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const ProductsTab = lazy(() => import('@/components/pages/business/merchant-dashboard/tabs/ProductsTab'));
const PromotionsTab = lazy(() => import('./tabs/PromotionsTab'));
const ReportsTab = lazy(() => import('./tabs/ReportsTab'));
const ReservationsTab = lazy(() => import('./tabs/ReservationsTab').then(m => ({ default: m.ReservationsTab })));
const SalesTab = lazy(() => import('./tabs/SalesTab'));
const InvoiceTab = lazy(() => import('./tabs/InvoiceTab'));
const NotificationsTab = lazy(() => import('./tabs/NotificationsTab'));

import TabButton from './components/TabButton';
import {
  MerchantDashboardTabId,
  getMerchantDashboardTabsForShop,
  resolveMerchantDashboardTabForShop,
} from './dashboardTabs';

const { useSearchParams, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;
const DASHBOARD_TAB_PRELOADERS: Partial<Record<MerchantDashboardTabId, () => Promise<unknown>>> = {
  overview: () => import('./tabs/OverviewTab'),
  notifications: () => import('./tabs/NotificationsTab'),
  gallery: () => import('./tabs/GalleryTab'),
  reports: () => import('./tabs/ReportsTab'),
  customers: () => import('./tabs/CustomersTab'),
  products: () => import('./tabs/ProductsTab'),
  promotions: () => import('./tabs/PromotionsTab'),
  reservations: () => import('./tabs/ReservationsTab'),
  invoice: () => import('./tabs/InvoiceTab'),
  sales: () => import('./tabs/SalesTab'),
  builder: () => import('../builder/PageBuilder'),
  settings: () => import('@/src/components/MerchantDashboard/Settings'),
  pos: () => import('../POSSystem'),
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
  builder: <Palette size={18} />,
  settings: <Settings size={18} />,
  pos: <Smartphone size={18} />,
};

const MerchantDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam as MerchantDashboardTabId) || 'overview';
  const impersonateShopId = searchParams.get('impersonateShopId');

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
    salesFrom.setFullYear(salesFrom.getFullYear() - 2); // Increased from 1 to 2 years
    const analyticsFrom = new Date(now);
    analyticsFrom.setDate(analyticsFrom.getDate() - 30);
    return { now, salesFrom, analyticsFrom };
  };

  const shopCategory = currentShop?.category;
  const visibleTabs = getMerchantDashboardTabsForShop(currentShop || { category: shopCategory }).map((t) => ({
    ...t,
    icon: ICON_BY_TAB_ID[t.id],
    label: t.dynamicLabel ? t.dynamicLabel(shopCategory) : t.label,
  }));
  const hasPosTab = visibleTabs.some((t) => t.id === 'pos');
  const effectiveTab = resolveMerchantDashboardTabForShop(activeTab, currentShop || { category: shopCategory });

  const setTab = useCallback((tab: TabType) => {
    const next = new URLSearchParams(searchParams);
    if (!tab || tab === 'overview') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setSearchParams(next as any, { replace: true } as any);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (tabParam === 'growth') {
      setTab('overview');
    }
  }, [tabParam]);

  useEffect(() => {
    if (!currentShop) return;
    if (effectiveTab !== activeTab) {
      setTab(effectiveTab);
    }
  }, [currentShop, effectiveTab]);

  const savedUserForView = (() => {
    try {
      return JSON.parse(localStorage.getItem('ray_user') || '{}');
    } catch {
      return {};
    }
  })();
  const isAdminView = String(savedUserForView?.role || '').toLowerCase() === 'admin';
  const adminTargetShopId = isAdminView && impersonateShopId ? impersonateShopId : undefined;

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

      setCurrentShop(effectiveShop);

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
        const list = await ApiService.getReservations(shopId);
        setReservations(list);
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
          ApiService.getReservations(shopId),
        ]);
        setSales(orders);
        setAnalytics(analytics);
        setReservations(reservations || []);
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
  }, []);

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

  // Smart event-driven refresh - replaces the old timer-based auto-refresh
  useSmartRefresh({
    shopId: currentShop?.id,
    role: 'merchant',
    scopes: ['orders', 'products', 'shop', 'reservations'],
    enabled: !!currentShop,
    onRefresh: (scope) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      
      // Refresh based on scope
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
      // Refresh products list
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
      await ApiService.updateReservationStatus(id, status);

      if (status === 'completed') {
        const reservation = reservations.find((r: any) => r.id === id);
        if (reservation) {
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
    return (
      <Suspense fallback={TabFallback}>
        {(() => {
          switch (effectiveTab) {
            case 'overview':
              return (
                <OverviewTab
                  shop={currentShop}
                  analytics={analytics}
                  notifications={notifications}
                  onViewAllNotifications={() => setTab('notifications')}
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
                  onDelete={(id) => ApiService.deleteOffer(id).then(() => currentShop ? ensureTabData('promotions', currentShop, true) : undefined)}
                  onCreate={() => {
                    setOfferSeedProduct(null);
                    setOfferModalOpen(true);
                  }}
                />
              );
            case 'reservations':
              return <ReservationsTab reservations={reservations} onUpdateStatus={handleUpdateResStatus} />;
            case 'invoice':
              return <InvoiceTab shopId={currentShop.id} shop={currentShop} />;
            case 'sales':
              return <SalesTab sales={sales} posEnabled={hasPosTab} />;
            case 'reports':
              return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} />;
            case 'customers':
              return <CustomersTab shopId={currentShop.id} />;
            case 'settings':
              return <MerchantSettings shop={currentShop} onSaved={refreshShopAndActiveTab as any} adminShopId={adminTargetShopId} />;
            default:
              return (
                <OverviewTab
                  shop={currentShop}
                  analytics={analytics}
                  notifications={notifications}
                  onViewAllNotifications={() => setTab('notifications')}
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
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-right px-6" dir="rtl">
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

  const bannerImageUrl = String(
    currentShop?.pageDesign?.bannerUrl ||
    currentShop?.bannerUrl ||
    currentShop?.banner_url ||
    currentShop?.coverImage ||
    '',
  ).trim();

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-10 text-right pb-28 md:pb-32 px-3 sm:px-4 md:px-6 font-sans" dir="rtl">
      {effectiveTab !== 'builder' && effectiveTab !== 'settings' && (
        <div className="relative overflow-hidden bg-gradient-to-l from-cyan-50 via-white to-slate-50 p-4 sm:p-6 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] border border-cyan-100/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 md:gap-8">
          {bannerImageUrl ? (
            <img
              src={bannerImageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/95 via-white/90 to-cyan-50/95" />
          <div className="pointer-events-none absolute -top-12 -left-10 w-36 h-36 rounded-full bg-[#00E5FF]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-8 w-40 h-40 rounded-full bg-slate-900/10 blur-3xl" />
          <div className="relative z-10 flex items-center gap-3 sm:gap-6 md:gap-8 flex-row-reverse">
            <div className="relative group">
              {currentShop.logoUrl || currentShop.logo_url ? (
                <SmartImage
                  src={currentShop.logoUrl || currentShop.logo_url}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-[2rem] sm:rounded-[2.5rem] object-cover shadow-2xl transition-transform group-hover:scale-105"
                  imgClassName="object-cover"
                  alt="logo"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : null}
              <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="min-w-0 text-right">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-2 break-words">{currentShop.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-end">
                <span className="bg-slate-100 px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase text-slate-500">{currentShop.category}</span>
                <span className="text-slate-400 font-bold text-xs sm:text-sm flex items-center justify-end gap-1.5 sm:gap-2">
                  <MapPin size={12} className="sm:w-4 sm:h-4" /> {currentShop.city}
                </span>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/shop/${currentShop.slug}`)}
              className="w-full sm:w-auto px-3 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 lg:py-5 bg-[#00E5FF] text-black rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] hover:brightness-110 transition-all shadow-md sm:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Eye size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> <span>{t('business.dashboard.previewShop')}</span>
            </button>
            {hasPosTab && (
              <button
                type="button"
                onClick={() => setTab('pos')}
                className="w-full sm:w-auto px-3 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 lg:py-5 bg-slate-900 text-white rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 hover:bg-black transition-all shadow-md sm:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Smartphone size={14} className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">{t('business.dashboard.smartPOS')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="sticky top-24 z-40">
        <div className="flex gap-2 p-2 bg-slate-100/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 overflow-x-auto no-scrollbar shadow-inner">
          {visibleTabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={effectiveTab === tab.id}
              onClick={() => setTab(tab.id)}
              onPointerEnter={() => handleTabPointerEnter(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>
      </div>

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
              <PageBuilder onClose={() => setTab('overview')} />
            ) : (
              renderContent()
            )}
          </Suspense>
        </MotionDiv>
      </AnimatePresence>

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
