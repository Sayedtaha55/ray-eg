import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// Event types for type-safe broadcasting
export type RealtimeEvent = {
  type: 'ORDER_NEW' | 'ORDER_UPDATED' | 'ORDER_STATUS_CHANGED' | 
        'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED' |
        'SHOP_UPDATED' | 'NOTIFICATION_NEW' | 'STOCK_LOW' |
        'RESERVATION_NEW' | 'RESERVATION_UPDATED' | 'MESSAGE_NEW' |
        'REFRESH_TRIGGER';
  shopId: string;
  payload: any;
  timestamp: number;
};

@Injectable()
export class RealtimeService implements OnModuleInit {
  private eventSubject = new Subject<RealtimeEvent>();

  constructor(
    @Inject(RealtimeGateway) private readonly gateway: RealtimeGateway,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Subscribe to Prisma events or other event sources
    // This can be extended to listen to database changes
  }

  /**
   * Broadcast an order event to connected clients
   */
  broadcastOrderEvent(
    shopId: string,
    type: 'ORDER_NEW' | 'ORDER_UPDATED' | 'ORDER_STATUS_CHANGED',
    payload: { orderId: string; status?: string; order?: any }
  ) {
    const event: RealtimeEvent = {
      type,
      shopId,
      payload,
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);

    // Emit via WebSocket
    switch (type) {
      case 'ORDER_NEW':
        this.gateway.emitNewOrder(shopId, payload.order);
        break;
      case 'ORDER_UPDATED':
      case 'ORDER_STATUS_CHANGED':
        this.gateway.emitOrderUpdate(shopId, payload.orderId, payload.status || '', payload);
        break;
    }

    // Also emit refresh trigger for smart refresh system
    this.gateway.emitRefreshTrigger(shopId, 'orders', { orderId: payload.orderId });
  }

  /**
   * Broadcast a product event
   */
  broadcastProductEvent(
    shopId: string,
    type: 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED',
    payload: { productId: string; product?: any }
  ) {
    const event: RealtimeEvent = {
      type,
      shopId,
      payload,
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);

    // Emit via WebSocket
    this.gateway.emitProductUpdate(shopId, payload.productId, type.split('_')[1].toLowerCase() as any);

    // Emit refresh trigger
    this.gateway.emitRefreshTrigger(shopId, 'products', { productId: payload.productId });
  }

  /**
   * Broadcast a shop update event
   */
  broadcastShopUpdate(shopId: string, changes: Record<string, any>) {
    const event: RealtimeEvent = {
      type: 'SHOP_UPDATED',
      shopId,
      payload: { changes },
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitShopUpdate(shopId, changes);
    this.gateway.emitRefreshTrigger(shopId, 'shop', { changes });
  }

  /**
   * Broadcast a notification
   */
  broadcastNotification(shopId: string, notification: any) {
    const event: RealtimeEvent = {
      type: 'NOTIFICATION_NEW',
      shopId,
      payload: { notification },
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitNotification(shopId, notification);
  }

  /**
   * Broadcast a low stock alert
   */
  broadcastLowStockAlert(shopId: string, productId: string, productName: string, currentStock: number) {
    const event: RealtimeEvent = {
      type: 'STOCK_LOW',
      shopId,
      payload: { productId, productName, currentStock },
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitToShop(shopId, 'stock:low', {
      productId,
      productName,
      currentStock,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast a reservation event
   */
  broadcastReservationEvent(
    shopId: string,
    type: 'RESERVATION_NEW' | 'RESERVATION_UPDATED',
    payload: { reservationId: string; reservation?: any }
  ) {
    const event: RealtimeEvent = {
      type,
      shopId,
      payload,
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitToShop(shopId, 'reservation:updated', {
      reservationId: payload.reservationId,
      type,
      timestamp: Date.now(),
    });
    this.gateway.emitRefreshTrigger(shopId, 'reservations', payload);
  }

  /**
   * Broadcast a message event
   */
  broadcastMessageEvent(shopId: string, message: any) {
    const event: RealtimeEvent = {
      type: 'MESSAGE_NEW',
      shopId,
      payload: { message },
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitToShop(shopId, 'message:new', {
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit a custom refresh trigger for any scope
   */
  triggerRefresh(shopId: string, scope: string, context?: any) {
    const event: RealtimeEvent = {
      type: 'REFRESH_TRIGGER',
      shopId,
      payload: { scope, context },
      timestamp: Date.now(),
    };

    this.eventSubject.next(event);
    this.gateway.emitRefreshTrigger(shopId, scope, context);
  }

  /**
   * Subscribe to all events (for logging, analytics, etc.)
   */
  subscribeToAllEvents(callback: (event: RealtimeEvent) => void): Subscription {
    return this.eventSubject.asObservable().subscribe(callback);
  }

  /**
   * Subscribe to events for a specific shop
   */
  subscribeToShopEvents(shopId: string, callback: (event: RealtimeEvent) => void): Subscription {
    return this.eventSubject.asObservable()
      .pipe(filter(e => e.shopId === shopId))
      .subscribe(callback);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.gateway.getTotalConnections(),
      shopConnections: (shopId: string) => this.gateway.getShopConnections(shopId),
    };
  }
}
