'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Loader2, CheckCircle, Banknote, RefreshCw, LogOut, Menu, X, Settings, ClipboardList, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clientFetch } from '@/lib/api/client';
import { clearSessionCookies } from '@/lib/auth/helpers';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import CourierOrdersTab from '@/components/client/courier/CourierOrdersTab';
import CourierOffersTab from '@/components/client/courier/CourierOffersTab';
import CourierSettingsTab from '@/components/client/courier/CourierSettingsTab';

type CourierTab = 'orders' | 'offers' | 'delivered' | 'settings';

const COURIER_AUTO_REFRESH_KEY = 'ray_courier_auto_refresh';
const COURIER_REFRESH_SECONDS_KEY = 'ray_courier_refresh_seconds';
const COURIER_SHARE_LOCATION_KEY = 'ray_courier_share_location';
const COURIER_AVAILABLE_KEY = 'ray_courier_available';

function readBoolFromStorage(key: string, fallback: boolean) {
  try { const raw = localStorage.getItem(key); return raw == null ? fallback : String(raw).toLowerCase() === 'true'; } catch { return fallback; }
}
function readNumberFromStorage(key: string, fallback: number) {
  try { const raw = localStorage.getItem(key); const n = Number(raw); return Number.isFinite(n) && n > 0 ? n : fallback; } catch { return fallback; }
}

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
    return { lat, lng, note: typeof parsed?.note === 'string' ? parsed.note : undefined, address: typeof parsed?.address === 'string' ? parsed.address : undefined };
  } catch { return null; }
};

