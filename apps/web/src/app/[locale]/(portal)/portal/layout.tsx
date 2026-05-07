'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, BarChart3, User, LogOut, Menu, X } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clearSessionCookies } from '@/lib/auth/helpers';

const NAV_ITEMS = [
  { key: 'dashboard', icon: Home, path: '/portal/dashboard' },
  { key: 'listings', icon: Building2, path: '/portal/listings' },
  { key: 'analytics', icon: BarChart3, path: '/portal/analytics' },
  { key: 'profile', icon: User, path: '/portal/profile' },
] as const;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dir } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
    if (!raw) {
      router.replace(`/${locale}/portal/login`);
    }
  }, [router, locale]);

  const handleLogout = async () => {
    try {
      await clearSessionCookies();
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_owner');
    } catch {}
    router.push(`/${locale}/portal/login`);
  };

  const label = (key: string) => t(`portal.layout.${key}`, key);

  if (pathname.endsWith('/login') || pathname.endsWith('/signup')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={dir}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`w-64 bg-white border-e border-gray-200 flex flex-col shrink-0 fixed inset-y-0 right-0 z-[110] md:relative md:translate-x-0 transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-600">{t('portal.layout.brandTitle', 'Portal')}</h1>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ key, icon: Icon, path }) => {
            const full = `/${locale}${path}`;
            const active = pathname === full || pathname.startsWith(full + '/');
            return (
              <Link key={key} href={full} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                <Icon size={18} /> {label(key)}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> {t('portal.layout.logout', 'خروج')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-h-screen">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 sticky top-0 z-40">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
