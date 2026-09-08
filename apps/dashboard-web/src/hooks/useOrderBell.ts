'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/auth';

export type BellNotification = {
  id: string;
  title?: string;
  content?: string;
  body?: string;
  message?: string;
  type?: string;
  priority?: string;
  read?: boolean;
  is_read?: boolean;
  created_at?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type OrderBellEvent = {
  id: string;
  source: 'pos' | 'website';
  title: string;
  body: string;
};

const POLL_MS = 12_000;
const SOUND_ENABLED_KEY = 'ray_sound_enabled';

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(SOUND_ENABLED_KEY) !== 'off';
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'on' : 'off');
}

function normalize(n: any): BellNotification {
  return {
    id: String(n?.id ?? ''),
    title: n?.title,
    content: n?.content ?? n?.body ?? n?.message,
    type: n?.type,
    priority: n?.priority,
    read: n?.read ?? n?.is_read ?? false,
    created_at: n?.created_at ?? n?.createdAt ?? n?.sent_at,
    metadata: n?.metadata ?? n?.meta ?? {},
  };
}

function orderSourceOf(n: BellNotification): 'pos' | 'website' {
  const src = String(n.metadata?.order_source ?? n.metadata?.source ?? '').toLowerCase();
  if (src === 'pos') return 'pos';
  return 'website';
}

function isRead(n: BellNotification): boolean {
  return Boolean(n.read);
}

/**
 * Polls /notifications/me and fires the right bell when a NEW_ORDER arrives.
 * - website order  → رنة الموقع
 * - pos order      → رنة نقطة البيع
 */
export function useOrderBell(onOrder?: (evt: OrderBellEvent) => void) {
  const [notifications, setNotifications] = useState<BellNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const lastSeenTs = useRef<number>(Date.now());
  const firstLoad = useRef(true);
  const onOrderRef = useRef(onOrder);
  onOrderRef.current = onOrder;

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiRequest('/notifications/me?take=30');
      const raw = Array.isArray(res) ? res : (res?.notifications || res?.data || res?.items || []);
      const list: BellNotification[] = (Array.isArray(raw) ? raw : []).map(normalize);
      setNotifications(list);

      // count unread
      let count = list.filter((n) => !isRead(n)).length;
      try {
        const cnt = await apiRequest('/notifications/me/unread-count');
        const c = Number(cnt?.unread_count ?? cnt?.count ?? cnt ?? 0);
        if (!Number.isNaN(c) && c > 0) count = c;
      } catch {}
      setUnreadCount(count);

      // detect new order notifications created after our last checkpoint
      if (!firstLoad.current) {
        for (const n of list) {
          const ts = n.created_at ? new Date(n.created_at).getTime() : 0;
          if (!ts || ts <= lastSeenTs.current) continue;
          if ((n.type || '').toUpperCase() !== 'NEW_ORDER') continue;
          onOrderRef.current?.({
            id: n.id,
            source: orderSourceOf(n),
            title: n.title || 'طلب جديد',
            body: n.content || '',
          });
        }
      }
      firstLoad.current = false;
      lastSeenTs.current = Date.now();
    } catch {
      // silent — polling shouldn't spam errors
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      setSoundEnabled(!prev);
      return !prev;
    });
  }, []);

  const markAllRead = useCallback(async () => {
    await apiRequest('/notifications/me/read', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const markRead = useCallback(async (id: string) => {
    await apiRequest(`/notifications/me/${id}/read`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  return {
    notifications,
    unreadCount,
    soundOn,
    toggleSound,
    refresh: fetchNotifications,
    markAllRead,
    markRead,
  };
}
