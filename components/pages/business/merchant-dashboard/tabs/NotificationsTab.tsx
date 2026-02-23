import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, Clock, DollarSign, MessageSquare, Package, ShoppingCart, TrendingUp, User, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';

enum NotificationType {
  // Shop notifications (for merchants)
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  NEW_ORDER = 'NEW_ORDER',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SHOP_VISIT = 'SHOP_VISIT',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  LOW_STOCK = 'LOW_STOCK',
  OFFER_EXPIRING = 'OFFER_EXPIRING',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  
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

interface NotificationsTabProps {
  shopId: string;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ shopId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [shopId]);

  const fetchNotifications = async () => {
    try {
      const data = await ApiService.getNotifications(shopId);
      const normalized = (data || []).map((n: any) => ({
        id: String(n.id),
        title: String(n.title || ''),
        content: String(n.message || n.content || ''),
        type: String(n.type || '') as any,
        priority: String(n.priority || 'MEDIUM') as any,
        isRead: Boolean(n.is_read ?? n.isRead),
        createdAt: String(n.created_at || n.createdAt || new Date().toISOString()),
        metadata: n.metadata,
      }));
      setNotifications(normalized as any);
      setUnreadCount(normalized.filter((n: any) => !Boolean(n.isRead)).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await ApiService.markShopNotificationRead(shopId, notificationId);
      
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
      await ApiService.markNotificationsRead(shopId);
      
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
      case NotificationType.NEW_FOLLOWER:
        return <User className="w-5 h-5" />;
      case NotificationType.NEW_ORDER:
        return <ShoppingCart className="w-5 h-5" />;
      case NotificationType.ORDER_STATUS_CHANGED:
        return <Package className="w-5 h-5" />;
      case NotificationType.NEW_MESSAGE:
        return <MessageSquare className="w-5 h-5" />;
      case NotificationType.SHOP_VISIT:
        return <TrendingUp className="w-5 h-5" />;
      case NotificationType.LOW_STOCK:
        return <Package className="w-5 h-5" />;
      case NotificationType.PAYMENT_RECEIVED:
        return <DollarSign className="w-5 h-5" />;
      case NotificationType.REVIEW_RECEIVED:
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType, priority: NotificationPriority) => {
    const baseColors = {
      [NotificationType.NEW_FOLLOWER]: 'text-blue-500 bg-blue-50',
      [NotificationType.NEW_ORDER]: 'text-green-500 bg-green-50',
      [NotificationType.ORDER_STATUS_CHANGED]: 'text-orange-500 bg-orange-50',
      [NotificationType.NEW_MESSAGE]: 'text-purple-500 bg-purple-50',
      [NotificationType.SHOP_VISIT]: 'text-cyan-500 bg-cyan-50',
      [NotificationType.LOW_STOCK]: 'text-red-500 bg-red-50',
      [NotificationType.PAYMENT_RECEIVED]: 'text-emerald-500 bg-emerald-50',
      [NotificationType.REVIEW_RECEIVED]: 'text-yellow-500 bg-yellow-50',
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

  const filteredNotifications = notifications.filter(n => 
    filter === 'ALL' || n.type === filter
  );

  const notificationTypes = [
    { value: 'ALL', label: 'الكل', count: notifications.length },
    { value: NotificationType.NEW_FOLLOWER, label: 'متابعون جدد', count: notifications.filter(n => n.type === NotificationType.NEW_FOLLOWER).length },
    { value: NotificationType.NEW_ORDER, label: 'طلبات جديدة', count: notifications.filter(n => n.type === NotificationType.NEW_ORDER).length },
    { value: NotificationType.NEW_MESSAGE, label: 'رسائل', count: notifications.filter(n => n.type === NotificationType.NEW_MESSAGE).length },
    { value: NotificationType.PAYMENT_RECEIVED, label: 'مدفوعات', count: notifications.filter(n => n.type === NotificationType.PAYMENT_RECEIVED).length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-6 h-6 text-cyan-500" />
            <h2 className="text-2xl font-black text-slate-900">الإشعارات</h2>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} غير مقروء
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
          >
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {notificationTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value as any)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
              filter === type.value
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type.label}
            {type.count > 0 && (
              <span className="mr-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {type.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {filter === 'ALL' ? 'لا توجد إشعارات' : `لا توجد إشعارات ${notificationTypes.find(t => t.value === filter)?.label}`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-2xl border p-6 transition-all hover:shadow-md ${
                !notification.isRead ? 'border-cyan-200 bg-cyan-50/30' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mr-4 text-cyan-600 hover:text-cyan-700"
                        title="تعليم كمقروء"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;
