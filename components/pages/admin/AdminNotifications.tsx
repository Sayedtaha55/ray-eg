import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const AdminNotifications: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [list, unread] = await Promise.all([
        ApiService.getMyNotifications({ take: 50, skip: 0 }),
        ApiService.getMyUnreadNotificationsCount(),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setUnreadCount(Math.max(0, Number(unread?.count || 0)));
    } catch (e: any) {
      addToast(e?.message || 'فشل تحميل الإشعارات', 'error');
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markAllRead = async () => {
    try {
      await ApiService.markMyNotificationsRead();
      await loadData(true);
      addToast('تم تعليم كل الإشعارات كمقروءة', 'success');
    } catch (e: any) {
      addToast(e?.message || 'فشل تحديث الإشعارات', 'error');
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await ApiService.markMyNotificationRead(id);
      setItems((prev) => prev.map((n) => (String(n?.id) === String(id) ? { ...n, isRead: true, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e: any) {
      addToast(e?.message || 'فشل تعليم الإشعار كمقروء', 'error');
    }
  };

  const normalized = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.map((n: any) => {
      const isRead = Boolean(n?.isRead ?? n?.is_read);
      const message = String(n?.content || n?.message || '').trim();
      const createdAtRaw = n?.createdAt || n?.created_at;
      const createdAt = new Date(createdAtRaw || 0);
      const createdAtText = !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString('ar-EG') : '';
      const title = String(n?.title || '').trim();
      const type = String(n?.type || '').trim();
      return { ...n, isRead, message, createdAtText, title, type };
    });
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <Bell size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white">الإشعارات</h2>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-200">
                غير مقروء: {unreadCount.toLocaleString('ar-EG')}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold">إشعارات حساب الأدمن</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-slate-900 border border-white/5 text-slate-200 hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            تحديث
          </button>

          <button
            onClick={markAllRead}
            disabled={loading || refreshing || unreadCount === 0}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 disabled:opacity-60 flex items-center gap-2"
          >
            <Check size={16} />
            تعليم الكل كمقروء
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 text-slate-400 font-bold flex items-center gap-3">
          <Loader2 className="animate-spin" size={18} />
          جاري تحميل الإشعارات...
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
          {normalized.length === 0 ? (
            <div className="p-10 text-slate-500 font-bold">لا توجد إشعارات حالياً.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {normalized.map((n: any) => (
                <div key={String(n?.id)} className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-slate-700' : 'bg-amber-400'}`} />
                      <div className="text-slate-200 font-black text-sm">
                        {n.title || n.type || 'إشعار'}
                      </div>
                      <div className="text-slate-600 font-bold text-xs">{n.createdAtText}</div>
                    </div>
                    <div className={`mt-2 text-sm font-bold leading-7 ${n.isRead ? 'text-slate-500' : 'text-slate-200'}`}>
                      {n.message || '—'}
                    </div>
                  </div>

                  {!n.isRead ? (
                    <button
                      onClick={() => markOneRead(String(n?.id))}
                      className="px-4 py-2 rounded-2xl text-xs font-black bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
                    >
                      تعليم كمقروء
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
