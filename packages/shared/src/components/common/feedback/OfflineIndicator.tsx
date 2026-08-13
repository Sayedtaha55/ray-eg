import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Sync } from 'lucide-react';
import { syncService } from '@/lib/sync-service';
import { retryManager } from '@/lib/retry-manager';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(retryManager.isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(0);

  useEffect(() => {
    // Update online status
    const updateOnlineStatus = () => setIsOnline(retryManager.isOnline());
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('ray-backend-status', updateOnlineStatus);
    
    // Update pending count
    const updatePendingCount = async () => {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    };
    
    // Listen for sync queue changes
    window.addEventListener('ray-sync-queue-changed', updatePendingCount);
    window.addEventListener('ray-sync-complete', () => {
      setLastSync(syncService.getLastSyncTs());
      updatePendingCount();
    });
    
    // Listen for sync status
    const handleSyncStatus = (e: any) => {
      setIsSyncing(e.detail?.syncing || false);
    };
    window.addEventListener('ray-sync-status', handleSyncStatus);
    
    // Initial load
    updateOnlineStatus();
    updatePendingCount();
    setLastSync(syncService.getLastSyncTs());
    
    // Periodic refresh
    const interval = setInterval(updatePendingCount, 5000);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('ray-backend-status', updateOnlineStatus);
      window.removeEventListener('ray-sync-queue-changed', updatePendingCount);
      window.removeEventListener('ray-sync-complete', updatePendingCount);
      window.removeEventListener('ray-sync-status', handleSyncStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  const formatLastSync = (ts: number) => {
    if (!ts) return 'لم يتم المزامنة';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'منذ دقيقة';
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    return `منذ ${Math.floor(diff / 3600000)} ساعة`;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>أنت غير متصل بالإنترنت</span>
        </div>
      )}
      
      {/* Pending sync indicator */}
      {pendingCount > 0 && (
        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
          {isSyncing ? (
            <>
              <Sync className="w-4 h-4 animate-spin" />
              <span>جاري المزامنة ({pendingCount})</span>
            </>
          ) : (
            <>
              <Sync className="w-4 h-4" />
              <span>{pendingCount} طلب في انتظار المزامنة</span>
            </>
          )}
        </div>
      )}
      
      {/* Last sync info */}
      {isOnline && lastSync > 0 && (
        <div className="bg-gray-700 text-white px-3 py-1 rounded-lg shadow-lg text-xs">
          آخر مزامنة: {formatLastSync(lastSync)}
        </div>
      )}
    </div>
  );
};
