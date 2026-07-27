import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDataDB extends DBSchema {
  products: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
  };
  shops: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
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
const DB_VERSION = 3;

let db: IDBPDatabase<OfflineDataDB> | null = null;

export const initDB = async () => {
  if (db) return db;

  db = await openDB<OfflineDataDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Products store
      if (database.objectStoreNames.contains('products')) {
        database.deleteObjectStore('products');
      }
      database.createObjectStore('products', { keyPath: 'id' });

      // Shops store
      if (database.objectStoreNames.contains('shops')) {
        database.deleteObjectStore('shops');
      }
      database.createObjectStore('shops', { keyPath: 'id' });

      // Sync queue store
      if (database.objectStoreNames.contains('syncQueue')) {
        database.deleteObjectStore('syncQueue');
      }
      database.createObjectStore('syncQueue', { keyPath: 'id' });
    },
  });

  return db;
};

export const saveProduct = async (id: string, data: any) => {
  const database = await initDB();
  await database.put('products', {
    id,
    data,
    timestamp: Date.now(),
  });
};

export const getProduct = async (id: string) => {
  const database = await initDB();
  return database.get('products', id);
};

export const saveShop = async (id: string, data: any) => {
  const database = await initDB();
  await database.put('shops', {
    id,
    data,
    timestamp: Date.now(),
  });
};

export const getShop = async (id: string) => {
  const database = await initDB();
  return database.get('shops', id);
};

export const addToSyncQueue = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: any,
  opts?: { opId?: string; idempotencyKey?: string }
) => {
  const database = await initDB();
  let opId = String(opts?.opId || '').trim();
  if (!opId) {
    try {
      opId = (crypto as any)?.randomUUID?.() || '';
    } catch {
    }
    if (!opId) {
      opId = `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }
  const id = opId;
  await database.put('syncQueue', {
    id,
    opId,
    endpoint,
    method,
    body,
    timestamp: Date.now(),
    retries: 0,
    nextAttemptAt: Date.now(),
    idempotencyKey: opts?.idempotencyKey || opId,
  });

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ray-sync-queue-changed'));
    }
  } catch {
  }
};

export const getSyncQueue = async () => {
  const database = await initDB();
  return database.getAll('syncQueue');
};

export const getSyncQueueItem = async (id: string) => {
  const database = await initDB();
  return database.get('syncQueue', id);
};

export const updateSyncQueueItem = async (item: {
  id: string;
  opId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  timestamp: number;
  retries: number;
  nextAttemptAt: number;
  idempotencyKey?: string;
}) => {
  const database = await initDB();
  await database.put('syncQueue', item);

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ray-sync-queue-changed'));
    }
  } catch {
  }
};

export const removeFromSyncQueue = async (id: string) => {
  const database = await initDB();
  await database.delete('syncQueue', id);

  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ray-sync-queue-changed'));
    }
  } catch {
  }
};

export const clearOldCache = async (maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
  const database = await initDB();
  const now = Date.now();

  // Clear old products
  const products = await database.getAll('products');
  for (const product of products) {
    if (now - product.timestamp > maxAge) {
      await database.delete('products', product.id);
    }
  }

  // Clear old shops
  const shops = await database.getAll('shops');
  for (const shop of shops) {
    if (now - shop.timestamp > maxAge) {
      await database.delete('shops', shop.id);
    }
  }
};
