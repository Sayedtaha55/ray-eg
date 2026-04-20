import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { NotificationType, NotificationPriority, NotificationChannel, NotificationData } from './types/notifications';
import { WebPushService } from './web-push.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WebPushService) private readonly webPushService: WebPushService,
  ) {}

  private normalizeWebPushSubscription(raw: any) {
    if (!raw || typeof raw !== 'object') throw new BadRequestException('subscription غير صحيحة');
    const expoPushToken = String((raw as any)?.expoPushToken || '').trim();
    if (expoPushToken) {
      if (!/^ExponentPushToken\[[^\]]+\]$/.test(expoPushToken) && !/^ExpoPushToken\[[^\]]+\]$/.test(expoPushToken)) {
        throw new BadRequestException('expoPushToken غير صحيح');
      }
      const endpointRaw = String((raw as any)?.endpoint || '').trim();
      const endpoint = endpointRaw || `https://expo.dev/push/${encodeURIComponent(expoPushToken)}`;
      return {
        endpoint,
        expoPushToken,
      };
    }

    const endpoint = String((raw as any)?.endpoint || '').trim();
    if (!endpoint) throw new BadRequestException('subscription.endpoint مطلوب');
    if (endpoint.length > 2048) throw new BadRequestException('subscription.endpoint غير صحيح');
    try {
      const url = new URL(endpoint);
      const proto = String(url.protocol || '').toLowerCase();
      if (proto !== 'https:') throw new BadRequestException('subscription.endpoint غير صحيح');
    } catch {
      throw new BadRequestException('subscription.endpoint غير صحيح');
    }

    const keys = (raw as any)?.keys;
    if (!keys || typeof keys !== 'object') throw new BadRequestException('subscription.keys مطلوبة');
    const p256dh = String((keys as any)?.p256dh || '').trim();
    const auth = String((keys as any)?.auth || '').trim();
    if (!p256dh || !auth) throw new BadRequestException('subscription.keys غير صحيحة');
    if (p256dh.length > 256 || auth.length > 256) throw new BadRequestException('subscription.keys غير صحيحة');

    return {
      ...raw,
      endpoint,
      keys: {
        ...(keys as any),
        p256dh,
        auth,
      },
    };
  }

  private buildMerchantPushUrl(data: NotificationData) {
    return '/business/dashboard';
  }

  private buildCustomerPushUrl(data: NotificationData) {
    return '/profile?tab=notifications';
  }

  async registerMerchantPushSubscription(params: {
    actor: { role: string; shopId?: string };
    shopId: string;
    subscription: any;
  }) {
    const sid = String(params?.shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');
    const role = String(params?.actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(params?.actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const subscription = this.normalizeWebPushSubscription(params?.subscription);
    const endpoint = String(subscription.endpoint);

    await this.prisma.merchantPushSubscription.upsert({
      where: { shopId_endpoint: { shopId: sid, endpoint } } as any,
      create: {
        shopId: sid,
        endpoint,
        subscription,
        isActive: true,
        lastSeenAt: new Date(),
      } as any,
      update: {
        subscription,
        isActive: true,
        lastSeenAt: new Date(),
      } as any,
    } as any);

    return { ok: true };
  }

  async unregisterMerchantPushSubscription(params: {
    actor: { role: string; shopId?: string };
    shopId: string;
    endpoint: string;
  }) {
    const sid = String(params?.shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');
    const role = String(params?.actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(params?.actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const endpoint = String(params?.endpoint || '').trim();
    if (!endpoint) throw new BadRequestException('endpoint مطلوب');

    await this.prisma.merchantPushSubscription.updateMany({
      where: { shopId: sid, endpoint },
      data: { isActive: false } as any,
    } as any);

    return { ok: true };
  }

  async registerCustomerPushSubscription(params: { userId: string; subscription: any }) {
    const uid = String(params?.userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const subscription = this.normalizeWebPushSubscription(params?.subscription);
    const endpoint = String(subscription.endpoint);

    await this.prisma.customerPushSubscription.upsert({
      where: { userId_endpoint: { userId: uid, endpoint } } as any,
      create: {
        userId: uid,
        endpoint,
        subscription,
        isActive: true,
        lastSeenAt: new Date(),
      } as any,
      update: {
        subscription,
        isActive: true,
        lastSeenAt: new Date(),
      } as any,
    } as any);

    return { ok: true };
  }

  async unregisterCustomerPushSubscription(params: { userId: string; endpoint: string }) {
    const uid = String(params?.userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const endpoint = String(params?.endpoint || '').trim();
    if (!endpoint) throw new BadRequestException('endpoint مطلوب');

    await this.prisma.customerPushSubscription.updateMany({
      where: { userId: uid, endpoint },
      data: { isActive: false } as any,
    } as any);

    return { ok: true };
  }

  async createNotification(data: NotificationData) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority || NotificationPriority.MEDIUM,
        shopId: data.shopId,
        userId: data.userId,
        orderId: data.orderId,
        channels: data.channels || [NotificationChannel.IN_APP],
        metadata: data.metadata || {},
        sentAt: new Date(),
      } as any,
    });

    try {
      const title = String(data?.title || '').trim() || 'إشعار جديد';
      const body = String(data?.content || '').trim();
      const tag = String((notification as any)?.id || '').trim();

      if (data?.shopId) {
        await this.webPushService.sendToMerchantShop(String(data.shopId), {
          title,
          body,
          url: this.buildMerchantPushUrl(data),
          tag: tag ? `merchant-${tag}` : undefined,
        });
      }

      if (data?.userId) {
        await this.webPushService.sendToCustomerUser(String(data.userId), {
          title,
          body,
          url: this.buildCustomerPushUrl(data),
          tag: tag ? `customer-${tag}` : undefined,
        });
      }
    } catch {
    }

    return notification;
  }

  async createBulkNotifications(notifications: NotificationData[]) {
    const created = await this.prisma.notification.createMany({
      data: notifications.map(n => ({
        title: n.title,
        content: n.content,
        type: n.type,
        priority: n.priority || NotificationPriority.MEDIUM,
        shopId: n.shopId,
        userId: n.userId,
        orderId: n.orderId,
        channels: n.channels || [NotificationChannel.IN_APP],
        metadata: n.metadata || {},
        sentAt: new Date(),
      })) as any,
    });

    return created;
  }

  async notifyNewFollower(shopId: string, followerId: string, followerName: string) {
    await this.createNotification({
      type: NotificationType.NEW_FOLLOWER,
      title: 'متابع جديد!',
      content: `${followerName} بدأ يتابع متجرك`,
      shopId,
      priority: NotificationPriority.MEDIUM,
      metadata: { followerId, followerName },
    });
  }

  async notifyNewOrder(
    shopId: string,
    orderId: string,
    customerName: string,
    total: number,
    extraMeta?: Record<string, any>,
  ) {
    await this.createNotification({
      type: NotificationType.NEW_ORDER,
      title: 'طلب جديد!',
      content: `${customerName} طلب منتجات بقيمة ${total} ج.م`,
      shopId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { customerName, total, ...(extraMeta || {}) },
    });
  }

  async notifyOrderStatusChanged(userId: string, orderId: string, newStatus: string) {
    await this.createNotification({
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: 'تحديث حالة الطلب',
      content: `تم تحديث حالة طلبك إلى: ${newStatus}`,
      userId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { newStatus },
    });
  }

  async notifyNewMessage(shopId: string, senderName: string, messageContent: string) {
    await this.createNotification({
      type: NotificationType.NEW_MESSAGE,
      title: 'رسالة جديدة',
      content: `${senderName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
      shopId,
      priority: NotificationPriority.MEDIUM,
      metadata: { senderName, messageContent },
    });
  }

  async notifyShopVisit(shopId: string, visitorCount: number) {
    await this.createNotification({
      type: NotificationType.SHOP_VISIT,
      title: 'زيارات المتجر',
      content: `متجرك حصل على ${visitorCount} زيارة اليوم`,
      shopId,
      priority: NotificationPriority.LOW,
      metadata: { visitorCount },
    });
  }

  async notifyLowStock(shopId: string, productName: string, currentStock: number) {
    await this.createNotification({
      type: NotificationType.LOW_STOCK,
      title: 'نفاد المخزون',
      content: `المخزون المتبقي من ${productName}: ${currentStock} قطعة`,
      shopId,
      priority: NotificationPriority.HIGH,
      metadata: { productName, currentStock },
    });
  }

  async notifyPaymentReceived(shopId: string, orderId: string, amount: number) {
    await this.createNotification({
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'استلام الدفعة',
      content: `تم استلام دفعة بقيمة ${amount} ج.م للطلب #${orderId}`,
      shopId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { amount },
    });
  }

  async notifyPromotionalOffer(userId: string, shopName: string, offerTitle: string, discount: number) {
    await this.createNotification({
      type: NotificationType.PROMOTIONAL_OFFER,
      title: 'عرض خاص!',
      content: `${shopName}: ${offerTitle} - خصم ${discount}%`,
      userId,
      priority: NotificationPriority.MEDIUM,
      metadata: { shopName, offerTitle, discount },
    });
  }

  async notifyOrderConfirmed(userId: string, orderId: string) {
    await this.createNotification({
      type: NotificationType.ORDER_CONFIRMED,
      title: 'تأكيد الطلب',
      content: `تم تأكيد طلبك #${orderId}`,
      userId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { orderId },
    });
  }

  async notifyOrderDelivered(userId: string, orderId: string) {
    await this.createNotification({
      type: NotificationType.ORDER_DELIVERED,
      title: 'تسليم الطلب',
      content: `تم تسليم طلبك #${orderId} بنجاح`,
      userId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { orderId },
    });
  }

  async listForUser(userId: string, opts?: { take?: number; skip?: number }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 100) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;

    return this.prisma.notification.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        isRead: true,
        createdAt: true,
        metadata: true,
        orderId: true,
      },
      take,
      skip,
    });
  }

  async unreadCountForUser(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const count = await this.prisma.notification.count({
      where: { userId: uid, isRead: false },
    });

    return { count };
  }

  async markAllReadForUser(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    await this.prisma.notification.updateMany({
      where: { userId: uid, isRead: false },
      data: { isRead: true },
    });

    return { ok: true };
  }

  async markReadForShop(shopId: string, actor: { role: string; shopId?: string }, notificationId: string) {
    const sid = String(shopId || '').trim();
    const id = String(notificationId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');
    if (!id) throw new BadRequestException('id مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || String((notif as any).shopId || '') !== sid || (notif as any).userId != null) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { ok: true };
  }

  async markReadForUser(userId: string, notificationId: string) {
    const uid = String(userId || '').trim();
    const id = String(notificationId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');
    if (!id) throw new BadRequestException('id مطلوب');

    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== uid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return { ok: true };
  }

  async listForShop(shopId: string, actor: { role: string; shopId?: string }, opts?: { take?: number; skip?: number }) {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 100) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;

    return this.prisma.notification.findMany({
      where: { shopId: sid, userId: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        isRead: true,
        createdAt: true,
        metadata: true,
        orderId: true,
      },
      take,
      skip,
    });
  }

  async unreadCountForShop(shopId: string, actor: { role: string; shopId?: string }) {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const count = await this.prisma.notification.count({
      where: { shopId: sid, userId: null, isRead: false },
    });

    return { count };
  }

  async markAllReadForShop(shopId: string, actor: { role: string; shopId?: string }) {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && String(actor?.shopId || '') !== sid) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    await this.prisma.notification.updateMany({
      where: { shopId: sid, userId: null, isRead: false },
      data: { isRead: true },
    });

    return { ok: true };
  }
}