const getDeliveryFeeFromNotes = (notes: any): number | null => {
  const raw = typeof notes === 'string' ? notes : '';
  if (!raw) return null;
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const feeLine = lines.find(l => l.toUpperCase().startsWith('DELIVERY_FEE:'));
  if (!feeLine) return null;
  const value = feeLine.split(':').slice(1).join(':').trim();
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const buildGoogleMapsLink = (payload: { lat: number; lng: number; originLat?: number; originLng?: number }) => {
  const { lat, lng, originLat, originLng } = payload;
  const hasOrigin = Number.isFinite(Number(originLat)) && Number.isFinite(Number(originLng));
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return '#';
  if (hasOrigin) return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}&travelmode=driving`;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

export default function CourierDashboardPage() {
  const t = useT();
  const router = useRouter();
  const { dir } = useLocale();

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
    try { const raw = localStorage.getItem('ray_user'); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  }, []);

  useEffect(() => {
    setProfileName(String(courierUser?.name || '').trim());
    setProfilePhone(String(courierUser?.phone || '').trim());
  }, [courierUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaving) return;
    const name = String(profileName || '').trim();
    if (!name) { window.alert(t('courier.ordersPage.nameRequired', 'الاسم مطلوب')); return; }
    setProfileSaving(true);
    try {
      const updated = await clientFetch<any>('/v1/users/me', { method: 'PATCH', body: JSON.stringify({ name, phone: profilePhone || null }) });
      const merged = { ...courierUser, ...(updated || {}) };
      try { localStorage.setItem('ray_user', JSON.stringify(merged)); } catch {}
      window.alert(t('courier.ordersPage.profileSaved', 'تم حفظ البيانات'));
    } catch { window.alert(t('courier.ordersPage.profileSaveFailed', 'فشل حفظ البيانات')); }
    finally { setProfileSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordSaving) return;
    if (!currentPassword) { window.alert(t('courier.ordersPage.enterCurrentPassword', 'أدخل كلمة المرور الحالية')); return; }
    if (!newPassword || newPassword.length < 8) { window.alert(t('courier.ordersPage.passwordMinLength', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')); return; }
    if (newPassword !== confirmNewPassword) { window.alert(t('courier.ordersPage.passwordConfirmMismatch', 'كلمتا المرور غير متطابقتين')); return; }
    if (!window.confirm(t('courier.ordersPage.confirmChangePassword', 'تأكيد تغيير كلمة المرور؟'))) return;
    setPasswordSaving(true);
    try {
      await clientFetch<any>('/v1/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      window.alert(t('courier.ordersPage.passwordChanged', 'تم تغيير كلمة المرور'));
    } catch { window.alert(t('courier.ordersPage.passwordChangeFailed', 'فشل تغيير كلمة المرور')); }
    finally { setPasswordSaving(false); }
  };

  const loadOffers = useCallback(async (quiet = false) => {
    if (!quiet) setOffersLoading(true); else setOffersRefreshing(true);
    try { const data = await clientFetch<any>('/v1/courier/offers'); setOffers(Array.isArray(data) ? data : []); } catch { setOffers([]); }
    finally { setOffersLoading(false); setOffersRefreshing(false); }
  }, []);

  const syncCourierStateFromBackend = useCallback(async () => {
    setStateLoading(true);
    try { const s = await clientFetch<any>('/v1/courier/state'); setLastState(s); if (typeof s?.isAvailable === 'boolean') setIsAvailable(Boolean(s.isAvailable)); } catch { setLastState(null); }
    setStateLoading(false);
  }, []);

  const copyText = async (value: string, fallbackLabel: string) => {
    const v = String(value || '').trim();
    if (!v) return;
    try { await navigator.clipboard.writeText(v); } catch { try { window.prompt(fallbackLabel, v); } catch {} }
  };

  const getOrderGrandTotal = (order: any) => {
    const fee = getDeliveryFeeFromNotes(order?.notes) || 0;
    return Number(order?.total || 0) + fee;
  };

  const updateLocationOnce = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setGeoStatus('unsupported'); return; }
    try {
      setGeoStatus('unknown');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          const accuracy = Number(pos?.coords?.accuracy);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
          try { await clientFetch<any>('/v1/courier/state', { method: 'PATCH', body: JSON.stringify({ ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}), lat, lng, ...(Number.isFinite(accuracy) ? { accuracy } : {}) }) }); setGeoStatus('ok'); setGeoLastFixAt(Date.now()); syncCourierStateFromBackend(); } catch {}
        },
        () => { setGeoStatus('blocked'); },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
    } catch { setGeoStatus('blocked'); }
  }, [isAvailable, syncCourierStateFromBackend]);

  const handleLogout = async () => {
    try { await clearSessionCookies(); } catch {}
    try { localStorage.removeItem('ray_token'); localStorage.removeItem('ray_user'); } catch {}
    router.push('/login');
  };

  useEffect(() => {
    const user = (() => { try { const raw = localStorage.getItem('ray_user'); return raw ? JSON.parse(raw) : {}; } catch { return {}; } })();
    if (String(user?.role || '').toLowerCase() !== 'courier') { router.replace('/login'); }
  }, [router]);

  const loadOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setIsRefreshing(true);
    try { const data = await clientFetch<any>('/v1/courier/orders'); setOrders(Array.isArray(data) ? data : []); } catch { setOrders([]); }
    finally { setLoading(false); setIsRefreshing(false); }
  }, []);

  useEffect(() => { loadOrders(); loadOffers(true); syncCourierStateFromBackend(); }, [loadOrders, loadOffers, syncCourierStateFromBackend]);

  useEffect(() => {
    try { localStorage.setItem(COURIER_AUTO_REFRESH_KEY, autoRefresh ? 'true' : 'false'); localStorage.setItem(COURIER_REFRESH_SECONDS_KEY, String(refreshSeconds)); localStorage.setItem(COURIER_SHARE_LOCATION_KEY, shareLocation ? 'true' : 'false'); localStorage.setItem(COURIER_AVAILABLE_KEY, isAvailable ? 'true' : 'false'); } catch {}
  }, [autoRefresh, refreshSeconds, shareLocation, isAvailable]);

  useEffect(() => {
    if (!autoRefresh) return;
    const ms = Math.max(5, Number(refreshSeconds || 0)) * 1000;
    const id = window.setInterval(() => { loadOrders(true); loadOffers(true); }, ms);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshSeconds, loadOrders, loadOffers]);

  useEffect(() => {
    try { clientFetch<any>('/v1/courier/state', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }).catch(() => {}); } catch {}
  }, [isAvailable]);

  const updateOrder = async (id: string, payload: { status?: string; codCollected?: boolean }) => {
    const updated = await clientFetch<any>(`/v1/courier/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    setOrders(prev => prev.map(o => String(o.id) === String(updated?.id) ? { ...o, ...updated } : o));
  };

  const summary = useMemo(() => ({
    totalOrders: orders.length,
    delivered: orders.filter(o => String(o.status || '').toUpperCase() === 'DELIVERED').length,
  }), [orders]);

  const kpis = useMemo(() => {
    const active = orders.filter(o => String(o.status || '').toUpperCase() !== 'DELIVERED');
    const pendingCod = orders.filter(o => String(o.status || '').toUpperCase() === 'DELIVERED' && !o?.codCollectedAt);
    const pendingCodAmount = pendingCod.reduce((acc, o) => acc + getOrderGrandTotal(o), 0);
    return { activeCount: active.length, pendingCodCount: pendingCod.length, pendingCodAmount };
  }, [orders]);

  const deliveredOrders = useMemo(() => orders.filter(o => String(o.status || '').toUpperCase() === 'DELIVERED'), [orders]);
  const visibleOrders = useMemo(() => {
    if (activeTab === 'delivered') return deliveredOrders;
    if (activeTab === 'orders') return orders;
    return [];
  }, [activeTab, deliveredOrders, orders]);

  const handleAcceptOffer = async (id: string) => {
    const offerId = String(id || '').trim();
    if (!offerId || acceptingOfferId) return;
    setAcceptingOfferId(offerId);
    try { await clientFetch<any>(`/v1/courier/offers/${offerId}/accept`, { method: 'PATCH' }); await loadOrders(true); await loadOffers(true); setActiveTab('orders'); setDrawerOpen(false); }
    catch { window.alert(t('courier.ordersPage.acceptFailed', 'فشل قبول العرض')); }
    finally { setAcceptingOfferId(null); }
  };

  const handleRejectOffer = async (id: string) => {
    try { await clientFetch<any>(`/v1/courier/offers/${id}/reject`, { method: 'PATCH' }); await loadOffers(true); } catch {}
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white" dir={dir}>
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <button className="absolute inset-0 bg-black/70" onClick={closeDrawer} />
          <div className="absolute top-0 bottom-0 right-0 w-[85%] max-w-sm bg-slate-900 border-l border-white/10 p-6 flex flex-col" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold">{t('courier.ordersPage.hello', 'مرحباً')}</p>
                <p className="text-lg font-black">{String(courierUser?.name || t('courier.ordersPage.courierFallback', 'مندوب'))}</p>
              </div>
              <button onClick={closeDrawer} className="p-2 rounded-xl bg-white/5 hover:bg-white/10"><X size={18} /></button>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {[
                { key: 'orders' as CourierTab, icon: ClipboardList, label: t('courier.ordersPage.tabs.orders', 'الطلبات'), activeClass: 'bg-[#00E5FF] text-slate-900' },
                { key: 'offers' as CourierTab, icon: Bell, label: t('courier.ordersPage.tabs.offers', 'العروض'), activeClass: 'bg-amber-300 text-slate-900' },
                { key: 'settings' as CourierTab, icon: Settings, label: t('courier.ordersPage.tabs.settings', 'الإعدادات'), activeClass: 'bg-white text-slate-900' },
              ].map(({ key, icon: Icon, label, activeClass }) => (
                <button key={key} onClick={() => { setActiveTab(key); if (key === 'offers') loadOffers(true); closeDrawer(); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm ${activeTab === key ? activeClass : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}>
                  <span>{label}</span><Icon size={18} />
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10">
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm bg-red-500/10 text-red-300 hover:bg-red-500/15">
                <span>{t('courier.ordersPage.logout', 'خروج')}</span><LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-[100dvh]">
        <aside className="hidden md:flex md:w-80 bg-slate-900 border-l border-white/10 p-8 flex-col">
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('courier.ordersPage.badge', 'مندوب')}</p>
            <p className="text-xl font-black mt-2">{String(courierUser?.name || t('courier.ordersPage.courierFallback', 'مندوب'))}</p>
            <p className="text-xs text-slate-500 font-bold mt-1 break-all">{String(courierUser?.email || '')}</p>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {[
              { key: 'orders' as CourierTab, icon: ClipboardList, label: t('courier.ordersPage.tabs.orders', 'الطلبات'), activeClass: 'bg-[#00E5FF] text-slate-900' },
              { key: 'offers' as CourierTab, icon: Bell, label: t('courier.ordersPage.tabs.offers', 'العروض'), activeClass: 'bg-amber-300 text-slate-900' },
              { key: 'settings' as CourierTab, icon: Settings, label: t('courier.ordersPage.tabs.settings', 'الإعدادات'), activeClass: 'bg-white text-slate-900' },
            ].map(({ key, icon: Icon, label, activeClass }) => (
              <button key={key} onClick={() => { setActiveTab(key); if (key === 'offers') loadOffers(true); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-colors ${activeTab === key ? activeClass : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}>
                <span>{label}</span><Icon size={18} />
              </button>
            ))}
          </div>
          <div className="pt-6 border-t border-white/10 mt-6">
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm bg-red-500/10 text-red-300 hover:bg-red-500/15">
              <span>{t('courier.ordersPage.logout', 'خروج')}</span><LogOut size={18} />
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <button className="md:hidden p-3 rounded-2xl bg-white/5 hover:bg-white/10" onClick={() => setDrawerOpen(true)}>
                  <Menu size={18} />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl md:text-4xl font-black">{t('courier.ordersPage.title', 'لوحة المندوب')}</h1>
                  <p className="text-slate-400 text-xs md:text-sm font-bold">
                    {activeTab === 'orders' ? t('courier.ordersPage.tabDesc.orders', 'الطلبات المسندة إليك') : activeTab === 'offers' ? t('courier.ordersPage.tabDesc.offers', 'عروض التوصيل المتاحة') : t('courier.ordersPage.tabDesc.settings', 'إعدادات الحساب')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3 w-full md:w-auto">
                <button onClick={() => loadOrders(true)} className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs md:text-sm font-black whitespace-nowrap">
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> {t('courier.common.refresh', 'تحديث')}
                </button>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-red-300 text-xs md:text-sm font-black whitespace-nowrap">
                  <LogOut size={14} /> {t('courier.ordersPage.exit', 'خروج')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">{t('courier.ordersPage.kpis.totalOrders', 'إجمالي الطلبات')}</p>
                <p className="text-lg md:text-2xl font-black text-[#00E5FF]">{summary.totalOrders}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">{t('courier.ordersPage.kpis.delivered', 'تم تسليمها')}</p>
                <p className="text-lg md:text-2xl font-black text-emerald-400">{summary.delivered}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">{t('courier.ordersPage.kpis.inProgress', 'قيد التنفيذ')}</p>
                <p className="text-lg md:text-2xl font-black text-white">{kpis.activeCount}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-2xl px-3 md:px-5 py-3">
                <p className="text-[10px] text-slate-500 font-black uppercase">{t('courier.ordersPage.kpis.pendingCash', 'نقود معلقة')}</p>
                <p className="text-sm md:text-base font-black text-white">{kpis.pendingCodCount ? `${t('courier.common.egpAbbr', 'ج.م')} ${Math.round(kpis.pendingCodAmount).toLocaleString()}` : t('courier.ordersPage.none', 'لا يوجد')}</p>
              </div>
            </div>

            {activeTab === 'settings' ? (
              <CourierSettingsTab
                courierUser={courierUser} profileName={profileName} profilePhone={profilePhone} profileSaving={profileSaving}
                onProfileNameChange={setProfileName} onProfilePhoneChange={setProfilePhone} onSaveProfile={handleSaveProfile}
                stateLoading={stateLoading} lastState={lastState} onSyncState={syncCourierStateFromBackend}
                isAvailable={isAvailable} shareLocation={shareLocation} autoRefresh={autoRefresh} refreshSeconds={refreshSeconds}
                onIsAvailableChange={setIsAvailable} onShareLocationChange={setShareLocation} onAutoRefreshChange={setAutoRefresh} onRefreshSecondsChange={setRefreshSeconds}
                geoStatus={geoStatus} geoLastFixAt={geoLastFixAt} onUpdateLocationOnce={updateLocationOnce}
                currentPassword={currentPassword} newPassword={newPassword} confirmNewPassword={confirmNewPassword} passwordSaving={passwordSaving}
                showCurrentPassword={showCurrentPassword} showNewPassword={showNewPassword} showConfirmPassword={showConfirmPassword}
                onShowCurrentPasswordChange={setShowCurrentPassword} onShowNewPasswordChange={setShowNewPassword} onShowConfirmPasswordChange={setShowConfirmPassword}
                onCurrentPasswordChange={setCurrentPassword} onNewPasswordChange={setNewPassword} onConfirmNewPasswordChange={setConfirmNewPassword}
                onChangePassword={handleChangePassword}
                onOpenOrdersNow={() => { setActiveTab('orders'); loadOrders(true); }}
              />
            ) : activeTab === 'offers' ? (
              <CourierOffersTab
                offers={offers} offersLoading={offersLoading} offersRefreshing={offersRefreshing} acceptingOfferId={acceptingOfferId}
                onRefresh={() => loadOffers(true)} onAccept={handleAcceptOffer} onReject={handleRejectOffer}
                parseCodLocation={parseCodLocation} getDeliveryFeeFromNotes={getDeliveryFeeFromNotes} buildGoogleMapsLink={buildGoogleMapsLink}
              />
            ) : (
              <CourierOrdersTab
                activeTab={activeTab} loading={loading} visibleOrders={visibleOrders}
                buildGoogleMapsLink={buildGoogleMapsLink} parseCodLocation={parseCodLocation} getDeliveryFeeFromNotes={getDeliveryFeeFromNotes}
                copyText={copyText} updateOrder={updateOrder}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
