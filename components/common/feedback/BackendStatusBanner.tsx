import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

type BackendStatusDetail = {
  status?: 'up' | 'down';
  downUntil?: number;
  failures?: number;
  lastPath?: string;
};

export default function BackendStatusBanner() {
  const { Link } = ReactRouterDOM as any;
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
    ? 'تم فصل الإنترنت مؤقتًا.'
    : 'الخدمة غير متاحة مؤقتًا.';

  const subMessage = !isOnline
    ? 'ارجع افتح الصفحة بعد ما الاتصال يرجع، أو جرّب تاني بعد لحظات.'
    : lastPath
      ? `آخر محاولة: ${lastPath}`
      : 'جرب تاني بعد شوية.';

  const handleRetry = () => {
    window.dispatchEvent(new Event('ray-backend-retry'));
  };

  if (!shouldShow) return null;

  if (isOnline && isBackendDown) {
    return (
      <div className="fixed inset-0 z-[999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-xl rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl p-8 md:p-10 text-right">
          <div className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">الخدمة غير متاحة الآن</div>
          <div className="mt-3 text-slate-600 font-bold leading-relaxed">بنحاول نوصل للسيرفر… من فضلك جرّب تاني بعد شوية.</div>
          {lastPath ? (
            <div className="mt-3 text-xs text-slate-400 font-bold break-words">آخر محاولة: {lastPath}</div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:opacity-95 transition-opacity"
            >
              إعادة المحاولة
            </button>
            <Link
              to="/"
              className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center"
            >
              الرئيسية
            </Link>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-slate-500 font-black text-xs hover:text-slate-900 transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[998]" dir="rtl">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200/60 bg-amber-50/90 backdrop-blur-xl p-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-black text-amber-900">{message}</div>
          {subMessage ? <div className="mt-1 text-xs text-amber-800/80 break-words">{subMessage}</div> : null}
        </div>
        {!isOnline ? null : (
          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 rounded-xl bg-amber-600 text-white font-black px-4 py-2 hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}
