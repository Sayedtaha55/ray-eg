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

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  variables?: string[];
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

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  types: Record<NotificationType, {
    enabled: boolean;
    channels: NotificationChannel[];
  }>;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    event: string;
    conditions: Record<string, any>;
  };
  actions: {
    type: NotificationType;
    template: string;
    channels: NotificationChannel[];
    delay?: number; // in minutes
  };
  isActive: boolean;
  targetAudience?: {
    roles?: string[];
    shopCategories?: string[];
    locations?: string[];
  };
}
