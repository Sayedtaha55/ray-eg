'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, ShieldAlert, Users, Settings, LogOut,
  Bell, Menu, CreditCard, Store, BarChart3, Truck,
  MessageSquare, FileText,
} from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clearSessionCookies } from '@/lib/auth/helpers';

const NAV_ITEMS = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { key: 'analytics', icon: BarChart3, path: '/admin/analytics' },
  { key: 'approvals', icon: ShieldAlert, path: '/admin/approvals' },
  { key: 'shops', icon: Store, path: '/admin/shops' },
  { key: 'users', icon: Users, path: '/admin/users' },
  { key: 'orders', icon: CreditCard, path: '/admin/orders' },
  { key: 'delivery', icon: Truck, path: '/admin/delivery' },
  { key: 'content', icon: FileText, path: '/admin/content' },
  { key: 'feedback', icon: MessageSquare, path: '/admin/feedback' },
  { key: 'notifications', icon: Bell, path: '/admin/notifications' },
  { key: 'settings', icon: Settings, path: '/admin/settings' },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dir } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('ray_user') : null;
    try {
      const user = JSON.parse(raw || 'null');
      if (!user || String(user.role || '').toLowerCase() !== 'admin') {
        const returnTo = `${pathname}${window.location.search || ''}`;
        router.replace(`/${locale}/admin/gate?returnTo=${encodeURIComponent(returnTo)}`);
      }
    } catch {
      router.replace(`/${locale}/admin/gate`);
    }
  }, [router, locale, pathname]);

  const handleLogout = async () => {
    await clearSessionCookies();
    try {
      localStorage.removeItem('ray_token');
      localStorage.removeItem('ray_user');
    } catch {}
    router.push(`/${locale}/login`);
  };

  const label = (key: string) => t(`admin.nav.${key}`, key);

  // Gate page: no sidebar, just render children directly
  if (pathname.endsWith('/gate')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-right font-sans" dir={dir}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-slate-900 text-white flex flex-col fixed inset-y-0 right-0 z-[110] shadow-2xl transition-transform duration-500 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-[#BD00FF] rounded-xl flex items-center justify-center">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">
            MNMKNK <span className="text-[#BD00FF]">ROOT</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-6 overflow-y-auto">
          {NAV_ITEMS.map(({ key, icon: Icon, path }) => {
            const full = `/${locale}${path}`;
            const active = pathname === full || pathname.startsWith(full + '/');
            return (
              <Link
                key={key}
                href={full}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                  active
                    ? 'bg-[#00E5FF] text-black shadow-[0_10px_30px_rgba(0,229,255,0.2)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{label(key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            <span>{t('admin.nav.logout', 'تسجيل الخروج')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-3 bg-white/5 rounded-xl text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell className="w-5 h-5 text-slate-500" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-[#00E5FF] text-sm">
              A
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              {t('admin.nav.systemVersion', 'v1.0')}
            </p>
          </div>
        </header>

        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
