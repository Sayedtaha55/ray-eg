import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/api.service';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface UseNotificationsOptions {
  userId?: string;
  shopId?: string;
  autoConnect?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const { userId, shopId, autoConnect = true } = options;

  useEffect(() => {
    if (!autoConnect || !userId) return;

    setIsConnected(true);

    const loadInitial = async () => {
      try {
        const data = await ApiService.getMyNotifications({ take: 50, skip: 0 });
        const normalized = (data || []).map((n: any) => ({
          id: String(n.id),
          title: String(n.title || ''),
          content: String(n.content || ''),
          type: String(n.type || ''),
          priority: String(n.priority || 'MEDIUM'),
          isRead: Boolean(n.isRead ?? n.is_read),
          createdAt: String(n.createdAt || n.created_at || new Date().toISOString()),
          metadata: n.metadata,
        }));
        setNotifications(normalized);
        setUnreadCount(normalized.filter((x: any) => !x.isRead).length);
      } catch {
      }
    };

    loadInitial();

    return () => {
      setIsConnected(false);
    };
  }, [userId, shopId, autoConnect]);

  const markAsRead = useCallback((notificationId: string) => {
    (async () => {
      try {
        await ApiService.markMyNotificationRead(notificationId);
      } catch {
      }
    })();
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await ApiService.markMyNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const refreshUnreadCount = useCallback(() => {
    (async () => {
      try {
        const res = await ApiService.getMyUnreadNotificationsCount();
        setUnreadCount(Number(res?.count || 0));
      } catch {
      }
    })();
  }, []);

  const fetchNotifications = useCallback(async (take = 50, skip = 0) => {
    try {
      const data = await ApiService.getMyNotifications({ take, skip });
      const normalized = (data || []).map((n: any) => ({
        id: String(n.id),
        title: String(n.title || ''),
        content: String(n.content || ''),
        type: String(n.type || ''),
        priority: String(n.priority || 'MEDIUM'),
        isRead: Boolean(n.isRead ?? n.is_read),
        createdAt: String(n.createdAt || n.created_at || new Date().toISOString()),
        metadata: n.metadata,
      }));
      setNotifications(normalized);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
    fetchNotifications,
  };
};

export const useShopNotifications = (shopId: string) => {
  const [shopNotifications, setShopNotifications] = useState<Notification[]>([]);
  const [shopUnreadCount, setShopUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (!shopId) return;
    setIsConnected(true);

    const sub = ApiService.subscribeToNotifications(shopId, (notif: any) => {
      const next = {
        id: String(notif.id),
        title: String(notif.title || ''),
        content: String(notif.message || notif.content || ''),
        type: String(notif.type || ''),
        priority: String(notif.priority || 'MEDIUM'),
        isRead: Boolean(notif.is_read ?? notif.isRead),
        createdAt: String(notif.created_at || notif.createdAt || new Date().toISOString()),
        metadata: notif.metadata,
      };

      const nid = String(next.id || '').trim();
      if (!nid) return;

      let isNew = false;
      setShopNotifications((prev) => {
        const exists = prev.some((x) => String(x.id) === nid);
        if (exists) return prev;
        isNew = true;
        return [next, ...prev];
      });

      if (isNew && !next.isRead) {
        setShopUnreadCount((prev) => prev + 1);
      }
    });
    setSubscription(sub);

    return () => {
      try {
        sub?.unsubscribe?.();
      } catch {
      }
      setSubscription(null);
      setIsConnected(false);
    };
  }, [shopId]);

  const fetchShopNotifications = useCallback(async (take = 50, skip = 0) => {
    try {
      const data = await ApiService.getNotifications(shopId);
      const normalized = (data || []).slice(skip, skip + take).map((n: any) => ({
        id: String(n.id),
        title: String(n.title || ''),
        content: String(n.message || n.content || ''),
        type: String(n.type || ''),
        priority: String(n.priority || 'MEDIUM'),
        isRead: Boolean(n.is_read ?? n.isRead),
        createdAt: String(n.created_at || n.createdAt || new Date().toISOString()),
        metadata: n.metadata,
      }));
      setShopNotifications(normalized);
    } catch (error) {
      console.error('Failed to fetch shop notifications:', error);
    }
  }, [shopId]);

  const markShopNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await ApiService.markShopNotificationRead(shopId, notificationId);
      setShopNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setShopUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark shop notification as read:', error);
    }
  }, [shopId]);

  const markAllShopNotificationsAsRead = useCallback(async () => {
    try {
      await ApiService.markNotificationsRead(shopId);
      setShopNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setShopUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all shop notifications as read:', error);
    }
  }, [shopId]);

  return {
    shopNotifications,
    shopUnreadCount,
    isConnected,
    fetchShopNotifications,
    markShopNotificationAsRead,
    markAllShopNotificationsAsRead,
  };
};
