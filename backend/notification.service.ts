import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { NotificationType, NotificationPriority, NotificationChannel, NotificationData } from './types/notifications';

@Injectable()
export class NotificationService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  async notifyNewOrder(shopId: string, orderId: string, customerName: string, total: number) {
    await this.createNotification({
      type: NotificationType.NEW_ORDER,
      title: 'طلب جديد!',
      content: `${customerName} طلب منتجات بقيمة ${total} ج.م`,
      shopId,
      orderId,
      priority: NotificationPriority.HIGH,
      metadata: { customerName, total },
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
