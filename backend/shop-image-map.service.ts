import { Injectable, Inject, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { GeminiVisionService } from './gemini-vision.service';

@Injectable()
export class ShopImageMapService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(GeminiVisionService) private readonly geminiVision: GeminiVisionService,
  ) {}

  private normalizeId(value: any) {
    return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  }

  private async ensureDefaultSectionIfMissing(mapId: string) {
    const mid = this.normalizeId(mapId);
    if (!mid) return;

    await (this.prisma as any).$transaction(async (tx: any) => {
      const count = await tx.shopImageSection.count({ where: { mapId: mid } });
      if (count > 0) return;
      await tx.shopImageSection.create({
        data: {
          mapId: mid,
          name: 'منتجات',
          sortOrder: 0,
          imageUrl: null,
          width: null,
          height: null,
        },
      });
    });
  }

  private isInlineDataImageUrl(value: any) {
    const s = this.normalizeId(value);
    return Boolean(s) && s.toLowerCase().startsWith('data:image/');
  }

  private shouldPurgeInlineImage(map: any) {
    if (!map) return false;
    if (!this.isInlineDataImageUrl(map?.imageUrl)) return false;
    const sectionsEmpty = Array.isArray(map?.sections) && map.sections.length === 0;
    const hotspotsEmpty = Array.isArray(map?.hotspots) && map.hotspots.length === 0;
    return sectionsEmpty && hotspotsEmpty;
  }

  private async purgeInlineImageIfNeeded(mapId: string) {
    const mid = this.normalizeId(mapId);
    if (!mid) return;
    await (this.prisma as any).shopImageMap.update({
      where: { id: mid },
      data: { imageUrl: null },
    });
  }

  async analyze(shopId: string, payload: any, ctx: { role?: any; shopId?: any }) {
    const sid = this.normalizeId(shopId);
    if (!sid) throw new BadRequestException('shopId مطلوب');

    this.assertCanManageShop({ tokenRole: ctx?.role, tokenShopId: ctx?.shopId, targetShopId: sid });

    const imageUrl = this.normalizeId(payload?.imageUrl);
    if (!imageUrl) throw new BadRequestException('imageUrl مطلوب');

    const analysis = await this.geminiVision.analyzeShopImageMap({
      imageUrl,
      language: payload?.language,
    });

    return {
      imageUrl,
      ...analysis,
    };
  }

  private normalizeOptionalInt(value: any) {
    if (typeof value === 'undefined') return undefined;
    if (value === null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : Math.floor(n);
  }

  private normalizeOptionalString(value: any) {
    if (typeof value === 'undefined') return undefined;
    if (value === null) return null;
    const s = String(value).trim();
    return s;
  }

  private assertCanManageShop(params: { tokenRole: any; tokenShopId: any; targetShopId: string }) {
    const role = String(params.tokenRole || '').toUpperCase();
    if (!params.targetShopId) throw new BadRequestException('shopId مطلوب');
    if (role !== 'ADMIN') {
      const shopIdFromToken = this.normalizeId(params.tokenShopId);
      if (!shopIdFromToken) throw new ForbiddenException('ليس لديك متجر مرتبط بهذا الحساب');
      if (shopIdFromToken !== params.targetShopId) {
        throw new ForbiddenException('ليس لديك صلاحية لإدارة هذا المتجر');
      }
    }
    return role;
  }

  async listByShopForManage(shopId: string, ctx: { role?: any; shopId?: any }) {
    const sid = this.normalizeId(shopId);
    if (!sid) throw new BadRequestException('shopId مطلوب');

    this.assertCanManageShop({ tokenRole: ctx?.role, tokenShopId: ctx?.shopId, targetShopId: sid });

    const maps = await (this.prisma as any).shopImageMap.findMany({
      where: { shopId: sid },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        hotspots: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            product: { select: { id: true, name: true, price: true, stock: true, unit: true, packOptions: true, colors: true, sizes: true, imageUrl: true, images: true, isActive: true, furnitureMeta: true } },
            section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
          },
        },
      },
    });

    const toPurge = (Array.isArray(maps) ? maps : []).filter((m: any) => this.shouldPurgeInlineImage(m));
    if (toPurge.length) {
      await Promise.all(toPurge.map((m: any) => this.purgeInlineImageIfNeeded(String(m.id))));
    }

    const toHeal = (Array.isArray(maps) ? maps : []).filter((m: any) => {
      const img = this.normalizeId(m?.imageUrl);
      const sectionsEmpty = Array.isArray(m?.sections) && m.sections.length === 0;
      const hasHotspots = Array.isArray(m?.hotspots) && m.hotspots.length > 0;
      return Boolean(img) && sectionsEmpty && hasHotspots;
    });

    if (toHeal.length === 0 && toPurge.length === 0) return maps;

    await Promise.all(toHeal.map((m: any) => this.ensureDefaultSectionIfMissing(String(m.id))));

    return (this.prisma as any).shopImageMap.findMany({
      where: { shopId: sid },
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        hotspots: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            product: { select: { id: true, name: true, price: true, stock: true, unit: true, packOptions: true, colors: true, sizes: true, imageUrl: true, images: true, isActive: true, furnitureMeta: true } },
            section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
          },
        },
      },
    });
  }

  async createMap(shopId: string, payload: any, ctx: { role?: any; shopId?: any }) {
    const sid = this.normalizeId(shopId);
    if (!sid) throw new BadRequestException('shopId مطلوب');

    this.assertCanManageShop({ tokenRole: ctx?.role, tokenShopId: ctx?.shopId, targetShopId: sid });

    const title = this.normalizeOptionalString(payload?.title);
    const imageUrl = this.normalizeId(payload?.imageUrl);
    if (!imageUrl) throw new BadRequestException('imageUrl مطلوب');

    const width = this.normalizeOptionalInt(payload?.width);
    const height = this.normalizeOptionalInt(payload?.height);

    const created = await (this.prisma as any).shopImageMap.create({
      data: {
        shopId: sid,
        title: typeof title === 'string' ? title : null,
        imageUrl,
        width: typeof width === 'number' ? width : null,
        height: typeof height === 'number' ? height : null,
        isActive: false,
        aiMeta: payload?.aiMeta ?? undefined,
      },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        hotspots: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return created;
  }

  async activateMap(shopId: string, mapId: string, ctx: { role?: any; shopId?: any }) {
    const sid = this.normalizeId(shopId);
    const mid = this.normalizeId(mapId);
    if (!sid) throw new BadRequestException('shopId مطلوب');
    if (!mid) throw new BadRequestException('mapId مطلوب');

    this.assertCanManageShop({ tokenRole: ctx?.role, tokenShopId: ctx?.shopId, targetShopId: sid });

    const existing = await (this.prisma as any).shopImageMap.findUnique({
      where: { id: mid },
      select: { id: true, shopId: true },
    });

    if (!existing || existing.shopId !== sid) throw new NotFoundException('الخريطة غير موجودة');

    await (this.prisma as any).$transaction([
      (this.prisma as any).shopImageMap.updateMany({
        where: { shopId: sid, isActive: true },
        data: { isActive: false },
      }),
      (this.prisma as any).shopImageMap.update({
        where: { id: mid },
        data: { isActive: true },
      }),
    ]);

    return (this.prisma as any).shopImageMap.findUnique({
      where: { id: mid },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        hotspots: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            product: { select: { id: true, name: true, price: true, stock: true, unit: true, packOptions: true, colors: true, sizes: true, imageUrl: true, images: true, isActive: true } },
            section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
          },
        },
      },
    });
  }

  async saveLayout(shopId: string, mapId: string, payload: any, ctx: { role?: any; shopId?: any }) {
    const sid = this.normalizeId(shopId);
    const mid = this.normalizeId(mapId);
    if (!sid) throw new BadRequestException('shopId مطلوب');
    if (!mid) throw new BadRequestException('mapId مطلوب');

    this.assertCanManageShop({ tokenRole: ctx?.role, tokenShopId: ctx?.shopId, targetShopId: sid });

    const map = await (this.prisma as any).shopImageMap.findUnique({
      where: { id: mid },
      select: { id: true, shopId: true },
    });
    if (!map || map.shopId !== sid) throw new NotFoundException('الخريطة غير موجودة');

    const sectionsInput = Array.isArray(payload?.sections) ? payload.sections : [];
    const hotspotsInput = Array.isArray(payload?.hotspots) ? payload.hotspots : [];

    const sections = sectionsInput
      .map((s: any, idx: number) => {
        const name = this.normalizeId(s?.name);
        if (!name) return null;
        const sortOrder = typeof s?.sortOrder === 'number' && Number.isFinite(s.sortOrder) ? Math.floor(s.sortOrder) : idx;
        const imageUrl = typeof s?.imageUrl === 'undefined' ? null : this.normalizeOptionalString(s?.imageUrl);
        const width = typeof s?.width === 'undefined' ? null : this.normalizeOptionalInt(s?.width);
        const height = typeof s?.height === 'undefined' ? null : this.normalizeOptionalInt(s?.height);

        return {
          name,
          sortOrder,
          imageUrl: imageUrl ? imageUrl : null,
          width: typeof width === 'number' ? width : width === null ? null : null,
          height: typeof height === 'number' ? height : height === null ? null : null,
        };
      })
      .filter(Boolean);

    const normalizeFloat = (v: any) => {
      if (typeof v === 'undefined') return null;
      if (v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };

    const hotspots = hotspotsInput
      .map((h: any, idx: number) => {
        const x = normalizeFloat(h?.x);
        const y = normalizeFloat(h?.y);
        if (x === null || y === null) return null;

        const productId = h?.productId != null ? this.normalizeId(h.productId) : null;
        const sectionIndex = typeof h?.sectionIndex === 'number' && Number.isFinite(h.sectionIndex) ? Math.floor(h.sectionIndex) : null;
        const label = typeof h?.label === 'string' ? h.label.trim() : null;
        const sortOrder = typeof h?.sortOrder === 'number' && Number.isFinite(h.sortOrder) ? Math.floor(h.sortOrder) : idx;
        const width = typeof h?.width === 'undefined' ? null : normalizeFloat(h.width);
        const height = typeof h?.height === 'undefined' ? null : normalizeFloat(h.height);
        const priceOverride = typeof h?.priceOverride === 'undefined' ? null : normalizeFloat(h.priceOverride);

        return {
          x,
          y,
          width,
          height,
          label,
          sortOrder,
          priceOverride,
          productId: productId || null,
          sectionIndex,
          aiMeta: typeof h?.aiMeta === 'undefined' ? undefined : h.aiMeta,
        };
      })
      .filter(Boolean);

    return (this.prisma as any).$transaction(async (tx: any) => {
      await tx.shopImageHotspot.deleteMany({ where: { mapId: mid } });
      await tx.shopImageSection.deleteMany({ where: { mapId: mid } });

      const createdSections = sections.length
        ? await tx.shopImageSection.createMany({
            data: sections.map((s: any) => ({
              mapId: mid,
              name: s.name,
              imageUrl: s.imageUrl,
              width: s.width,
              height: s.height,
              sortOrder: s.sortOrder,
            })),
          })
        : null;

      const sectionRows = await tx.shopImageSection.findMany({
        where: { mapId: mid },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true },
      });

      const sectionIdByIndex = new Map<number, string>();
      sectionRows.forEach((s: any, i: number) => sectionIdByIndex.set(i, s.id));

      if (hotspots.length) {
        await tx.shopImageHotspot.createMany({
          data: hotspots.map((h: any) => ({
            mapId: mid,
            sectionId: typeof h.sectionIndex === 'number' ? sectionIdByIndex.get(h.sectionIndex) ?? null : null,
            productId: h.productId,
            x: h.x,
            y: h.y,
            width: h.width,
            height: h.height,
            label: h.label,
            sortOrder: h.sortOrder,
            priceOverride: h.priceOverride,
            aiMeta: h.aiMeta,
          })),
        });
      }

      const updated = await tx.shopImageMap.update({
        where: { id: mid },
        data: {
          width: typeof payload?.width === 'undefined' ? undefined : this.normalizeOptionalInt(payload?.width),
          height: typeof payload?.height === 'undefined' ? undefined : this.normalizeOptionalInt(payload?.height),
          title: typeof payload?.title === 'undefined' ? undefined : this.normalizeOptionalString(payload?.title),
          imageUrl:
            typeof payload?.imageUrl === 'undefined'
              ? undefined
              : (() => {
                  const raw = this.normalizeId(payload?.imageUrl);
                  return raw ? raw : null;
                })(),
          aiMeta: typeof payload?.aiMeta === 'undefined' ? undefined : payload.aiMeta,
        },
        include: {
          sections: { orderBy: { sortOrder: 'asc' } },
          hotspots: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              product: { select: { id: true, name: true, price: true, stock: true, unit: true, packOptions: true, colors: true, sizes: true, imageUrl: true, images: true, isActive: true, furnitureMeta: true } },
              section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
            },
          },
        },
      });

      return { ...updated, createdSections };
    });
  }

  async getActiveForCustomerBySlug(slug: string) {
    const shopSlug = this.normalizeId(slug);
    if (!shopSlug) throw new BadRequestException('slug مطلوب');

    const shop = await (this.prisma as any).shop.findUnique({
      where: { slug: shopSlug },
      select: { id: true, slug: true, name: true, category: true, isActive: true },
    });

    if (!shop || !shop.isActive) throw new NotFoundException('المتجر غير موجود');

    let map = await (this.prisma as any).shopImageMap.findFirst({
      where: { shopId: shop.id, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        hotspots: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                unit: true,
                packOptions: true,
                colors: true,
                sizes: true,
                imageUrl: true,
                images: true,
                furnitureMeta: true,
                isActive: true,
                shopId: true,
              },
            },
            section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
          },
        },
      },
    });

    if (!map) {
      return { shop, map: null };
    }

    const needsPurge = this.shouldPurgeInlineImage(map);

    const img = this.normalizeId((map as any)?.imageUrl);
    const sectionsEmpty = Array.isArray((map as any)?.sections) && (map as any).sections.length === 0;
    const hasHotspots = Array.isArray((map as any)?.hotspots) && (map as any).hotspots.length > 0;
    const needsHeal = Boolean(img) && sectionsEmpty && hasHotspots;

    if (needsPurge) {
      await this.purgeInlineImageIfNeeded(String((map as any).id));
    }
    if (needsHeal) {
      await this.ensureDefaultSectionIfMissing(String((map as any).id));
    }
    if (needsPurge || needsHeal) {
      map = await (this.prisma as any).shopImageMap.findUnique({
        where: { id: String((map as any).id) },
        include: {
          sections: { orderBy: { sortOrder: 'asc' } },
          hotspots: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  unit: true,
                  packOptions: true,
                  colors: true,
                  sizes: true,
                  imageUrl: true,
                  images: true,
                  furnitureMeta: true,
                  isActive: true,
                  shopId: true,
                },
              },
              section: { select: { id: true, name: true, sortOrder: true, imageUrl: true, width: true, height: true } },
            },
          },
        },
      });
    }

    const cleaned = {
      ...map,
      hotspots: (map.hotspots || []).filter((h: any) => !h.product || h.product.isActive),
    };

    return { shop, map: cleaned };
  }
}
