'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, Bell, Settings as SettingsIcon, LayoutDashboard, LogOut, Calendar, CalendarDays, Stethoscope, DoorOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-l border-slate-100 flex flex-col h-screen shrink-0">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-50">
          <Link href="/bookings" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
              <CalendarCheck size={18} className="text-[#00E5FF]" />
            </div>
            <span className="font-black text-sm text-slate-900">لوحة الحجوزات</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <div className="px-3 py-1.5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
              الرئيسية
            </div>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=overview"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <LayoutDashboard size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">نظرة عامة</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=reservations"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <CalendarCheck size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الحجوزات</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=calendar"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <Calendar size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">التقويم</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=appointments"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <CalendarDays size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">جدول المواعيد</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=doctors"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <Stethoscope size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الأطباء والمقدمون</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=rooms"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <DoorOpen size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الغرف والقاعات</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=tables"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <DoorOpen size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الطاولات والأماكن</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=notifications"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <Bell size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الإشعارات</span>
            </Link>
          </div>

          <div className="mb-2">
            <Link
              href="/bookings?tab=settings"
              className="flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
            >
              <SettingsIcon size={16} className="text-slate-400" />
              <span className="text-xs font-bold flex-1 text-right">الإعدادات</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
