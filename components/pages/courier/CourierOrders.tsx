import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { MapPin, Loader2, CheckCircle, Banknote, RefreshCw, LogOut, Menu, X, Settings, ClipboardList, Bell, Phone, Copy, Navigation } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { clearSession, getStoredUser, persistSession } from '@/services/authStorage';
import CourierOffersTab from './CourierOffersTab';
import CourierOrdersTab from './CourierOrdersTab';
import CourierSettingsTab from './CourierSettingsTab';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';

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

const buildGoogleMapsLink = (payload: { lat: number; lng: number; originLat?: number; originLng?: number }) => {
  const lat = Number(payload?.lat);
  const lng = Number(payload?.lng);
  const originLat = Number(payload?.originLat);
  const originLng = Number(payload?.originLng);
  const hasOrigin = Number.isFinite(originLat) && Number.isFinite(originLng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '#';

  if (hasOrigin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}&travelmode=driving`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

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
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [lastState, setLastState] = useState<any>(null);
  const [geoStatus, setGeoStatus] = useState<'unknown' | 'ok' | 'blocked' | 'unsupported'>('unknown');
  const [geoLastFixAt, setGeoLastFixAt] = useState<number | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const courierUser = useMemo(() => {
    try {
      return getStoredUser() || {};
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    setProfileName(String((courierUser as any)?.name || '').trim());
    setProfilePhone(String((courierUser as any)?.phone || '').trim());
  }, [courierUser]);

  const persistLocalUser = (updatedUser: any) => {
    persistSession({ user: updatedUser || {} }, 'courier-profile-update');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaving) return;
    const name = String(profileName || '').trim();
    const phone = String(profilePhone || '').trim();
    if (!name) {
      window.alert('الاسم مطلوب');
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await ApiService.updateMyProfile({
        name,
        phone: phone ? phone : null,
      });
      const merged = { ...(courierUser as any), ...(updated || {}) };
      persistLocalUser(merged);
      window.alert('تم حفظ البيانات بنجاح');
    } catch (err: any) {
      window.alert(String(err?.message || 'فشل حفظ البيانات'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordSaving) return;

    const cur = String(currentPassword || '');
    const next = String(newPassword || '');
    const conf = String(confirmNewPassword || '');

    if (!cur) {
      window.alert('اكتب كلمة المرور الحالية');
      return;
    }
    if (!next || next.length < 8) {
      window.alert('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (next !== conf) {
      window.alert('تأكيد كلمة المرور غير مطابق');
      return;
    }

    const ok = window.confirm('تأكيد تغيير كلمة المرور؟');
    if (!ok) return;

    setPasswordSaving(true);
    try {
      await ApiService.changePassword({ currentPassword: cur, newPassword: next });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      window.alert('تم تغيير كلمة المرور بنجاح');
    } catch (err: any) {
      window.alert(String(err?.message || 'فشل تغيير كلمة المرور'));
    } finally {
      setPasswordSaving(false);
    }
  };

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
    setStateLoading(true);
    try {
      const s = await ApiService.getCourierState();
      setLastState(s);
      if (typeof s?.isAvailable === 'boolean') {
        setIsAvailable(Boolean(s.isAvailable));
      }
    } catch {
      setLastState(null);
    }
    setStateLoading(false);
  }, []);

  const copyText = async (value: string, fallbackLabel: string) => {
    const v = String(value || '').trim();
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      return;
    } catch {
      try {
        window.prompt(fallbackLabel, v);
      } catch {
      }
    }
  };

  const getOrderGrandTotal = (order: any) => {
    const fee = getDeliveryFeeFromNotes(order?.notes) || 0;
    return Number(order?.total || 0) + fee;
  };

  const updateLocationOnce = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    try {
      setGeoStatus('unknown');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          const accuracy = Number(pos?.coords?.accuracy);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          try {
            await ApiService.updateCourierState({
              ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
              lat,
              lng,
              ...(Number.isFinite(accuracy) ? { accuracy } : {}),
            });
            setGeoStatus('ok');
            setGeoLastFixAt(Date.now());
            syncCourierStateFromBackend();
          } catch {
          }
        },
        () => {
          setGeoStatus('blocked');
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 } as any,
      );
    } catch {
      setGeoStatus('blocked');
    }
  }, [isAvailable, syncCourierStateFromBackend]);

  const locationWatchIdRef = useRef<number | null>(null);
  const lastLocationCommitAtRef = useRef<number>(0);

  const commitLocation = useCallback(async (payload: { lat: number; lng: number; accuracy?: number }) => {
    const now = Date.now();
    const minIntervalMs = 20000;
    if (now - lastLocationCommitAtRef.current < minIntervalMs) return;
    lastLocationCommitAtRef.current = now;

    try {
      await ApiService.updateCourierState({
        ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
        lat: payload.lat,
        lng: payload.lng,
        ...(Number.isFinite(Number(payload.accuracy)) ? { accuracy: Number(payload.accuracy) } : {}),
      });
      setGeoStatus('ok');
      setGeoLastFixAt(Date.now());
      syncCourierStateFromBackend();
    } catch {
    }
  }, [isAvailable, syncCourierStateFromBackend]);

  useEffect(() => {
    if (!shareLocation) {
      try {
        if (locationWatchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
        }
      } catch {
      }
      locationWatchIdRef.current = null;
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }

    // Trigger an immediate update so the courier doesn't miss offers on enable.
    updateLocationOnce();

    try {
      setGeoStatus('unknown');
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          const accuracy = Number(pos?.coords?.accuracy);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          commitLocation({ lat, lng, ...(Number.isFinite(accuracy) ? { accuracy } : {}) });
        },
        () => {
          setGeoStatus('blocked');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 } as any,
      );
      locationWatchIdRef.current = Number(watchId);
    } catch {
      setGeoStatus('blocked');
    }

    return () => {
      try {
        if (locationWatchIdRef.current != null && typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
        }
      } catch {
      }
      locationWatchIdRef.current = null;
    };
  }, [shareLocation, updateLocationOnce, commitLocation]);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
    } catch {
    }
    clearSession('courier-logout');
    navigate('/login');
  };

  useEffect(() => {
    const user = getStoredUser() || {};
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

  // Smart event-driven refresh - replaces the old timer-based auto-refresh
  useSmartRefreshListener(['orders', 'all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    loadOrders(true);
    loadOffers(true);
    syncCourierStateFromBackend();
  });

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

  const kpis = useMemo(() => {
    const active = (orders || []).filter((o) => String(o.status || '').toUpperCase() !== 'DELIVERED');
    const pendingCod = (orders || []).filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED' && !o?.codCollectedAt);
    const pendingCodAmount = pendingCod.reduce((acc, o) => acc + getOrderGrandTotal(o), 0);
    return {
      activeCount: active.length,
      pendingCodCount: pendingCod.length,
      pendingCodAmount,
    };
  }, [orders]);

  const offersSummary = useMemo(() => {
    const pending = (offers || []).filter((o) => String(o?.status || '').toUpperCase() === 'PENDING');
    return { pending: pending.length };
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
    const offerId = String(id || '').trim();
    if (!offerId || acceptingOfferId) return;
    setAcceptingOfferId(offerId);
    try {
      await ApiService.acceptCourierOffer(offerId);
      await loadOrders(true);
      await loadOffers(true);
      setActiveTab('orders');
      setDrawerOpen(false);
    } catch (e: any) {
      try {
        window.alert(String(e?.message || 'فشل قبول الطلب'));
      } catch {
      }
    } finally {
      setAcceptingOfferId(null);
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
            className="absolute top-0 bottom-0 right-0 w-[85%] max-w-sm bg-slate-900 border-l border-white/10 p-6 flex flex-col"
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

            <div className="space-y-2 flex-1 overflow-y-auto">
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

      <div className="flex min-h-[100dvh]">
        <aside className="hidden md:flex md:w-80 bg-slate-900 border-l border-white/10 p-8 flex-col">
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">لوحة المندوب</p>
            <p className="text-xl font-black mt-2">{String(courierUser?.name || 'مندوب')}</p>
            <p className="text-xs text-slate-500 font-bold mt-1 break-all">{String(courierUser?.email || '')}</p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
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
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === 'settings' ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              <span>الإعدادات</span>
              <Settings size={18} />
            </button>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm bg-red-500/10 text-red-300 hover:bg-red-500/15"
            >
              <span>تسجيل خروج</span>
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden">
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
                <p className="text-[10px] text-slate-500 font-black uppercase">طلبات قيد التنفيذ</p>
                <p className="text-lg md:text-2xl font-black text-white">{kpis.activeCount}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">كاش معلّق</p>
                <p className="text-sm md:text-base font-black text-white">{kpis.pendingCodCount ? `ج.م ${Math.round(kpis.pendingCodAmount).toLocaleString()}` : 'لا يوجد'}</p>
              </div>
            </div>

            {activeTab === 'settings' ? (
              <CourierSettingsTab
                courierUser={courierUser}
                profileName={profileName}
                profilePhone={profilePhone}
                profileSaving={profileSaving}
                onProfileNameChange={setProfileName}
                onProfilePhoneChange={setProfilePhone}
                onSaveProfile={handleSaveProfile}
                stateLoading={stateLoading}
                lastState={lastState}
                onSyncState={syncCourierStateFromBackend}
                isAvailable={isAvailable}
                shareLocation={shareLocation}
                autoRefresh={autoRefresh}
                refreshSeconds={refreshSeconds}
                onIsAvailableChange={setIsAvailable}
                onShareLocationChange={setShareLocation}
                onAutoRefreshChange={setAutoRefresh}
                onRefreshSecondsChange={setRefreshSeconds}
                geoStatus={geoStatus}
                geoLastFixAt={geoLastFixAt}
                onUpdateLocationOnce={updateLocationOnce}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmNewPassword={confirmNewPassword}
                passwordSaving={passwordSaving}
                showCurrentPassword={showCurrentPassword}
                showNewPassword={showNewPassword}
                showConfirmPassword={showConfirmPassword}
                onShowCurrentPasswordChange={setShowCurrentPassword}
                onShowNewPasswordChange={setShowNewPassword}
                onShowConfirmPasswordChange={setShowConfirmPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmNewPasswordChange={setConfirmNewPassword}
                onChangePassword={handleChangePassword}
                onOpenOrdersNow={() => {
                  setActiveTab('orders');
                  loadOrders(true);
                }}
              />
            ) : activeTab === 'offers' ? (
              <CourierOffersTab
                offers={offers}
                offersLoading={offersLoading}
                offersRefreshing={offersRefreshing}
                acceptingOfferId={acceptingOfferId}
                onRefresh={() => loadOffers(true)}
                onAccept={handleAcceptOffer}
                onReject={handleRejectOffer}
                parseCodLocation={parseCodLocation}
                getDeliveryFeeFromNotes={getDeliveryFeeFromNotes}
                buildGoogleMapsLink={buildGoogleMapsLink}
              />
            ) : (
              <CourierOrdersTab
                activeTab={activeTab}
                loading={loading}
                visibleOrders={visibleOrders}
                buildGoogleMapsLink={buildGoogleMapsLink}
                parseCodLocation={parseCodLocation}
                getDeliveryFeeFromNotes={getDeliveryFeeFromNotes}
                copyText={copyText}
                updateOrder={updateOrder}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourierOrders;
