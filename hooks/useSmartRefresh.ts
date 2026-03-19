/**
 * Smart Event-Driven Refresh System
 * 
 * Combines:
 * 1. WebSocket real-time updates (instant, like global apps)
 * 2. Notification-based triggers - when a new notification arrives
 * 3. Event-driven updates - dispatch specific events for specific data changes
 * 4. Cross-tab sync - use BroadcastChannel for multi-tab coordination
 * 
 * This prevents disruptive full-page refreshes and only updates what's needed.
 */

import { useEffect, useRef, useCallback } from 'react';
import { ApiService } from '../services/api.service';
import { useRealtime, useRealtimeRefresh } from './useRealtime';

export type RefreshScope = 
  | 'orders' 
  | 'products' 
  | 'shop' 
  | 'analytics' 
  | 'notifications'
  | 'reservations'
  | 'messages'
  | 'all';

export interface SmartRefreshOptions {
  shopId?: string;
  userId?: string;
  role?: string;
  scopes?: RefreshScope[];
  enabled?: boolean;
  onRefresh?: (scope: RefreshScope) => void;
  /** Use WebSocket for instant updates (default: true when available) */
  useWebSocket?: boolean;
  /** Token for WebSocket authentication */
  token?: string;
}

// Map notification types to refresh scopes
const NOTIFICATION_TYPE_TO_SCOPE: Record<string, RefreshScope> = {
  NEW_ORDER: 'orders',
  ORDER_CONFIRMED: 'orders',
  ORDER_STATUS_CHANGED: 'orders',
  ORDER_DELIVERED: 'orders',
  ORDER_CANCELLED: 'orders',
  NEW_MESSAGE: 'messages',
  LOW_STOCK: 'products',
  PROMOTIONAL_OFFER: 'products',
  PAYMENT_RECEIVED: 'orders',
  NEW_FOLLOWER: 'shop',
  SHOP_VISIT: 'analytics',
  RESERVATION: 'reservations',
};

// Global state for tracking last notification IDs per context
const lastNotificationIds = new Map<string, string>();

/**
 * Hook for smart, event-driven data refresh
 * 
 * Usage:
 * ```tsx
 * useSmartRefresh({
 *   shopId: currentShop?.id,
 *   role: user?.role,
 *   scopes: ['orders', 'products'],
 *   onRefresh: (scope) => {
 *     if (scope === 'orders') refetchOrders();
 *     if (scope === 'products') refetchProducts();
 *   }
 * });
 * ```
 */
