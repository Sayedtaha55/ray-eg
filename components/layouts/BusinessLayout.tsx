import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutDashboard, Store, CreditCard, BarChart3, Settings, Bell, LogOut, ChevronRight, HelpCircle, Menu, X, Clock, CheckCircle2, UserPlus, ShoppingBag, Calendar, Camera, Users, Megaphone, Palette, User, Shield, FileText, Sliders, Type, Layout, ChevronDown, RefreshCw, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import { useToast } from '@/components/common/feedback/Toaster';
import BrandLogo from '@/components/common/BrandLogo';
import { Category } from '@/types';
import {
  MerchantDashboardTabId,
  getMerchantDashboardTabsForShop,
} from '@/components/pages/business/merchant-dashboard/dashboardTabs';

const { Link, Outlet, useLocation, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const BusinessLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/profile');
  const isBusinessLanding = location.pathname === '/business' || location.pathname === '/business/';
  const isProfilePage = location.pathname.includes('/profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { addToast } = useToast();
  const audioUnlockedRef = useRef(false);

  const userStr = localStorage.getItem('ray_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const impersonateShopId = new URLSearchParams(location.search).get('impersonateShopId');
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const settingsTab = new URLSearchParams(location.search).get('settingsTab') || 'overview';
  const builderTabRaw = new URLSearchParams(location.search).get('builderTab') || '';
  const isSettingsTab = activeTab === 'settings';
  const isBuilderTab = activeTab === 'builder';
  const [settingsDirtyCount, setSettingsDirtyCount] = useState(0);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<Category | undefined>(undefined);
  const [shopForModules, setShopForModules] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const effectiveUser = (user?.role === 'admin' && impersonateShopId)
    ? { ...user, role: 'merchant', shopId: impersonateShopId, name: `Admin (${impersonateShopId})` }
    : user;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(Boolean(mq.matches));
    onChange();
    try {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } catch {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  const ICON_BY_TAB_ID: Record<MerchantDashboardTabId, React.ReactNode> = {
    overview: <LayoutDashboard size={20} />,
    sales: <CreditCard size={20} />,
    reservations: <Calendar size={20} />,
    invoice: <FileText size={20} />,
    products: <ShoppingBag size={20} />,
    customers: <Users size={20} />,
    promotions: <Megaphone size={20} />,
    gallery: <Camera size={20} />,
    reports: <BarChart3 size={20} />,
    builder: <Palette size={20} />,
    settings: <Settings size={20} />,
    pos: <Store size={20} />,
  };

  const buildUrlForTab = (id: MerchantDashboardTabId) => {
    if (id === 'builder') return buildBuilderIndexUrl();
    if (id === 'settings') return buildSettingsUrl('overview');
    return buildDashboardUrl(id);
  };

  const isTabActive = (id: MerchantDashboardTabId) => {
    if (isProfilePage) return false;
    return String(activeTab) === String(id);
  };

  const visibleMainTabs = getMerchantDashboardTabsForShop(shopForModules || { category: shopCategory })
    .map((t) => ({ ...t, icon: ICON_BY_TAB_ID[t.id] }))
    .filter((t) => t.id !== 'pos');

  const normalizeNotif = (n: any) => {
    const id = n?.id != null ? String(n.id) : '';
    return {
      ...n,
      id,
      is_read: Boolean((n as any)?.is_read ?? (n as any)?.isRead),
    };
  };

  useEffect(() => {
    if (!isDashboard) return;

    const unlock = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      try {
        const url = RayDB.getSelectedNotificationSoundUrl();
        if (!url) return;
        const audio = new Audio(url);
        audio.muted = true;
        const p = audio.play();
        if (p && typeof (p as any).then === 'function') {
          (p as any)
            .then(() => {
              try {
                audio.pause();
                audio.currentTime = 0;
              } catch {
              }
              audio.muted = false;
            })
            .catch(() => {
              audioUnlockedRef.current = false;
            });
        } else {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {
          }
          audio.muted = false;
        }
      } catch {
        audioUnlockedRef.current = false;
      }
    };

    window.addEventListener('pointerdown', unlock as any, { once: true } as any);
    return () => {
      try {
        window.removeEventListener('pointerdown', unlock as any);
      } catch {
      }
    };
  }, [isDashboard]);

  const buildDashboardUrl = (tab?: string) => {
    const params = new URLSearchParams(location.search);
    if (!tab) {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    if (tab !== 'settings') {
      params.delete('settingsTab');
    }
    if (tab !== 'builder') {
      params.delete('builderTab');
    }
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  const buildSettingsUrl = (section?: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'settings');
    params.set('settingsTab', String(section || 'overview'));
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  const buildBuilderUrl = (section?: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'builder');
    params.set('builderTab', String(section || 'colors'));
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  const buildBuilderIndexUrl = () => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'builder');
    params.delete('builderTab');
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  const buildBuilderToggleUrl = (section: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'builder');
    const current = String(builderTabRaw || '').trim();
    const next = String(section || '').trim();
    if (current && next && current === next) {
      params.delete('builderTab');
    } else {
      params.set('builderTab', next || 'colors');
    }
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  const loadNotifications = async () => {
    if (!effectiveUser?.shopId) return;
    try {
      const data = await ApiService.getNotifications(effectiveUser.shopId);
      const normalized = (data || []).map(normalizeNotif).filter((n: any) => Boolean(n?.id));
      const uniq: any[] = [];
      const seen = new Set<string>();
      for (const n of normalized) {
        const id = String(n.id || '');
        if (!id || seen.has(id)) continue;
        seen.add(id);
        uniq.push(n);
      }
      setNotifications(uniq);
      setUnreadCount(uniq.filter((n: any) => !Boolean(n?.is_read)).length);
    } catch (e) {
      // Failed to load notifications - handled silently
    }
  };

  useEffect(() => {
    if (isDashboard && effectiveUser?.shopId) {
      loadNotifications();
      
      // الاشتراك في قناة الإشعارات الحية
      const subscription = ApiService.subscribeToNotifications(effectiveUser.shopId, (notif) => {
        const normalized = normalizeNotif(notif);
        const nid = String((normalized as any)?.id || '').trim();
        if (!nid) return;

        let isNew = false;
        setNotifications(prev => {
          const exists = prev.some((x: any) => String((x as any)?.id || '') === nid);
          if (exists) return prev;
          isNew = true;
          return [normalized, ...prev];
        });

        if (!isNew) return;

        const t = String((normalized as any)?.type || '').trim().toUpperCase();
        const shouldRing =
          t === 'ORDER' ||
          t === 'NEW_ORDER' ||
          t === 'RESERVATION' ||
          t === 'NEW_RESERVATION' ||
          t === 'BOOKING';

        if (shouldRing) {
          try {
            const url = RayDB.getSelectedNotificationSoundUrl();
            if (url) {
              const audio = new Audio(url);
              try {
                (audio as any).preload = 'auto';
              } catch {
              }
              try {
                audio.currentTime = 0;
              } catch {
              }
              audio.play().catch(() => {});
            }
          } catch {
          }
        }

        // إظهار توست للمستخدم
        addToast(String((normalized as any)?.title || ''), 'info');

        if (!Boolean((normalized as any)?.is_read)) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDashboard, effectiveUser?.shopId]);

  useEffect(() => {
    if (!isDashboard) return;
    if (!effectiveUser?.shopId) return;

    let cancelled = false;
    (async () => {
      try {
        const shop = impersonateShopId
          ? await ApiService.getShopAdminById(String(impersonateShopId))
          : await ApiService.getMyShop();
        if (cancelled) return;
        setShopCategory((shop as any)?.category);
        setShopForModules(shop);
      } catch {
        if (cancelled) return;
        setShopCategory(undefined);
        setShopForModules(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDashboard, effectiveUser?.shopId, impersonateShopId]);

  useEffect(() => {
    const onSettingsStatus = (e: any) => {
      const count = Number(e?.detail?.count ?? 0);
      const saving = Boolean(e?.detail?.saving);
      setSettingsDirtyCount(Number.isFinite(count) ? count : 0);
      setSettingsSaving(saving);
    };
    window.addEventListener('merchant-settings-status', onSettingsStatus as any);
    return () => window.removeEventListener('merchant-settings-status', onSettingsStatus as any);
  }, []);

  const handleMarkRead = async () => {
    if (!effectiveUser?.shopId) return;
    await ApiService.markNotificationsRead(effectiveUser.shopId);
    setUnreadCount(0);
  };

  const handleLogout = () => {
    if (impersonateShopId && user?.role === 'admin') {
      window.close();
      navigate('/admin/dashboard');
      return;
    }
    (async () => {
      try {
        await ApiService.logout();
      } catch {
      }
    })();
    localStorage.removeItem('ray_user');
    localStorage.removeItem('ray_token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  if (!isDashboard) {
    const headerContent = (
      <>
        <Link to="/" className="flex items-center gap-2 md:gap-3">
          <BrandLogo variant="business" iconOnly />
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">من مكانك للأعمال</span>
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/login" className="text-xs md:text-sm font-bold hover:text-[#00E5FF] transition-colors">دخول التجار</Link>
          <Link to="/signup?role=merchant" className="bg-white text-slate-900 px-5 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-[#00E5FF] transition-all shadow-xl">ابدأ مجاناً</Link>
        </div>
      </>
    );

    return (
      <div className="min-h-screen bg-slate-900 text-white selection:bg-[#00E5FF] selection:text-slate-900 text-right font-sans" dir="rtl">
        {isBusinessLanding ? (
          <header className="fixed top-0 left-0 right-0 z-[80] bg-transparent">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
              {headerContent}
            </div>
          </header>
        ) : (
          <header className="max-w-[1400px] mx-auto px-4 md:px-6 h-24 flex items-center justify-between">
            {headerContent}
          </header>
        )}
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-right font-sans" dir="rtl">
      {/* Mobile Header */}
      <header className="md:hidden h-20 bg-white text-slate-900 flex items-center justify-between px-6 sticky top-0 z-[200] border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo variant="business" iconOnly />
          <span className="font-black tracking-tighter uppercase">من مكانك للأعمال</span>
        </Link>
        <div className="flex items-center gap-4">
           <button
             onClick={() => window.location.reload()}
             aria-label="تحديث"
             title="تحديث"
             className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 transition-all"
           >
             <RefreshCw className="w-6 h-6" />
           </button>
           <button
             onClick={() => navigate(buildDashboardUrl('pos'))}
             aria-label="نظام الكاشير"
             title="نظام الكاشير"
             className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 transition-all"
           >
             <Store className="w-6 h-6" />
           </button>
           <button
             onClick={() => navigate(buildBuilderIndexUrl())}
             aria-label="هوية المتجر"
             title="هوية المتجر"
             className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 transition-all"
           >
             <Palette className="w-6 h-6" />
           </button>
           <div className="relative" onClick={() => { setNotifOpen(true); handleMarkRead(); }}>
              <motion.div animate={unreadCount > 0 ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-700'}`} />
              </motion.div>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-black text-white">{unreadCount}</span>}
           </div>
           <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-900 transition-all">
             <Menu className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <MotionDiv 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`w-80 bg-white text-slate-900 flex flex-col fixed inset-y-0 left-0 z-[310] shadow-2xl transition-transform duration-500 ease-in-out overflow-hidden min-h-0 md:translate-x-0 border-r border-slate-100 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {!isBuilderTab ? (
          <div className="p-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <BrandLogo variant="business" iconOnly />
              <span className="text-2xl font-black tracking-tighter uppercase">من مكانك للأعمال</span>
            </Link>
            {isSettingsTab ? (
              <button
                type="button"
                onClick={() => {
                  try {
                    window.dispatchEvent(new Event('merchant-settings-save-request'));
                  } catch {
                  }
                }}
                disabled={settingsSaving || settingsDirtyCount <= 0}
                className={`relative px-5 py-3 rounded-2xl font-black text-xs transition-all ${settingsSaving || settingsDirtyCount <= 0 ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}
              >
                حفظ الإعدادات
                {settingsDirtyCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#BD00FF] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                    {settingsDirtyCount}
                  </span>
                )}
              </button>
            ) : null}
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="p-10 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-2xl font-black tracking-tighter">هوية المتجر</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Page Builder</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.dispatchEvent(new Event('pagebuilder-save'));
                  } catch {
                  }
                }}
                className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all"
              >
                حفظ التصميم
              </button>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 px-6 space-y-2 py-4 overflow-y-auto no-scrollbar min-h-0">
          {!isSettingsTab && !isBuilderTab ? (
            <>
              {visibleMainTabs.map((t) => (
                <NavItem
                  key={t.id}
                  to={buildUrlForTab(t.id)}
                  onClick={() => setSidebarOpen(false)}
                  icon={t.icon}
                  label={t.label}
                  active={isTabActive(t.id)}
                />
              ))}
            </>
          ) : isSettingsTab ? (
            <>
              <NavItem to={buildDashboardUrl('overview')} onClick={() => setSidebarOpen(false)} icon={<LayoutDashboard size={20} />} label="رجوع للوحة" active={false} />
              <NavItem to={buildSettingsUrl('overview')} onClick={() => setSidebarOpen(false)} icon={<LayoutDashboard size={20} />} label="نظرة عامة" active={String(settingsTab) === 'overview'} />
              <NavItem to={buildSettingsUrl('account')} onClick={() => setSidebarOpen(false)} icon={<User size={20} />} label="الحساب" active={String(settingsTab) === 'account'} />
              <NavItem to={buildSettingsUrl('security')} onClick={() => setSidebarOpen(false)} icon={<Shield size={20} />} label="الأمان" active={String(settingsTab) === 'security'} />
              <NavItem to={buildSettingsUrl('store')} onClick={() => setSidebarOpen(false)} icon={<Store size={20} />} label="إعدادات المتجر" active={String(settingsTab) === 'store'} />
              <NavItem to={buildSettingsUrl('modules')} onClick={() => setSidebarOpen(false)} icon={<RefreshCw size={20} />} label="ترقية" active={String(settingsTab) === 'modules'} />
              <NavItem to={buildSettingsUrl('receipt_theme')} onClick={() => setSidebarOpen(false)} icon={<FileText size={20} />} label="ثيم الفاتورة" active={String(settingsTab) === 'receipt_theme'} />
              <NavItem to={buildSettingsUrl('payments')} onClick={() => setSidebarOpen(false)} icon={<CreditCard size={20} />} label="المدفوعات" active={String(settingsTab) === 'payments'} />
              <NavItem to={buildSettingsUrl('notifications')} onClick={() => setSidebarOpen(false)} icon={<Bell size={20} />} label="التنبيهات" active={String(settingsTab) === 'notifications'} />
            </>
          ) : (() => {
            const activeBuilderId = String(builderTabRaw || '').trim();
            const focusMode = !isMobile && Boolean(activeBuilderId);
            const item = (id: string, label: string, icon: React.ReactNode) => (
              <>
                <NavItem
                  to={buildBuilderToggleUrl(id)}
                  onClick={() => setSidebarOpen(false)}
                  icon={icon}
                  label={label}
                  active={String(builderTabRaw) === id}
                />
                <div
                  className={`hidden md:block transition-all ${
                    String(builderTabRaw) === id
                      ? 'max-h-[70vh] pb-4 overflow-y-auto'
                      : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <div id={`builder-accordion-${id}`} className="mx-2 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm" />
                </div>
              </>
            );

            if (focusMode) {
              return (
                <>
                  <NavItem to={buildBuilderIndexUrl()} onClick={() => setSidebarOpen(false)} icon={<ChevronRight size={20} />} label="رجوع" active={false} />
                  {activeBuilderId === 'colors' ? item('colors', 'الألوان', <Palette size={20} />) : null}
                  {activeBuilderId === 'background' ? item('background', 'صورة الخلفية', <Palette size={20} />) : null}
                  {activeBuilderId === 'banner' ? item('banner', 'البانر', <Layout size={20} />) : null}
                  {activeBuilderId === 'header' ? item('header', 'اللوجو', <Layout size={20} />) : null}
                  {activeBuilderId === 'headerFooter' ? item('headerFooter', 'أعلى وأسفل العرض', <Layout size={20} />) : null}
                  {activeBuilderId === 'products' ? item('products', 'عرض المعروضات', <Layout size={20} />) : null}
                  {activeBuilderId === 'layout' ? item('layout', 'النمط', <Layout size={20} />) : null}
                  {activeBuilderId === 'typography' ? item('typography', 'الخطوط', <Type size={20} />) : null}
                  {activeBuilderId === 'buttons' ? item('buttons', 'شكل وحجم الزر', <Layout size={20} />) : null}
                  {activeBuilderId === 'visibility' ? item('visibility', 'إظهار / إخفاء', <Sliders size={20} />) : null}
                  {activeBuilderId === 'customCss' ? item('customCss', 'CSS مخصص', <Sliders size={20} />) : null}
                </>
              );
            }

            return (
              <>
                <NavItem to={buildDashboardUrl('overview')} onClick={() => setSidebarOpen(false)} icon={<LayoutDashboard size={20} />} label="رجوع للوحة" active={false} />
                {item('colors', 'الألوان', <Palette size={20} />)}
                {item('background', 'صورة الخلفية', <Palette size={20} />)}
                {item('banner', 'البانر', <Layout size={20} />)}
                {item('header', 'اللوجو', <Layout size={20} />)}
                {item('headerFooter', 'أعلى وأسفل العرض', <Layout size={20} />)}
                {item('products', 'عرض المعروضات', <Layout size={20} />)}
                {item('layout', 'النمط', <Layout size={20} />)}
                {item('typography', 'الخطوط', <Type size={20} />)}
                {item('buttons', 'شكل وحجم الزر', <Layout size={20} />)}
                {item('visibility', 'إظهار / إخفاء', <Sliders size={20} />)}
                {item('customCss', 'CSS مخصص', <Sliders size={20} />)}
              </>
            );
          })()}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100 space-y-2">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold group"
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
             <span>تسجيل الخروج</span>
           </button>
        </div>
      </aside>

      <AnimatePresence>
        {isNotifOpen && (
          <>
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotifOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]" />
            <MotionDiv initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[160] shadow-2xl flex flex-col p-8 text-right">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-black">التنبيهات</h3>
                   <button onClick={() => setNotifOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Bell size={48} className="opacity-10" />
                        <p className="font-bold">لا توجد تنبيهات جديدة</p>
                     </div>
                   ) : (
                     notifications.map((n: any) => (
                       <div key={n.id} className={`p-4 rounded-2xl border flex items-start gap-4 flex-row-reverse ${n.is_read ? 'bg-white border-slate-100' : 'bg-cyan-50 border-cyan-100 ring-1 ring-cyan-200'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'sale' ? 'bg-green-100 text-green-600' : 
                            n.type === 'reservation' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                             {n.type === 'sale' ? <ShoppingBag size={18} /> : n.type === 'reservation' ? <Calendar size={18} /> : <UserPlus size={18} />}
                          </div>
                          <div className="flex-1 text-right">
                             <p className="font-black text-sm text-slate-900 leading-tight mb-1">{n.title}</p>
                             <p className="text-xs text-slate-500 font-bold mb-2">{n.message}</p>
                             <span className="text-[9px] text-slate-400 font-black flex items-center gap-1 justify-end"><Clock size={10} /> {new Date(n.created_at).toLocaleTimeString('ar-EG')}</span>
                          </div>
                       </div>
                     ))
                   )}
                </div>
                <button onClick={() => setNotifOpen(false)} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">إغلاق القائمة</button>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-80 overflow-x-hidden">
        <header className="hidden md:flex h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 items-center justify-between px-12 md:fixed md:top-0 md:left-80 md:right-0 z-[200]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 pr-4 border-r border-slate-100 relative">
               <div 
                 className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
                 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
               >
                 <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-[#00E5FF] shadow-lg shadow-cyan-500/10">
                   {effectiveUser?.name?.charAt(0)}
                 </div>
                 <div className="text-right">
                   <p className="font-black text-sm text-slate-900 leading-none">{effectiveUser?.name || 'حساب التاجر'}</p>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">التاجر</p>
                 </div>
                 <ChevronDown size={16} className="text-slate-400" />
               </div>
               
               {/* User Dropdown Menu */}
               {isUserMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                   <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                     <div className="p-4 border-b border-slate-100">
                       <p className="font-black text-slate-900">{effectiveUser?.name}</p>
                       <p className="text-xs text-slate-400">{effectiveUser?.email}</p>
                     </div>
                     <div className="p-2">
                       <button
                         onClick={() => { navigate(buildSettingsUrl('account')); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-right transition-all"
                       >
                         <User size={18} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">الملف الشخصي</span>
                       </button>
                       <button
                         onClick={() => { navigate(buildSettingsUrl('store')); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-right transition-all"
                       >
                         <Store size={18} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">إعدادات المتجر</span>
                       </button>
                       <button
                         onClick={() => { navigate(buildSettingsUrl('notifications')); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-right transition-all"
                       >
                         <Bell size={18} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">الإشعارات</span>
                       </button>
                     </div>
                     <div className="p-2 border-t border-slate-100">
                       <button
                         onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-right transition-all group"
                       >
                         <LogOut size={18} className="text-red-500" />
                         <span className="text-sm font-bold text-red-500 group-hover:text-red-600">تسجيل الخروج</span>
                       </button>
                     </div>
                   </div>
                 </>
               )}
            </div>
            <div className="relative cursor-pointer group" onClick={() => { setNotifOpen(true); handleMarkRead(); }}>
               <motion.div animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                 <Bell className={`w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-300 group-hover:text-slate-900'}`} />
               </motion.div>
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white text-[8px] flex items-center justify-center font-black text-white">{unreadCount}</span>}
            </div>
            <button
              onClick={() => navigate(buildBuilderIndexUrl())}
              aria-label="هوية المتجر"
              title="هوية المتجر"
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.reload()}
              aria-label="تحديث"
              title="تحديث"
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(buildDashboardUrl('pos'))}
              aria-label="نظام الكاشير"
              title="نظام الكاشير"
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            >
              <Store className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col text-right">
             <h2 className="font-black text-slate-900 text-xl leading-none">لوحة التاجر</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">مركز العمليات</p>
          </div>
        </header>

        <div className="p-4 md:p-12 md:pt-36 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }> = ({ to, icon, label, active, onClick }) => (
  <Link to={to} onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
    active ? 'bg-[#00E5FF] text-slate-900 font-black shadow-lg shadow-cyan-500/20' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold'
  }`}>
    <div className={`${active ? 'text-slate-900' : 'text-slate-400 group-hover:text-[#00E5FF]'}`}>{icon}</div>
    <span className="flex-1 text-sm">{label}</span>
    {active && <ChevronRight className="w-4 h-4" />}
  </Link>
);

export default BusinessLayout;
