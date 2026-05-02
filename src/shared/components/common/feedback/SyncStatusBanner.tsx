import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { syncService } from '../../../lib/sync-service';

export default function SyncStatusBanner() {
  const { t } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTs, setLastSyncTs] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    try {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    } catch {}
  }, []);

  const refreshLastSync = useCallback(() => {
    try {
      setLastSyncTs(syncService.getLastSyncTs());
    } catch {}
  }, []);

  useEffect(() => {
    refreshPending();
    refreshLastSync();

    const handleQueueChanged = () => refreshPending();
    const handleSyncComplete = () => {
      refreshPending();
      refreshLastSync();
      setSyncing(false);
    };
    const handleOnline = () => {
      setIsOnline(true);
      setSyncing(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('ray-sync-queue-changed', handleQueueChanged);
    window.addEventListener('ray-sync-complete', handleSyncComplete as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic refresh of pending count
    const interval = setInterval(refreshPending, 30_000);

    return () => {
      window.removeEventListener('ray-sync-queue-changed', handleQueueChanged);
      window.removeEventListener('ray-sync-complete', handleSyncComplete as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshPending, refreshLastSync]);

  const handleSyncNow = () => {
    if (syncing || !isOnline) return;
    setSyncing(true);
    syncService.sync().finally(() => {
      refreshPending();
      refreshLastSync();
      setSyncing(false);
    });
  };

  if (isOnline && pendingCount === 0) return null;

  const formatLastSync = () => {
    if (!lastSyncTs) return '';
    try {
      const diff = Date.now() - lastSyncTs;
      if (diff < 60_000) return t('syncStatus.justNow');
      if (diff < 3600_000) return t('syncStatus.minutesAgo', { count: Math.floor(diff / 60_000) });
      if (diff < 86400_000) return t('syncStatus.hoursAgo', { count: Math.floor(diff / 3600_000) });
      return new Date(lastSyncTs).toLocaleTimeString();
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[997]" dir="rtl">
      <div className="mx-auto max-w-3xl rounded-2xl backdrop-blur-xl p-3 flex items-center justify-between gap-3 border border-cyan-200/60 bg-cyan-50/90">
        <div className="min-w-0 flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'}`} />
          <div>
            <div className="font-black text-cyan-900 text-sm">
              {!isOnline
                ? t('syncStatus.offline')
                : syncing
                  ? t('syncStatus.syncing')
                  : t('syncStatus.pendingCount', { count: pendingCount })}
            </div>
            {lastSyncTs > 0 && (
              <div className="text-[10px] text-cyan-800/70 font-bold">
                {t('syncStatus.lastSync')}: {formatLastSync()}
              </div>
            )}
          </div>
        </div>
        {isOnline && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="shrink-0 rounded-xl bg-cyan-600 text-white font-black px-3 py-1.5 text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {syncing ? t('syncStatus.syncing') : t('syncStatus.syncNow')}
          </button>
        )}
      </div>
    </div>
  );
}
