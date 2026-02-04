import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { MapPin, Loader2, CheckCircle, Banknote, RefreshCw, LogOut, Menu, X, Settings, ClipboardList, Bell } from 'lucide-react';
import { ApiService } from '@/services/api.service';

const { useNavigate } = ReactRouterDOM as any;

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: { name?: string };
};

const parseCodLocation = (notes: any): { lat: number; lng: number; note?: string; address?: string } | null => {
  try {
    const raw = typeof notes === 'string' ? notes : '';
    const prefix = 'COD_LOCATION:';
    const start = raw.indexOf(prefix);
    if (start < 0) return null;

    const after = raw.slice(start + prefix.length);
    const nl = after.search(/\r?\n/);
    const json = (nl === -1 ? after : after.slice(0, nl)).trim();
    if (!json) return null;

    const parsed = JSON.parse(json);
    const lat = Number(parsed?.coords?.lat);
    const lng = Number(parsed?.coords?.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return {
      lat,
      lng,
      note: typeof parsed?.note === 'string' ? parsed.note : undefined,
      address: typeof parsed?.address === 'string' ? parsed.address : undefined,
    };
  } catch {
    return null;
  }
};

const getDeliveryFeeFromNotes = (notes: any): number | null => {
  const raw = typeof notes === 'string' ? notes : '';
  if (!raw) return null;
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const feeLine = lines.find((l) => l.toUpperCase().startsWith('DELIVERY_FEE:'));
  if (!feeLine) return null;
  const value = feeLine.split(':').slice(1).join(':').trim();
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

type CourierTab = 'orders' | 'offers' | 'delivered' | 'settings';

const COURIER_AUTO_REFRESH_KEY = 'ray_courier_auto_refresh';
const COURIER_REFRESH_SECONDS_KEY = 'ray_courier_refresh_seconds';
const COURIER_SHARE_LOCATION_KEY = 'ray_courier_share_location';
const COURIER_AVAILABLE_KEY = 'ray_courier_available';

function readBoolFromStorage(key: string, fallback: boolean) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return String(raw).toLowerCase() === 'true';
  } catch {
    return fallback;
  }
}

function readNumberFromStorage(key: string, fallback: number) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

const CourierOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<CourierTab>('orders');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(() => readBoolFromStorage(COURIER_AUTO_REFRESH_KEY, true));
  const [refreshSeconds, setRefreshSeconds] = useState(() => readNumberFromStorage(COURIER_REFRESH_SECONDS_KEY, 30));
  const [shareLocation, setShareLocation] = useState(() => readBoolFromStorage(COURIER_SHARE_LOCATION_KEY, false));
  const [isAvailable, setIsAvailable] = useState(() => readBoolFromStorage(COURIER_AVAILABLE_KEY, false));
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersRefreshing, setOffersRefreshing] = useState(false);

  const courierUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('ray_user');
      return userStr ? JSON.parse(userStr) : {};
    } catch {
      return {};
    }
  }, []);

  const loadOffers = useCallback(async (quiet = false) => {
    if (!quiet) setOffersLoading(true);
    else setOffersRefreshing(true);
    try {
      const data = await ApiService.getCourierOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch {
      setOffers([]);
    } finally {
      setOffersLoading(false);
      setOffersRefreshing(false);
    }
  }, []);

  const syncCourierStateFromBackend = useCallback(async () => {
    try {
      const s = await ApiService.getCourierState();
      if (typeof s?.isAvailable === 'boolean') {
        setIsAvailable(Boolean(s.isAvailable));
      }
    } catch {
    }
  }, []);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch {
    }
    try {
      localStorage.removeItem('ray_token');
      localStorage.removeItem('ray_user');
    } catch {
    }
    try {
      window.dispatchEvent(new Event('auth-change'));
    } catch {
    }
    navigate('/login');
  };

  useEffect(() => {
    const userStr = localStorage.getItem('ray_user');
    const user = userStr ? JSON.parse(userStr) : {};
    if (String(user?.role || '').toLowerCase() !== 'courier') {
      navigate('/login');
    }
  }, [navigate]);

  const loadOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await ApiService.getCourierOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadOffers(true);
    syncCourierStateFromBackend();
  }, [loadOrders, loadOffers, syncCourierStateFromBackend]);

  useEffect(() => {
    try {
      localStorage.setItem(COURIER_AUTO_REFRESH_KEY, autoRefresh ? 'true' : 'false');
      localStorage.setItem(COURIER_REFRESH_SECONDS_KEY, String(refreshSeconds));
      localStorage.setItem(COURIER_SHARE_LOCATION_KEY, shareLocation ? 'true' : 'false');
      localStorage.setItem(COURIER_AVAILABLE_KEY, isAvailable ? 'true' : 'false');
    } catch {
    }
  }, [autoRefresh, refreshSeconds, shareLocation, isAvailable]);

  useEffect(() => {
    if (!autoRefresh) return;
    const ms = Math.max(5, Number(refreshSeconds || 0)) * 1000;
    const id = window.setInterval(() => {
      loadOrders(true);
      loadOffers(true);
    }, ms);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshSeconds, loadOrders, loadOffers]);

  useEffect(() => {
    if (!shareLocation || !isAvailable) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    let cancelled = false;
    let timer: any;

    const tick = () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (cancelled) return;
            const lat = Number(pos?.coords?.latitude);
            const lng = Number(pos?.coords?.longitude);
            const accuracy = Number(pos?.coords?.accuracy);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
            try {
              await ApiService.updateCourierState({
                isAvailable: true,
                lat,
                lng,
                accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
              });
            } catch {
            }
          },
          () => {
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 } as any,
        );
      } catch {
      }
    };

    tick();
    timer = setInterval(tick, Math.max(10, Number(refreshSeconds || 0)) * 1000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [shareLocation, isAvailable, refreshSeconds]);

  useEffect(() => {
    try {
      ApiService.updateCourierState({ isAvailable }).catch(() => {});
    } catch {
    }
  }, [isAvailable]);

  const updateOrder = async (id: string, payload: { status?: string; codCollected?: boolean }) => {
    const updated = await ApiService.updateCourierOrder(id, payload);
    setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
  };

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED').length;
    return { totalOrders, delivered };
  }, [orders]);

  const offersSummary = useMemo(() => {
    const now = Date.now();
    const pending = (offers || []).filter((o) => String(o?.status || '').toUpperCase() === 'PENDING');
    const active = pending.filter((o) => {
      const exp = o?.expiresAt ? new Date(o.expiresAt).getTime() : NaN;
      return !Number.isFinite(exp) || exp > now;
    });
    return { pending: active.length };
  }, [offers]);

  const deliveredOrders = useMemo(
    () => orders.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED'),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    if (activeTab === 'delivered') return deliveredOrders;
    if (activeTab === 'orders') return orders;
    return [];
  }, [activeTab, deliveredOrders, orders]);

  const handleAcceptOffer = async (id: string) => {
    try {
      await ApiService.acceptCourierOffer(id);
      await loadOrders(true);
      await loadOffers(true);
      setActiveTab('orders');
    } catch {
    }
  };

  const handleRejectOffer = async (id: string) => {
    try {
      await ApiService.rejectCourierOffer(id);
      await loadOffers(true);
    } catch {
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white" dir="rtl">
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={closeDrawer}
            aria-label="close"
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-[85%] max-w-sm bg-slate-900 border-l border-white/10 p-6 overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">مرحباً</p>
                <p className="text-lg font-black">{String(courierUser?.name || 'مندوب')}</p>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  closeDrawer();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm ${activeTab === 'orders' ? 'bg-[#00E5FF] text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                <span>الطلبات</span>
                <ClipboardList size={18} />
              </button>
              <button
                onClick={() => {
                  setActiveTab('offers');
                  loadOffers(true);
                  closeDrawer();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm ${activeTab === 'offers' ? 'bg-amber-300 text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                <span>عروض جديدة</span>
                <Bell size={18} />
              </button>
              <button
                onClick={() => {
                  setActiveTab('delivered');
                  closeDrawer();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm ${activeTab === 'delivered' ? 'bg-emerald-400 text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                <span>تم التوصيل</span>
                <CheckCircle size={18} />
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  closeDrawer();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm ${activeTab === 'settings' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                <span>الإعدادات</span>
                <Settings size={18} />
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm bg-red-500/10 text-red-300 hover:bg-red-500/15"
              >
                <span>تسجيل خروج</span>
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-[100dvh] overflow-hidden">
        <aside className="hidden md:flex md:w-80 bg-slate-900 border-l border-white/10 p-8 flex-col overflow-y-auto">
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لوحة المندوب</p>
            <p className="text-xl font-black mt-2">{String(courierUser?.name || 'مندوب')}</p>
            <p className="text-xs text-slate-500 font-bold mt-1 break-all">{String(courierUser?.email || '')}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === 'orders' ? 'bg-[#00E5FF] text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <span>الطلبات</span>
              <ClipboardList size={18} />
            </button>
            <button
              onClick={() => {
                setActiveTab('offers');
                loadOffers(true);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === 'offers' ? 'bg-amber-300 text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <span>عروض جديدة</span>
              <Bell size={18} />
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === 'delivered' ? 'bg-emerald-400 text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <span>تم التوصيل</span>
              <CheckCircle size={18} />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === 'settings' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <span>الإعدادات</span>
              <Settings size={18} />
            </button>
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm bg-red-500/10 text-red-300 hover:bg-red-500/15"
            >
              <span>تسجيل خروج</span>
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain">
          <div
            className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-10"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <button
                  className="md:hidden p-3 rounded-2xl bg-white/5 hover:bg-white/10"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="menu"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl md:text-4xl font-black">لوحة المندوب</h1>
                  <p className="text-slate-400 text-xs md:text-sm font-bold">
                    {activeTab === 'orders'
                      ? 'طلباتك المعيّنة وتحديث حالتها وتحصيل الكاش.'
                      : activeTab === 'offers'
                        ? 'طلبات جديدة قريبة منك. أول من يوافق يتم إسناد الطلب له.'
                        : activeTab === 'delivered'
                          ? 'مراجعة الطلبات التي تم توصيلها.'
                          : 'إعدادات المندوب وتفضيلات التحديث.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3 w-full md:w-auto">
                <button
                  onClick={() => loadOrders(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs md:text-sm font-black whitespace-nowrap"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  تحديث
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-300 text-xs md:text-sm font-black whitespace-nowrap"
                >
                  <LogOut size={14} />
                  خروج
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">إجمالي الطلبات</p>
                <p className="text-lg md:text-2xl font-black text-[#00E5FF]">{summary.totalOrders}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">تم التوصيل</p>
                <p className="text-lg md:text-2xl font-black text-emerald-400">{summary.delivered}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">تحديث تلقائي</p>
                <p className="text-lg md:text-2xl font-black text-white">{autoRefresh ? `${refreshSeconds}s` : 'مغلق'}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">تبويب</p>
                <p className="text-sm md:text-base font-black text-white">
                  {activeTab === 'orders' ? 'الطلبات' : activeTab === 'offers' ? `عروض (${offersSummary.pending})` : activeTab === 'delivered' ? 'تم التوصيل' : 'الإعدادات'}
                </p>
              </div>
            </div>

            {activeTab === 'settings' ? (
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black">إعدادات المندوب</h3>
                    <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">تحكم في تفضيلات التحديث وبيانات الحساب.</p>
                  </div>
                  <Settings size={20} className="text-slate-400" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-3">
                    <p className="text-xs text-slate-500 font-black">بيانات الحساب</p>
                    <div className="text-sm font-black text-white break-all">{String(courierUser?.name || 'مندوب')}</div>
                    <div className="text-xs font-bold text-slate-400 break-all">{String(courierUser?.email || '')}</div>
                    {courierUser?.phone ? (
                      <div className="text-xs font-bold text-slate-500 break-all">{String(courierUser.phone)}</div>
                    ) : null}
                  </div>

                  <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-4">
                    <p className="text-xs text-slate-500 font-black">التحديث التلقائي</p>
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">متاح لاستلام الطلبات</span>
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(Boolean(e.target.checked))}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">مشاركة الموقع</span>
                      <input
                        type="checkbox"
                        checked={shareLocation}
                        onChange={(e) => setShareLocation(Boolean(e.target.checked))}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">تفعيل التحديث التلقائي</span>
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(Boolean(e.target.checked))}
                        className="w-5 h-5"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">كل (ثانية)</span>
                      <select
                        value={String(refreshSeconds)}
                        disabled={!autoRefresh}
                        onChange={(e) => setRefreshSeconds(Number(e.target.value))}
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm font-black disabled:opacity-50"
                      >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="60">60</option>
                        <option value="120">120</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('orders');
                        loadOrders(true);
                      }}
                      className="w-full mt-2 py-3 rounded-2xl bg-[#00E5FF] text-slate-900 font-black text-sm"
                    >
                      فتح الطلبات الآن
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'offers' ? (
              offersLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-300" /></div>
              ) : (offers || []).length === 0 ? (
                <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
                  لا توجد عروض جديدة حالياً.
                </div>
              ) : (
                <div className="space-y-3 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-black">عروض جديدة</h3>
                    <button
                      onClick={() => loadOffers(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black"
                    >
                      <RefreshCw size={14} className={offersRefreshing ? 'animate-spin' : ''} />
                      تحديث
                    </button>
                  </div>

                  {(offers || [])
                    .filter((o) => String(o?.status || '').toUpperCase() === 'PENDING')
                    .map((offer) => {
                      const order = offer?.order;
                      const fee = getDeliveryFeeFromNotes(order?.notes) || 0;
                      const grandTotal = Number(order?.total || 0) + fee;
                      const location = parseCodLocation(order?.notes);
                      const shopLat = Number((order as any)?.shop?.latitude);
                      const shopLng = Number((order as any)?.shop?.longitude);
                      const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);
                      const expiresAtMs = offer?.expiresAt ? new Date(offer.expiresAt).getTime() : NaN;
                      const secondsLeft = Number.isFinite(expiresAtMs) ? Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)) : null;

                      return (
                        <div key={String(offer.id)} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-slate-500 font-black uppercase">عرض طلب</p>
                              <h3 className="text-lg font-black">{order?.shop?.name || 'متجر غير معروف'}</h3>
                              <p className="text-xs text-slate-400 font-bold">
                                العميل: {order?.user?.name || 'غير معروف'} {order?.user?.phone ? `• ${order.user.phone}` : ''}
                              </p>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                                  الإجمالي: ج.م {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                                </span>
                                {secondsLeft != null && (
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 text-amber-300 font-black text-xs">
                                    متبقي: {secondsLeft}s
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {location && (
                                <a
                                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs"
                                >
                                  <MapPin size={12} /> العميل
                                </a>
                              )}
                              {location && hasShopCoords && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&origin=${shopLat},${shopLng}&destination=${location.lat},${location.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 text-emerald-300 font-black text-xs"
                                >
                                  <MapPin size={12} /> مسار
                                </a>
                              )}
                              <button
                                onClick={() => handleAcceptOffer(String(offer.id))}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-black text-xs"
                              >
                                <CheckCircle size={12} /> قبول
                              </button>
                              <button
                                onClick={() => handleRejectOffer(String(offer.id))}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 text-red-300 hover:bg-red-500/15 font-black text-xs"
                              >
                                <X size={12} /> رفض
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )
            ) : loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : visibleOrders.length === 0 ? (
              <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-12 text-center text-slate-400 font-bold">
                {activeTab === 'delivered' ? 'لا توجد طلبات تم توصيلها بعد.' : 'لا توجد طلبات مخصصة لك حالياً.'}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-6">
                {visibleOrders.map((order) => {
                  const fee = getDeliveryFeeFromNotes(order.notes) || 0;
                  const grandTotal = Number(order.total || 0) + fee;
                  const delivered = String(order.status || '').toUpperCase() === 'DELIVERED';
                  const codCollected = !!order.codCollectedAt;
                  const location = parseCodLocation(order.notes);
                  const shopLat = Number((order as any)?.shop?.latitude);
                  const shopLng = Number((order as any)?.shop?.longitude);
                  const hasShopCoords = Number.isFinite(shopLat) && Number.isFinite(shopLng);

                  return (
                    <div key={order.id} className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
                        <div className="space-y-1 md:space-y-2">
                          <p className="text-xs text-slate-500 font-black uppercase">طلب #{String(order.id).slice(0, 8)}</p>
                          <h3 className="text-lg md:text-xl font-black">{order?.shop?.name || 'متجر غير معروف'}</h3>
                          <p className="text-xs md:text-sm text-slate-400 font-bold">
                            العميل: {order?.user?.name || 'غير معروف'} {order?.user?.phone ? `• ${order.user.phone}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(order.created_at || order.createdAt).toLocaleString('ar-EG')}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {location && (
                            <a
                              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs"
                            >
                              <MapPin size={12} /> فتح الخريطة
                            </a>
                          )}
                          {location && hasShopCoords && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${shopLat},${shopLng}&destination=${location.lat},${location.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-emerald-500/10 text-emerald-300 font-black text-xs"
                            >
                              <MapPin size={12} /> مسار من المتجر
                            </a>
                          )}
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                            الإجمالي: ج.م {Number.isFinite(grandTotal) ? grandTotal.toLocaleString() : '0'}
                          </span>
                          {fee > 0 && (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl bg-amber-500/10 text-amber-300 font-black text-xs">
                              رسوم التوصيل: ج.م {fee}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 md:mt-6 grid md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4">
                          <p className="text-xs text-slate-500 font-black mb-2 md:mb-3">الأصناف</p>
                          <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-slate-300">
                            {(order.items || []).map((item: OrderItem) => (
                              <li key={item.id} className="flex items-center justify-between">
                                <span>{item.product?.name || 'منتج'}</span>
                                <span className="text-slate-400">× {item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-3 md:p-4 space-y-3 md:space-y-4">
                          <div>
                            <p className="text-xs text-slate-500 font-black">الحالة الحالية</p>
                            <p className="text-xs md:text-sm font-black text-white">{String(order.status || 'PENDING')}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <button
                              disabled={delivered}
                              onClick={() => updateOrder(String(order.id), { status: 'DELIVERED' })}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${delivered ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
                            >
                              <CheckCircle size={12} /> تم التوصيل
                            </button>
                            <button
                              disabled={codCollected}
                              onClick={() => updateOrder(String(order.id), { codCollected: true })}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl text-xs font-black ${codCollected ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'}`}
                            >
                              <Banknote size={12} /> {codCollected ? 'تم تحصيل الكاش' : 'تحصيل الكاش'}
                            </button>
                          </div>
                          {(location?.address || location?.note) && (
                            <div className="text-xs text-slate-400">
                              {location?.address && <p>العنوان: {location.address}</p>}
                              {location?.note && <p>ملاحظات: {location.note}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourierOrders;
