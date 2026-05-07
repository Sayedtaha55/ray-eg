'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDataDB extends DBSchema {
  products: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  shops: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  orders: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  reservations: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  analytics: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  notifications: {
    key: string;
    value: { id: string; data: any; timestamp: number };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      opId: string;
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      timestamp: number;
      retries: number;
      nextAttemptAt: number;
      idempotencyKey?: string;
    };
  };
}

const DB_NAME = 'ray-offline-db';
const DB_VERSION = 4;

let db: IDBPDatabase<OfflineDataDB> | null = null;

export const initDB = async () => {
  if (db) return db;
  db = await openDB<OfflineDataDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      const stores = ['products', 'shops', 'orders', 'reservations', 'analytics', 'notifications', 'syncQueue'] as const;
      for (const store of stores) {
        if (database.objectStoreNames.contains(store)) {
          database.deleteObjectStore(store);
        }
        database.createObjectStore(store, { keyPath: 'id' });
      }
    },
  });
  return db;
};

const saveItem = async (storeName: 'products' | 'shops' | 'orders' | 'reservations' | 'analytics' | 'notifications', id: string, data: any) => {
  const database = await initDB();
  await database.put(storeName, { id, data, timestamp: Date.now() });
};

const getItem = async (storeName: 'products' | 'shops' | 'orders' | 'reservations' | 'analytics' | 'notifications', id: string) => {
  const database = await initDB();
  const entry = await database.get(storeName, id);
  return entry?.data ?? null;
};

const getAllItems = async (storeName: 'products' | 'shops' | 'orders' | 'reservations' | 'analytics' | 'notifications') => {
  const database = await initDB();
  const entries = await database.getAll(storeName);
  return entries.map(e => e.data);
};

export const offlineDB = {
  saveShop: (id: string, data: any) => saveItem('shops', id, data),
  getShop: (id: string) => getItem('shops', id),
  saveProducts: (shopId: string, products: any[]) => saveItem('products', `shop-${shopId}`, products),
  getProducts: (shopId: string) => getItem('products', `shop-${shopId}`),
  saveOrders: (shopId: string, orders: any[]) => saveItem('orders', `shop-${shopId}`, orders),
  getOrders: (shopId: string) => getItem('orders', `shop-${shopId}`),
  saveReservations: (shopId: string, reservations: any[]) => saveItem('reservations', `shop-${shopId}`, reservations),
  getReservations: (shopId: string) => getItem('reservations', `shop-${shopId}`),
  saveAnalytics: (shopId: string, analytics: any) => saveItem('analytics', `shop-${shopId}`, analytics),
  getAnalytics: (shopId: string) => getItem('analytics', `shop-${shopId}`),
  saveNotifications: (shopId: string, notifications: any[]) => saveItem('notifications', `shop-${shopId}`, notifications),
  getNotifications: (shopId: string) => getItem('notifications', `shop-${shopId}`),

  addToSyncQueue: async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: any,
    opts?: { opId?: string; idempotencyKey?: string }
  ) => {
    const database = await initDB();
    let opId = String(opts?.opId || '').trim();
    if (!opId) {
      try { opId = (crypto as any)?.randomUUID?.() || ''; } catch {}
      if (!opId) opId = `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    await database.put('syncQueue', {
      id: opId,
      opId,
      endpoint,
      method,
      body,
      timestamp: Date.now(),
      retries: 0,
      nextAttemptAt: Date.now(),
      idempotencyKey: opts?.idempotencyKey || opId,
    });
    try { if (typeof window !== 'undefined') window.dispatchEvent(new Event('ray-sync-queue-changed')); } catch {}
  },

  getSyncQueue: async () => {
    const database = await initDB();
    return database.getAll('syncQueue');
  },

  removeFromSyncQueue: async (id: string) => {
    const database = await initDB();
    await database.delete('syncQueue', id);
    try { if (typeof window !== 'undefined') window.dispatchEvent(new Event('ray-sync-queue-changed')); } catch {}
  },

  clearOldCache: async (maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
    const database = await initDB();
    const now = Date.now();
    const stores = ['products', 'shops', 'orders', 'reservations', 'analytics', 'notifications'] as const;
    for (const store of stores) {
      const items = await database.getAll(store);
      for (const item of items) {
        if (now - item.timestamp > maxAge) {
          await database.delete(store, item.id);
        }
      }
    }
  },
};

export function isOfflineError(e: any): boolean {
  try {
    if (typeof navigator !== 'undefined' && navigator?.onLine === false) return true;
  } catch {}
  const name = String(e?.name || '');
  if (name === 'TypeError') return true;
  const msg = String(e?.message || '').toLowerCase();
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network request failed')) return true;
  return false;
}
