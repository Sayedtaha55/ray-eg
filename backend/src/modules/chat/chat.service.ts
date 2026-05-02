import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RealtimeService } from '@common/realtime/realtime.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RealtimeService) private readonly realtime?: RealtimeService,
  ) {}

  private ensureShopAccess(params: { shopId: string; user: any }) {
    const role = String(params.user?.role || '').toUpperCase();
    const userShopId = params.user?.shopId ? String(params.user.shopId) : '';
    const shopId = String(params.shopId);

    if (role === 'ADMIN') return;
    if (role === 'MERCHANT' && userShopId && userShopId === shopId) return;

    throw new ForbiddenException('Access denied');
  }

  async listMerchantChats(shopId: string, user: any) {
    this.ensureShopAccess({ shopId, user });

    const lastMessages = await this.prisma.message.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        content: true,
        senderId: true,
        senderName: true,
        role: true,
        createdAt: true,
      },
    });

    const byCustomerId: Record<string, any> = {};
    for (const m of lastMessages) {
      const customerId = String(m.senderId || '').trim();
      if (!customerId) continue;
      if (byCustomerId[customerId]) continue;

      byCustomerId[customerId] = {
        userId: customerId,
        lastMessage: String(m.content || ''),
        lastMessageAt: m.createdAt,
        userName: m.role === 'CUSTOMER' ? String(m.senderName || '') : '',
      };
    }

    const userIds = Object.keys(byCustomerId);
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, phone: true },
        })
      : [];

    const usersById: Record<string, any> = {};
    for (const u of users) usersById[String(u.id)] = u;

    const chats = userIds.map((uid) => ({
      userId: uid,
      userName:
        usersById[uid]?.name ||
        usersById[uid]?.email ||
        usersById[uid]?.phone ||
        byCustomerId[uid]?.userName ||
        'Customer',
      lastMessage: byCustomerId[uid]?.lastMessage || '',
      lastMessageAt: byCustomerId[uid]?.lastMessageAt || null,
    }));

    return chats.sort(
      (a, b) => new Date(String(b.lastMessageAt || 0)).getTime() - new Date(String(a.lastMessageAt || 0)).getTime(),
    );
  }

  async getThreadMessages(shopId: string, otherUserId: string, user: any) {
    this.ensureShopAccess({ shopId, user });
    const uid = String(otherUserId || '').trim();

    const messages = await this.prisma.message.findMany({
      where: {
        shopId,
        senderId: uid,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderId: true,
        senderName: true,
        role: true,
        createdAt: true,
      },
      take: 500,
    });

    return messages;
  }

  async sendMessageToUser(shopId: string, otherUserId: string, content: string, user: any) {
    this.ensureShopAccess({ shopId, user });

    const customerId = String(otherUserId || '').trim();
    const text = String(content || '').trim();

    if (!customerId || !text) {
      throw new ForbiddenException('Invalid message');
    }

    const senderName = String(user?.name || user?.email || 'Merchant');

    const message = await this.prisma.message.create({
      data: {
        shopId,
        content: text,
        senderId: customerId,
        senderName,
        role: 'MERCHANT',
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        senderName: true,
        role: true,
        createdAt: true,
      },
    });

    try {
      this.realtime?.broadcastMessageEvent(shopId, message);
    } catch {
      // ignore
    }

    return message;
  }
}
