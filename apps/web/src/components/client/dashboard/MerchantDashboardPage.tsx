'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Bell, CalendarCheck, Camera, CheckCircle2, CreditCard,
  FileText, Loader2, MapPin, Megaphone, Menu, Package, Palette, Settings,
  ShoppingCart, Smartphone, TrendingUp, Users, Eye, Store,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as merchantApi from '@/lib/api/merchant';
import { offlineDB, isOfflineError } from '@/lib/offline/offline-db';
import {
  MerchantDashboardTabId,
  getMerchantDashboardTabsForShop,
  resolveMerchantDashboardTabForShop,
  isTabUpgradeRequired,
} from '@/lib/dashboard/activity-config';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import TabButton from './TabButton';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

import OverviewTab from './tabs/OverviewTab';
import NotificationsTab from './tabs/NotificationsTab';
import ProductsTab from './tabs/ProductsTab';
import ReservationsTab from './tabs/ReservationsTab';
import SalesTab from './tabs/SalesTab';
import PromotionsTab from './tabs/PromotionsTab';
import ReportsTab from './tabs/ReportsTab';
import CustomersTab from './tabs/CustomersTab';
import GalleryTab from './tabs/GalleryTab';
import InvoiceTab from './tabs/InvoiceTab';
import AbandonedCartTab from './tabs/AbandonedCartTab';
import DesignTab from './tabs/DesignTab';
import SettingsPage from './tabs/SettingsPage';
import AddProductModal from './modals/AddProductModal';
import CreateOfferModal from './modals/CreateOfferModal';
import AiAssistantPanel from './AiAssistantPanel';
import NotificationPanel from './NotificationPanel';
import ModuleUpgradeRequest from './ModuleUpgradeRequest';
import { useShopNotifications } from '@/lib/hooks/useNotifications';
import POSSystem from './pos/POSSystem';

const MotionDiv = motion.div as any;

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
  design: <Palette size={18} />,
};

const readCachedShop = () => {
  try {
    const raw = localStorage.getItem('ray_last_shop');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id) return null;
    return parsed;
  } catch { return null; }
};

const readSessionFromClientCookies = () => {
  try {
    const role = document.cookie
      .split('; ')
      .find((row) => row.startsWith('ray_role='))
      ?.split('=')[1];
    const userId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('ray_user_id='))
      ?.split('=')[1];
    const shopId = document.cookie
      .split('; ')
      .find((row) => row.startsWith('ray_shop_id='))
      ?.split('=')[1];
    return {
      role: role ? decodeURIComponent(role) : '',
      userId: userId ? decodeURIComponent(userId) : '',
      shopId: shopId ? decodeURIComponent(shopId) : '',
    };
  } catch {
    return { role: '', userId: '', shopId: '' };
  }
};

