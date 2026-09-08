'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Bell, CheckCheck, BellOff, ShoppingBag, Store,
  Volume2, VolumeX, RefreshCw, AlertTriangle, Info,
} from 'lucide-react';
import { useOrderBell } from '@/hooks/useOrderBell';

type TabKey = 'all' | 'orders' | 'unread';

type Notif = ReturnType<typeof normalizeNotif>;

function normalizeNotif(n: any) {
  return {
    id: String(n?.id ?? ''),
    title: n?.title,
    content: n?.content ?? n?.body ?? n?.message,
    type: n?.type,
    priority: n?.priority,
    read: Boolean(n?.read ?? n?.is_read),
    created_at: n?.created_at ?? n?.createdAt ?? n?.sent_at,
    metadata: n?.metadata ?? n?.meta ?? {},
  };
}

function sourceOf(n: Notif): 'pos' | 'website' | null {
  if ((n.type || '').toUpperCase() !== 'NEW_ORDER') return null;
  return n.metadata?.order_source === 'pos' ? 'pos' : 'website';
}

function priorityStyle(p?: string) {
  switch ((p || '').toUpperCase()) {
    case 'URGENT':
      return { badge: 'bg-red-100 text-red-700', label: 'عاجل' };
    case 'HIGH':
      return { badge: 'bg-orange-100 text-orange-700', label: 'مهم' };
    case 'MEDIUM':
      return { badge: 'bg-slate-100 text-slate-600', label: 'عادي' };
    default:
      return { badge: 'bg-slate-100 text-slate-500', label: 'منخفض' };
  }
}

export default function NotificationsPage() {
  const {
    notifications: rawList,
    unreadCount,
    soundOn,
    toggleSound,
    refresh,
    markAllRead,
    markRead,
  } = useOrderBell();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const notifications = useMemo(() => rawList.map(normalizeNotif), [rawList]);

  const filtered = useMemo(() => {
    if (tab === 'orders') return notifications.filter((n) => sourceOf(n) !== null);
    if (tab === 'unread') return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, tab]);

  const ordersCount = useMemo(
    () => notifications.filter((n) => sourceOf(n) !== null).length,
    [notifications]
  );

  const handleRefresh = useCallback(async () => {
    setError('');
    try {
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الإشعارات');
    }
  }, [refresh]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="relative w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Bell size={24} className="text-[#00E5FF]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإشعارات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات غير مقروءة'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-row-reverse flex-wrap">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              soundOn ? 'border-[#00E5FF]/40 bg-cyan-50 text-slate-800' : 'border-slate-200 text-slate-400'
            }`}
            title={soundOn ? 'إيقاف صوت الرنة' : 'تشغيل صوت الرنة'}
          >
            {soundOn ? <Volume2 size={16} className="text-[#00E5FF]" /> : <VolumeX size={16} />}
            <span>{soundOn ? 'الرنة مفعّلة' : 'الرنة مغلقة'}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
            title="تحديث"
          >
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
            >
              <CheckCheck size={18} />
              <span>تعليم الكل كمقروء</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-row-reverse flex-wrap">
        {([
          { key: 'all', label: 'الكل', count: notifications.length },
          { key: 'orders', label: 'الطلبات الجديدة', count: ordersCount },
          { key: 'unread', label: 'غير مقروء', count: unreadCount },
        ] as { key: TabKey; label: string; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              tab === t.key
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 rounded-md text-[11px] ${
                tab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BellOff size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد إشعارات هنا</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const isUnread = !notif.read;
            const src = sourceOf(notif);
            const prio = priorityStyle(notif.priority);
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all cursor-pointer ${
                  src === 'pos'
                    ? 'border-r-4 border-r-amber-400'
                    : src === 'website'
                    ? 'border-r-4 border-r-[#00E5FF]'
                    : ''
                } ${isUnread ? 'border-[#00E5FF]/30 bg-cyan-50/30' : 'border-slate-200'}`}
                onClick={() => !notif.read && markRead(notif.id)}
              >
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      src === 'pos'
                        ? 'bg-amber-100'
                        : src === 'website'
                        ? 'bg-slate-900'
                        : 'bg-slate-100'
                    }`}
                  >
                    {src === 'pos' ? (
                      <Store size={18} className="text-amber-600" />
                    ) : src === 'website' ? (
                      <ShoppingBag size={18} className="text-[#00E5FF]" />
                    ) : prio.label === 'عاجل' || prio.label === 'مهم' ? (
                      <AlertTriangle size={18} className="text-orange-500" />
                    ) : (
                      <Info size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <div className="font-bold text-slate-900 text-sm">{notif.title || 'إشعار'}</div>
                      {src === 'pos' && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black">
                          نقطة البيع / الكاشير
                        </span>
                      )}
                      {src === 'website' && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-700 text-[10px] font-black">
                          طلب من الموقع
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${prio.badge}`}>
                        {prio.label}
                      </span>
                    </div>
                    {notif.content && (
                      <div className="text-xs text-slate-500 mt-1">{notif.content}</div>
                    )}
                    <div className="flex items-center gap-2 justify-end mt-2">
                      {notif.created_at && (
                        <div className="text-[10px] text-slate-400">
                          {new Date(notif.created_at).toLocaleString('ar-EG')}
                        </div>
                      )}
                      {isUnread && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
