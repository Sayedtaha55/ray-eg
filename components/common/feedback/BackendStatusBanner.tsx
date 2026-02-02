import React, { useEffect, useMemo, useState } from 'react';

type BackendStatusDetail = {
  status?: 'up' | 'down';
  downUntil?: number;
  failures?: number;
  lastPath?: string;
};

export default function BackendStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });
  const [backendDownUntil, setBackendDownUntil] = useState<number>(0);
  const [lastPath, setLastPath] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBackendStatus = (evt: Event) => {
      const detail = (evt as CustomEvent<BackendStatusDetail>)?.detail;
      if (!detail) return;
      if (typeof detail.downUntil === 'number') setBackendDownUntil(detail.downUntil);
      if (typeof detail.lastPath === 'string') setLastPath(detail.lastPath);
      if (detail.status === 'up') setBackendDownUntil(0);
    };

    window.addEventListener('ray-backend-status', handleBackendStatus as any);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ray-backend-status', handleBackendStatus as any);
    };
  }, []);

  const isBackendDown = useMemo(() => {
    return backendDownUntil > Date.now();
  }, [backendDownUntil]);

  const shouldShow = !isOnline || isBackendDown;

  const message = !isOnline
    ? 'أنت غير متصل بالإنترنت.'
    : 'تعذر الاتصال بالخدمة الآن، جاري المحاولة مرة أخرى تلقائيًا.';

  const subMessage = !isOnline
    ? 'تأكد من الاتصال وحاول مرة أخرى.'
    : lastPath
      ? `آخر طلب: ${lastPath}`
      : '';

  const handleRetry = () => {
    window.dispatchEvent(new Event('ray-backend-retry'));
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[998]" dir="rtl">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-500/25 bg-slate-950/60 backdrop-blur-xl p-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-black text-slate-100">{message}</div>
          {subMessage ? <div className="mt-1 text-xs text-slate-200/70 break-words">{subMessage}</div> : null}
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="shrink-0 rounded-xl bg-slate-700 text-white font-black px-4 py-2 hover:opacity-90 transition-opacity"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
