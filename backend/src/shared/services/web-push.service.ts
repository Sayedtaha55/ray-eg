import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import webpush from 'web-push';

function resolveEnv(name: string) {
  const v = String(process.env[name] || '').trim();
  return v || null;
}

function safeJsonStringify(value: any) {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

function isExpoToken(value: string) {
  const token = String(value || '').trim();
  return /^ExponentPushToken\[[^\]]+\]$/.test(token) || /^ExpoPushToken\[[^\]]+\]$/.test(token);
}

@Injectable()
export class WebPushService {
  private configured = false;
  private vapidSubject: string | null;
  private vapidPublicKey: string | null;
  private vapidPrivateKey: string | null;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
    this.vapidSubject = resolveEnv('VAPID_SUBJECT');
    this.vapidPublicKey = resolveEnv('VAPID_PUBLIC_KEY');
    this.vapidPrivateKey = resolveEnv('VAPID_PRIVATE_KEY');

    this.configure();
  }

  private configure() {
    if (this.configured) return;
    if (!this.vapidSubject || !this.vapidPublicKey || !this.vapidPrivateKey) {
      return;
    }

    try {
      webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
      this.configured = true;
    } catch {
      this.configured = false;
    }
  }

  private canSend() {
    this.configure();
    return Boolean(this.configured);
  }

  async sendToMerchantShop(shopId: string, payload: any) {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    if (!this.canSend()) return;

    const subs = await this.prisma.merchantPushSubscription.findMany({
      where: { shopId: sid, isActive: true } as any,
      select: { id: true, subscription: true } as any,
      take: 200,
    });

    await this.sendMany(subs.map((s: any) => ({ id: s.id, subscription: s.subscription })), payload, {
      onGone: async (id) => {
        try {
          await this.prisma.merchantPushSubscription.update({ where: { id }, data: { isActive: false } as any } as any);
        } catch {
        }
      },
      onSeen: async (id) => {
        try {
          await this.prisma.merchantPushSubscription.update({ where: { id }, data: { lastSeenAt: new Date() } as any } as any);
        } catch {
        }
      },
    });
  }

  async sendToCustomerUser(userId: string, payload: any) {
    const uid = String(userId || '').trim();
    if (!uid) return;
    if (!this.canSend()) return;

    const subs = await this.prisma.customerPushSubscription.findMany({
      where: { userId: uid, isActive: true } as any,
      select: { id: true, subscription: true } as any,
      take: 200,
    });

    await this.sendMany(subs.map((s: any) => ({ id: s.id, subscription: s.subscription })), payload, {
      onGone: async (id) => {
        try {
          await this.prisma.customerPushSubscription.update({ where: { id }, data: { isActive: false } as any } as any);
        } catch {
        }
      },
      onSeen: async (id) => {
        try {
          await this.prisma.customerPushSubscription.update({ where: { id }, data: { lastSeenAt: new Date() } as any } as any);
        } catch {
        }
      },
    });
  }

  private async sendMany(
    subs: Array<{ id: string; subscription: any }>,
    payload: any,
    hooks: {
      onGone: (id: string) => Promise<void>;
      onSeen: (id: string) => Promise<void>;
    },
  ) {
    if (!subs.length) return;

    const body = safeJsonStringify(payload);

    await Promise.all(
      subs.map(async (s) => {
        try {
          const expoPushToken = String((s.subscription as any)?.expoPushToken || '').trim();
          if (isExpoToken(expoPushToken)) {
            await this.sendExpoPush(expoPushToken, payload);
          } else {
            await webpush.sendNotification(s.subscription as any, body);
          }
          await hooks.onSeen(String(s.id));
        } catch (e: any) {
          const status = typeof e?.statusCode === 'number' ? e.statusCode : typeof e?.statusCode === 'string' ? Number(e.statusCode) : undefined;
          if (status === 404 || status === 410) {
            await hooks.onGone(String(s.id));
          }
        }
      }),
    );
  }

  private async sendExpoPush(expoPushToken: string, payload: any) {
    const title = String(payload?.title || '').trim() || 'إشعار';
    const body = String(payload?.body || '').trim();
    const data = payload?.url ? { url: payload.url } : undefined;

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        title,
        body,
        data,
        sound: 'default',
      }),
    });

    if (!response.ok) {
      const err: any = new Error(`Expo push failed with status ${response.status}`);
      err.statusCode = response.status;
      throw err;
    }
  }
}
