import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

function parseOptionalInt(value: any) {
  if (typeof value === 'undefined' || value === null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

const VALID_TYPES = new Set(['COMPLAINT', 'SUPPORT', 'INQUIRY', 'FEEDBACK']);
const VALID_STATUSES = new Set(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
const VALID_PRIORITIES = new Set(['LOW', 'NORMAL', 'HIGH', 'URGENT']);

@Injectable()
export class SupportService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createPublic(payload: {
    type?: string;
    subject?: string;
    message?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    shopId?: string;
    orderId?: string;
  }) {
    const type = String(payload?.type || 'COMPLAINT').trim().toUpperCase();
    if (!VALID_TYPES.has(type)) throw new BadRequestException('نوع غير صالح');

    const subject = String(payload?.subject || '').trim();
    if (!subject) throw new BadRequestException('الموضوع مطلوب');
    if (subject.length > 200) throw new BadRequestException('الموضوع طويل جداً');

    const message = String(payload?.message || '').trim();
    if (!message) throw new BadRequestException('الرسالة مطلوبة');
    if (message.length > 5000) throw new BadRequestException('الرسالة طويلة جداً');

    const userName = String(payload?.userName || '').trim();
    const userEmail = String(payload?.userEmail || '').trim();
    const userPhone = String(payload?.userPhone || '').trim();

    if (userName && userName.length > 80) throw new BadRequestException('الاسم طويل جداً');
    if (userEmail) {
      if (userEmail.length > 254) throw new BadRequestException('البريد الإلكتروني غير صحيح');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) throw new BadRequestException('البريد الإلكتروني غير صحيح');
    }
    if (userPhone && userPhone.length > 20) throw new BadRequestException('رقم الهاتف غير صحيح');

    return (this.prisma as any).supportTicket.create({
      data: {
        type,
        subject,
        message,
        userName: userName || null,
        userEmail: userEmail || null,
        userPhone: userPhone || null,
        shopId: payload?.shopId ? String(payload.shopId) : null,
        orderId: payload?.orderId ? String(payload.orderId) : null,
        status: 'OPEN',
        priority: 'NORMAL',
      },
    });
  }

  async createForUser(userId: string, payload: {
    type?: string;
    subject?: string;
    message?: string;
    shopId?: string;
    orderId?: string;
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const type = String(payload?.type || 'COMPLAINT').trim().toUpperCase();
    if (!VALID_TYPES.has(type)) throw new BadRequestException('نوع غير صالح');

    const subject = String(payload?.subject || '').trim();
    if (!subject) throw new BadRequestException('الموضوع مطلوب');
    if (subject.length > 200) throw new BadRequestException('الموضوع طويل جداً');

    const message = String(payload?.message || '').trim();
    if (!message) throw new BadRequestException('الرسالة مطلوبة');
    if (message.length > 5000) throw new BadRequestException('الرسالة طويلة جداً');

    return (this.prisma as any).supportTicket.create({
      data: {
        type,
        subject,
        message,
        userId: uid,
        shopId: payload?.shopId ? String(payload.shopId) : null,
        orderId: payload?.orderId ? String(payload.orderId) : null,
        status: 'OPEN',
        priority: 'NORMAL',
      },
    });
  }

  async listAdmin(opts?: { take?: number; skip?: number; status?: string; type?: string; q?: string }) {
    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 200) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;
    const status = String(opts?.status || '').trim().toUpperCase();
    const type = String(opts?.type || '').trim().toUpperCase();
    const q = String(opts?.q || '').trim();

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (type && type !== 'ALL') where.type = type;
    if (q) {
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { userName: { contains: q, mode: 'insensitive' } },
        { userEmail: { contains: q, mode: 'insensitive' } },
        { userPhone: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [rows, total] = await Promise.all([
      (this.prisma as any).supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          shop: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      (this.prisma as any).supportTicket.count({ where }),
    ]);

    return { rows, total };
  }

  async listForUser(userId: string, opts?: { take?: number; skip?: number }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 100) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;

    return (this.prisma as any).supportTicket.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async getStats() {
    const [total, open, inProgress, resolved, closed, complaints, support, inquiries] = await Promise.all([
      (this.prisma as any).supportTicket.count(),
      (this.prisma as any).supportTicket.count({ where: { status: 'OPEN' } }),
      (this.prisma as any).supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      (this.prisma as any).supportTicket.count({ where: { status: 'RESOLVED' } }),
      (this.prisma as any).supportTicket.count({ where: { status: 'CLOSED' } }),
      (this.prisma as any).supportTicket.count({ where: { type: 'COMPLAINT' } }),
      (this.prisma as any).supportTicket.count({ where: { type: 'SUPPORT' } }),
      (this.prisma as any).supportTicket.count({ where: { type: 'INQUIRY' } }),
    ]);

    return { total, open, inProgress, resolved, closed, complaints, support, inquiries };
  }

  async replyAdmin(id: string, reply: string) {
    const tid = String(id || '').trim();
    if (!tid) throw new BadRequestException('id مطلوب');

    const replyText = String(reply || '').trim();
    if (!replyText) throw new BadRequestException('الرد مطلوب');
    if (replyText.length > 5000) throw new BadRequestException('الرد طويل جداً');

    return (this.prisma as any).supportTicket.update({
      where: { id: tid },
      data: {
        adminReply: replyText,
        repliedAt: new Date(),
        status: 'IN_PROGRESS',
      },
    });
  }

  async updateStatusAdmin(id: string, statusRaw: string) {
    const tid = String(id || '').trim();
    if (!tid) throw new BadRequestException('id مطلوب');

    const status = String(statusRaw || '').trim().toUpperCase();
    if (!VALID_STATUSES.has(status)) throw new BadRequestException('status غير صالح');

    return (this.prisma as any).supportTicket.update({
      where: { id: tid },
      data: { status },
    });
  }

  async updatePriorityAdmin(id: string, priorityRaw: string) {
    const tid = String(id || '').trim();
    if (!tid) throw new BadRequestException('id مطلوب');

    const priority = String(priorityRaw || '').trim().toUpperCase();
    if (!VALID_PRIORITIES.has(priority)) throw new BadRequestException('priority غير صالح');

    return (this.prisma as any).supportTicket.update({
      where: { id: tid },
      data: { priority },
    });
  }

  async deleteAdmin(id: string) {
    const tid = String(id || '').trim();
    if (!tid) throw new BadRequestException('id مطلوب');
    return (this.prisma as any).supportTicket.delete({ where: { id: tid } });
  }

  parseListQuery(take: any, skip: any) {
    return {
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
    };
  }
}