export function useSmartRefresh(options: SmartRefreshOptions) {
  const {
    shopId,
    userId,
    role,
    scopes = ['all'],
    enabled = true,
    onRefresh,
    useWebSocket = true,
    token,
  } = options;

  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const scopesRef = useRef(scopes);
  scopesRef.current = scopes;

  // Check if a scope should trigger refresh
  const shouldRefresh = useCallback((scope: RefreshScope): boolean => {
    if (scopesRef.current.includes('all')) return true;
    return scopesRef.current.includes(scope);
  }, []);

  // Trigger refresh for a specific scope
  const triggerRefresh = useCallback((scope: RefreshScope) => {
    if (shouldRefresh(scope)) {
      onRefreshRef.current?.(scope);
      
      // Also dispatch custom event for components that listen to it
      window.dispatchEvent(new CustomEvent('ray-smart-refresh', {
        detail: { scope, shopId, userId, timestamp: Date.now() }
      }));
    }
  }, [shouldRefresh, shopId, userId]);

  // 1. WebSocket real-time connection (instant updates)
  useRealtime({
    token,
    enabled: enabled && useWebSocket && !!shopId,
    onRefreshTrigger: (data) => {
      if (shouldRefresh(data.scope as RefreshScope)) {
        triggerRefresh(data.scope as RefreshScope);
      }
    },
    onOrderNew: () => {
      if (shouldRefresh('orders')) {
        triggerRefresh('orders');
      }
    },
    onOrderUpdated: () => {
      if (shouldRefresh('orders')) {
        triggerRefresh('orders');
      }
    },
    onProductUpdated: () => {
      if (shouldRefresh('products')) {
        triggerRefresh('products');
      }
    },
    onShopUpdated: () => {
      if (shouldRefresh('shop')) {
        triggerRefresh('shop');
      }
    },
    onNotification: (notification) => {
      const type = String(notification?.type || '').toUpperCase();
      const scope = NOTIFICATION_TYPE_TO_SCOPE[type] || 'all';
      if (shouldRefresh(scope)) {
        triggerRefresh(scope);
      }
    },
    onStockLow: () => {
      if (shouldRefresh('products')) {
        triggerRefresh('products');
      }
    },
    onReservationUpdated: () => {
      if (shouldRefresh('reservations')) {
        triggerRefresh('reservations');
      }
    },
    onMessage: () => {
      if (shouldRefresh('messages')) {
        triggerRefresh('messages');
      }
    },
  });

  useEffect(() => {
    if (!enabled) return;
    
    // Skip polling-based notification subscription if WebSocket is enabled
    if (useWebSocket && shopId && (role === 'merchant' || role === 'admin')) {
      // WebSocket handles real-time updates, no need for polling
      return;
    }

    // 2. Fallback: Subscribe to notification-based refresh triggers (polling)
    let notificationSub: { unsubscribe: () => void } | null = null;
    
    if (shopId && (role === 'merchant' || role === 'admin')) {
      notificationSub = ApiService.subscribeToNotifications(shopId, (notification: any) => {
        const type = String(notification?.type || '').toUpperCase();
        const scope = NOTIFICATION_TYPE_TO_SCOPE[type] || 'all';
        
        // Prevent duplicate refreshes for same notification
        const notifId = String(notification?.id || '');
        const key = `${shopId}:${type}`;
        if (notifId && lastNotificationIds.get(key) === notifId) {
          return;
        }
        lastNotificationIds.set(key, notifId);
        
        triggerRefresh(scope);
      });
    }

    // 3. Listen for explicit refresh events from other parts of the app
    const handleDbUpdate = () => {
      scopesRef.current.forEach(scope => {
        if (scope !== 'all') {
          triggerRefresh(scope as RefreshScope);
        }
      });
    };

    const handleOrdersUpdated = () => {
      triggerRefresh('orders');
    };

    const handleProductsUpdated = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!shopId || !detail?.shopId || detail.shopId === shopId) {
        triggerRefresh('products');
      }
    };

    const handleSmartRefresh = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.shopId && shopId && detail.shopId !== shopId) return;
      if (detail?.userId && userId && detail.userId !== userId) return;
    };

    window.addEventListener('ray-db-update', handleDbUpdate);
    window.addEventListener('orders-updated', handleOrdersUpdated);
    window.addEventListener('ray-products-updated', handleProductsUpdated);
    window.addEventListener('ray-smart-refresh', handleSmartRefresh);

    // 4. Cross-tab synchronization via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('ray-db');
        bc.onmessage = (event) => {
          const { ts, scope: bcScope, shopId: bcShopId } = event.data || {};
          if (bcScope && shouldRefresh(bcScope)) {
            if (!shopId || !bcShopId || bcShopId === shopId) {
              triggerRefresh(bcScope);
            }
          }
        };
      }
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      notificationSub?.unsubscribe();
      window.removeEventListener('ray-db-update', handleDbUpdate);
      window.removeEventListener('orders-updated', handleOrdersUpdated);
      window.removeEventListener('ray-products-updated', handleProductsUpdated);
      window.removeEventListener('ray-smart-refresh', handleSmartRefresh);
      bc?.close();
    };
  }, [enabled, shopId, userId, role, triggerRefresh, shouldRefresh, useWebSocket]);

  return {
    triggerRefresh,
  };
}

/**
 * Utility to dispatch a smart refresh event
 * Call this after mutations to trigger targeted refreshes
 */
export function dispatchSmartRefresh(scope: RefreshScope, context?: { shopId?: string; userId?: string }) {
  try {
    window.dispatchEvent(new CustomEvent('ray-smart-refresh', {
      detail: { 
        scope, 
        shopId: context?.shopId, 
        userId: context?.userId, 
        timestamp: Date.now() 
      }
    }));

    // Also broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('ray-db');
      bc.postMessage({ 
        ts: Date.now(), 
        scope, 
        shopId: context?.shopId 
      });
      bc.close();
    }
  } catch {
    // ignore
  }
}

/**
 * Hook to listen for smart refresh events in components
 * Use this in components that need to refresh data based on events
 */
export function useSmartRefreshListener(
  scopes: RefreshScope[],
  callback: (scope: RefreshScope) => void,
  options?: { enabled?: boolean; shopId?: string }
) {
  const { enabled = true, shopId } = options || {};
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const scopesRef = useRef(scopes);
  scopesRef.current = scopes;

  useEffect(() => {
    if (!enabled) return;

    const handleRefresh = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const scope = detail?.scope as RefreshScope;
      
      if (!scope) return;
      if (!scopesRef.current.includes('all') && !scopesRef.current.includes(scope)) return;
      if (shopId && detail?.shopId && detail.shopId !== shopId) return;
      
      callbackRef.current(scope);
    };

    window.addEventListener('ray-smart-refresh', handleRefresh);
    return () => window.removeEventListener('ray-smart-refresh', handleRefresh);
  }, [enabled, shopId]);
}

export default useSmartRefresh;
