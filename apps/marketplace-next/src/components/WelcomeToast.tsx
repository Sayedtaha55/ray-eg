'use client';

import { useEffect, useRef, useState } from 'react';
import { X, PartyPopper } from 'lucide-react';

const FLAG_KEY = 'mnmknk_welcome';

interface WelcomeData {
  type: 'login' | 'signup';
  name?: string;
}

/**
 * Welcome toast that appears at the top of the page (above the hero banner)
 * right after login or signup. The auth pages set a sessionStorage flag,
 * redirect to the home page, and this component picks it up and shows the toast.
 */
export function WelcomeToast() {
  const [data, setData] = useState<WelcomeData | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = sessionStorage.getItem(FLAG_KEY);
      if (!raw) return;
      sessionStorage.removeItem(FLAG_KEY);
      const parsed = JSON.parse(raw) as WelcomeData;
      if (!parsed || (parsed.type !== 'login' && parsed.type !== 'signup')) return;

      setData(parsed);
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), 7000);

      // If the name wasn't stored, try to resolve it from the session
      if (!parsed.name) {
        const token = localStorage.getItem('ray_token') || localStorage.getItem('token');
        fetch('/api/v1/auth/me', {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((body) => {
            if (cancelled) return;
            const name =
              body?.data?.user?.name || body?.user?.name || body?.data?.name || body?.name;
            if (name) setData((prev) => (prev ? { ...prev, name } : prev));
          })
          .catch(() => {});
      }
    } catch {
      /* ignore */
    }
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!data || !visible) return null;

  const isSignup = data.type === 'signup';
  const firstName = data.name ? data.name.split(' ')[0] : '';

  return (
    <div className="fixed top-20 md:top-24 inset-x-0 z-[90] flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto w-full max-w-sm flex items-start gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 shadow-2xl p-4 animate-slide-down"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <PartyPopper className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 dark:text-white">
            {isSignup
              ? 'تم إنشاء حسابك بنجاح 🎉'
              : firstName
                ? `أهلاً بعودتك يا ${firstName} 👋`
                : 'أهلاً بعودتك 👋'}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isSignup
              ? 'سجل دخولك الآن وابدأ التسوق من مكانك'
              : 'سعداء برؤيتك مجدداً في من مكانك'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="إغلاق"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}