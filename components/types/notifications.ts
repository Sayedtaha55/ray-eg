export enum NotificationType {
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

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'
}

export interface NotificationData {
  type: NotificationType;
  title: string;
  content: string;
  shopId?: string;
  userId?: string;
  orderId?: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}
