'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock, DollarSign, MessageSquare, Package, ShoppingCart, TrendingUp, User, X } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import type { ShopNotification } from '@/lib/hooks/useNotifications';

const MotionDiv = motion.div as any;

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ShopNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const getNotifIcon = (type: string) => {
  switch (type) {
    case 'NEW_FOLLOWER': return <User className="w-5 h-5" />;
    case 'NEW_ORDER': return <ShoppingCart className="w-5 h-5" />;
    case 'ORDER_STATUS_CHANGED': return <Package className="w-5 h-5" />;
    case 'NEW_MESSAGE': return <MessageSquare className="w-5 h-5" />;
    case 'SHOP_VISIT': return <TrendingUp className="w-5 h-5" />;
    case 'LOW_STOCK': return <Package className="w-5 h-5" />;
    case 'PAYMENT_RECEIVED': return <DollarSign className="w-5 h-5" />;
    case 'REVIEW_RECEIVED': return <CheckCircle className="w-5 h-5" />;
    default: return <Bell className="w-5 h-5" />;
  }
};

const getNotifColor = (type: string, priority: string) => {
  const base: Record<string, string> = {
    NEW_FOLLOWER: 'text-blue-500 bg-blue-50',
    NEW_ORDER: 'text-green-500 bg-green-50',
    ORDER_STATUS_CHANGED: 'text-orange-500 bg-orange-50',
    NEW_MESSAGE: 'text-purple-500 bg-purple-50',
    SHOP_VISIT: 'text-cyan-500 bg-cyan-50',
    LOW_STOCK: 'text-red-500 bg-red-50',
    PAYMENT_RECEIVED: 'text-emerald-500 bg-emerald-50',
    REVIEW_RECEIVED: 'text-yellow-500 bg-yellow-50',
  };
  if (priority === 'URGENT') return 'text-red-600 bg-red-50';
  if (priority === 'HIGH') return 'text-orange-600 bg-orange-50';
  return base[type] || 'text-slate-500 bg-slate-50';
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen, onClose, notifications, unreadCount, onMarkRead, onMarkAllRead,
}) => {
  const t = useT();
  const { dir } = useLocale();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[300]"
          />
          <MotionDiv
            initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-full max-w-sm bg-white shadow-2xl z-[310] flex flex-col`}
          >
            <header className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <Bell className="w-5 h-5 text-slate-900" />
                <h3 className="font-black text-lg">{t('notificationPanel.alerts', 'التنبيهات')}</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Bell className="w-12 h-12 opacity-20" />
                  <p className="font-bold">{t('notificationPanel.noAlerts', 'لا توجد تنبيهات')}</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      n.isRead ? 'bg-white border-slate-100' : 'bg-cyan-50/50 border-cyan-100 shadow-sm'
                    }`}
                    onClick={() => { if (!n.isRead) onMarkRead(n.id); }}
                  >
                    <div className={`flex items-start gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-2.5 rounded-full shrink-0 ${getNotifColor(n.type, n.priority)}`}>
                        {getNotifIcon(n.type)}
                      </div>
                      <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <h4 className="font-black text-sm text-slate-900 mb-1">{n.title}</h4>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{n.content}</p>
                        <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <footer className="p-4 border-t border-slate-100">
                <button
                  onClick={onMarkAllRead}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all"
                >
                  {t('notificationPanel.markAllRead', 'تحديد الكل كمقروء')}
                </button>
              </footer>
            )}
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(NotificationPanel);
