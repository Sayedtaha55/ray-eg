import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationType, NotificationPriority } from './types/notifications';

@Injectable()
export class NotificationEventsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
  ) {}

  async onShopFollowerCreated(shopId: string, followerId: string) {
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true }
    });

    if (follower) {
      await this.notificationService.notifyNewFollower(shopId, followerId, follower.name);
    }
  }

  async onOrderCreated(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true } },
        shop: { select: { id: true } }
      }
    });

    if (order) {
      await this.notificationService.notifyNewOrder(
        order.shopId,
        order.id,
        order.user.name,
        order.totalAmount
      );

      await this.notificationService.notifyOrderConfirmed(order.userId, order.id);
    }
  }

  async onOrderStatusUpdated(orderId: string, newStatus: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, shopId: true }
    });

    if (order) {
      await this.notificationService.notifyOrderStatusChanged(order.userId, orderId, newStatus);

      if (newStatus === 'DELIVERED') {
        await this.notificationService.notifyOrderDelivered(order.userId, orderId);
      }
    }
  }

  async onMessageCreated(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { shopId: true, senderId: true, content: true }
    });

    if (message) {
      const sender = await this.prisma.user.findUnique({
        where: { id: message.senderId },
        select: { name: true }
      });
      const senderName = sender?.name || 'Unknown';
      
      if (senderName !== 'System') {
        await this.notificationService.notifyNewMessage(
          message.shopId,
          senderName,
          message.content
        );
      }
    }
  }

  async onProductLowStock(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, stock: true, shop: { select: { id: true } } }
    });

    if (product && product.stock <= 5) {
      await this.notificationService.notifyLowStock(
        product.shop.id,
        product.name,
        product.stock
      );
    }
  }

  async onOfferCreated(offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        shop: {
          include: {
            followersList: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (offer && offer.shop.followersList.length > 0) {
      const notifications = offer.shop.followersList.map(follower => ({
        type: NotificationType.PROMOTIONAL_OFFER,
        title: 'عرض خاص!',
        content: `${offer.shop.name}: ${offer.title} - خصم ${offer.discount}%`,
        userId: follower.id,
        priority: NotificationPriority.MEDIUM,
        metadata: { 
          shopName: offer.shop.name, 
          offerTitle: offer.title, 
          discount: offer.discount 
        },
      }));

      await this.notificationService.createBulkNotifications(notifications);
    }
  }

  async onPaymentReceived(orderId: string, amount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { shopId: true }
    });

    if (order) {
      await this.notificationService.notifyPaymentReceived(order.shopId, orderId, amount);
    }
  }

  async onShopVisited(shopId: string) {
    const analytics = await this.prisma.shopAnalytics.findUnique({
      where: { shopId },
      select: { visitorsCount: true }
    });

    if (analytics?.visitorsCount && analytics.visitorsCount % 10 === 0) {
      await this.notificationService.notifyShopVisit(shopId, analytics.visitorsCount);
    }
  }
}
