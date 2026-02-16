import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AccountPurgeService implements OnModuleInit, OnModuleDestroy {
  private timer: any = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    const enabled = String(process.env.ACCOUNT_PURGE_ENABLED || '').toLowerCase() === 'true';
    if (!enabled) return;

    const intervalMinRaw = String(process.env.ACCOUNT_PURGE_INTERVAL_MINUTES || '60').trim();
    const intervalMs = Math.max(1, Number(intervalMinRaw) || 60) * 60 * 1000;

    const run = async () => {
      try {
        await this.runOnce();
      } catch {
        // ignore
      }
    };

    // run shortly after boot
    setTimeout(run, 5_000);
    this.timer = setInterval(run, intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) {
      try {
        clearInterval(this.timer);
      } catch {
      }
      this.timer = null;
    }
  }

  private async getOrCreateDeletedUserId() {
    const email = 'deleted@ray.local';
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing?.id) return existing.id;

    const password = randomBytes(32).toString('hex');
    const created = await this.prisma.user.create({
      data: {
        email,
        name: 'Deleted User',
        password,
        role: 'CUSTOMER' as any,
        isActive: false,
      } as any,
      select: { id: true },
    });
    return created.id;
  }

  async runOnce() {
    const now = new Date();

    const graceDaysRaw = String(process.env.ACCOUNT_DELETE_GRACE_DAYS || '30').trim();
    const graceDays = Math.max(1, Math.min(365, Number(graceDaysRaw) || 30));
    const fallbackScheduled = new Date(now.getTime() + graceDays * 24 * 60 * 60 * 1000);

    // Backfill scheduled deletion for old deactivations that happened before we added the columns.
    try {
      await this.prisma.user.updateMany({
        where: {
          isActive: false,
          scheduledPurgeAt: null as any,
        } as any,
        data: {
          deactivatedAt: now as any,
          scheduledPurgeAt: fallbackScheduled as any,
        } as any,
      });
    } catch {
    }

    const due = await this.prisma.user.findMany({
      where: {
        isActive: false,
        scheduledPurgeAt: { not: null, lte: now } as any,
      } as any,
      select: {
        id: true,
        email: true,
        role: true,
      },
      take: 50,
      orderBy: { scheduledPurgeAt: 'asc' } as any,
    });

    if (!due || due.length === 0) return { ok: true, purged: 0 };

    const deletedUserId = await this.getOrCreateDeletedUserId();
    let purged = 0;

    for (const u of due) {
      const userId = String(u.id);
      if (!userId) continue;
      if (userId === deletedUserId) continue;

      await this.prisma.$transaction(async (tx) => {
        // Reassign orders to the deleted user to satisfy FK constraints.
        try {
          await (tx as any).order.updateMany({ where: { userId }, data: { userId: deletedUserId } });
        } catch {
        }

        // Deactivate shop + randomize slug to avoid public collisions.
        try {
          const shop = await tx.shop.findFirst({ where: { ownerId: userId }, select: { id: true, slug: true } });
          if (shop?.id) {
            const newSlug = `deleted-${userId.slice(0, 8)}-${randomBytes(4).toString('hex')}`;
            try {
              await tx.shop.update({
                where: { id: String(shop.id) },
                data: {
                  isActive: false,
                  slug: newSlug,
                  name: 'Deleted Shop',
                  logoUrl: null,
                  bannerUrl: null,
                  pageDesign: null,
                  layoutConfig: null,
                } as any,
              });
            } catch {
              // if slug update fails, still deactivate
              await tx.shop.update({ where: { id: String(shop.id) }, data: { isActive: false } as any });
            }
          }
        } catch {
        }

        // Anonymize user row (we keep it to avoid breaking other references).
        const anonymEmail = `deleted_${userId}@ray.local`;
        const newPassword = randomBytes(32).toString('hex');
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            deactivatedAt: (now as any),
            scheduledPurgeAt: null,
            email: anonymEmail,
            name: 'Deleted User',
            phone: null,
            password: newPassword,
          } as any,
        });
      });

      // Best-effort cache invalidation.
      try {
        await this.redis.invalidatePattern(`shop:*`);
      } catch {
      }

      purged += 1;
    }

    return { ok: true, purged };
  }
}
