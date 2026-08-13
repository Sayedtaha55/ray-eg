'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
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

  const userName = user?.name || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Right side — menu + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-50 rounded-xl"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            type="text"
            placeholder="بحث..."
            className="w-64 bg-slate-50 border-none rounded-xl py-2.5 pr-10 pl-4 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#00E5FF]/20 transition-all"
          />
        </div>
      </div>

      {/* Left side — notifications + profile */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 hover:bg-slate-50 rounded-xl">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BD00FF] rounded-full" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">{userInitial}</span>
            </div>
            <span className="hidden md:block text-xs font-black text-slate-700">
              {userName}
            </span>
            <ChevronDown size={14} className="hidden md:block text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-50">
                <div className="text-xs font-black text-slate-900">{userName}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {user?.email || ''}
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <User size={16} className="text-slate-400" />
                الإعدادات
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
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
