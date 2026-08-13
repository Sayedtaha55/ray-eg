'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Package, Store, Tag, Heart, CheckCircle, Clock,
  Loader2, ArrowLeft, Trash2,
} from 'lucide-react';
import { getStoredAuthToken, jsonRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const NOTIF_ICONS: Record<string, any> = {
  ORDER: Package,
  SHOP: Store,
  OFFER: Tag,
  FOLLOW: Heart,
  SYSTEM: Bell,
};

const NOTIF_COLORS: Record<string, string> = {
  ORDER: 'bg-cyan-500/10 text-cyan-500',
  SHOP: 'bg-purple-500/10 text-purple-500',
  OFFER: 'bg-amber-500/10 text-amber-500',
  FOLLOW: 'bg-red-500/10 text-red-500',
  SYSTEM: 'bg-slate-500/10 text-slate-500',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = getStoredAuthToken();
      if (!token) {
        router.push('/login?returnTo=/notifications');
        return;
      }
      try {
        const data = await jsonRequest<any>('/notifications/me');
        setNotifications(Array.isArray(data) ? data : (data?.items ?? []));
      } catch {}
      setLoading(false);
    })();
  }, [router]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await jsonRequest(`/notifications/me/${id}/read`, { method: 'PATCH' });
    } catch {}
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await jsonRequest('/notifications/me/read', { method: 'PATCH' });
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center">
        <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-brand-cyan" />
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-brand-cyan text-white text-xs font-bold">
              {unreadCount} جديد
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Bell className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg">لا توجد إشعارات</p>
          <p className="text-slate-400 text-sm mt-1">ستظهر هنا إشعارات الطلبات والعروض الجديدة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type] || Bell;
            const colorCls = NOTIF_COLORS[notif.type] || NOTIF_COLORS.SYSTEM;
            const content = (
              <div
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-brand-cyan/5 border-brand-cyan/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{notif.title}</h3>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-cyan flex-shrink-0" />}
                  </div>
                  {notif.body && (
                    <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">{notif.body}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.createdAt)}
                    </span>
                    {!notif.read && (
                      <button
                        onClick={(e) => { e.preventDefault(); markAsRead(notif.id); }}
                        className="text-xs font-bold text-brand-cyan hover:underline mr-auto"
                      >
                        تعليم كمقروء
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} href={notif.link}>
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-cyan">
          <ArrowLeft className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
