import { getSyncQueue, removeFromSyncQueue, updateSyncQueueItem } from './offline-db';
import { fetchWithRetry, retryManager } from './retry-manager';
import { toBackendUrl } from '../services/api/httpClient';

const LAST_SYNC_KEY = 'ray_last_sync_ts';

type ConflictStrategy = 'last-write-wins' | 'server-wins' | 'client-wins';

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private conflictStrategies: Map<string, ConflictStrategy> = new Map();

  constructor() {
    // Default strategies per entity type
    this.conflictStrategies.set('orders', 'server-wins');
    this.conflictStrategies.set('reservations', 'server-wins');
    this.conflictStrategies.set('products', 'last-write-wins');
    this.conflictStrategies.set('shops', 'last-write-wins');
  }

  private getNextAttemptAt(retries: number) {
    const base = 1500;
    const max = 60_000;
    const pow = Math.min(6, Math.max(0, retries));
    const delay = Math.min(max, base * Math.pow(2, pow));
    const jitter = Math.floor(Math.random() * 500);
    return Date.now() + delay + jitter;
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      const queue = await getSyncQueue();
      console.log(`Syncing ${queue.length} items`);

      const refreshedScopes = new Set<string>();

      const now = Date.now();

      for (const item of queue) {
        const nextAttemptAt = typeof item?.nextAttemptAt === 'number' ? item.nextAttemptAt : 0;
        if (nextAttemptAt > now) continue;

        try {
          await this.syncItem(item);
          await removeFromSyncQueue(item.id);

          try {
            const ep = String(item?.endpoint || '');
            if (ep.startsWith('/api/v1/orders')) refreshedScopes.add('orders');
            if (ep.startsWith('/api/v1/reservations')) refreshedScopes.add('reservations');
            if (ep.startsWith('/api/v1/products')) refreshedScopes.add('products');
            if (ep.startsWith('/api/v1/offers')) refreshedScopes.add('products');
            if (ep.startsWith('/api/v1/shops')) refreshedScopes.add('shop');
            if (ep.startsWith('/api/v1/invoices')) refreshedScopes.add('invoices');
            if (ep.startsWith('/api/v1/apps')) refreshedScopes.add('shop');
            if (ep.startsWith('/api/v1/notifications')) refreshedScopes.add('notifications');
            if (ep.startsWith('/api/v1/cart-events')) refreshedScopes.add('cart');
          } catch {
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retries++;

          try {
            item.nextAttemptAt = this.getNextAttemptAt(item.retries);
          } catch {
          }

          try {
            await updateSyncQueueItem(item);
          } catch {
          }

          // Remove if too many retries
          if (item.retries >= 5) {
            await removeFromSyncQueue(item.id);
          }
        }
      }

      try {
        if (refreshedScopes.size) {
          window.dispatchEvent(new Event('ray-db-update'));
          if (refreshedScopes.has('orders')) {
            window.dispatchEvent(new Event('orders-updated'));
          }
          if (refreshedScopes.has('products')) {
            window.dispatchEvent(new Event('ray-products-updated'));
          }
          // Pull sync: invalidate caches so next read fetches fresh server data
          try {
            window.dispatchEvent(new CustomEvent('ray-smart-refresh', {
              detail: { scope: Array.from(refreshedScopes).join(','), timestamp: Date.now() }
            }));
          } catch {
          }
        }
      } catch {
      }

      // Record last successful sync timestamp
      try {
        const ts = Date.now();
        localStorage.setItem(LAST_SYNC_KEY, String(ts));
        window.dispatchEvent(new CustomEvent('ray-sync-complete', { detail: { ts } }));
      } catch {
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: any): Promise<void> {
    const url = toBackendUrl(item.endpoint);
    const token = this.getAuthToken();
    const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const idempotencyKey = String(item?.idempotencyKey || item?.opId || item?.id || '').trim();
    const idemHeader: Record<string, string> = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {};

    // Determine entity type for conflict resolution
    let entityType = 'default';
    const ep = String(item?.endpoint || '');
    if (ep.includes('/orders')) entityType = 'orders';
    else if (ep.includes('/reservations')) entityType = 'reservations';
    else if (ep.includes('/products')) entityType = 'products';
    else if (ep.includes('/shops')) entityType = 'shops';

    switch (item.method) {
      case 'GET':
        await fetchWithRetry(url, { method: 'GET', headers: { ...authHeader } });
        break;
      case 'POST':
        await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader, ...idemHeader },
          body: JSON.stringify(item.body),
        });
        break;
      case 'PUT':
        await fetchWithRetry(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeader, ...idemHeader },
          body: JSON.stringify(item.body),
        });
        break;
      case 'PATCH':
        const response = await fetchWithRetry(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader, ...idemHeader },
          body: JSON.stringify(item.body),
        });
        
        // Check for conflict (HTTP 409)
        if (response && response.status === 409) {
          const remoteData = await response.json().catch(() => null);
          if (remoteData) {
            const resolved = this.resolveConflict(item.body, remoteData, entityType);
            // Retry with resolved data
            await fetchWithRetry(url, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...authHeader, ...idemHeader },
              body: JSON.stringify(resolved),
            });
          }
        }
        break;
      case 'DELETE':
        await fetchWithRetry(url, { method: 'DELETE', headers: { ...authHeader, ...idemHeader } });
        break;
    }
  }

  private resolveConflict(local: any, remote: any, entityType: string): any {
    const strategy = this.conflictStrategies.get(entityType) || 'last-write-wins';

    switch (strategy) {
      case 'server-wins':
        return remote;
      case 'client-wins':
        return local;
      case 'last-write-wins':
        const localTimestamp = local.updatedAt || local.updated_at || Date.now();
        const remoteTimestamp = remote.updatedAt || remote.updated_at || Date.now();
        return localTimestamp > remoteTimestamp ? local : remote;
      default:
        return remote;
    }
  }

  private getAuthToken(): string {
    try {
      return localStorage.getItem('ray_token') || '';
    } catch {
      return '';
    }
  }

  async startAutoSync(): Promise<void> {
    // Initial sync on app load (if online and queue has items)
    try {
      if (retryManager.isOnline()) {
        const queue = await getSyncQueue();
        if (queue.length > 0) {
          this.sync();
        }
      }
    } catch {
    }

    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('Back online, starting sync');
      this.sync();
    });

    // Sync when tab regains focus (user returns to app)
    try {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && retryManager.isOnline()) {
          this.sync();
        }
      });
    } catch {
    }

    // Periodic sync every 5 minutes
    setInterval(() => {
      if (retryManager.isOnline()) {
        this.sync();
      }
    }, 5 * 60 * 1000);
  }

  async getPendingCount(): Promise<number> {
    try {
      const queue = await getSyncQueue();
      return queue.length;
    } catch {
      return 0;
    }
  }

  getLastSyncTs(): number {
    try {
      const raw = localStorage.getItem(LAST_SYNC_KEY);
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }
}

export const syncService = SyncService.getInstance();
