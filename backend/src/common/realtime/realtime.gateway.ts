import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, Inject, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      role: string;
      shopId?: string;
    };
    rooms?: Set<string>;
  };
}

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Allow all origins in development, configure for production
      const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
      if (isDev) {
        callback(null, true);
        return;
      }
      // In production, allow configured origins
      const allowedOrigins = String(process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private shopSockets: Map<string, Set<string>> = new Map(); // shopId -> socketIds

  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on /realtime namespace');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or headers
      const token = 
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        this.extractTokenFromCookie(client.handshake.headers?.cookie);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }

      // Verify JWT
      const secret = this.config.get<string>('JWT_SECRET') || 'dev-fallback-secret-change-in-production';
      let payload: any;
      try {
        payload = this.jwtService.verify(token, { secret });
      } catch (err) {
        this.logger.warn(`Client ${client.id} has invalid token`);
        client.emit('error', { message: 'Invalid or expired token' });
        client.disconnect(true);
        return;
      }

      const userId = String(payload?.sub || '').trim();
      if (!userId) {
        client.disconnect(true);
        return;
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, shopId: true, isActive: true },
      });

      if (!user || user.isActive === false) {
        client.emit('error', { message: 'User not found or inactive' });
        client.disconnect(true);
        return;
      }

      // Attach user to socket
      client.data = {
        user: {
          id: String(user.id),
          email: String(user.email),
          role: String((user as any).role || 'customer'),
          shopId: (user as any).shopId ? String((user as any).shopId) : undefined,
        },
        rooms: new Set(),
      };

      // Track socket by user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Auto-join user-specific room
      const userRoom = `user:${userId}`;
      client.join(userRoom);
      client.data.rooms!.add(userRoom);

      // Auto-join shop room for merchants/admins
      if (client.data.user?.shopId) {
        const shopRoom = `shop:${client.data.user.shopId}`;
        client.join(shopRoom);
        client.data.rooms!.add(shopRoom);
        
        if (!this.shopSockets.has(client.data.user.shopId)) {
          this.shopSockets.set(client.data.user.shopId, new Set());
        }
        this.shopSockets.get(client.data.user.shopId)!.add(client.id);
      }

      // Join role-based room for admins
      if (client.data.user?.role?.toUpperCase() === 'ADMIN') {
        client.join('role:admin');
        client.data.rooms!.add('role:admin');
      }

      this.logger.log(`Client ${client.id} authenticated as ${user.email} (${(user as any).role})`);
      
      // Send connection confirmation
      client.emit('connected', {
        userId: user.id,
        role: (user as any).role,
        shopId: (user as any).shopId,
        rooms: Array.from(client.data.rooms!),
      });

    } catch (error) {
      this.logger.error(`Error handling connection: ${error}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.user?.id;
    const shopId = client.data?.user?.shopId;

    // Remove from user sockets
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    // Remove from shop sockets
    if (shopId && this.shopSockets.has(shopId)) {
      this.shopSockets.get(shopId)!.delete(client.id);
      if (this.shopSockets.get(shopId)!.size === 0) {
        this.shopSockets.delete(shopId);
      }
    }

    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    payload: { room: string }
  ) {
    if (!client.data?.user) {
      throw new WsException('Not authenticated');
    }

    const { room } = payload;
    
    // Validate room access
    if (!this.canJoinRoom(client, room)) {
      throw new WsException('Access denied to this room');
    }

    client.join(room);
    client.data.rooms!.add(room);
    
    return { success: true, room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    payload: { room: string }
  ) {
    client.leave(payload.room);
    client.data.rooms?.delete(payload.room);
    return { success: true, room: payload.room };
  }

  // ========== Public Methods for Broadcasting ==========

  /**
   * Emit to a specific shop (all connected users for that shop)
   */
  emitToShop(shopId: string, event: string, data: any) {
    const room = `shop:${shopId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to shop ${shopId}`);
  }

  /**
   * Emit to a specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to user ${userId}`);
  }

  /**
   * Emit to all admins
   */
  emitToAdmins(event: string, data: any) {
    this.server.to('role:admin').emit(event, data);
    this.logger.debug(`Emitted ${event} to admins`);
  }

  /**
   * Emit order update to relevant parties
   */
  emitOrderUpdate(shopId: string, orderId: string, status: string, extra?: any) {
    this.emitToShop(shopId, 'order:updated', {
      orderId,
      status,
      timestamp: Date.now(),
      ...extra,
    });
  }

  /**
   * Emit new order notification
   */
  emitNewOrder(shopId: string, order: any) {
    this.emitToShop(shopId, 'order:new', {
      order,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit product update
   */
  emitProductUpdate(shopId: string, productId: string, action: 'created' | 'updated' | 'deleted') {
    this.emitToShop(shopId, 'product:updated', {
      productId,
      action,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit shop update
   */
  emitShopUpdate(shopId: string, changes: any) {
    this.emitToShop(shopId, 'shop:updated', {
      shopId,
      changes,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit notification
   */
  emitNotification(shopId: string, notification: any) {
    this.emitToShop(shopId, 'notification:new', {
      notification,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit refresh trigger (for smart refresh system)
   */
  emitRefreshTrigger(shopId: string, scope: string, context?: any) {
    this.emitToShop(shopId, 'refresh:trigger', {
      scope,
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * Get connected clients count for a shop
   */
  getShopConnections(shopId: string): number {
    return this.shopSockets.get(shopId)?.size || 0;
  }

  /**
   * Get total connected clients
   */
  getTotalConnections(): number {
    return this.server.sockets.sockets.size;
  }

  // ========== Private Helpers ==========

  private canJoinRoom(client: AuthenticatedSocket, room: string): boolean {
    const role = client.data?.user?.role?.toUpperCase();
    const userShopId = client.data?.user?.shopId;

    // User can join their own room
    if (room === `user:${client.data?.user?.id}`) return true;

    // User can join their shop room
    if (room === `shop:${userShopId}`) return true;

    // Admins can join any shop room
    if (role === 'ADMIN' && room.startsWith('shop:')) return true;

    // Admins can join admin room
    if (role === 'ADMIN' && room === 'role:admin') return true;

    // Deny by default
    return false;
  }

  private extractTokenFromCookie(cookie: string | undefined): string | null {
    if (!cookie) return null;
    const parts = cookie.split(';');
    for (const p of parts) {
      const trimmed = p.trim();
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k === 'ray_session') {
        return trimmed.slice(eq + 1).trim() || null;
      }
    }
    return null;
  }
}
