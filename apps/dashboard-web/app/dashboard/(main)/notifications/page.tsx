'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Bell, CheckCheck, BellOff, ShoppingBag, Store,
  Volume2, VolumeX, RefreshCw, AlertTriangle, Info,
  Trash2, Search, X,
} from 'lucide-react';
import { useOrderBell } from '@/hooks/useOrderBell';
import { apiRequest } from '@/lib/auth';

type TabKey = 'all' | 'orders' | 'unread';

type Notif = {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  read: boolean;
  created_at: string;
  source: 'pos' | 'website' | null;
};

function normalizeNotif(n: any): Notif {
  const type = (n?.type || '').toUpperCase();
  let source: 'pos' | 'website' | null = null;
  if (type === 'NEW_ORDER') {
    const src = n?.metadata?.order_source || n?.meta?.order_source;
    source = src === 'pos' ? 'pos' : 'website';
  }
  return {
    id: String(n?.id ?? ''),
    title: n?.title || 'إشعار',
    content: n?.content ?? n?.body ?? (n?.message || ''),
    type,
    priority: n?.priority || 'MEDIUM',
    read: Boolean(n?.read ?? n?.is_read),
    created_at: n?.created_at ?? n?.createdAt ?? (n?.sent_at || ''),
    source,
  };
}

function priorityStyle(p: string) {
  switch (p.toUpperCase()) {
    case 'URGENT': return { badge: 'bg-red-100 text-red-700 border-red-200', label: 'عاجل' };
    case 'HIGH': return { badge: 'bg-orange-100 text-orange-700 border-orange-200', label: 'مهم' };
    case 'MEDIUM': return { badge: 'bg-slate-100 text-slate-600 border-slate-200', label: 'عادي' };
    default: return { badge: 'bg-slate-100 text-slate-500 border-slate-200', label: 'منخفض' };
  }
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  if (m < 1440) return `منذ ${Math.floor(m / 60)} ساعة`;
  const d = Math.floor(m / 1440);
  return `منذ ${d} ${d === 1 ? 'يوم' : 'أيام'}`;
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

  const [tab, setTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const notifications = useMemo(() => rawList.map(normalizeNotif), [rawList]);

  const filtered = useMemo(() => {
    let list = notifications;
    if (tab === 'orders') list = list.filter((n) => n.source !== null);
    if (tab === 'unread') list = list.filter((n) => !n.read);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, tab, searchQuery]);

  const ordersCount = useMemo(
    () => notifications.filter((n) => n.source !== null).length,
    [notifications]
  );

  const handleRefresh = useCallback(async () => {
    try { await refresh(); } catch { /* silent */ }
  }, [refresh]);

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    try {
      await apiRequest(`/notifications/me/${id}`, { method: 'DELETE' });
      await refresh();
    } catch { /* silent */ }
    finally { setDeleting(null); }
  }, [refresh]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: notifications.length },
    { key: 'orders', label: 'الطلبات', count: ordersCount },
    { key: 'unread', label: 'غير مقروء', count: unreadCount },
  ];
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
            <Bell size={26} className="text-[#00E5FF]" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإشعارات</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'لا توجد إشعارات جديدة'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSound} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${soundOn ? 'border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00B8CC]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{soundOn ? 'الصوت مفعل' : 'الصوت مغلق'}</span>
          </button>
          <button onClick={handleRefresh} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all" title="تحديث">
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all">
              <CheckCheck size={16} />
              <span>قراءة الكل</span>
            </button>
          )}
        </div>
      </div>
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="بحث في الإشعارات..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm font-medium outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/10 transition-all" />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${tab === t.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
            {t.label}
            {t.count > 0 && (
              <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${tab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BellOff size={32} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-400">لا توجد إشعارات</p>
          <p className="text-sm text-slate-400 mt-1">{searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ستظهر الإشعارات الجديدة هنا'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const isUnread = !notif.read;
            const prio = priorityStyle(notif.priority);
            return (
              <div key={notif.id} className={`group bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${notif.source === 'pos' ? 'border-r-4 border-r-amber-400' : notif.source === 'website' ? 'border-r-4 border-r-[#00E5FF]' : isUnread ? 'border-[#00E5FF]/30 bg-cyan-50/20' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${notif.source === 'pos' ? 'bg-amber-100' : notif.source === 'website' ? 'bg-slate-900' : notif.priority === 'URGENT' || notif.priority === 'HIGH' ? 'bg-red-100' : 'bg-slate-100'}`}>
                    {notif.source === 'pos' ? <Store size={18} className="text-amber-600" /> : notif.source === 'website' ? <ShoppingBag size={18} className="text-[#00E5FF]" /> : notif.priority === 'URGENT' || notif.priority === 'HIGH' ? <AlertTriangle size={18} className="text-red-500" /> : <Info size={18} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => isUnread && markRead(notif.id)} className={`font-bold text-sm ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notif.title}
                      </button>
                      {notif.source === 'pos' && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-black">نقطة البيع</span>}
                      {notif.source === 'website' && <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-700 text-[10px] font-black">من الموقع</span>}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${prio.badge}`}>{prio.label}</span>
                    </div>
                    {notif.content && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.content}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {notif.created_at && <span className="text-[11px] font-medium text-slate-400">{timeAgo(notif.created_at)}</span>}
                      {isUnread && <button onClick={() => markRead(notif.id)} className="text-[11px] font-bold text-[#00B8CC] hover:text-[#00E5FF] transition-colors">تحديد كمقروء</button>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(notif.id)} disabled={deleting === notif.id} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50" title="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
