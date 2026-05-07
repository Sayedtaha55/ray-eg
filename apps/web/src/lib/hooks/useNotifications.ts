'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as merchantApi from '@/lib/api/merchant';

export interface ShopNotification {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const normalizeNotification = (n: any): ShopNotification => ({
  id: String(n.id || ''),
  title: String(n.title || ''),
  content: String(n.message || n.content || ''),
  type: String(n.type || ''),
  priority: String(n.priority || 'MEDIUM'),
  isRead: Boolean(n.is_read ?? n.isRead),
  createdAt: String(n.created_at || n.createdAt || new Date().toISOString()),
  metadata: n.metadata,
});

export const useShopNotifications = (shopId: string | undefined) => {
  const [notifications, setNotifications] = useState<ShopNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const shownBrowserNotificationIdsRef = useRef<Set<string>>(new Set());

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!shopId) return;
    try {
      const data = await merchantApi.merchantGetNotifications(shopId);
      const normalized = (data || []).map(normalizeNotification).filter(n => n.id);
      // Dedupe
      const seen = new Set<string>();
      const uniq: ShopNotification[] = [];
      for (const n of normalized) {
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        uniq.push(n);
      }
      setNotifications(uniq);
      setUnreadCount(uniq.filter(n => !n.isRead).length);
    } catch {}
  }, [shopId]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!shopId) return;
    try {
      await merchantApi.merchantMarkNotificationRead(shopId, notificationId);
    } catch {}
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [shopId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!shopId) return;
    try {
      await merchantApi.merchantMarkAllNotificationsRead(shopId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, [shopId]);

  // SSE realtime subscription
  useEffect(() => {
    if (!shopId) return;

    fetchNotifications();

    let es: EventSource | null = null;
    try {
      const esUrl = `/api/v1/notifications/stream?shopId=${shopId}`;
      es = new EventSource(esUrl);
      eventSourceRef.current = es;

      es.onopen = () => setIsConnected(true);
      es.onerror = () => setIsConnected(false);

      es.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const notif = normalizeNotification(raw);
          if (!notif.id) return;

          setNotifications(prev => {
            if (prev.some(n => n.id === notif.id)) return prev;
            return [notif, ...prev];
          });

          if (!notif.isRead) {
            setUnreadCount(prev => prev + 1);
          }

          // Browser notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted' &&
            !shownBrowserNotificationIdsRef.current.has(notif.id)
          ) {
            shownBrowserNotificationIdsRef.current.add(notif.id);
            const metaSource = String(notif.metadata?.source || '').toLowerCase();
            if (metaSource !== 'pos' && metaSource !== 'cashier') {
              const bn = new Notification(notif.title || 'New Notification', {
                body: notif.content,
                tag: `shop-notification-${notif.id}`,
                icon: '/favicon.ico',
              });
              bn.onclick = () => { try { window.focus(); } catch {} };
            }
          }
        } catch {}
      };
    } catch {
      // SSE not supported, polling fallback
    }

    // Fallback: poll every 30s if SSE fails
    const pollInterval = setInterval(() => {
      if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      try { es?.close(); } catch {}
      eventSourceRef.current = null;
      setIsConnected(false);
      clearInterval(pollInterval);
    };
  }, [shopId, fetchNotifications]);

  // Request browser notification permission
  useEffect(() => {
    if (!shopId) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const ask = () => {
      try {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
      } catch {}
    };

    window.addEventListener('pointerdown', ask as any, { once: true } as any);
    return () => {
      try { window.removeEventListener('pointerdown', ask as any); } catch {}
    };
  }, [shopId]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};
