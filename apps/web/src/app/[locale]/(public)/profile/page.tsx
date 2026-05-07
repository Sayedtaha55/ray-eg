'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Package, Bell, Settings, Heart,
  Clock, CheckCircle2, XCircle, AlertCircle,
  Loader2, ChevronRight, LogOut, Edit3, Save
} from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

type ProfileTab = 'reservations' | 'orders' | 'notifications' | 'settings';

interface ReservationItem {
  id: string;
  productId?: string;
  productName?: string;
  shopId?: string;
  shopName?: string;
  status: string;
  createdAt?: string;
  date?: string;
  time?: string;
  notes?: string;
}

interface OrderItem {
  id: string;
  status: string;
  total?: number;
  paymentMethod?: string;
  createdAt?: string;
  shopId?: string;
  shopName?: string;
  items?: any[];
}

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
  type?: string;
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export default function ProfilePage() {
  const t = useT();
  const router = useRouter();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [activeTab, setActiveTab] = useState<ProfileTab>('reservations');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab data
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [ordLoading, setOrdLoading] = useState(false);
  const [notLoading, setNotLoading] = useState(false);

  // Settings form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  // Read user
  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem('ray_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id) {
            setUser(parsed);
            setEditName(parsed.name || '');
            setEditPhone(parsed.phone || '');
            setLoading(false);
            return;
          }
        }
      } catch {}
      // Try cookie
      const userId = document.cookie.split('; ').find(r => r.startsWith('ray_user_id='))?.split('=')[1];
      const userName = document.cookie.split('; ').find(r => r.startsWith('ray_user_name='))?.split('=')[1];
      const role = document.cookie.split('; ').find(r => r.startsWith('ray_role='))?.split('=')[1];
      if (userId) {
        const u = { id: userId, name: userName ? decodeURIComponent(userName) : '', role: role || '' };
        setUser(u);
        setEditName(u.name || '');
        setLoading(false);
        return;
      }
      // Not logged in — redirect
      router.replace(`/${locale}/login?returnTo=/${locale}/profile`);
    };
    readUser();
  }, [locale, router]);

  // Fetch tab data
  const fetchReservations = useCallback(async () => {
    setResLoading(true);
    try {
      const data = await clientFetch<any>('/v1/reservations/me?limit=50');
      setReservations(Array.isArray(data) ? data : data?.items || []);
    } catch { setReservations([]); }
    finally { setResLoading(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdLoading(true);
    try {
      const data = await clientFetch<any>('/v1/orders/me?limit=50');
      setOrders(Array.isArray(data) ? data : data?.items || []);
    } catch { setOrders([]); }
    finally { setOrdLoading(false); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotLoading(true);
    try {
      const data = await clientFetch<any>('/v1/notifications/me?take=50&skip=0');
      setNotifications(Array.isArray(data) ? data : data?.items || []);
    } catch { setNotifications([]); }
    finally { setNotLoading(false); }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'reservations') fetchReservations();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'notifications') fetchNotifications();
  }, [activeTab, user, fetchReservations, fetchOrders, fetchNotifications]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await clientFetch('/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      setSaveOk(true);
      setSaveMsg(t('profile.settings.saved', 'Settings saved successfully'));
      // Update local storage
      try {
        const raw = localStorage.getItem('ray_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.name = editName;
          parsed.phone = editPhone;
          localStorage.setItem('ray_user', JSON.stringify(parsed));
          setUser(parsed);
        }
      } catch {}
    } catch {
      setSaveOk(false);
      setSaveMsg(t('profile.settings.saveFailed', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/clear-cookie', { method: 'POST' }); } catch {}
    try { localStorage.removeItem('ray_token'); localStorage.removeItem('ray_user'); } catch {}
    window.dispatchEvent(new Event('auth-change'));
    router.replace(`/${locale}`);
  };

  const statusBadge = (status: string) => {
    const s = String(status || '').toLowerCase();
    let cls = 'bg-yellow-100 text-yellow-700';
    let icon = <Clock size={12} />;
    if (s === 'confirmed' || s === 'completed' || s === 'delivered') { cls = 'bg-green-100 text-green-700'; icon = <CheckCircle2 size={12} />; }
    else if (s === 'cancelled' || s === 'rejected') { cls = 'bg-red-100 text-red-700'; icon = <XCircle size={12} />; }
    else if (s === 'pending') { cls = 'bg-yellow-100 text-yellow-700'; icon = <Clock size={12} />; }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cls}`}>
        {icon} {status}
      </span>
    );
  };

  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'reservations', label: t('profile.tabs.reservations', 'Reservations'), icon: <Clock size={16} /> },
    { key: 'orders', label: t('profile.tabs.orders', 'Orders'), icon: <Package size={16} /> },
    { key: 'notifications', label: t('profile.tabs.notifications', 'Notifications'), icon: <Bell size={16} /> },
    { key: 'settings', label: t('profile.tabs.settings', 'Settings'), icon: <Settings size={16} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir={dir}>
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      </div>
    );
  }

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold ${isRtl ? 'text-right' : 'text-left'}`;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      {/* Profile Header */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 mb-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
        <div className={`flex items-center gap-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-100" />
            <User className="relative z-10 text-white" size={32} />
          </div>
          <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-black tracking-tight">{user?.name || t('profile.noName', 'User')}</h1>
            <p className="text-slate-400 font-bold text-sm">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
            title={t('common.logout', 'Log Out')}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 mb-8 overflow-x-auto pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-2xl'
                : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
        {/* Reservations */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4">{t('profile.reservations.title', 'My Reservations')}</h2>
            {resLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">{t('profile.reservations.empty', 'No reservations yet')}</p>
              </div>
            ) : (
              reservations.map((r) => (
                <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="font-black text-sm">{r.productName || r.notes || `#${r.id.slice(0,8)}`}</p>
                    <p className="text-slate-400 text-xs font-bold">{r.shopName || ''}</p>
                    {r.date && <p className="text-slate-400 text-xs mt-1">{r.date} {r.time || ''}</p>}
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4">{t('profile.orders.title', 'My Orders')}</h2>
            {ordLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">{t('profile.orders.empty', 'No orders yet')}</p>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <p className="font-black text-sm">{t('profile.orders.orderNum', 'Order')} #{o.id.slice(0,8)}</p>
                      <p className="text-slate-400 text-xs font-bold">{o.shopName || ''}</p>
                    </div>
                    <div className="text-right">
                      {statusBadge(o.status)}
                      {o.total != null && <p className="text-sm font-black mt-1">{t('common.currency', 'EGP')} {o.total}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black mb-4">{t('profile.notifications.title', 'Notifications')}</h2>
            {notLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">{t('profile.notifications.empty', 'No notifications')}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-white border-slate-100' : 'bg-[#00E5FF]/5 border-[#00E5FF]/20'}`}>
                  <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {!n.read && <div className="w-2 h-2 bg-[#00E5FF] rounded-full mt-2 shrink-0" />}
                    <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <p className="font-black text-sm">{n.title || n.type || t('profile.notifications.untitled', 'Notification')}</p>
                      <p className="text-slate-400 text-xs font-bold mt-1">{n.message}</p>
                      {n.createdAt && <p className="text-slate-300 text-[10px] font-bold mt-2">{new Date(n.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black mb-4">{t('profile.settings.title', 'Account Settings')}</h2>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('profile.settings.nameLabel', 'NAME')}
                </label>
                <div className="relative">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputCls}
                    placeholder={t('profile.settings.namePlaceholder', 'Your name')}
                  />
                  <Edit3 className={`absolute top-1/2 -translate-y-1/2 text-slate-300 ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('profile.settings.phoneLabel', 'PHONE')}
                </label>
                <div className="relative">
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={inputCls}
                    placeholder="01xxxxxxxxx"
                    inputMode="tel"
                  />
                  <Edit3 className={`absolute top-1/2 -translate-y-1/2 text-slate-300 ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('profile.settings.emailLabel', 'EMAIL')}
                </label>
                <input
                  value={user?.email || ''}
                  disabled
                  className={`${inputCls} opacity-50 cursor-not-allowed`}
                />
              </div>

              {saveMsg && (
                <p className={`text-sm font-bold ${saveOk ? 'text-green-500' : 'text-red-500'}`}>
                  {saveMsg}
                </p>
              )}

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {saving ? t('profile.settings.saving', 'Saving...') : t('profile.settings.save', 'Save Changes')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
