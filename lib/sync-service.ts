import { getSyncQueue, removeFromSyncQueue } from './offline-db';
import { fetchWithRetry, retryManager } from './retry-manager';

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;

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

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retries++;

          // Remove if too many retries
          if (item.retries >= 5) {
            await removeFromSyncQueue(item.id);
          }
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: any): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}${item.endpoint}`;

    switch (item.method) {
      case 'GET':
        await fetchWithRetry(url, { method: 'GET' });
        break;
      case 'POST':
        await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body),
        });
        break;
      case 'PUT':
        await fetchWithRetry(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.body),
        });
        break;
      case 'DELETE':
        await fetchWithRetry(url, { method: 'DELETE' });
        break;
    }
  }

  async startAutoSync(): Promise<void> {
    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('Back online, starting sync');
      this.sync();
    });

    // Periodic sync every 5 minutes
    setInterval(() => {
      if (retryManager.isOnline()) {
        this.sync();
      }
    }, 5 * 60 * 1000);
  }
}

export const syncService = SyncService.getInstance();
