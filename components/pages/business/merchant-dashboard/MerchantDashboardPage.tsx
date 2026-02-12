import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  Camera,
  CheckCircle2,
  CreditCard,
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
import MerchantSettings from '@/src/components/MerchantDashboard/Settings';

import POSSystem from '../POSSystem';
import PageBuilder from '../builder/PageBuilder';

import AddProductModal from './modals/AddProductModal';
import CreateOfferModal from './modals/CreateOfferModal';
import TabButton from './components/TabButton';
import {
  MerchantDashboardTabId,
  getVisibleMerchantDashboardTabs,
  resolveMerchantDashboardTab,
} from './dashboardTabs';

import CustomersTab from './tabs/CustomersTab';
import GalleryTab from './tabs/GalleryTab';
import OverviewTab from './tabs/OverviewTab';
import ProductsTab from './tabs/ProductsTab';
import PromotionsTab from './tabs/PromotionsTab';
import ReportsTab from './tabs/ReportsTab';
import { ReservationsTab } from './tabs/ReservationsTab';
import SalesTab from './tabs/SalesTab';

const { useSearchParams, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type TabType = MerchantDashboardTabId;

const ICON_BY_TAB_ID: Record<MerchantDashboardTabId, React.ReactNode> = {
  overview: <TrendingUp size={18} />,
  gallery: <Camera size={18} />,
  reports: <BarChart3 size={18} />,
  customers: <Users size={18} />,
  products: <Package size={18} />,
  promotions: <Megaphone size={18} />,
  reservations: <CalendarCheck size={18} />,
  sales: <CreditCard size={18} />,
  builder: <Palette size={18} />,
  settings: <Settings size={18} />,
  pos: <Smartphone size={18} />,
};

const MerchantDashboardPage: React.FC = () => {
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

  const tabLoadStateRef = useRef<Record<string, { loaded: boolean; inFlight: boolean }>>({});
  const getDateRanges = () => {
    const now = new Date();
    const salesFrom = new Date(now);
    salesFrom.setFullYear(salesFrom.getFullYear() - 1);
    const analyticsFrom = new Date(now);
    analyticsFrom.setDate(analyticsFrom.getDate() - 30);
    return { now, salesFrom, analyticsFrom };
  };

  const shopCategory = currentShop?.category;
  const visibleTabs = getVisibleMerchantDashboardTabs(shopCategory).map((t) => ({
    ...t,
    icon: ICON_BY_TAB_ID[t.id],
    label: t.dynamicLabel ? t.dynamicLabel(shopCategory) : t.label,
  }));
  const effectiveTab = resolveMerchantDashboardTab(activeTab, shopCategory);

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
        addToastRef.current('هذه الصفحة للتجار فقط', 'error');
        navigate('/login');
        return;
      }

      const effectiveShop =
        savedUser?.role === 'admin' && impersonateShopId
          ? await ApiService.getShopAdminById(String(impersonateShopId))
          : await ApiService.getMyShop();

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
        try {
          localStorage.removeItem('ray_user');
          localStorage.removeItem('ray_token');
          window.dispatchEvent(new Event('auth-change'));
        } catch {
          // ignore
        }
        redirected = true;
        navigate('/login');
        return;
      }
      const message = (e as any)?.message || 'حدث خطأ أثناء تحميل البيانات';
      addToastRef.current(message, 'error');
    } finally {
      if (!redirected) {
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

      if (tab === 'products') {
        const list = await (ApiService as any).getProductsForManage(shopId);
        setProducts(list);
      } else if (tab === 'reservations') {
        const list = await ApiService.getReservations(shopId);
        setReservations(list);
      } else if (tab === 'sales') {
        const list = await ApiService.getAllOrders({ shopId, from: salesFrom.toISOString(), to: now.toISOString() });
        setSales(list.filter((s: any) => s.shop_id === shopId || s.shopId === shopId));
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
        setSales((orders || []).filter((s: any) => s.shop_id === shopId || s.shopId === shopId));
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
      const message = (e as any)?.message || 'حدث خطأ أثناء تحميل البيانات';
      addToastRef.current(message, 'error');
    } finally {
      tabLoadStateRef.current[key] = { loaded: true, inFlight: false };
    }
  }, []);

  const refreshShopAndActiveTab = useCallback(async (forceTab = true) => {
    const shop = (await loadShop()) || currentShop;
    if (!shop) return;
    await ensureTabData(resolveMerchantDashboardTab(searchParams.get('tab'), shop?.category), shop, forceTab);
  }, [currentShop, ensureTabData, loadShop, searchParams]);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  useEffect(() => {
    if (!currentShop) return;
    ensureTabData(resolveMerchantDashboardTab(tabParam, currentShop?.category), currentShop);
  }, [currentShop, ensureTabData, tabParam]);

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

  useEffect(() => {
    const onOrdersUpdated = () => {
      const t = setTimeout(() => {
        refreshShopAndActiveTab(true);
      }, 150);
      return () => clearTimeout(t);
    };
    const handler = () => {
      const cleanup = onOrdersUpdated();
      if (typeof cleanup === 'function') {
        // ignore
      }
    };
    window.addEventListener('orders-updated', handler);
    return () => {
      window.removeEventListener('orders-updated', handler);
    };
  }, [refreshShopAndActiveTab]);

  useEffect(() => {
    let timer: any;
    const onDbUpdate = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refreshShopAndActiveTab(true);
      }, 200);
    };
    window.addEventListener('ray-db-update', onDbUpdate);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('ray-db-update', onDbUpdate);
    };
  }, [refreshShopAndActiveTab]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await ApiService.deleteProduct(id);
      addToast('تم حذف المنتج', 'success');
      if (currentShop) {
        await ensureTabData('products', currentShop, true);
      }
    } catch {
      addToast('فشل حذف المنتج', 'error');
    }
  };

  const handleUpdateProduct = async (updatedProduct: any) => {
    try {
      addToast('تم تحديث المنتج بنجاح', 'success');
      // Refresh products list
      if (currentShop?.id) {
        const list = await (ApiService as any).getProductsForManage(currentShop.id);
        setProducts(list);
      }
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'فشل في تحديث المنتج';
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
          addToast('تم تحويل العميل لقاعدة العملاء بنجاح', 'success');
        }
      }

      addToast('تم تحديث حالة الحجز', 'success');
      if (currentShop) {
        await ensureTabData('reservations', currentShop, true);
      }
    } catch {
      addToast('فشل التحديث', 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} />;
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
      case 'sales':
        return <SalesTab sales={sales} />;
      case 'reports':
        return <ReportsTab analytics={analytics} sales={sales} reservations={reservations as any} />;
      case 'customers':
        return <CustomersTab shopId={currentShop.id} />;
      case 'settings':
        return <MerchantSettings shop={currentShop} onSaved={refreshShopAndActiveTab as any} adminShopId={adminTargetShopId} />;
      default:
        return <OverviewTab shop={currentShop} analytics={analytics} notifications={notifications} />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-[#00E5FF] w-12 h-12" />
        <p className="font-black text-slate-400">تحميل مركز العمليات...</p>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-right px-6" dir="rtl">
        <p className="font-black text-slate-600">لم يتم العثور على متجر مرتبط بهذا الحساب.</p>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('ray_user');
              localStorage.removeItem('ray_token');
              window.dispatchEvent(new Event('auth-change'));
            } catch {
            }
            navigate('/login');
          }}
          className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10 text-right pb-32 px-4 md:px-6 font-sans" dir="rtl">
      {effectiveTab !== 'builder' && effectiveTab !== 'settings' && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8 flex-row-reverse">
            <div className="relative group">
              <img
                src={
                  currentShop.logoUrl ||
                  currentShop.logo_url ||
                  'https://images.unsplash.com/photo-1544441893-675973e31985?w=200'
                }
                className="w-20 h-20 md:w-32 md:h-32 rounded-[2.5rem] object-cover shadow-2xl transition-transform group-hover:scale-105"
                alt="logo"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">{currentShop.name}</h1>
              <div className="flex items-center gap-3 justify-end">
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-slate-500">{currentShop.category}</span>
                <span className="text-slate-400 font-bold text-sm flex items-center justify-end gap-2">
                  <MapPin size={14} /> {currentShop.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/shop/${currentShop.slug}`)}
              className="flex-1 md:flex-none px-3 sm:px-8 md:px-10 py-2 sm:py-4 md:py-5 bg-[#00E5FF] text-black rounded-xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-3 hover:scale-105 transition-all shadow-md sm:shadow-xl"
            >
              <Eye size={14} className="sm:w-5 sm:h-5" /> معاينة المحل
            </button>
            <button
              onClick={() => setTab('pos')}
              className="flex-1 md:flex-none px-3 sm:px-8 md:px-10 py-2 sm:py-4 md:py-5 bg-slate-900 text-white rounded-xl sm:rounded-[1.75rem] md:rounded-[2rem] font-black text-[11px] sm:text-sm flex items-center justify-center gap-1.5 sm:gap-3 hover:bg-black transition-all shadow-md sm:shadow-xl"
            >
              <Smartphone size={14} className="sm:w-5 sm:h-5" /> الكاشير الذكي
            </button>
          </div>
        </div>
      )}

      <div className="hidden gap-2 p-2 bg-slate-100/60 backdrop-blur-xl rounded-[2.5rem] border border-white/40 overflow-x-auto no-scrollbar sticky top-24 z-40 shadow-inner">
        {visibleTabs.map((tab) => (
          <TabButton key={tab.id} active={effectiveTab === tab.id} onClick={() => setTab(tab.id)} icon={tab.icon} label={tab.label} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv
          key={effectiveTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {effectiveTab === 'pos' ? (
            <POSSystem shopId={currentShop.id} shop={currentShop} onClose={() => setTab('overview')} />
          ) : effectiveTab === 'builder' ? (
            <PageBuilder onClose={() => setTab('overview')} />
          ) : (
            renderContent()
          )}
        </MotionDiv>
      </AnimatePresence>

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
    </div>
  );
};

export default MerchantDashboardPage;
