'use client';

import React from 'react';
import { Bell, Search, RefreshCw, Smartphone, Settings, LogOut, Menu } from 'lucide-react';

type Props = {
  shopName?: string;
  userName?: string;
  userEmail?: string;
  userInitial?: string;
  hasPosTab?: boolean;
  unreadCount?: number;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenSidebar?: () => void;
  onOpenNotifications?: () => void;
  onNavigateToPos?: () => void;
  onNavigateToDesign?: () => void;
  onNavigateToSettings?: (tab?: string) => void;
  onRefresh?: () => void;
  onLogout?: () => void;
};

const DashboardHeader: React.FC<Props> = ({
  shopName,
  unreadCount = 0,
  onToggleSidebar,
  onOpenNotifications,
  onNavigateToPos,
  onRefresh,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between flex-row-reverse">
      <div className="flex items-center gap-4">
        <button onClick={onRefresh} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
          <RefreshCw size={20} />
        </button>
        <button onClick={onOpenNotifications} className="relative p-2 hover:bg-slate-50 rounded-xl text-slate-400">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <div className="h-8 w-[1px] bg-slate-100 mx-2" />
        <button onClick={onLogout} className="p-2 hover:bg-red-50 rounded-xl text-red-400">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 flex-row-reverse">
        <button onClick={onToggleSidebar} className="hidden md:flex p-2 hover:bg-slate-50 rounded-xl text-slate-400">
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-black text-slate-900">{shopName}</h2>
      </div>
    </header>
  );
};

export default DashboardHeader;