export default function MerchantDashboardPage() {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'overview';
  const impersonateShopId = searchParams.get('impersonateShopId');

  const [currentShop, setCurrentShop] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerSeedProduct, setOfferSeedProduct] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState('overview');

  const [loading, setLoading] = useState(true);

  const syncInFlightRef = useRef(false);
  const loadRequestIdRef = useRef(0);
  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});

  const shopCategory = currentShop?.category;
  const visibleTabs = getMerchantDashboardTabsForShop(currentShop || { category: shopCategory }).map(tab => ({
    ...tab,
    icon: ICON_BY_TAB_ID[tab.id],
    label: t(tab.labelKey, tab.id),
  }));
  const hasPosTab = visibleTabs.some(t => t.id === 'pos' && !t.upgradeRequired);
  const effectiveTab = resolveMerchantDashboardTabForShop(tabParam, currentShop || { category: shopCategory });

  const shopIdForNotifs = currentShop?.id ? String(currentShop.id) : undefined;
  const { notifications: shopNotifs, unreadCount: notifUnreadCount, markAsRead: notifMarkRead, markAllAsRead: notifMarkAllRead } = useShopNotifications(shopIdForNotifs);

  const setTab = useCallback((tab: MerchantDashboardTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!tab || tab === 'overview') params.delete('tab');
    else params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const getDateRanges = () => {
    const now = new Date();
    const salesFrom = new Date(now);
    salesFrom.setFullYear(salesFrom.getFullYear() - 2);
    const analyticsFrom = new Date(now);
    analyticsFrom.setDate(analyticsFrom.getDate() - 30);
    return { now, salesFrom, analyticsFrom };
  };

  const loadShop = useCallback(async () => {
    if (syncInFlightRef.current) return null;
    syncInFlightRef.current = true;
    const requestId = ++loadRequestIdRef.current;
    const isStale = () => requestId !== loadRequestIdRef.current;
    let redirected = false;
    setLoading(true);

    try {
      const cookieSession = typeof document !== 'undefined' ? readSessionFromClientCookies() : { role: '', userId: '', shopId: '' };
      const savedUserStr = (() => {
        try {
          return localStorage.getItem('ray_user');
        } catch {
          return null;
        }
      })();

      // If we have neither cookies nor localStorage session, redirect to login.
      if (!savedUserStr && !cookieSession.userId) {
        router.push('/login');
        return null;
      }

      const isOffline = (() => {
        try { return typeof navigator !== 'undefined' && navigator?.onLine === false; } catch { return false; }
      })();

      if (isOffline) {
        const cached = readCachedShop();
        if (cached) { setCurrentShop(cached); return cached; }
      }

      const savedUser = (() => {
        if (!savedUserStr) return null;
        try {
          return JSON.parse(savedUserStr);
        } catch {
          return null;
        }
      })();

      const role = String(savedUser?.role || cookieSession.role || '').toLowerCase();
      if (role !== 'merchant' && !(role === 'admin' && impersonateShopId)) {
        router.push('/login'); return null;
      }

      const effectiveShop = await merchantApi.merchantGetMyShop();
      if (isStale()) return null;
      setCurrentShop(effectiveShop);

      try {
        if (effectiveShop?.id) {
          localStorage.setItem('ray_last_shop', JSON.stringify(effectiveShop));
          await offlineDB.saveShop(effectiveShop.id, effectiveShop);
        }
      } catch {}

      const status = String(effectiveShop?.status || '').toLowerCase();
      if (status !== 'approved') {
        redirected = true;
        router.push('/business/pending');
        return null;
      }

      return effectiveShop;
    } catch (e: any) {
      if (isOfflineError(e)) {
        const cached = readCachedShop();
        if (cached) { setCurrentShop(cached); return cached; }
        // Try IndexedDB
        try {
          const savedUser = JSON.parse(localStorage.getItem('ray_user') || '{}');
          if (savedUser?.shopId) {
            const idbShop = await offlineDB.getShop(savedUser.shopId);
            if (idbShop) { setCurrentShop(idbShop); return idbShop; }
          }
        } catch {}
      }
      const status = typeof e?.status === 'number' ? e.status : undefined;
      if (status === 404) { router.push('/login'); return null; }
    } finally {
      if (!redirected && !isStale()) setLoading(false);
      syncInFlightRef.current = false;
    }
    return null;
  }, [impersonateShopId, router]);

  const dedupeProductsById = (items: any[]) => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const p of Array.isArray(items) ? items : []) {
      const id = p?.id != null ? String(p.id).trim() : '';
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
    return out;
  };

  const ensureTabData = useCallback(async (tab: MerchantDashboardTabId, shop: any, force = false) => {
    const shopId = shop?.id ? String(shop.id) : '';
    if (!shopId) return;
    const key = `${tab}:${shopId}`;
    const state = tabLoadStateRef.current[key] || { loaded: false, inFlight: false };
    if (!force && state.loaded) return;
    if (state.inFlight) return;
    tabLoadStateRef.current[key] = { ...state, inFlight: true };

    try {
      const { now, salesFrom, analyticsFrom } = getDateRanges();

      if (tab === 'products') {
        const list = await merchantApi.merchantGetProducts(shopId);
        setProducts(dedupeProductsById(list));
        await offlineDB.saveProducts(shopId, list);
      } else if (tab === 'reservations') {
        const list = await merchantApi.merchantGetReservations(shopId);
        setReservations(list);
        await offlineDB.saveReservations(shopId, list);
      } else if (tab === 'sales') {
        const list = await merchantApi.merchantGetOrders({ shopId, from: salesFrom.toISOString(), to: now.toISOString() });
        setSales(list);
        await offlineDB.saveOrders(shopId, list);
      } else if (tab === 'overview') {
        const [notif, an] = await Promise.all([
          merchantApi.merchantGetNotifications(shopId),
          merchantApi.merchantGetShopAnalytics(shopId, { from: analyticsFrom.toISOString(), to: now.toISOString() }),
        ]);
        setNotifications((notif || []).slice(0, 5));
        setAnalytics(an);
        await offlineDB.saveNotifications(shopId, notif);
        await offlineDB.saveAnalytics(shopId, an);
      } else if (tab === 'reports') {
        const [orders, an, res] = await Promise.all([
          merchantApi.merchantGetOrders({ shopId, from: salesFrom.toISOString(), to: now.toISOString() }),
          merchantApi.merchantGetShopAnalytics(shopId, { from: analyticsFrom.toISOString(), to: now.toISOString() }),
          merchantApi.merchantGetReservations(shopId),
        ]);
        setSales(orders);
        setAnalytics(an);
        setReservations(res || []);
        await offlineDB.saveOrders(shopId, orders);
        await offlineDB.saveAnalytics(shopId, an);
        await offlineDB.saveReservations(shopId, res || []);
      } else if (tab === 'promotions') {
        const offers = await merchantApi.merchantGetOffers();
        setActiveOffers((offers || []).filter((o: any) => o.shopId === shopId));
      } else if (tab === 'gallery') {
        const images = await merchantApi.merchantGetGallery(shopId);
        setGalleryImages(images || []);
      }
    } catch (e) {
      // Offline fallback: try to load from IndexedDB
      if (isOfflineError(e)) {
        try {
          if (tab === 'products') { const d = await offlineDB.getProducts(shopId); if (d) setProducts(d); }
          else if (tab === 'reservations') { const d = await offlineDB.getReservations(shopId); if (d) setReservations(d); }
          else if (tab === 'sales') { const d = await offlineDB.getOrders(shopId); if (d) setSales(d); }
          else if (tab === 'overview' || tab === 'reports') {
            const [n, a, o, r] = await Promise.all([
              offlineDB.getNotifications(shopId), offlineDB.getAnalytics(shopId),
              offlineDB.getOrders(shopId), offlineDB.getReservations(shopId),
            ]);
            if (n) setNotifications(n.slice(0, 5));
            if (a) setAnalytics(a);
            if (o && tab === 'reports') setSales(o);
            if (r && tab === 'reports') setReservations(r);
          }
        } catch {}
      }
    } finally {
      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
    }
  }, []);

  const refreshShopAndActiveTab = useCallback(async (forceTab = true) => {
    const shop = (await loadShop()) || currentShop;
    if (!shop) return;
    await ensureTabData(resolveMerchantDashboardTabForShop(searchParams.get('tab') || '', shop), shop, forceTab);
  }, [currentShop, ensureTabData, loadShop, searchParams]);

  useEffect(() => { loadShop(); }, [loadShop]);

  useEffect(() => {
    if (!currentShop) return;
    ensureTabData(resolveMerchantDashboardTabForShop(tabParam, currentShop), currentShop);
  }, [currentShop, ensureTabData, tabParam]);

  useEffect(() => {
    if (!currentShop) return;
    if (!searchParams.get('tab')) setTab('overview');
  }, [currentShop, searchParams, setTab]);

  useEffect(() => {
    if (effectiveTab !== tabParam && currentShop) setTab(effectiveTab);
  }, [effectiveTab, tabParam, currentShop, setTab]);

  // Smart refresh via BroadcastChannel + custom events
  useEffect(() => {
    if (!currentShop) return;
    let bc: BroadcastChannel | null = null;
    try { bc = new BroadcastChannel('ray-db'); } catch {}

    const onSmartRefresh = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      refreshShopAndActiveTab(true);
    };

    const onBcMessage = () => { refreshShopAndActiveTab(true); };

    window.addEventListener('ray-smart-refresh', onSmartRefresh);
    bc?.addEventListener('message', onBcMessage);
    return () => {
      window.removeEventListener('ray-smart-refresh', onSmartRefresh);
      bc?.removeEventListener('message', onBcMessage);
      bc?.close();
    };
  }, [currentShop, refreshShopAndActiveTab]);

  const handleDeleteProduct = async (id: string): Promise<void> => {
    if (!confirm(t('business.dashboard.confirmDeleteProduct'))) return;
    try {
      await merchantApi.merchantDeleteProduct(id);
      if (currentShop) await ensureTabData('products', currentShop, true);
    } catch {}
  };

  const handleUpdateResStatus = async (id: string, status: string) => {
    try {
      await merchantApi.merchantUpdateReservationStatus(id, status);
      if (status === 'completed') {
        const res = reservations.find((r: any) => r.id === id);
        if (res) await merchantApi.merchantConvertReservationToCustomer({
          customerName: (res as any).customerName,
          customerPhone: (res as any).customerPhone,
          customerEmail: (res as any).customerEmail || '',
          shopId: currentShop.id,
          firstPurchaseAmount: (res as any).itemPrice,
          firstPurchaseItem: (res as any).itemName,
        });
      }
      if (currentShop) await ensureTabData('reservations', currentShop, true);
    } catch {}
  };

  const handleTabPointerEnter = useCallback((tabId: MerchantDashboardTabId) => {
    if (!currentShop) return;
    void ensureTabData(tabId, currentShop);
  }, [currentShop, ensureTabData]);

  const TabFallback = (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      <p className="font-bold text-slate-400">{t('business.dashboard.loadingSection')}</p>
    </div>
  );

  const renderContent = () => {
    // If the current tab requires an upgrade, show the upgrade request UI
    if (isTabUpgradeRequired(effectiveTab, currentShop || { category: shopCategory })) {
      const tabDef = visibleTabs.find(t => t.id === effectiveTab);
      return (
        <ModuleUpgradeRequest
          moduleId={effectiveTab}
          icon={ICON_BY_TAB_ID[effectiveTab]}
          title={tabDef?.label || t(tabDef?.labelKey || '', effectiveTab)}
          description={t(`business.modules.${effectiveTab}Description`, '')}
          onRequested={() => refreshShopAndActiveTab(true)}
        />
      );
    }

    switch (effectiveTab) {
      case 'overview':
        return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} onViewAllNotifications={() => setTab('notifications')} onNavigateToTab={(tab) => setTab(tab)} />;
      case 'notifications':
        return <NotificationsTab shopId={String(currentShop.id)} />;
      case 'products':
        return <ProductsTab products={products} shopId={currentShop.id} shopCategory={shopCategory} shop={currentShop} onDelete={handleDeleteProduct} onAdd={() => setShowProductModal(true)} />;
      case 'gallery':
        return <GalleryTab images={galleryImages} onImagesChange={setGalleryImages} shopId={currentShop.id} primaryColor={currentShop.pageDesign?.primaryColor || '#00E5FF'} />;
      case 'promotions':
        return <PromotionsTab shopId={currentShop.id} offers={activeOffers} onDelete={async (id: string) => { await merchantApi.merchantDeleteOffer(id); if (currentShop) await ensureTabData('promotions', currentShop, true); }} onCreateOffer={() => { setOfferSeedProduct(null); setOfferModalOpen(true); }} />;
      case 'reservations':
        return <ReservationsTab reservations={reservations} onUpdateStatus={handleUpdateResStatus} />;
      case 'invoice':
        return <InvoiceTab shopId={currentShop.id} shop={currentShop} />;
      case 'sales':
        return <SalesTab sales={sales} posEnabled={hasPosTab} />;
      case 'abandonedCart':
        return <AbandonedCartTab shopId={currentShop.id} shop={currentShop} />;
      case 'reports':
        return <ReportsTab analytics={analytics} sales={sales} reservations={reservations} />;
      case 'design':
        return <DesignTab shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} />;
      case 'settings':
        return <SettingsPage shop={currentShop} onSaved={() => refreshShopAndActiveTab(true)} settingsTab={settingsSubTab} onSettingsTabChange={setSettingsSubTab} />;
      case 'pos':
        return <POSSystem onClose={() => setTab('overview')} shopId={currentShop.id} shop={currentShop} />;
      case 'builder':
        return <div className="p-8 text-center">
          <Palette className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-black text-slate-600">{t('business.dashboard.pageBuilder', 'بناء الصفحة')}</h2>
          <p className="text-slate-400 mt-2">{t('business.dashboard.builderComingSoon', 'قريباً')}</p>
          <button onClick={() => setTab('overview')} className="mt-4 px-6 py-2 rounded-2xl bg-slate-900 text-white font-bold">{t('business.dashboard.backToOverview', 'الرئيسية')}</button>
        </div>;
      default:
        return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} onViewAllNotifications={() => setTab('notifications')} onNavigateToTab={(tab) => setTab(tab)} />;
    }
  };

  const sidebarWidthOffset = isSidebarCollapsed ? 'md:mr-24 md:ml-0' : 'md:mr-80 md:ml-0';
  const sidebarWidthOffsetLtr = isSidebarCollapsed ? 'md:ml-24 md:mr-0' : 'md:ml-80 md:mr-0';
  const offsetClass = isArabic ? sidebarWidthOffset : sidebarWidthOffsetLtr;

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/clear-cookie', { method: 'POST' });
    } catch {}
    try { localStorage.removeItem('ray_user'); } catch {}
    try { localStorage.removeItem('ray_last_shop'); } catch {}
    router.push(`/${isArabic ? 'ar' : 'en'}/login`);
  }, [router, isArabic]);

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
      <div className={`h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 px-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={dir}>
        <p className="font-black text-slate-600">{t('business.dashboard.noShopFound')}</p>
        <button onClick={() => router.push('/login')} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black">
          {t('business.dashboard.login')}
        </button>
      </div>
    );
  }

  const bannerImageUrl = String(
    currentShop?.pageDesign?.bannerUrl || currentShop?.bannerUrl || currentShop?.banner_url || currentShop?.coverImage || ''
  ).trim();

  return (
    <>
    <DashboardSidebar
      visibleTabs={visibleTabs}
      effectiveTab={effectiveTab}
      onTabChange={setTab}
      isSidebarOpen={isSidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isCollapsed={isSidebarCollapsed}
      setIsCollapsed={setIsSidebarCollapsed}
      onLogout={handleLogout}
      shopName={currentShop?.name}
      notifUnreadCount={notifUnreadCount}
    />
    <DashboardHeader
      shopName={currentShop?.name}
      userName={currentShop?.name}
      userEmail={readSessionFromClientCookies().role || undefined}
      userInitial={currentShop?.name?.charAt(0)}
      hasPosTab={hasPosTab}
      unreadCount={notifUnreadCount}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(v => !v)}
      onOpenSidebar={() => setSidebarOpen(true)}
      onOpenNotifications={() => setIsNotifPanelOpen(true)}
      onNavigateToPos={() => setTab('pos')}
      onNavigateToDesign={() => setTab('design')}
      onNavigateToSettings={(subTab) => { setTab('settings'); if (subTab) setSettingsSubTab(subTab); }}
      onRefresh={() => refreshShopAndActiveTab(true)}
      onLogout={handleLogout}
    />
    <div className={`min-h-screen pb-28 md:pb-32 px-3 sm:px-4 md:px-6 md:pt-28 font-sans transition-all duration-500 ${offsetClass} ${isArabic ? 'text-right' : 'text-left'}`} dir={dir}>
      {effectiveTab !== 'builder' && (
        <div className="relative overflow-hidden bg-gradient-to-l from-cyan-50 via-white to-slate-50 p-4 sm:p-6 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] border border-cyan-100/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 md:gap-8">
          {bannerImageUrl ? (
            <img src={bannerImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" loading="lazy" decoding="async" />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/95 via-white/90 to-cyan-50/95" />
          <div className="pointer-events-none absolute -top-12 -left-10 w-36 h-36 rounded-full bg-[#00E5FF]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-8 w-40 h-40 rounded-full bg-slate-900/10 blur-3xl" />
          <div className="relative z-10 flex items-center gap-3 sm:gap-6 md:gap-8 flex-row-reverse">
            <div className="relative group">
              {currentShop.logoUrl || currentShop.logo_url ? (
                <img
                  src={currentShop.logoUrl || currentShop.logo_url}
                  alt="logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-[2rem] sm:rounded-[2.5rem] object-cover shadow-2xl transition-transform group-hover:scale-105"
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
              onClick={() => setIsNotifPanelOpen(true)}
              className="relative w-full sm:w-auto px-3 sm:px-5 py-3 sm:py-3 md:py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Bell size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('business.dashboardTabs.notifications', 'الإشعارات')}</span>
              {notifUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{notifUnreadCount > 9 ? '9+' : notifUnreadCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/shop/${currentShop.slug}`)}
              className="w-full sm:w-auto px-3 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 lg:py-5 bg-[#00E5FF] text-black rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 hover:scale-[1.02] hover:brightness-110 transition-all shadow-md sm:shadow-xl"
            >
              <Eye size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> <span>{t('business.dashboard.previewShop')}</span>
            </button>
            {hasPosTab && (
              <button
                type="button"
                onClick={() => setTab('pos')}
                className="w-full sm:w-auto px-3 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3 md:py-4 lg:py-5 bg-slate-900 text-white rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-xs md:text-sm flex items-center justify-center gap-2 md:gap-3 hover:bg-black transition-all shadow-md sm:shadow-xl"
              >
                <Smartphone size={14} className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">{t('business.dashboard.smartPOS')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="sticky top-4 z-40 md:hidden">
        <div className="flex gap-2 p-2 bg-slate-100/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 overflow-x-auto no-scrollbar shadow-inner">
          <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 px-3 py-2 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center gap-2">
            <Menu size={14} /> {t('sidebar.menu', 'القائمة')}
          </button>
          {visibleTabs.slice(0, 5).map((tab) => (
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

      {/* Content area */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={effectiveTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {effectiveTab === 'pos' ? (
              <POSSystem onClose={() => setTab('overview')} shopId={currentShop.id} shop={currentShop} />
            ) : effectiveTab === 'builder' ? (
              <div className="p-8 text-center">
                <Palette className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h2 className="text-xl font-black text-slate-600">{t('business.dashboard.pageBuilder', 'بناء الصفحة')}</h2>
                <p className="text-slate-400 mt-2">{t('business.dashboard.builderComingSoon', 'قريباً')}</p>
                <button onClick={() => setTab('overview')} className="mt-4 px-6 py-2 rounded-2xl bg-slate-900 text-white font-bold">{t('business.dashboard.backToOverview', 'الرئيسية')}</button>
              </div>
            ) : (
              renderContent()
            )}
          </MotionDiv>
        </AnimatePresence>
      </div>

      {process.env.NODE_ENV !== 'production' && currentShop?.id && (
        <AiAssistantPanel
          shopId={currentShop.id}
          shop={currentShop}
          currentPage={effectiveTab}
          onActionExecuted={() => refreshShopAndActiveTab(true)}
        />
      )}

      <AddProductModal isOpen={showProductModal} onClose={() => setShowProductModal(false)} shopId={String(currentShop?.id || '')} shopCategory={shopCategory} onCreated={() => { if (currentShop) ensureTabData('products', currentShop, true); }} />

      <CreateOfferModal isOpen={offerModalOpen} onClose={() => { setOfferModalOpen(false); setOfferSeedProduct(null); }} shopId={String(currentShop?.id || '')} seedProduct={offerSeedProduct} onCreated={() => { if (currentShop) ensureTabData('promotions', currentShop, true); }} />

      {/* Notification slide-in panel */}
      <NotificationPanel
        isOpen={isNotifPanelOpen}
        onClose={() => setIsNotifPanelOpen(false)}
        notifications={shopNotifs}
        unreadCount={notifUnreadCount}
        onMarkRead={notifMarkRead}
        onMarkAllRead={notifMarkAllRead}
      />
    </div>
    </>
  );
}
