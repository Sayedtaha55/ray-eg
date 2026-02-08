import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

function parseOptionalInt(value: any) {
  if (typeof value === 'undefined' || value === null) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

@Injectable()
export class FeedbackService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createForUser(userId: string, payload: { comment?: string; rating?: number; shopId?: string | null; productId?: string | null }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const comment = String(payload?.comment || '').trim();
    const ratingRaw = payload?.rating;
    const rating = typeof ratingRaw === 'number' && Number.isFinite(ratingRaw) ? Math.floor(ratingRaw) : undefined;

    if (!comment) throw new BadRequestException('المحتوى مطلوب');

    const data: any = {
      userId: uid,
      comment,
      ...(typeof rating === 'number' ? { rating } : { rating: 5 }),
      ...(payload?.shopId ? { shopId: String(payload.shopId) } : {}),
      ...(payload?.productId ? { productId: String(payload.productId) } : {}),
      status: 'PENDING',
    };

    return (this.prisma as any).feedback.create({
      data,
    });
  }

  async createPublic(payload: { comment?: string; rating?: number; userName?: string; userEmail?: string }) {
    const comment = String(payload?.comment || '').trim();
    const userName = String(payload?.userName || '').trim();
    const userEmail = String(payload?.userEmail || '').trim();

    const ratingRaw = payload?.rating;
    const rating = typeof ratingRaw === 'number' && Number.isFinite(ratingRaw) ? Math.floor(ratingRaw) : undefined;

    if (!comment) throw new BadRequestException('المحتوى مطلوب');

    return (this.prisma as any).feedback.create({
      data: {
        rating: typeof rating === 'number' ? Math.min(Math.max(rating, 1), 5) : 5,
        comment,
        userName: userName || null,
        userEmail: userEmail || null,
        status: 'PENDING',
      },
    });
  }

  async listAdmin(opts?: { take?: number; skip?: number; status?: string; q?: string }) {
    const take = typeof opts?.take === 'number' ? Math.min(Math.max(opts.take, 1), 200) : 50;
    const skip = typeof opts?.skip === 'number' ? Math.max(opts.skip, 0) : 0;
    const status = String(opts?.status || '').trim().toUpperCase();
    const q = String(opts?.q || '').trim();

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { comment: { contains: q, mode: 'insensitive' } },
        { userName: { contains: q, mode: 'insensitive' } },
        { userEmail: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return (this.prisma as any).feedback.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        shop: { select: { id: true, name: true, slug: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async updateStatusAdmin(id: string, statusRaw: any) {
    const fid = String(id || '').trim();
    if (!fid) throw new BadRequestException('id مطلوب');

    const status = String(statusRaw || '').trim().toUpperCase();
    const allowed = new Set(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']);
    if (!allowed.has(status)) {
      throw new BadRequestException('status غير صالح');
    }

    return (this.prisma as any).feedback.update({
      where: { id: fid },
      data: { status },
    });
  }

  async deleteAdmin(id: string) {
    const fid = String(id || '').trim();
    if (!fid) throw new BadRequestException('id مطلوب');
    return (this.prisma as any).feedback.delete({ where: { id: fid } });
  }

  parseListQuery(take: any, skip: any) {
    return {
      take: parseOptionalInt(take),
      skip: parseOptionalInt(skip),
    };
  }
}
