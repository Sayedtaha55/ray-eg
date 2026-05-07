'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useT } from '@/i18n/useT';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useParams<{ locale: string }>();
  const prefix = `/${locale}`;
  const t = useT();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    console.error('[PublicError]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center" dir={dir}>
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-slate-900">{t('common.error', 'An unexpected error occurred')}</h1>
      <p className="text-slate-500 max-w-md">{t('common.errorHint', 'Try again or go back to Home')}</p>
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all"
        >
          {t('common.retry', 'Retry')}
        </button>
        <Link
          href={`${prefix}/`}
          className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
        >
          {t('common.home', 'Home')}
        </Link>
      </div>
    </div>
  );
}
