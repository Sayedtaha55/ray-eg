import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, Clock, Package, ShoppingCart, TrendingUp, User, X, Tag, Truck } from 'lucide-react';

enum NotificationType {
  // Customer notifications
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SHOP_FOLLOWED_BACK = 'SHOP_FOLLOWED_BACK',
  PROMOTIONAL_OFFER = 'PROMOTIONAL_OFFER',
  PRICE_DROP = 'PRICE_DROP',
  BACK_IN_STOCK = 'BACK_IN_STOCK',
  
  // System notifications
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  FEATURE_UPDATE = 'FEATURE_UPDATE'
}

enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userId, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/v1/notifications/me?take=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/v1/notifications/me/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/v1/notifications/me/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/notifications/me/read', {
        method: 'PATCH',
      });
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ORDER_CONFIRMED:
        return <CheckCircle className="w-5 h-5" />;
      case NotificationType.ORDER_SHIPPED:
        return <Truck className="w-5 h-5" />;
      case NotificationType.ORDER_DELIVERED:
        return <Package className="w-5 h-5" />;
      case NotificationType.ORDER_CANCELLED:
        return <X className="w-5 h-5" />;
      case NotificationType.PAYMENT_SUCCESSFUL:
        return <TrendingUp className="w-5 h-5" />;
      case NotificationType.PAYMENT_FAILED:
        return <X className="w-5 h-5" />;
      case NotificationType.SHOP_FOLLOWED_BACK:
        return <User className="w-5 h-5" />;
      case NotificationType.PROMOTIONAL_OFFER:
        return <Tag className="w-5 h-5" />;
      case NotificationType.PRICE_DROP:
        return <Tag className="w-5 h-5" />;
      case NotificationType.BACK_IN_STOCK:
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType, priority: NotificationPriority) => {
    const baseColors = {
      [NotificationType.ORDER_CONFIRMED]: 'text-green-500 bg-green-50',
      [NotificationType.ORDER_SHIPPED]: 'text-blue-500 bg-blue-50',
      [NotificationType.ORDER_DELIVERED]: 'text-emerald-500 bg-emerald-50',
      [NotificationType.ORDER_CANCELLED]: 'text-red-500 bg-red-50',
      [NotificationType.PAYMENT_SUCCESSFUL]: 'text-green-500 bg-green-50',
      [NotificationType.PAYMENT_FAILED]: 'text-red-500 bg-red-50',
      [NotificationType.SHOP_FOLLOWED_BACK]: 'text-purple-500 bg-purple-50',
      [NotificationType.PROMOTIONAL_OFFER]: 'text-orange-500 bg-orange-50',
      [NotificationType.PRICE_DROP]: 'text-yellow-500 bg-yellow-50',
      [NotificationType.BACK_IN_STOCK]: 'text-cyan-500 bg-cyan-50',
    };

    const defaultColor = 'text-slate-500 bg-slate-50';
    
    if (priority === NotificationPriority.URGENT) {
      return 'text-red-600 bg-red-50';
    }
    if (priority === NotificationPriority.HIGH) {
      return 'text-orange-600 bg-orange-50';
    }
    
    return baseColors[type] || defaultColor;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BellRing className="w-6 h-6 text-slate-900" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">الإشعارات</h2>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                >
                  تعليم الكل
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-all hover:bg-slate-50 ${
                      !notification.isRead ? 'bg-cyan-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 text-sm mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                              {notification.content}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.createdAt)}
                            </div>
                          </div>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="mr-2 text-cyan-600 hover:text-cyan-700 flex-shrink-0"
                              title="تعليم كمقروء"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="w-full text-center text-cyan-600 hover:text-cyan-700 font-medium text-sm"
            >
              عرض جميع الإشعارات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
