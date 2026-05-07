'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { apiGetSession, resolvePostLoginRedirect, setSessionCookies } from '@/lib/auth/helpers';

function GoogleCallbackPageInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dir } = useLocale();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const returnTo = params.get('returnTo') || '';
        const hintedTarget = params.get('target') || '';

        const res = await apiGetSession();
        await setSessionCookies(res.session.access_token, res.user);

        const target = resolvePostLoginRedirect(
          res.user.role,
          returnTo || hintedTarget || undefined,
          hintedTarget === '/business/dashboard'
        );
        router.replace(`/${locale}${target === '/' ? '' : target}`);
      } catch (err: any) {
        const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
        setError(msg || t('auth.googleCallback.failed', 'Google login failed. Please try again.'));
      }
    };
    run();
  }, [params, router, locale, t]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]" dir={dir}>
      <div className={`w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        {error ? (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={40} />
            </div>
            <h2 className="text-2xl font-black">{t('auth.googleCallback.failedTitle', 'Login Failed')}</h2>
            <p className="text-slate-400 font-bold text-sm">{error}</p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl"
            >
              {t('auth.backToLogin', 'Back to Login')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="animate-spin text-[#00E5FF] w-12 h-12 mb-6" />
            <h1 className="text-2xl font-black tracking-tight mb-2">
              {t('auth.googleCallback.loadingTitle', 'Completing Login...')}
            </h1>
            <p className="text-slate-400 font-bold text-sm">
              {t('auth.googleCallback.loadingSubtitle', 'Please wait while we verify your account.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackPageInner />
    </Suspense>
  );
}
