'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clearSessionCookies } from '@/lib/auth/helpers';
import { clearPortalSession } from '@/lib/auth/portal';

export function useLogout() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useT();

  return async (options?: { portal?: boolean; redirect?: string }) => {
    try {
      if (options?.portal) {
        clearPortalSession();
        try { await fetch('/api/v1/portal/auth/logout', { method: 'POST' }); } catch {}
      } else {
        try { localStorage.removeItem('ray_token'); } catch {}
        await clearSessionCookies();
      }
    } catch {
      // ignore — cookies may already be cleared
    }

    const target = options?.redirect || '/';
    router.replace(`/${locale}${target === '/' ? '' : target}`);
  };
}
