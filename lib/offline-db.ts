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
      endpoint: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      timestamp: number;
      retries: number;
    };
  };
}

const DB_NAME = 'ray-offline-db';
const DB_VERSION = 1;

let db: IDBPDatabase<OfflineDataDB> | null = null;

export const initDB = async () => {
  if (db) return db;

  db = await openDB<OfflineDataDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Products store
      if (!database.objectStoreNames.contains('products')) {
        database.createObjectStore('products');
      }

      // Shops store
      if (!database.objectStoreNames.contains('shops')) {
        database.createObjectStore('shops');
      }

      // Sync queue store
      if (!database.objectStoreNames.contains('syncQueue')) {
        database.createObjectStore('syncQueue');
      }
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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
) => {
  const database = await initDB();
  const id = `${method}-${endpoint}-${Date.now()}`;
  await database.put('syncQueue', {
    id,
    endpoint,
    method,
    body,
    timestamp: Date.now(),
    retries: 0,
  });
};

export const getSyncQueue = async () => {
  const database = await initDB();
  return database.getAll('syncQueue');
};

export const removeFromSyncQueue = async (id: string) => {
  const database = await initDB();
  await database.delete('syncQueue', id);
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
