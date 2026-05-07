'use client';

import React from 'react';
import { X, Bell } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const NotificationPanel: React.FC<Props> = ({ isOpen, onClose, notifications }) => {
  const t = useT();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-100 p-8 flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-row-reverse">
        <h2 className="text-2xl font-black text-slate-900">{t('business.dashboardTabs.notifications')}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold">{t('business.overview.noRecentActivity')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationPanel;
