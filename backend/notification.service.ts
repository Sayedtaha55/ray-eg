import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listForUser(userId: string, opts?: { take?: number; skip?: number }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 100) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;

    return this.prisma.notification.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
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
