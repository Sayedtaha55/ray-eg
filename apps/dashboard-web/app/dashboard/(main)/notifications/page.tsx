'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, CheckCheck, Loader2, BellOff,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type Notification = {
  id: string;
  title?: string;
  body?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
  type?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, countRes] = await Promise.allSettled([
        apiRequest('/notifications/me?take=50'),
        apiRequest('/notifications/me/unread-count'),
      ]);
      if (listRes.status === 'fulfilled') {
        const data = listRes.value;
        const list = Array.isArray(data) ? data : (data?.notifications || data?.data || []);
        setNotifications(Array.isArray(list) ? list : []);
      }
      if (countRes.status === 'fulfilled') {
        setUnreadCount(Number(countRes.value?.count || countRes.value || 0));
      }
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await apiRequest('/notifications/me/read', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الإشعارات');
    }
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await apiRequest(`/notifications/me/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Bell size={24} className="text-[#00E5FF]" />
          </div>
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإشعارات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات غير مقروءة'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
          >
            <CheckCheck size={18} />
            <span>تعليم الكل كمقروء</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BellOff size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all cursor-pointer ${
                  isUnread ? 'border-[#00E5FF]/30 bg-cyan-50/30' : 'border-slate-200'
                }`}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
              >
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isUnread ? 'bg-[#00E5FF]' : 'bg-transparent'}`} />
                  <div className="flex-1 text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      {notif.title || notif.message || 'إشعار'}
                    </div>
                    {notif.body && (
                      <div className="text-xs text-slate-500 mt-1">{notif.body}</div>
                    )}
                    {notif.createdAt && (
                      <div className="text-[10px] text-slate-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString('ar-EG')}
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
  );
}
