import React, { useCallback, useEffect, useState } from 'react';
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
  MessageCircle,
  Package,
  Palette,
  Settings,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { Category, Offer, Product, Reservation, ShopGallery } from '@/types';
import { useToast } from '@/components';
import MerchantSettings from '@/src/components/MerchantDashboard/Settings';

import POSSystem from '../POSSystem';
import PageBuilder from '../builder/PageBuilder';

import AddProductModal from './modals/AddProductModal';
import CreateOfferModal from './modals/CreateOfferModal';
import TabButton from './components/TabButton';

import ChatsTab from './tabs/ChatsTab';
import CustomersTab from './tabs/CustomersTab';
import GalleryTab from './tabs/GalleryTab';
import OverviewTab from './tabs/OverviewTab';
import ProductsTab from './tabs/ProductsTab';
import PromotionsTab from './tabs/PromotionsTab';
import ReportsTab from './tabs/ReportsTab';
import ReservationsTab from './tabs/ReservationsTab';
import SalesTab from './tabs/SalesTab';

const { useSearchParams, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

type TabType =
  | 'overview'
  | 'pos'
  | 'builder'
  | 'products'
  | 'reservations'
  | 'sales'
  | 'promotions'
  | 'chats'
  | 'settings'
  | 'reports'
  | 'customers'
  | 'gallery';

type DashboardTabConfig = {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  visibleFor?: Category[];
};

const DASHBOARD_TABS: DashboardTabConfig[] = [
  { id: 'overview', label: 'نظرة عامة', icon: <TrendingUp size={18} /> },
  { id: 'gallery', label: 'معرض الصور', icon: <Camera size={18} /> },
  { id: 'reports', label: 'التقارير', icon: <BarChart3 size={18} /> },
  { id: 'customers', label: 'العملاء', icon: <Users size={18} /> },
  { id: 'products', label: 'المخزون', icon: <Package size={18} /> },
  { id: 'promotions', label: 'العروض', icon: <Megaphone size={18} /> },
  { id: 'reservations', label: 'الحجوزات', icon: <CalendarCheck size={18} /> },
  { id: 'chats', label: 'المحادثات', icon: <MessageCircle size={18} /> },
  { id: 'sales', label: 'المبيعات', icon: <CreditCard size={18} /> },
  { id: 'builder', label: 'التصميم', icon: <Palette size={18} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
];

const isTabVisibleForCategory = (tab: DashboardTabConfig, category?: unknown) => {
  if (!tab.visibleFor || tab.visibleFor.length === 0) return true;
  const cat = String(category || '').toUpperCase();
  if (!cat) return false;
  return tab.visibleFor.some((c) => String(c).toUpperCase() === cat);
};

const resolveDashboardTab = (requested: any, category?: unknown): TabType => {
  const req = String(requested || '').trim() as TabType;
  if (req === 'pos' || req === 'builder') return req;
  const known = DASHBOARD_TABS.find((t) => t.id === req);
  if (!known) return 'overview';
  return isTabVisibleForCategory(known, category) ? known.id : 'overview';
};

const MerchantDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = (tabParam as TabType) || 'overview';
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
  const [showOfferModal, setShowOfferModal] = useState<Product | null>(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const shopCategory = currentShop?.category;
  const visibleTabs = DASHBOARD_TABS.filter((t) => isTabVisibleForCategory(t, shopCategory));
  const effectiveTab = resolveDashboardTab(activeTab, shopCategory);

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

  const syncData = useCallback(async () => {
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
        addToast('هذه الصفحة للتجار فقط', 'error');
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

      const now = new Date();
      const salesFrom = new Date(now);
      salesFrom.setFullYear(salesFrom.getFullYear() - 1);

      const analyticsFrom = new Date(now);
      analyticsFrom.setDate(analyticsFrom.getDate() - 30);

      const results = await Promise.allSettled([
        ApiService.getProducts(effectiveShop.id),
        ApiService.getReservations(effectiveShop.id),
        ApiService.getAllOrders({ shopId: effectiveShop.id, from: salesFrom.toISOString(), to: now.toISOString() }),
        ApiService.getNotifications(effectiveShop.id),
        ApiService.getShopAnalytics(effectiveShop.id, { from: analyticsFrom.toISOString(), to: now.toISOString() }),
        ApiService.getOffers(),
        ApiService.getShopGallery(effectiveShop.id),
      ]);

      const firstRejection = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (firstRejection?.reason) {
        const message = (firstRejection as any).reason?.message || String((firstRejection as any).reason);
        addToast(message, 'error');
      }

      const prodRes = results[0];
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value);

      const reservationsRes = results[1];
      if (reservationsRes.status === 'fulfilled') setReservations(reservationsRes.value);

      const salesRes = results[2];
      if (salesRes.status === 'fulfilled') {
        setSales(salesRes.value.filter((s: any) => s.shop_id === effectiveShop.id || s.shopId === effectiveShop.id));
      }

      const notifRes = results[3];
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.slice(0, 5));

      const analyticsRes = results[4];
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);

      const offersRes = results[5];
      if (offersRes.status === 'fulfilled') setActiveOffers(offersRes.value.filter((o: any) => o.shopId === effectiveShop.id));

      const galleryRes = results[6];
      if (galleryRes.status === 'fulfilled') setGalleryImages(galleryRes.value || []);
    } catch (e) {
      const message = (e as any)?.message || 'حدث خطأ أثناء تحميل البيانات';
      addToast(message, 'error');
    } finally {
      if (!redirected) {
        setLoading(false);
      }
    }
  }, [addToast, impersonateShopId, navigate]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  useEffect(() => {
    if (!currentShop) return;
    const isRestaurant = String(currentShop?.category || '').toUpperCase() === 'RESTAURANT';
    if (isRestaurant && !searchParams.get('tab')) {
      setTab('reservations');
    }
  }, [currentShop, searchParams, setTab]);

  useEffect(() => {
    const onOrdersUpdated = () => {
      syncData();
    };
    window.addEventListener('orders-updated', onOrdersUpdated);
    return () => {
      window.removeEventListener('orders-updated', onOrdersUpdated);
    };
  }, [syncData]);

  useEffect(() => {
    const onDbUpdate = () => {
      syncData();
    };
    window.addEventListener('ray-db-update', onDbUpdate);
    return () => {
      window.removeEventListener('ray-db-update', onDbUpdate);
    };
  }, [syncData]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await ApiService.deleteProduct(id);
      addToast('تم حذف المنتج', 'success');
      syncData();
    } catch {
      addToast('فشل حذف المنتج', 'error');
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
      syncData();
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
            onMakeOffer={(p) => setShowOfferModal(p)}
            onDelete={handleDeleteProduct}
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
            onDelete={(id) => ApiService.deleteOffer(id).then(syncData)}
            onCreate={() => setTab('products')}
          />
        );
      case 'reservations':
        return <ReservationsTab reservations={reservations} onUpdateStatus={handleUpdateResStatus} />;
      case 'sales':
        return <SalesTab sales={sales} />;
      case 'chats':
        return <ChatsTab shopId={currentShop.id} />;
      case 'reports':
        return <ReportsTab analytics={analytics} sales={sales} />;
      case 'customers':
        return <CustomersTab shopId={currentShop.id} />;
      case 'settings':
        return <MerchantSettings shop={currentShop} onSaved={syncData} adminShopId={adminTargetShopId} />;
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10 text-right pb-32 px-4 md:px-6 font-sans" dir="rtl">
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
            onClick={() => setTab('pos')}
            className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
          >
            <Smartphone size={20} /> الكاشير الذكي
          </button>
        </div>
      </div>

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
            <POSSystem shopId={currentShop.id} onClose={() => setTab('overview')} />
          ) : effectiveTab === 'builder' ? (
            <PageBuilder onClose={() => setTab('overview')} />
          ) : (
            renderContent()
          )}
        </MotionDiv>
      </AnimatePresence>

      <AddProductModal isOpen={showProductModal} onClose={() => {
        setShowProductModal(false);
        syncData();
      }} shopId={currentShop.id} />

      <CreateOfferModal product={showOfferModal} onClose={() => {
        setShowOfferModal(null);
        syncData();
      }} shopId={currentShop.id} />
    </div>
  );
};

export default MerchantDashboardPage;
