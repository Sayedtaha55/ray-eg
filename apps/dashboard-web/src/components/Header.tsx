'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, LogOut, User, ChevronDown, PanelTop } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useOrderBell } from '@/hooks/useOrderBell';

export default function Header({ onMenuClick, onSwitchNav }: { onMenuClick: () => void; onSwitchNav?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useOrderBell();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleBellClick = () => {
    router.push('/dashboard/notifications');
  };

  const userName = user?.name || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input type="text" placeholder="بحث..." className="w-64 bg-white/10 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/15 focus:border-[#00E5FF]/40 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onSwitchNav && (
          <button
            onClick={onSwitchNav}
            title="التبديل إلى الهدر العلوي"
            className="hidden md:block p-2 text-white/70 hover:text-[#00E5FF] hover:bg-white/10 rounded-xl transition-colors"
          >
            <PanelTop size={20} />
          </button>
        )}
        <button onClick={handleBellClick} className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <Bell size={20} className="text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-all">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">{userInitial}</span>
            </div>
            <span className="hidden md:block text-xs font-black text-white/90">{userName}</span>
            <ChevronDown size={14} className="hidden md:block text-white/50" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-50">
                <div className="text-xs font-black text-slate-900">{userName}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-0.5">{user?.email || ''}</div>
              </div>
              <button onClick={() => router.push('/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <User size={16} className="text-slate-400" />
                الإعدادات
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
