/**
 * Real-time WebSocket Hook
 * 
 * Provides instant updates like global apps (Uber, DoorDash, etc.)
 * Replaces polling with persistent WebSocket connection.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RealtimeEvent {
  type: string;
  shopId?: string;
  payload: any;
  timestamp: number;
}

export interface UseRealtimeOptions {
  token?: string;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onOrderNew?: (order: any) => void;
  onOrderUpdated?: (data: { orderId: string; status: string }) => void;
  onProductUpdated?: (data: { productId: string; action: string }) => void;
  onShopUpdated?: (data: { changes: any }) => void;
  onNotification?: (notification: any) => void;
  onRefreshTrigger?: (data: { scope: string; context?: any }) => void;
  onStockLow?: (data: { productId: string; productName: string; currentStock: number }) => void;
  onReservationUpdated?: (data: { reservationId: string; type: string }) => void;
  onMessage?: (message: any) => void;
}

// Global socket instance (shared across hooks)
let globalSocket: Socket | null = null;
let connectionCount = 0;
let reconnectTimer: any = null;

function getSocketUrl(): string {
  // In development, connect to backend directly
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV) {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  }
  // In production, use same origin or configured URL
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

/**
 * Hook for real-time WebSocket connection
 * 
 * Usage:
 * ```tsx
 * useRealtime({
 *   token: userToken,
 *   onOrderNew: (order) => { console.log('New order!', order); },
 *   onRefreshTrigger: (data) => { if (data.scope === 'orders') refetchOrders(); },
 * });
 * ```
 */
export function useRealtime(options: UseRealtimeOptions) {
  const {
    token,
    enabled = true,
    onConnect,
    onDisconnect,
    onError,
    onOrderNew,
    onOrderUpdated,
    onProductUpdated,
    onShopUpdated,
    onNotification,
    onRefreshTrigger,
    onStockLow,
    onReservationUpdated,
    onMessage,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Stable callback refs
  const callbacksRef = useRef({
    onConnect,
    onDisconnect,
    onError,
    onOrderNew,
    onOrderUpdated,
    onProductUpdated,
    onShopUpdated,
    onNotification,
    onRefreshTrigger,
    onStockLow,
    onReservationUpdated,
    onMessage,
  });
  callbacksRef.current = {
    onConnect,
    onDisconnect,
    onError,
    onOrderNew,
    onOrderUpdated,
    onProductUpdated,
    onShopUpdated,
    onNotification,
    onRefreshTrigger,
    onStockLow,
    onReservationUpdated,
    onMessage,
  };

  useEffect(() => {
    if (!enabled || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Use global socket if available and connected
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setIsConnected(true);
      connectionCount++;
      return;
    }

    // Create new socket connection
    const url = getSocketUrl();
    const socket = io(`${url}/realtime`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionId(socket.id);
      globalSocket = socket;
      connectionCount++;
      callbacksRef.current.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionId(null);
      connectionCount = Math.max(0, connectionCount - 1);
      if (connectionCount === 0) {
        globalSocket = null;
      }
      callbacksRef.current.onDisconnect?.();
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected, wait before reconnecting
        reconnectTimer = setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    socket.on('connect_error', (error) => {
      callbacksRef.current.onError?.(error);
    });

    socket.on('error', (error) => {
      callbacksRef.current.onError?.(error);
    });

    socket.on('connected', (data) => {
      setConnectionId(socket.id);
    });

    // Business event handlers
    socket.on('order:new', (data) => {
      callbacksRef.current.onOrderNew?.(data.order);
    });

    socket.on('order:updated', (data) => {
      callbacksRef.current.onOrderUpdated?.({
        orderId: data.orderId,
        status: data.status,
      });
    });

    socket.on('product:updated', (data) => {
      callbacksRef.current.onProductUpdated?.({
        productId: data.productId,
        action: data.action,
      });
    });

    socket.on('shop:updated', (data) => {
      callbacksRef.current.onShopUpdated?.({ changes: data.changes });
    });

    socket.on('notification:new', (data) => {
      callbacksRef.current.onNotification?.(data.notification);
    });

    socket.on('refresh:trigger', (data) => {
      callbacksRef.current.onRefreshTrigger?.({
        scope: data.scope,
        context: data.context,
      });
    });

    socket.on('stock:low', (data) => {
      callbacksRef.current.onStockLow?.(data);
    });

    socket.on('reservation:updated', (data) => {
      callbacksRef.current.onReservationUpdated?.(data);
    });

    socket.on('message:new', (data) => {
      callbacksRef.current.onMessage?.(data.message);
    });

    socketRef.current = socket;

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      connectionCount = Math.max(0, connectionCount - 1);
      if (connectionCount === 0) {
        socket.disconnect();
        globalSocket = null;
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [enabled, token]);

  // Manual emit function
  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  // Subscribe to additional room
  const subscribe = useCallback((room: string) => {
    socketRef.current?.emit('subscribe', { room });
  }, []);

  // Unsubscribe from room
  const unsubscribe = useCallback((room: string) => {
    socketRef.current?.emit('unsubscribe', { room });
  }, []);

  return {
    isConnected,
    connectionId,
    emit,
    subscribe,
    unsubscribe,
    socket: socketRef.current,
  };
}

/**
 * Simplified hook for just listening to refresh triggers
 */
export function useRealtimeRefresh(
  scopes: string[],
  callback: (scope: string, context?: any) => void,
  options?: { enabled?: boolean; token?: string }
) {
  const { enabled = true, token } = options || {};

  useRealtime({
    token,
    enabled,
    onRefreshTrigger: (data) => {
      if (scopes.includes('all') || scopes.includes(data.scope)) {
        callback(data.scope, data.context);
      }
    },
  });
}

export default useRealtime;
