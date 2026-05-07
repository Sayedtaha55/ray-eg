'use client';

import React, { useRef, useState } from 'react';
import {
  Bell, ChevronDown, Loader2, LogOut, Menu, Palette, RefreshCw,
  Settings, Store, User, X,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

interface DashboardHeaderProps {
  shopName?: string;
  userName?: string;
  userEmail?: string;
  userInitial?: string;
  hasPosTab: boolean;
  unreadCount: number;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
  onNavigateToPos: () => void;
  onNavigateToDesign: () => void;
  onNavigateToSettings: (subTab?: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  shopName,
  userName,
  userEmail,
  userInitial,
  hasPosTab,
  unreadCount,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenSidebar,
  onOpenNotifications,
  onNavigateToPos,
  onNavigateToDesign,
  onNavigateToSettings,
  onRefresh,
  onLogout,
}: DashboardHeaderProps) {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sidebarOffset = isSidebarCollapsed
    ? isArabic ? 'md:pr-[6.5rem]' : 'md:pl-[6.5rem]'
    : isArabic ? 'md:pr-[21rem]' : 'md:pl-[21rem]';

  return (
    <>
      {/* ── Mobile Header ────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-[200] min-h-20 bg-white/95 backdrop-blur text-slate-900 flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-sm font-black tracking-tight truncate">{shopName || t('business.dashboardTabs.settings', 'الإعدادات')}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
            title={t('business.dashboard.refreshData', 'تحديث')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {hasPosTab && (
            <button
              onClick={onNavigateToPos}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
              title={t('business.dashboardTabs.pos', 'نقطة البيع')}
            >
              <Store className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onNavigateToDesign}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
            title={t('business.dashboardTabs.design', 'التصميم')}
          >
            <Palette className="w-5 h-5" />
          </button>
          <div className="relative cursor-pointer" onClick={onOpenNotifications}>
            <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-700'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onOpenSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Desktop Header ───────────────────────────── */}
      <header
        className={`hidden md:flex h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 items-center justify-between px-8 fixed top-0 z-[200] ${
          isArabic ? `right-0 ${sidebarOffset}` : `left-0 ${sidebarOffset}`
        } transition-all duration-500`}
        style={isArabic ? { left: 0 } : { right: 0 }}
      >
        <div className="flex items-center gap-6">
          {/* User menu */}
          <div ref={menuRef} className="relative">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-[#00E5FF] shadow-lg shadow-cyan-500/10">
                {userInitial || <User size={20} />}
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <p className="font-black text-sm text-slate-900 leading-none">{userName || shopName || '—'}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">{t('business.dashboard.merchant', 'تاجر')}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>

            {/* Dropdown */}
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className={`absolute top-full ${isArabic ? 'right-0' : 'left-0'} mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden`}>
                  <div className="p-4 border-b border-slate-100">
                    <p className="font-black text-slate-900">{userName || shopName}</p>
                    {userEmail && <p className="text-xs text-slate-400">{userEmail}</p>}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { onNavigateToSettings('account'); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 ${isArabic ? 'text-right' : 'text-left'} transition-all`}
                    >
                      <User size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{t('business.settingsIndex.tabAccount', 'الحساب')}</span>
                    </button>
                    <button
                      onClick={() => { onNavigateToSettings('store'); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 ${isArabic ? 'text-right' : 'text-left'} transition-all`}
                    >
                      <Store size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{t('business.storeSettings.title', 'إعدادات المحل')}</span>
                    </button>
                    <button
                      onClick={() => { onNavigateToSettings('notifications'); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 ${isArabic ? 'text-right' : 'text-left'} transition-all`}
                    >
                      <Bell size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{t('business.settingsIndex.tabNotifications', 'الإشعارات')}</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 ${isArabic ? 'text-right' : 'text-left'} transition-all group`}
                    >
                      <LogOut size={18} className="text-red-500" />
                      <span className="text-sm font-bold text-red-500 group-hover:text-red-600">{t('common.logout', 'تسجيل خروج')}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notification bell */}
          <div className="relative cursor-pointer group" onClick={onOpenNotifications}>
            <Bell className={`w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-[#00E5FF]' : 'text-slate-300 group-hover:text-slate-900'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white text-[8px] flex items-center justify-center font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* POS button */}
          {hasPosTab && (
            <button
              onClick={onNavigateToPos}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
              title={t('business.dashboardTabs.pos', 'نقطة البيع')}
            >
              <Store className="w-5 h-5" />
            </button>
          )}

          {/* Design button */}
          <button
            onClick={onNavigateToDesign}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            title={t('business.dashboardTabs.design', 'التصميم')}
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-900 transition-all"
            title={t('business.dashboard.refreshData', 'تحديث')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Right side: Dashboard title */}
        <div className={`flex flex-col ${isArabic ? 'text-right' : 'text-left'}`}>
          <h2 className="font-black text-slate-900 text-xl leading-none">{t('business.dashboardTabs.overview', 'لوحة التحكم')}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">{shopName || ''}</p>
        </div>
      </header>
    </>
  );
}
