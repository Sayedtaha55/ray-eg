'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShieldAlert, Users, Settings, LogOut, Bell, Menu,
  MessageSquare, CreditCard, Store, BarChart3, FileText, Truck, Headphones,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/settings/ToastProvider';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/admin/approvals', label: 'الموافقات', icon: ShieldAlert },
  { href: '/admin/shops', label: 'المتاجر', icon: Store },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/orders', label: 'العمليات', icon: CreditCard },
  { href: '/admin/delivery', label: 'التوصيل', icon: Truck },
  { href: '/admin/feedback', label: 'التقييمات', icon: MessageSquare },
  { href: '/admin/customer-service', label: 'خدمة العملاء', icon: Headphones },
  { href: '/admin/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/admin/notifications', label: 'الإشعارات', icon: Bell },
  { href: '/admin/content', label: 'المحتوى', icon: FileText },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
];

export default function GuardedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    const role = String(user?.role || '').toLowerCase();
    if (role !== 'admin') {
      const returnTo = typeof window !== 'undefined' ? window.location.pathname : '';
      const qs = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
      router.replace(`/admin/gate${qs}`);
      return;
    }
    setChecked(true);
  }, [user, loading, router]);

  const handleLogout = async () => {
    logout();
    router.replace('/login');
  };

  if (!checked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-[#BD00FF] rounded-full animate-spin" />
      </div>
    );
  }

  const initial = String(user?.name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row-reverse text-right font-sans" dir="rtl">
      {/* Sidebar Overlay (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`w-80 bg-slate-900 text-white flex flex-col fixed inset-y-0 right-0 z-[110] shadow-2xl transition-transform duration-500 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-10 flex items-center gap-3">
          <span className="text-2xl font-black tracking-tighter uppercase">
            MNMKNK <span className="text-[#BD00FF]">ROOT</span>
          </span>
        </div>

        <nav className="flex-1 px-6 space-y-2 py-6 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                  active
                    ? 'bg-[#00E5FF] text-black shadow-[0_10px_30px_rgba(0,229,255,0.2)]'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:mr-80 overflow-x-hidden min-h-screen">
        <header className="h-24 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-3 bg-white/5 rounded-xl text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-slate-500" />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-[#00E5FF]">
              {initial}
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">MNMKNK ROOT</p>
          </div>
        </header>

        <div className="p-6 md:p-12"><ToastProvider>{children}</ToastProvider></div>
      </main>
    </div>
  );
}
