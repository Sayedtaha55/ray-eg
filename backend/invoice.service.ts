import { Injectable, Inject, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

type Actor = { role?: string; shopId?: string };

type InvoiceItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private mapDbErrorToBadRequest(e: any) {
    const msg = e?.message ? String(e.message) : '';
    const lowered = msg.toLowerCase();
    if (
      lowered.includes('does not exist') ||
      lowered.includes('no such column') ||
      lowered.includes('no such table') ||
      lowered.includes('unknown column')
    ) {
      return new BadRequestException('قاعدة البيانات غير محدثة. شغّل migrations ثم أعد تشغيل السيرفر');
    }
    if (msg) return new BadRequestException(msg);
    return new BadRequestException('Database error');
  }

  private assertCanAccessShop(targetShopId: string, actor: Actor) {
    const role = String(actor?.role || '').toUpperCase();
    if (role === 'ADMIN') return;
    if (!actor?.shopId || String(actor.shopId) !== String(targetShopId)) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }
  }

  private normalizeItems(raw: any): InvoiceItemInput[] {
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
      .map((it: any) => {
        const name = String(it?.name || '').trim();
        const quantityRaw = typeof it?.quantity === 'number' ? it.quantity : Number(it?.quantity);
        const unitPriceRaw = typeof it?.unitPrice === 'number' ? it.unitPrice : (typeof it?.price === 'number' ? it.price : Number(it?.unitPrice ?? it?.price));
        const quantity = Number.isFinite(quantityRaw) ? Math.floor(quantityRaw) : NaN;
        const unitPrice = Number.isFinite(unitPriceRaw) ? Number(unitPriceRaw) : NaN;
        return { name, quantity, unitPrice };
      })
      .filter((it: any) => it.name);

    if (normalized.length === 0) {
      throw new BadRequestException('items مطلوبة');
    }

    for (const it of normalized) {
      if (!it.name) throw new BadRequestException('item name مطلوب');
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) throw new BadRequestException('quantity غير صحيح');
      if (!Number.isFinite(it.unitPrice) || it.unitPrice < 0) throw new BadRequestException('unitPrice غير صحيح');
    }

    return normalized;
  }

  private computeTotals(items: InvoiceItemInput[], discount: number, vatRate: number) {
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const safeDiscount = Number.isFinite(discount) ? Math.max(discount, 0) : 0;
    const safeVatRate = Number.isFinite(vatRate) ? Math.max(vatRate, 0) : 0;
    const discountedSubtotal = Math.max(subtotal - safeDiscount, 0);
    const vatAmount = discountedSubtotal * (safeVatRate / 100);
    const total = discountedSubtotal + vatAmount;
    return {
      subtotal,
      discount: safeDiscount,
      vatRate: safeVatRate,
      vatAmount,
      total,
      discountedSubtotal,
    };
  }

  private getPagination(paging?: { page?: number; limit?: number }) {
    const page = typeof paging?.page === 'number' ? paging.page : undefined;
    const limit = typeof paging?.limit === 'number' ? paging.limit : undefined;
    if (page == null && limit == null) return null;

    const safeLimitRaw = limit == null ? 20 : limit;
    const safeLimit = Math.min(Math.max(Math.floor(safeLimitRaw), 1), 100);
    const safePage = Math.max(Math.floor(page == null ? 1 : page), 1);
    const skip = (safePage - 1) * safeLimit;

    return { take: safeLimit, skip };
  }

  async listByShop(
    shopId: string,
    actor: Actor,
    filters?: { from?: Date; to?: Date },
    paging?: { page?: number; limit?: number },
  ) {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');
    this.assertCanAccessShop(sid, actor);

    const pagination = this.getPagination(paging);

    const where: any = {
      shopId: sid,
      ...(filters?.from || filters?.to
        ? {
            invoiceDate: {
              ...(filters?.from ? { gte: filters.from } : {}),
              ...(filters?.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.accountingInvoice.findMany({
          where,
          orderBy: [{ invoiceDate: 'desc' }, { createdAt: 'desc' }],
          ...(pagination ? pagination : {}),
          select: {
            id: true,
            sequence: true,
            invoiceDate: true,
            notes: true,
            subtotal: true,
            discount: true,
            vatRate: true,
            vatAmount: true,
            total: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.accountingInvoice.count({ where }),
      ]);

      return { items, total };
    } catch (e) {
      throw this.mapDbErrorToBadRequest(e);
    }
  }

  async getById(id: string, actor: Actor) {
    const invoiceId = String(id || '').trim();
    if (!invoiceId) throw new BadRequestException('id مطلوب');

    let inv: any;
    try {
      inv = await this.prisma.accountingInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          items: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              name: true,
              quantity: true,
              unitPrice: true,
              lineTotal: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
    } catch (e) {
      throw this.mapDbErrorToBadRequest(e);
    }

    if (!inv) throw new NotFoundException('الفاتورة غير موجودة');
    this.assertCanAccessShop(String(inv.shopId), actor);
    return inv;
  }

  async create(input: {
    shopId: string;
    createdById: string;
    invoiceDate?: Date;
    notes?: string;
    discount?: number;
    vatRate?: number;
    currency?: string;
    items: InvoiceItemInput[];
  }, actor: Actor) {
    const shopId = String(input?.shopId || '').trim();
    const createdById = String(input?.createdById || '').trim();
    const notes = typeof input?.notes === 'string' ? input.notes : undefined;
    const currency = typeof input?.currency === 'string' && input.currency.trim() ? input.currency.trim() : 'EGP';
    const invoiceDate = input?.invoiceDate instanceof Date ? input.invoiceDate : new Date();
    const discount = typeof input?.discount === 'number' ? input.discount : Number(input?.discount ?? 0);
    const vatRate = typeof input?.vatRate === 'number' ? input.vatRate : Number(input?.vatRate ?? 0);

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!createdById) throw new BadRequestException('createdById مطلوب');
    this.assertCanAccessShop(shopId, actor);

    const items = this.normalizeItems(input?.items);
    const totals = this.computeTotals(items, discount, vatRate);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const last = await tx.accountingInvoice.findFirst({
          where: { shopId },
          orderBy: { sequence: 'desc' },
          select: { sequence: true },
        });

        const nextSequence = (last?.sequence || 0) + 1;

        const created = await tx.accountingInvoice.create({
          data: {
            shopId,
            createdById,
            sequence: nextSequence,
            invoiceDate,
            notes,
            currency,
            discount: totals.discount,
            vatRate: totals.vatRate,
            subtotal: totals.subtotal,
            vatAmount: totals.vatAmount,
            total: totals.total,
            items: {
              create: items.map((it) => ({
                name: it.name,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                lineTotal: it.quantity * it.unitPrice,
              })),
            },
          },
          include: { items: true },
        });

        return created;
      });
    } catch (e) {
      throw this.mapDbErrorToBadRequest(e);
    }
  }

  async update(
    id: string,
    input: {
      invoiceDate?: Date;
      notes?: string;
      discount?: number;
      vatRate?: number;
      currency?: string;
      items?: InvoiceItemInput[];
    },
    actor: Actor,
  ) {
    const invoiceId = String(id || '').trim();
    if (!invoiceId) throw new BadRequestException('id مطلوب');

    let existing: any;
    try {
      existing = await this.prisma.accountingInvoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, shopId: true },
      });
    } catch (e) {
      throw this.mapDbErrorToBadRequest(e);
    }

    if (!existing) throw new NotFoundException('الفاتورة غير موجودة');
    this.assertCanAccessShop(String(existing.shopId), actor);

    const invoiceDate = input?.invoiceDate instanceof Date ? input.invoiceDate : undefined;
    const notes = typeof input?.notes === 'string' ? input.notes : undefined;
    const currency = typeof input?.currency === 'string' && input.currency.trim() ? input.currency.trim() : undefined;

    const discount = typeof input?.discount === 'undefined' ? undefined : (typeof input.discount === 'number' ? input.discount : Number(input.discount));
    const vatRate = typeof input?.vatRate === 'undefined' ? undefined : (typeof input.vatRate === 'number' ? input.vatRate : Number(input.vatRate));

    const items = typeof input?.items === 'undefined' ? undefined : this.normalizeItems(input.items);

    const safeDiscount = typeof discount === 'number' && Number.isFinite(discount) ? Math.max(discount, 0) : undefined;
    const safeVatRate = typeof vatRate === 'number' && Number.isFinite(vatRate) ? Math.max(vatRate, 0) : undefined;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const current = await tx.accountingInvoice.findUnique({
          where: { id: invoiceId },
          include: { items: true },
        });
        if (!current) throw new NotFoundException('الفاتورة غير موجودة');

        const mergedDiscount = safeDiscount == null ? Number(current.discount) || 0 : safeDiscount;
        const mergedVatRate = safeVatRate == null ? Number(current.vatRate) || 0 : safeVatRate;
        const mergedItems = items == null
          ? current.items.map((it: any) => ({ name: it.name, quantity: it.quantity, unitPrice: it.unitPrice }))
          : items;

        const totals = this.computeTotals(mergedItems, mergedDiscount, mergedVatRate);

        if (items != null) {
          await tx.accountingInvoiceItem.deleteMany({ where: { invoiceId } });
          await tx.accountingInvoiceItem.createMany({
            data: mergedItems.map((it) => ({
              invoiceId,
              name: it.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              lineTotal: it.quantity * it.unitPrice,
            })),
          });
        }

        const updated = await tx.accountingInvoice.update({
          where: { id: invoiceId },
          data: {
            ...(invoiceDate ? { invoiceDate } : {}),
            ...(typeof notes !== 'undefined' ? { notes } : {}),
            ...(currency ? { currency } : {}),
            ...(safeDiscount != null ? { discount: safeDiscount } : {}),
            ...(safeVatRate != null ? { vatRate: safeVatRate } : {}),
            subtotal: totals.subtotal,
            vatAmount: totals.vatAmount,
            total: totals.total,
          },
          include: { items: true },
        });

        return updated;
      });
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof ForbiddenException || e instanceof NotFoundException) {
        throw e;
      }
      throw this.mapDbErrorToBadRequest(e);
    }
  }

  async summaryByShop(shopId: string, actor: Actor, filters?: { from?: Date; to?: Date }) {
    const sid = String(shopId || '').trim();
    if (!sid) throw new BadRequestException('shopId مطلوب');
    this.assertCanAccessShop(sid, actor);

    const where: any = {
      shopId: sid,
      ...(filters?.from || filters?.to
        ? {
            invoiceDate: {
              ...(filters?.from ? { gte: filters.from } : {}),
              ...(filters?.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };

    try {
      const [count, agg] = await this.prisma.$transaction([
        this.prisma.accountingInvoice.count({ where }),
        this.prisma.accountingInvoice.aggregate({
          where,
          _sum: { total: true, subtotal: true, discount: true, vatAmount: true },
        }),
      ]);

      return {
        count,
        sumTotal: agg._sum.total || 0,
        sumSubtotal: agg._sum.subtotal || 0,
        sumDiscount: agg._sum.discount || 0,
        sumVat: agg._sum.vatAmount || 0,
      };
    } catch (e) {
      throw this.mapDbErrorToBadRequest(e);
    }
  }
}
