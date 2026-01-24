import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { NotificationType, NotificationChannel } from './types/notifications';

@Injectable()
export class NotificationPreferencesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getUserPreferences(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('User ID required');

    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId: uid },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await this.createDefaultPreferences(uid);
    }

    return preferences;
  }

  async updatePreferences(userId: string, updates: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    inAppEnabled?: boolean;
    typeSettings?: Record<string, any>;
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('User ID required');

    const preferences = await this.prisma.notificationPreference.upsert({
      where: { userId: uid },
      update: updates,
      create: {
        userId: uid,
        emailEnabled: updates.emailEnabled ?? true,
        smsEnabled: updates.smsEnabled ?? false,
        pushEnabled: updates.pushEnabled ?? true,
        inAppEnabled: updates.inAppEnabled ?? true,
        typeSettings: updates.typeSettings ?? this.getDefaultTypeSettings(),
      },
    });

    return preferences;
  }

  async updateTypePreferences(userId: string, type: NotificationType, settings: {
    enabled: boolean;
    channels: NotificationChannel[];
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('User ID required');

    const preferences = await this.getUserPreferences(uid);
    const currentTypeSettings = preferences.typeSettings as any || {};

    const updatedTypeSettings = {
      ...currentTypeSettings,
      [type]: settings,
    };

    return this.prisma.notificationPreference.update({
      where: { userId: uid },
      data: {
        typeSettings: updatedTypeSettings,
      },
    });
  }

  async getTypePreferences(userId: string, type: NotificationType) {
    const preferences = await this.getUserPreferences(userId);
    const typeSettings = preferences.typeSettings as any || {};
    
    return typeSettings[type] || {
      enabled: true,
      channels: [NotificationChannel.IN_APP],
    };
  }

  async shouldSendNotification(userId: string, type: NotificationType, channel: NotificationChannel): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Check if channel is globally enabled
      switch (channel) {
        case NotificationChannel.EMAIL:
          if (!preferences.emailEnabled) return false;
          break;
        case NotificationChannel.SMS:
          if (!preferences.smsEnabled) return false;
          break;
        case NotificationChannel.PUSH:
          if (!preferences.pushEnabled) return false;
          break;
        case NotificationChannel.IN_APP:
          if (!preferences.inAppEnabled) return false;
          break;
      }

      // Check type-specific preferences
      const typePreferences = await this.getTypePreferences(userId, type);
      if (!typePreferences.enabled) return false;
      
      return typePreferences.channels.includes(channel);
    } catch (error) {
      // If preferences can't be determined, default to sending in-app notifications
      return channel === NotificationChannel.IN_APP;
    }
  }

  async getEnabledChannels(userId: string, type: NotificationType): Promise<NotificationChannel[]> {
    const typePreferences = await this.getTypePreferences(userId, type);
    const userPreferences = await this.getUserPreferences(userId);
    
    const enabledChannels: NotificationChannel[] = [];
    
    for (const channel of typePreferences.channels) {
      let channelEnabled = false;
      
      switch (channel) {
        case NotificationChannel.EMAIL:
          channelEnabled = userPreferences.emailEnabled;
          break;
        case NotificationChannel.SMS:
          channelEnabled = userPreferences.smsEnabled;
          break;
        case NotificationChannel.PUSH:
          channelEnabled = userPreferences.pushEnabled;
          break;
        case NotificationChannel.IN_APP:
          channelEnabled = userPreferences.inAppEnabled;
          break;
      }
      
      if (channelEnabled) {
        enabledChannels.push(channel);
      }
    }
    
    return enabledChannels;
  }

  private async createDefaultPreferences(userId: string) {
    return this.prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        typeSettings: this.getDefaultTypeSettings(),
      },
    });
  }

  private getDefaultTypeSettings() {
    const settings: Record<string, any> = {};
    
    // Merchant notifications (enabled by default for merchants)
    const merchantTypes = [
      NotificationType.NEW_FOLLOWER,
      NotificationType.NEW_ORDER,
      NotificationType.ORDER_STATUS_CHANGED,
      NotificationType.NEW_MESSAGE,
      NotificationType.LOW_STOCK,
      NotificationType.PAYMENT_RECEIVED,
      NotificationType.REVIEW_RECEIVED,
    ];

    // Customer notifications (enabled by default for customers)
    const customerTypes = [
      NotificationType.ORDER_CONFIRMED,
      NotificationType.ORDER_SHIPPED,
      NotificationType.ORDER_DELIVERED,
      NotificationType.ORDER_CANCELLED,
      NotificationType.PAYMENT_SUCCESSFUL,
      NotificationType.PAYMENT_FAILED,
      NotificationType.SHOP_FOLLOWED_BACK,
      NotificationType.PROMOTIONAL_OFFER,
      NotificationType.PRICE_DROP,
      NotificationType.BACK_IN_STOCK,
    ];

    // System notifications (enabled by default for all)
    const systemTypes = [
      NotificationType.SYSTEM_MAINTENANCE,
      NotificationType.SECURITY_ALERT,
      NotificationType.ACCOUNT_VERIFICATION,
      NotificationType.FEATURE_UPDATE,
    ];

    // Set default settings for all types
    [...merchantTypes, ...customerTypes, ...systemTypes].forEach(type => {
      settings[type] = {
        enabled: true,
        channels: [NotificationChannel.IN_APP],
        // Add email for important notifications
        ...(systemTypes.includes(type) && { channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL] }),
        // Add push for customer notifications
        ...(customerTypes.includes(type) && { channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH] }),
      };
    });

    // Special cases
    settings[NotificationType.PROMOTIONAL_OFFER] = {
      enabled: true,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    };

    settings[NotificationType.SECURITY_ALERT] = {
      enabled: true,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.SMS],
    };

    return settings;
  }

  async bulkUpdatePreferences(userId: string, preferences: Array<{
    type: NotificationType;
    enabled: boolean;
    channels: NotificationChannel[];
  }>) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('User ID required');

    const currentPreferences = await this.getUserPreferences(uid);
    const currentTypeSettings = currentPreferences.typeSettings as any || {};

    const updatedTypeSettings = { ...currentTypeSettings };
    
    preferences.forEach(pref => {
      updatedTypeSettings[pref.type] = {
        enabled: pref.enabled,
        channels: pref.channels,
      };
    });

    return this.prisma.notificationPreference.update({
      where: { userId: uid },
      data: {
        typeSettings: updatedTypeSettings,
      },
    });
  }

  async resetToDefaults(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('User ID required');

    return this.prisma.notificationPreference.update({
      where: { userId: uid },
      data: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        inAppEnabled: true,
        typeSettings: this.getDefaultTypeSettings(),
      },
    });
  }
}
