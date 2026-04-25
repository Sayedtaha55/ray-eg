import { Injectable, Inject, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private normalizeKey(keyRaw: any) {
    return String(keyRaw || '').trim().toLowerCase();
  }

  private async ensureDefaultApps() {
    const count = await this.prisma.app.count();
    if (count > 0) return;

    await this.prisma.app.createMany({
      data: [
        {
          key: 'voice-ordering',
          name: 'Voice Ordering',
          description: 'Enable voice-based ordering and AI assistant flows.',
          version: '1.0.0',
          permissions: ['orders', 'products'] as any,
          hooks: ['onOrderCreate'] as any,
        },
        {
          key: 'whatsapp-button',
          name: 'WhatsApp Button',
          description: 'Show a WhatsApp contact button on your storefront.',
          version: '1.0.0',
          permissions: ['shop'] as any,
          hooks: [] as any,
        },
      ],
      skipDuplicates: true,
    });
  }

  async listApps() {
    await this.ensureDefaultApps();
    return this.prisma.app.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        version: true,
        permissions: true,
        hooks: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listMyApps(shopIdRaw: string) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    await this.ensureDefaultApps();

    return this.prisma.shopApp.findMany({
      where: { shopId, status: 'INSTALLED' as any },
      orderBy: { installedAt: 'desc' },
      select: {
        id: true,
        shopId: true,
        status: true,
        isActive: true,
        settings: true,
        installedAt: true,
        updatedAt: true,
        app: {
          select: {
            id: true,
            key: true,
            name: true,
            description: true,
            version: true,
            permissions: true,
            hooks: true,
          },
        },
      },
    });
  }

  async installApp(shopIdRaw: string, appKeyRaw: any) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const key = this.normalizeKey(appKeyRaw);
    if (!key) throw new BadRequestException('appKey مطلوب');

    await this.ensureDefaultApps();

    const app = await this.prisma.app.findUnique({
      where: { key },
      select: { id: true, key: true },
    });
    if (!app) throw new BadRequestException('App غير موجود');

    const now = new Date();

    const row = await this.prisma.shopApp.upsert({
      where: { shopId_appId: { shopId, appId: app.id } },
      create: {
        shopId,
        appId: app.id,
        status: 'INSTALLED' as any,
        isActive: true,
        installedAt: now as any,
      } as any,
      update: {
        status: 'INSTALLED' as any,
        isActive: true,
        installedAt: now as any,
      } as any,
      select: {
        id: true,
        shopId: true,
        status: true,
        isActive: true,
        installedAt: true,
        updatedAt: true,
        app: { select: { key: true, name: true, version: true } },
      },
    });

    return row;
  }

  async uninstallApp(shopIdRaw: string, appKeyRaw: any) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const key = this.normalizeKey(appKeyRaw);
    if (!key) throw new BadRequestException('appKey مطلوب');

    const app = await this.prisma.app.findUnique({
      where: { key },
      select: { id: true },
    });
    if (!app) throw new BadRequestException('App غير موجود');

    const existing = await this.prisma.shopApp.findUnique({
      where: { shopId_appId: { shopId, appId: app.id } },
      select: { id: true },
    });

    if (!existing?.id) {
      return { ok: true, uninstalled: false };
    }

    await this.prisma.shopApp.update({
      where: { id: existing.id },
      data: {
        status: 'UNINSTALLED' as any,
        isActive: false,
      } as any,
      select: { id: true },
    });

    return { ok: true, uninstalled: true };
  }

  async setActive(shopIdRaw: string, appKeyRaw: any, active: boolean) {
    const shopId = String(shopIdRaw || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const key = this.normalizeKey(appKeyRaw);
    if (!key) throw new BadRequestException('appKey مطلوب');

    const app = await this.prisma.app.findUnique({
      where: { key },
      select: { id: true },
    });
    if (!app) throw new BadRequestException('App غير موجود');

    const existing = await this.prisma.shopApp.findUnique({
      where: { shopId_appId: { shopId, appId: app.id } },
      select: { id: true, status: true },
    });
    if (!existing?.id) throw new BadRequestException('App غير مثبت');

    const status = String((existing as any)?.status || '').toUpperCase();
    if (status !== 'INSTALLED') {
      throw new ForbiddenException('App غير مثبت');
    }

    return this.prisma.shopApp.update({
      where: { id: existing.id },
      data: { isActive: Boolean(active) } as any,
      select: {
        id: true,
        shopId: true,
        status: true,
        isActive: true,
        updatedAt: true,
        app: { select: { key: true, name: true, version: true } },
      },
    });
  }
}
