import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { LayoutDashboard, Store, CreditCard, BarChart3, Settings, Bell, LogOut, ChevronRight, HelpCircle, Menu, X, Clock, CheckCircle2, UserPlus, ShoppingBag, ShoppingCart, Calendar, Camera, Users, Megaphone, Palette, User, Shield, FileText, Sliders, Type, Layout, ChevronDown, RefreshCw, ChevronLeft, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { clearSession, getStoredUser, persistSession } from '@/services/authStorage';
import { RayDB } from '@/constants';
import { useToast } from '@/components/common/feedback/Toaster';
import BrandLogo from '@/components/common/BrandLogo';
import LanguageToggle from '@/components/common/LanguageToggle';
import { Category } from '@/types';
import {
  MerchantDashboardTabId,
  getMerchantDashboardTabsForShop,
} from '@/components/pages/business/merchant-dashboard/dashboardTabs';

// Sub-components
import NavItem from './business/NavItem';
const DashboardHeader = lazy(() => import('./business/DashboardHeader'));

const { Link, Outlet, useLocation, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;


const BusinessLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const isDev = !Boolean((import.meta as any)?.env?.PROD);
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/profile');
  const isBusinessLanding = location.pathname === '/business' || location.pathname === '/business/';
  const isProfilePage = location.pathname.includes('/profile');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { addToast } = useToast();
  const audioUnlockedRef = useRef(false);
  const shownBrowserNotificationIdsRef = useRef<Set<string>>(new Set());
  const webPushRegisterAttemptedRef = useRef(false);
  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';

  const user = (() => {
    try {
      return getStoredUser();
    } catch {
      return null;
    }
  })();
  const impersonateShopId = new URLSearchParams(location.search).get('impersonateShopId');
  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const settingsTab = new URLSearchParams(location.search).get('settingsTab') || 'overview';
  const builderTabRaw = new URLSearchParams(location.search).get('builderTab') || '';
  const isSettingsTab = activeTab === 'settings';
  const isBuilderTab = activeTab === 'builder';
  const [settingsDirtyCount, setSettingsDirtyCount] = useState(0);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDevActivityMenuOpen, setIsDevActivityMenuOpen] = useState(false);
  const [devSwitchLoading, setDevSwitchLoading] = useState(false);
  const [shopCategory, setShopCategory] = useState<Category | undefined>(() => {
    try {
      const u = getStoredUser();
      const role = String(u?.role || '').toLowerCase();
      if (!isDev || role !== 'merchant') return undefined;
      const raw = String(localStorage.getItem('ray_dev_shop_category') || '').trim().toUpperCase();
      const allowed = new Set(Object.values(Category).map((v) => String(v).toUpperCase()));
      if (!raw || !allowed.has(raw)) return undefined;
      return raw as any;
    } catch {
      return undefined;
    }
  });
  const [shopForModules, setShopForModules] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const SidebarOverlayWrapper: any = prefersReducedMotion ? 'div' : MotionDiv;
  const NotifOverlayWrapper: any = prefersReducedMotion ? 'div' : MotionDiv;
  const NotifPanelWrapper: any = prefersReducedMotion ? 'div' : MotionDiv;
  const effectiveUser = (user?.role === 'admin' && impersonateShopId)
    ? { ...user, role: 'merchant', shopId: impersonateShopId, name: `Admin (${impersonateShopId})` }
    : user;

  const canUseShopNotifications =
    Boolean(isDashboard) &&
    String((effectiveUser as any)?.role || '').toLowerCase() === 'merchant' &&
    Boolean((effectiveUser as any)?.shopId);

  const canUseDevActivitySwitcher =
    Boolean(isDev) &&
    String((effectiveUser as any)?.role || '').toLowerCase() === 'merchant';

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

  const switchDevActivity = async (category?: string) => {
    if (!canUseDevActivitySwitcher) return;
    setDevSwitchLoading(true);
    try {
      const res = await ApiService.devMerchantLogin(category ? { shopCategory: category } : undefined);
      persistSession({
        user: res.user,
        accessToken: res.session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'business-dev-merchant-switch');
      try {
        if (category) {
          localStorage.setItem('ray_dev_shop_category', String(category).toUpperCase());
        } else {
          localStorage.removeItem('ray_dev_shop_category');
        }
      } catch {
      }
      setShopCategory(undefined);
      setShopForModules(null);
      navigate('/business/dashboard', { replace: true });
      setTimeout(() => {
        try {
          window.location.reload();
        } catch {
        }
      }, 50);
      addToast(t('dashboard.devActivity.switched'), 'success');
    } catch (err: any) {
      addToast(err?.message || t('dashboard.devActivity.switchFailed'), 'error');
    } finally {
      setDevSwitchLoading(false);
      setIsDevActivityMenuOpen(false);
    }
  };

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
    notifications: <Bell size={20} />,
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
    abandonedCart: <ShoppingCart size={20} />,
    pos: <Store size={20} />,
  };

  const buildDashboardUrl = useCallback((tab?: string) => {
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
  }, [location.search]);

  const buildSettingsUrl = useCallback((section?: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'settings');
    params.set('settingsTab', String(section || 'overview'));
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  }, [location.search]);

  const buildBuilderUrl = useCallback((section?: string) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'builder');
    params.set('builderTab', String(section || 'colors'));
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  }, [location.search]);

  const buildBuilderIndexUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'builder');
    params.delete('builderTab');
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  }, [location.search]);

  const buildBuilderToggleUrl = useCallback((section: string) => {
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
  }, [location.search, builderTabRaw]);

  const buildUrlForTab = useCallback((id: MerchantDashboardTabId) => {
    if (id === 'builder') return buildBuilderIndexUrl();
    if (id === 'settings') return buildSettingsUrl('overview');
    return buildDashboardUrl(id);
  }, [buildBuilderIndexUrl, buildSettingsUrl, buildDashboardUrl]);

  const isTabActive = useCallback((id: MerchantDashboardTabId) => {
    if (isProfilePage) return false;
    return String(activeTab) === String(id);
  }, [isProfilePage, activeTab]);

  const handleNavItemClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const visibleMainTabs = useMemo(
    () => getMerchantDashboardTabsForShop(shopForModules || { category: shopCategory })
      .map((t) => ({ ...t, icon: ICON_BY_TAB_ID[t.id] })),
    [shopForModules, shopCategory],
  );

  const hasPosTab = visibleMainTabs.some((t) => t.id === 'pos');

  const desktopSidebarWidthClass = isDesktopSidebarCollapsed ? 'md:w-24' : 'md:w-80';
  const desktopSidebarOffsetClass = isDesktopSidebarCollapsed ? 'md:ml-24' : 'md:ml-80';
  const desktopSidebarHeaderOffsetClass = isDesktopSidebarCollapsed ? 'md:left-24' : 'md:left-80';

  const desktopSidebarOffsetClassRtl = isDesktopSidebarCollapsed ? 'md:mr-24' : 'md:mr-80';
  const desktopSidebarHeaderOffsetClassRtl = isDesktopSidebarCollapsed ? 'md:right-24' : 'md:right-80';

  const sidebarNavSections = useMemo(() => {
    const byId = new Map<string, any>();
    for (const tab of visibleMainTabs) byId.set(String(tab.id), tab);

    const pick = (...ids: MerchantDashboardTabId[]) =>
      ids.map((id) => byId.get(String(id))).filter(Boolean);

    return [
      { title: t('dashboard.sections.dashboard'), items: pick('overview') },
      { title: t('dashboard.sections.operations'), items: pick('products', 'pos', 'reservations', 'invoice') },
      { title: t('dashboard.sections.sales'), items: pick('sales', 'abandonedCart') },
      { title: t('dashboard.sections.growth'), items: pick('promotions', 'customers', 'reports', 'gallery') },
      { title: t('dashboard.sections.setup'), items: pick('builder', 'settings') },
    ].filter((s) => Array.isArray(s.items) && s.items.length > 0);
  }, [visibleMainTabs]);

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

  useEffect(() => {
    if (!canUseShopNotifications) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    const askPermission = () => {
      try {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
      } catch {
      }
    };

    window.addEventListener('pointerdown', askPermission as any, { once: true } as any);
    return () => {
      try {
        window.removeEventListener('pointerdown', askPermission as any);
      } catch {
      }
    };
  }, [canUseShopNotifications]);

  useEffect(() => {
    if (!canUseShopNotifications) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;
    if (isDev) return;

    const shopId = String((effectiveUser as any)?.shopId || '').trim();
    if (!shopId) return;

    const vapidPublicKey = String(((import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY as any) || '').trim();
    if (!vapidPublicKey) return;

    const urlBase64ToUint8Array = (base64String: string) => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    const run = async () => {
      try {
        if (Notification.permission !== 'granted') return;
        if (webPushRegisterAttemptedRef.current) return;
        webPushRegisterAttemptedRef.current = true;

        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        const subscription = existing
          ? existing
          : await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

        await ApiService.registerWebPushSubscription(shopId, subscription);
      } catch {
        webPushRegisterAttemptedRef.current = false;
      }
    };

    run();
  }, [canUseShopNotifications, (effectiveUser as any)?.shopId, isDev]);

  const loadNotifications = async () => {
    if (!canUseShopNotifications) return;
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
    if (canUseShopNotifications) {
      loadNotifications();
      
      // الاشتراك في قناة الإشعارات الحية
      const subscription = ApiService.subscribeToNotifications(effectiveUser.shopId, (notif) => {
        const normalized = normalizeNotif(notif);
        const nid = String((normalized as any)?.id || '').trim();
        if (!nid) return;

        const metaSource = String(((normalized as any)?.metadata as any)?.source || '').trim().toLowerCase();
        const isPosOrigin = metaSource === 'pos' || metaSource === 'cashier';

        let isNew = false;
        setNotifications(prev => {
          const exists = prev.some((x: any) => String((x as any)?.id || '') === nid);
          if (exists) return prev;
          isNew = true;
          return [normalized, ...prev];
        });

        if (!isNew) return;

        try {
          if (!Boolean((normalized as any)?.is_read)) {
            setUnreadCount((prev) => prev + 1);
          }
        } catch {
        }

        if (!isPosOrigin) {
          try {
            const title = String((normalized as any)?.title || t('common.newNotification')).trim();
            const body = String((normalized as any)?.content || (normalized as any)?.message || '').trim();
            addToast([title, body].filter(Boolean).join(' - ') || t('common.newNotification'), 'info');
          } catch {
          }
        }

        if (!isPosOrigin) {
          try {
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              const key = String((normalized as any)?.id || '').trim();
              if (key && !shownBrowserNotificationIdsRef.current.has(key)) {
                shownBrowserNotificationIdsRef.current.add(key);
                const title = String((normalized as any)?.title || t('common.newNotification')).trim();
                const body = String((normalized as any)?.content || (normalized as any)?.message || '').trim();
                const n = new Notification(title, {
                  body,
                  tag: `shop-notification-${key}`,
                  icon: '/favicon.ico',
                });
                n.onclick = () => {
                  try {
                    window.focus();
                  } catch {
                  }
                };
              }
            }
          } catch {
          }
        }

        const notifType = String((normalized as any)?.type || '').trim().toUpperCase();
        const shouldRing =
          notifType === 'ORDER' ||
          notifType === 'NEW_ORDER' ||
          notifType === 'RESERVATION' ||
          notifType === 'NEW_RESERVATION' ||
          notifType === 'BOOKING';

        if (shouldRing && !isPosOrigin) {
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
        if (!isPosOrigin) {
          addToast(String((normalized as any)?.title || ''), 'info');
        }

        if (!Boolean((normalized as any)?.is_read)) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [canUseShopNotifications, effectiveUser?.shopId]);

  useEffect(() => {
    if (!isDashboard) return;
    if (!canUseShopNotifications) return;

    let cancelled = false;
    (async () => {
      try {
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
            setShopCategory((cachedShop as any)?.category);
            setShopForModules(cachedShop);
            return;
          }
        }

        const shop = impersonateShopId
          ? await ApiService.getShopAdminById(String(impersonateShopId))
          : await ApiService.getMyShop();
        if (cancelled) return;
        setShopCategory((shop as any)?.category);
        setShopForModules(shop);

        try {
          if ((shop as any)?.id) {
            localStorage.setItem('ray_last_shop', JSON.stringify(shop));
          }
        } catch {
        }
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
    if (!isDashboard) return;
    if (!effectiveUser?.shopId) return;

    let cancelled = false;
    let timer: any;

    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
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
              setShopCategory((cachedShop as any)?.category);
              setShopForModules(cachedShop);
              return;
            }
          }

          const shop = impersonateShopId
            ? await ApiService.getShopAdminById(String(impersonateShopId))
            : await ApiService.getMyShop();
          if (cancelled) return;
          setShopCategory((shop as any)?.category);
          setShopForModules(shop);

          try {
            if ((shop as any)?.id) {
              localStorage.setItem('ray_last_shop', JSON.stringify(shop));
            }
          } catch {
          }
        } catch {
          if (cancelled) return;
        }
      }, 200);
    };

    window.addEventListener('ray-db-update', refresh);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('ray-db-update', refresh);
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
    if (!canUseShopNotifications) return;
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
    clearSession('business-layout-logout');
    navigate('/');
  };

  const [landingScrolled, setLandingScrolled] = useState(false);

  useEffect(() => {
    if (!isBusinessLanding) return;
    const onScroll = () => setLandingScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isBusinessLanding]);

  if (!isDashboard) {
    const scrolled = landingScrolled;
    const headerTextCls = scrolled ? 'text-slate-900' : 'text-white';
    const borderBtnCls = scrolled
      ? 'border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
      : 'border border-white/20 hover:border-white/40 text-white/80 hover:text-white';
    const ctaBtnCls = scrolled
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'bg-white text-slate-900 hover:bg-[#00E5FF]';

    const headerContent = (
      <>
        <Link to="/" className={`flex items-center gap-2 md:gap-3 transition-colors ${headerTextCls}`}>
          <BrandLogo variant="business" iconOnly />
          <span className="text-lg md:text-2xl font-black tracking-tighter uppercase">{t('brand.nameBusiness')}</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          {isBusinessLanding && (
            <a href="#about" className={`text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all ${borderBtnCls}`}>{t('common.aboutUs')}</a>
          )}
          <Link to="/business/login" className={`text-xs md:text-sm font-bold px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all ${borderBtnCls}`}>{t('business.merchantLogin')}</Link>
          <Link to="/signup?role=merchant" className={`px-5 md:px-6 py-2 md:py-2.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-lg ${ctaBtnCls}`}>{t('business.startFree')}</Link>
        </div>
      </>
    );

    return (
      <div className={`min-h-screen bg-slate-900 text-white selection:bg-[#00E5FF] selection:text-slate-900 font-sans ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        {isBusinessLanding ? (
          <header className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
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

  const isPosTab = String(activeTab || '').toLowerCase() === 'pos';
  if (isPosTab) {
    return (
      <div className={`min-h-screen bg-[#F8F9FA] font-sans ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-100 animate-pulse" />}>
        <DashboardHeader
          hasPosTab={hasPosTab}
          unreadCount={unreadCount}
          isNotifOpen={isNotifOpen}
          setNotifOpen={setNotifOpen}
          setSidebarOpen={setSidebarOpen}
          handleMarkRead={handleMarkRead}
          buildDashboardUrl={buildDashboardUrl}
          buildBuilderIndexUrl={buildBuilderIndexUrl}
          navigate={navigate}
          notifications={notifications}
        />
      </Suspense>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <SidebarOverlayWrapper
            {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
            onClick={() => setSidebarOpen(false)}
            className={`fixed inset-0 bg-black/60 ${prefersReducedMotion ? '' : 'backdrop-blur-sm'} z-[300] md:hidden`}
          />
        )}
      </AnimatePresence>

      <aside
        className={`bg-white text-slate-900 flex flex-col fixed inset-y-0 z-[310] shadow-2xl transition-transform duration-500 ease-in-out overflow-hidden min-h-0 md:translate-x-0 border-slate-100 ${
          isArabic ? 'right-0 border-l' : 'left-0 border-r'
        } ${desktopSidebarWidthClass} ${
          isSidebarOpen
            ? 'translate-x-0'
            : isArabic
              ? 'translate-x-full'
              : '-translate-x-full'
        }`}
      >
        {!isBuilderTab ? (
          <div className={`${isDesktopSidebarCollapsed ? 'p-4' : 'p-10'} flex items-center justify-between gap-3`}>
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <BrandLogo variant="business" iconOnly />
              {!isDesktopSidebarCollapsed && (
                <span className="text-2xl font-black tracking-tighter uppercase truncate">{t('brand.nameBusiness')}</span>
              )}
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
                {t('dashboard.saveSettings')}
                {settingsDirtyCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#BD00FF] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                    {settingsDirtyCount}
                  </span>
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsDesktopSidebarCollapsed((v) => !v)}
              className="hidden md:flex shrink-0 p-2 hover:bg-slate-100 rounded-full"
              aria-label={isDesktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
              title={isDesktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
            >
              {isArabic ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className={`${isDesktopSidebarCollapsed ? 'p-4' : 'p-10'} flex items-center justify-between gap-3`}>
            {!isDesktopSidebarCollapsed ? (
              <div className="flex flex-col">
                <div className="text-2xl font-black tracking-tighter">{t('dashboard.storeIdentity')}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Page Builder</div>
              </div>
            ) : (
              <BrandLogo variant="business" iconOnly />
            )}
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
                {t('dashboard.saveDesign')}
              </button>
              <button
                type="button"
                onClick={() => setIsDesktopSidebarCollapsed((v) => !v)}
                className="hidden md:flex shrink-0 p-2 hover:bg-slate-100 rounded-full"
                aria-label={isDesktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
                title={isDesktopSidebarCollapsed ? (isArabic ? 'توسيع القائمة' : 'Expand menu') : (isArabic ? 'طي القائمة' : 'Collapse menu')}
              >
                {isArabic ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
              </button>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar min-h-0">
          {!isSettingsTab && !isBuilderTab ? (
            <>
              <div className="space-y-6">
                {sidebarNavSections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    {!isDesktopSidebarCollapsed && (
                      <div className="px-2 text-[10px] font-black tracking-[0.22em] uppercase text-slate-400 text-right">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-2">
                      {section.items.map((t: any) => (
                        <NavItem
                          key={t.id}
                          to={buildUrlForTab(t.id)}
                          onClick={handleNavItemClick}
                          icon={t.icon}
                          showIcon={isDesktopSidebarCollapsed}
                          hideLabel={isDesktopSidebarCollapsed}
                          label={t.label}
                          active={isTabActive(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : isSettingsTab ? (
            <>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="px-2 text-[10px] font-black tracking-[0.22em] uppercase text-slate-400 text-right">
                    {t('dashboard.settings.title')}
                  </div>
                  <div className="space-y-2">
                    <NavItem to={buildDashboardUrl('overview')} onClick={handleNavItemClick} icon={<LayoutDashboard size={20} />} showIcon={false} label={t('dashboard.backToDashboard')} active={false} />
                    <NavItem to={buildSettingsUrl('overview')} onClick={handleNavItemClick} icon={<LayoutDashboard size={20} />} showIcon={false} label={t('dashboard.settings.overview')} active={String(settingsTab) === 'overview'} />
                    <NavItem to={buildSettingsUrl('account')} onClick={handleNavItemClick} icon={<User size={20} />} showIcon={false} label={t('dashboard.settings.account')} active={String(settingsTab) === 'account'} />
                    <NavItem to={buildSettingsUrl('security')} onClick={handleNavItemClick} icon={<Shield size={20} />} showIcon={false} label={t('dashboard.settings.security')} active={String(settingsTab) === 'security'} />
                    <NavItem to={buildSettingsUrl('store')} onClick={handleNavItemClick} icon={<Store size={20} />} showIcon={false} label={t('dashboard.settings.storeSettings')} active={String(settingsTab) === 'store'} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="px-2 text-[10px] font-black tracking-[0.22em] uppercase text-slate-400 text-right">
                    {t('dashboard.settings.billingAndAlerts')}
                  </div>
                  <div className="space-y-2">
                    <NavItem to={buildSettingsUrl('modules')} onClick={handleNavItemClick} icon={<RefreshCw size={20} />} showIcon={false} label={t('dashboard.settings.upgrade')} active={String(settingsTab) === 'modules'} />
                    <NavItem to={buildSettingsUrl('apps')} onClick={handleNavItemClick} icon={<LayoutGrid size={20} />} showIcon={false} label={t('dashboard.settings.apps')} active={String(settingsTab) === 'apps'} />
                    <NavItem to={buildSettingsUrl('receipt_theme')} onClick={handleNavItemClick} icon={<FileText size={20} />} showIcon={false} label={t('dashboard.settings.receiptTheme')} active={String(settingsTab) === 'receipt_theme'} />
                    <NavItem to={buildSettingsUrl('payments')} onClick={handleNavItemClick} icon={<CreditCard size={20} />} showIcon={false} label={t('dashboard.settings.payments')} active={String(settingsTab) === 'payments'} />
                    <NavItem to={buildSettingsUrl('notifications')} onClick={handleNavItemClick} icon={<Bell size={20} />} showIcon={false} label={t('dashboard.settings.notifications')} active={String(settingsTab) === 'notifications'} />
                  </div>
                </div>
              </div>
            </>
          ) : (() => {
            const activeBuilderId = String(builderTabRaw || '').trim();
            const focusMode = !isMobile && Boolean(activeBuilderId);
            const item = (id: string, label: string, icon: React.ReactNode) => (
              <React.Fragment key={id}>
                <NavItem
                  to={buildBuilderToggleUrl(id)}
                  onClick={handleNavItemClick}
                  icon={icon}
                  showIcon={false}
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
              </React.Fragment>
            );

            const subItem = (id: string, label: string, icon: React.ReactNode, parentId: string) => (
              <React.Fragment key={id}>
                <div className="pr-8">
                  <NavItem
                    to={buildBuilderToggleUrl(id)}
                    onClick={handleNavItemClick}
                    icon={icon}
                    showIcon={false}
                    label={label}
                    active={String(builderTabRaw) === id}
                  />
                </div>
                <div
                  className={`hidden md:block transition-all ${
                    String(builderTabRaw) === id
                      ? 'max-h-[70vh] pb-4 overflow-y-auto'
                      : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <div id={`builder-accordion-${id}`} className="mx-2 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm" />
                </div>
              </React.Fragment>
            );

            if (focusMode) {
              return (
                <>
                  <NavItem to={buildBuilderIndexUrl()} onClick={handleNavItemClick} icon={<ChevronRight size={20} />} showIcon={false} label={t('common.back')} active={false} />
                  {activeBuilderId === 'products' ? item('products', t('dashboard.builder.products'), <Layout size={20} />) : null}
                  {activeBuilderId === 'productCard' ? item('productCard', t('dashboard.builder.productCard'), <Palette size={20} />) : null}
                  {activeBuilderId === 'imageShape' ? item('imageShape', t('dashboard.builder.imageShape'), <Layout size={20} />) : null}
                  {activeBuilderId === 'categories' ? item('categories', t('dashboard.builder.categories'), <ShoppingBag size={20} />) : null}
                  {activeBuilderId === 'productEditor' ? item('productEditor', t('dashboard.builder.productEditor'), <ShoppingBag size={20} />) : null}
                  {activeBuilderId === 'header' ? item('header', t('dashboard.builder.logo'), <Layout size={20} />) : null}
                  {activeBuilderId === 'headerFooter' ? item('headerFooter', t('dashboard.builder.headerFooter'), <Layout size={20} />) : null}
                  {activeBuilderId === 'products' || activeBuilderId === 'productCard' ? (
                    <>
                      <NavItem
                        to={buildBuilderToggleUrl('products')}
                        onClick={handleNavItemClick}
                        icon={<Layout size={20} />}
                        showIcon={false}
                        label={t('dashboard.builder.products')}
                        active={String(builderTabRaw) === 'products' || String(builderTabRaw) === 'productCard' || String(builderTabRaw) === 'imageShape'}
                      />
                      <div
                        className={`hidden md:block transition-all ${
                          String(builderTabRaw) === 'products' || String(builderTabRaw) === 'productCard' || String(builderTabRaw) === 'imageShape'
                            ? 'max-h-[70vh] pb-4 overflow-y-auto'
                            : 'max-h-0 overflow-hidden'
                        }`}
                      >
                        <div id={`builder-accordion-products`} className="mx-2 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm" />
                      </div>
                      {subItem('productCard', t('dashboard.builder.productCard'), <Palette size={20} />, 'products')}
                      {subItem('imageShape', t('dashboard.builder.imageShape'), <Layout size={20} />, 'products')}
                    </>
                  ) : null}
                  {activeBuilderId === 'productEditor' ? item('productEditor', t('dashboard.builder.productEditor'), <ShoppingBag size={20} />) : null}
                  {activeBuilderId === 'layout' ? item('layout', t('dashboard.builder.layout'), <Layout size={20} />) : null}
                  {activeBuilderId === 'typography' ? item('typography', t('dashboard.builder.typography'), <Type size={20} />) : null}
                  {activeBuilderId === 'buttons' ? item('buttons', t('dashboard.builder.buttons'), <Layout size={20} />) : null}
                  {activeBuilderId === 'visibility' ? item('visibility', t('dashboard.builder.visibility'), <Sliders size={20} />) : null}
                  {activeBuilderId === 'customCss' ? item('customCss', t('dashboard.builder.customCss'), <Sliders size={20} />) : null}
                </>
              );
            }

            return (
              <>
                <NavItem to={buildDashboardUrl('overview')} onClick={handleNavItemClick} icon={<LayoutDashboard size={20} />} showIcon={false} label={t('dashboard.backToDashboard')} active={false} />
                {item('colors', t('dashboard.builder.colors'), <Palette size={20} />)}
                {item('background', t('dashboard.builder.background'), <Palette size={20} />)}
                {item('banner', t('dashboard.builder.banner'), <Layout size={20} />)}
                {item('header', t('dashboard.builder.logo'), <Layout size={20} />)}
                {item('headerFooter', t('dashboard.builder.headerFooter'), <Layout size={20} />)}
                <>
                  <NavItem
                    to={buildBuilderToggleUrl('products')}
                    onClick={handleNavItemClick}
                    icon={<Layout size={20} />}
                    showIcon={false}
                    label={t('dashboard.builder.products')}
                    active={String(builderTabRaw) === 'products' || String(builderTabRaw) === 'productCard' || String(builderTabRaw) === 'imageShape'}
                  />
                  <div
                    className={`hidden md:block transition-all ${
                      String(builderTabRaw) === 'products' || String(builderTabRaw) === 'productCard' || String(builderTabRaw) === 'imageShape'
                        ? 'max-h-[70vh] pb-4 overflow-y-auto'
                        : 'max-h-0 overflow-hidden'
                    }`}
                  >
                    <div id={`builder-accordion-products`} className="mx-2 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm" />
                  </div>
                  {subItem('productCard', t('dashboard.builder.productCard'), <Palette size={20} />, 'products')}
                  {subItem('imageShape', t('dashboard.builder.imageShape'), <Layout size={20} />, 'products')}
                </>
                {item('categories', t('dashboard.builder.categories'), <ShoppingBag size={20} />)}
                {item('productEditor', t('dashboard.builder.productEditor'), <ShoppingBag size={20} />)}
                {item('layout', t('dashboard.builder.layout'), <Layout size={20} />)}
                {item('typography', t('dashboard.builder.typography'), <Type size={20} />)}
                {item('buttons', t('dashboard.builder.buttons'), <Layout size={20} />)}
                {item('visibility', t('dashboard.builder.visibility'), <Sliders size={20} />)}
                {item('customCss', t('dashboard.builder.customCss'), <Sliders size={20} />)}
              </>
            );
          })()}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100 space-y-2">
           <button
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-black group"
           >
             <span>{t('common.logout')}</span>
           </button>
        </div>
      </aside>

      <AnimatePresence>
        {isNotifOpen && (
          <>
            <NotifOverlayWrapper
              {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } })}
              onClick={() => setNotifOpen(false)}
              className={`fixed inset-0 bg-black/40 ${prefersReducedMotion ? '' : 'backdrop-blur-sm'} z-[150]`}
            />
            <NotifPanelWrapper
              {...(prefersReducedMotion ? {} : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } })}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[160] shadow-2xl flex flex-col p-8 text-right"
            >
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-black">{t('dashboard.notifications')}</h3>
                   <button onClick={() => setNotifOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Bell size={48} className="opacity-10" />
                        <p className="font-bold">{t('dashboard.noNotifications')}</p>
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
                             <span className="text-[9px] text-slate-400 font-black flex items-center gap-1 justify-end"><Clock size={10} /> {new Date(n.created_at).toLocaleTimeString(locale)}</span>
                          </div>
                       </div>
                     ))
                   )}
                </div>
                <button onClick={() => setNotifOpen(false)} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">{t('common.close')}</button>
            </NotifPanelWrapper>
          </>
        )}
      </AnimatePresence>

      <main className={`flex-1 overflow-x-hidden ${isArabic ? desktopSidebarOffsetClassRtl : desktopSidebarOffsetClass}`}>
        <header
          className={`hidden md:flex h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 items-center justify-between px-12 md:fixed md:top-0 z-[200] ${
            isArabic
              ? `md:left-0 ${desktopSidebarHeaderOffsetClassRtl}`
              : `md:right-0 ${desktopSidebarHeaderOffsetClass}`
          }`}
        >
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
                   <p className="font-black text-sm text-slate-900 leading-none">{effectiveUser?.name || t('dashboard.merchantAccount')}</p>
                   <p className="text-[10px] text-slate-400 font-bold mt-1">{t('dashboard.merchant')}</p>
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
                         <span className="text-sm font-bold text-slate-700">{t('dashboard.userMenu.profile')}</span>
                       </button>
                       <button
                         onClick={() => { navigate(buildSettingsUrl('store')); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-right transition-all"
                       >
                         <Store size={18} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">{t('dashboard.userMenu.storeSettings')}</span>
                       </button>
                       <button
                         onClick={() => { navigate(buildSettingsUrl('notifications')); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-right transition-all"
                       >
                         <Bell size={18} className="text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">{t('dashboard.userMenu.notifications')}</span>
                       </button>
                     </div>
                     <div className="p-2 border-t border-slate-100">
                       <button
                         onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}
                         className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-right transition-all group"
                       >
                         <LogOut size={18} className="text-red-500" />
                         <span className="text-sm font-bold text-red-500 group-hover:text-red-600">{t('common.logout')}</span>
                       </button>
                     </div>
                   </div>
                 </>
               )}
            </div>

            {canUseDevActivitySwitcher && (
              <div className="relative">
                <button
                  type="button"
                  disabled={devSwitchLoading}
                  onClick={() => setIsDevActivityMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all font-black text-xs"
                  title={t('dashboard.devActivity.switchLabel')}
                  aria-label={t('dashboard.devActivity.switchLabel')}
                >
                  <Store size={16} />
                  <span>{t('dashboard.devActivity.title')}</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {isDevActivityMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDevActivityMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => switchDevActivity(undefined)}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.retail')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => switchDevActivity('RESTAURANT')}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.restaurant')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => switchDevActivity('FASHION')}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.fashion')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'homeTextiles');
                          } catch {
                          }
                          switchDevActivity('RETAIL');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.homeTextiles')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          switchDevActivity('FOOD');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.supermarketGrocery')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          switchDevActivity('ELECTRONICS');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.computersMobiles')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          switchDevActivity('HEALTH');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.pharmacy')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'furniture');
                          } catch {
                          }
                          switchDevActivity('SERVICE');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.furniture')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'homeGoods');
                          } catch {
                          }
                          switchDevActivity('RETAIL');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.homeGoods')}
                      </button>

                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'realEstate');
                          } catch {
                          }
                          switchDevActivity('SERVICE');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.realEstate')}
                      </button>

                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'carShowroom');
                          } catch {
                          }
                          switchDevActivity('RETAIL');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.carShowroom')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          switchDevActivity('SERVICE');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.bookings')}
                      </button>
                      <button
                        type="button"
                        disabled={devSwitchLoading}
                        onClick={() => {
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          switchDevActivity('OTHER');
                        }}
                        className="w-full py-4 px-5 text-right hover:bg-slate-50 transition-all font-black text-sm text-slate-800"
                      >
                        {t('dashboard.devActivity.other')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="relative cursor-pointer group" onClick={() => { setNotifOpen(true); handleMarkRead(); }}>
               <motion.div
                 animate={!prefersReducedMotion && unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
                 transition={!prefersReducedMotion && unreadCount > 0 ? { repeat: Infinity, duration: 2 } : {}}
               >
                 <Bell className={`w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-300 group-hover:text-slate-900'}`} />
               </motion.div>
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white text-[8px] flex items-center justify-center font-black text-white">{unreadCount}</span>}
            </div>
            {hasPosTab && (
              <button
                onClick={() => navigate(buildDashboardUrl('pos'))}
                aria-label={t('dashboard.posSystem')}
                title={t('dashboard.posSystem')}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
              >
                <Store className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => navigate(buildBuilderIndexUrl())}
              aria-label={t('dashboard.storeIdentity')}
              title={t('dashboard.storeIdentity')}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                try {
                  window.dispatchEvent(new Event('ray-db-update'));
                } catch {
                }
              }}
              aria-label={t('dashboard.refreshData')}
              title={t('dashboard.refreshData')}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col text-right">
             <h2 className="font-black text-slate-900 text-xl leading-none">{t('dashboard.title')}</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </header>

        <div className="p-4 md:p-12 md:pt-36 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BusinessLayout;
