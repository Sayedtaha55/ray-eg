'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale } from '@/i18n/LocaleProvider';

function BusinessLoginPageInner() {
  const params = useSearchParams();
  const { locale } = useLocale();
  const routeParams = useParams();

  const returnTo = params.get('returnTo') || '';
  const q = new URLSearchParams();
  q.set('role', 'merchant');
  if (returnTo) q.set('returnTo', returnTo);

  useEffect(() => {
    window.location.replace(`/${locale}/login?${q.toString()}`);
  }, [locale, q]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin w-8 h-8 border-4 border-[#00E5FF] border-t-transparent rounded-full" />
    </div>
  );
}

export default function BusinessLoginPage() {
  return (
    <Suspense>
      <BusinessLoginPageInner />
    </Suspense>
  );
}
