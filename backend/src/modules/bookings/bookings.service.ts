import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private normalizePhone(input: any) {
    const raw = String(input ?? '').trim().replace(/\s+/g, '');
    if (!raw) return '';
    if (raw.length > 32) return '__INVALID__';
    if (!/^\+?[0-9]{6,32}$/.test(raw)) return '__INVALID__';
    return raw;
  }

  private assertSmallJsonPayload(value: any, label: string) {
    if (typeof value === 'undefined') return;
    try {
      const s = JSON.stringify(value);
      if (s.length > 20_000) {
        throw new BadRequestException(`${label} كبير جداً`);
      }
    } catch {
      throw new BadRequestException(`${label} غير صالح`);
    }
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

  private normalizeStatus(status?: string) {
    const s = String(status || '').trim().toUpperCase();
    if (s === 'COMPLETED') return 'COMPLETED';
    if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'CANCELLED';
    if (s === 'CONFIRMED') return 'CONFIRMED';
    return 'PENDING';
  }

  private buildBookingNumber() {
    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    return `BK-${stamp}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private getBookingDateParts(startAt?: Date | string | null, endAt?: Date | string | null) {
    const start = startAt instanceof Date ? startAt : (startAt ? new Date(String(startAt)) : new Date());
    const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
    const end = endAt instanceof Date ? endAt : (endAt ? new Date(String(endAt)) : new Date(safeStart.getTime() + 30 * 60_000));
    const safeEnd = Number.isNaN(end.getTime()) ? new Date(safeStart.getTime() + 30 * 60_000) : end;
    const date = new Date(safeStart);
    date.setHours(0, 0, 0, 0);
    const toTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return { date, startTime: toTime(safeStart), endTime: toTime(safeEnd) };
  }

  private serializeBooking(booking: any) {
    if (!booking) return booking;
    const metadata = booking?.metadata && typeof booking.metadata === 'object' ? booking.metadata : {};
    const service = booking?.service || {};
    const date = booking?.date ? new Date(booking.date) : null;
    return {
      ...booking,
      __recordType: 'booking',
      itemId: metadata.itemId || booking.serviceId || service.id || booking.id,
      itemName: metadata.itemName || service.nameAr || service.name || 'حجز',
      itemImage: metadata.itemImage || '',
      itemPrice: Number(booking.totalAmount || service.price || 0),
      bookingActivityType: metadata.bookingActivityType || metadata.activityType || null,
      bookingActivityRoute: metadata.bookingActivityRoute || metadata.activityRoute || null,
      bookingDate: date && !Number.isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '',
      bookingTime: booking.startTime || booking?.slot?.startTime || '',
      customerName: booking.customerName || 'عميل',
      customerPhone: booking.customerPhone || '',
      customerEmail: booking.customerEmail || '',
      status: booking.status || 'PENDING',
      createdAt: booking.createdAt || new Date().toISOString(),
    };
  }

  private async ensureBookingCategory() {
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.bookingCategory.findFirst({ where: { type: 'OTHER', isActive: true } });
    if (existing) return existing;
    return prismaAny.bookingCategory.create({
      data: {
        name: 'General Bookings',
        nameAr: 'حجوزات عامة',
        type: 'OTHER',
        description: 'تصنيف تلقائي للحجوزات القادمة من لوحات الأنشطة',
        icon: 'CalendarCheck',
      },
    });
  }

  private async ensureBookingService(input: {
    shopId: string;
    serviceId?: string | null;
    itemName?: string | null;
    itemPrice?: number | null;
    metadata?: any;
  }) {
    const prismaAny = this.prisma as any;
    const serviceId = String(input?.serviceId || '').trim();
    if (serviceId) {
      const existing = await prismaAny.bookingService.findFirst({ where: { id: serviceId, shopId: input.shopId } });
      if (existing) return existing;
    }

    const name = String(input?.itemName || 'حجز عام').trim().slice(0, 160) || 'حجز عام';
    const existingByName = await prismaAny.bookingService.findFirst({ where: { shopId: input.shopId, name } });
    if (existingByName) return existingByName;

    const category = await this.ensureBookingCategory();
    const priceRaw = input?.itemPrice == null ? 0 : Number(input.itemPrice);
    return prismaAny.bookingService.create({
      data: {
        shopId: input.shopId,
        categoryId: category.id,
        name,
        nameAr: name,
        description: 'تم إنشاؤها تلقائياً من لوحة الحجوزات',
        durationMinutes: 30,
        price: Number.isFinite(priceRaw) ? Math.max(0, priceRaw) : 0,
        currency: 'EGP',
        capacity: 1,
        metadata: input?.metadata || null,
      },
    });
  }

  private async ensureBookingSlot(input: {
    slotId?: string | null;
    serviceId: string;
    resourceId?: string | null;
    date: Date;
    startTime: string;
    endTime: string;
    participants: number;
  }) {
    const prismaAny = this.prisma as any;
    const slotId = String(input?.slotId || '').trim();
    if (slotId) {
      const existing = await prismaAny.bookingSlot.findFirst({ where: { id: slotId, serviceId: input.serviceId } });
      if (existing) {
        await prismaAny.bookingSlot.update({
          where: { id: existing.id },
          data: { currentBookings: Number(existing.currentBookings || 0) + input.participants, status: 'BOOKED' },
        }).catch(() => undefined);
        return existing;
      }
    }

    return prismaAny.bookingSlot.create({
      data: {
        serviceId: input.serviceId,
        resourceId: input.resourceId ? String(input.resourceId) : null,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: 'BOOKED',
        maxCapacity: Math.max(1, input.participants),
        currentBookings: input.participants,
      },
    });
  }

  async create(input: {
    shopId: string;
    customerName: string;
    customerPhone?: string | null;
    itemId?: string;
    itemName?: string;
    itemImage?: string | null;
    itemPrice?: number | null;
    customerEmail?: string | null;
    serviceId?: string | null;
    slotId?: string | null;
    participants?: number | null;
    startAt?: Date | null;
    endAt?: Date | null;
    resourceId?: string | null;
    notes?: string | null;
    metadata?: any;
    bookingActivityType?: string | null;
    bookingActivityRoute?: string | null;
    userId?: string | null;
  }) {
    const shopId = String(input?.shopId || '').trim();
    const customerName = String(input?.customerName || '').trim();
    const customerPhone = this.normalizePhone(input?.customerPhone);
    const dbCustomerPhone = customerPhone && customerPhone !== '__INVALID__' ? customerPhone : null;

    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!customerName) throw new BadRequestException('customerName مطلوب');
    if (customerName.length > 120) throw new BadRequestException('customerName طويل جداً');
    if (customerPhone === '__INVALID__') throw new BadRequestException('customerPhone غير صحيح');

    const notes = input?.notes != null ? String(input.notes) : null;
    if (notes && notes.length > 2000) throw new BadRequestException('notes طويل جداً');

    this.assertSmallJsonPayload((input as any)?.metadata, 'metadata');

    const shop = await this.prisma.shop.findUnique({ where: { id: shopId }, select: { id: true, ownerId: true } });
    if (!shop) throw new NotFoundException('المتجر غير موجود');

    const itemPriceRaw = input?.itemPrice == null ? 0 : Number(input.itemPrice);
    const itemPrice = Number.isFinite(itemPriceRaw) ? Math.max(0, itemPriceRaw) : 0;
    const participants = Math.max(1, Math.min(Number(input?.participants || 1) || 1, 999));
    const metadata = {
      ...((input as any)?.metadata || {}),
      itemId: input?.itemId ? String(input.itemId) : undefined,
      itemName: input?.itemName ? String(input.itemName) : undefined,
      itemImage: input?.itemImage ? String(input.itemImage) : undefined,
      bookingActivityType: input?.bookingActivityType ? String(input.bookingActivityType) : ((input as any)?.metadata?.bookingActivityType || (input as any)?.metadata?.activityType),
      bookingActivityRoute: input?.bookingActivityRoute ? String(input.bookingActivityRoute) : ((input as any)?.metadata?.bookingActivityRoute || (input as any)?.metadata?.activityRoute),
    };

    const service = await this.ensureBookingService({
      shopId,
      serviceId: input?.serviceId,
      itemName: input?.itemName,
      itemPrice,
      metadata: { source: 'booking_dashboard' },
    });
    const { date, startTime, endTime } = this.getBookingDateParts(input?.startAt, input?.endAt);
    const slot = await this.ensureBookingSlot({
      slotId: input?.slotId,
      serviceId: service.id,
      resourceId: input?.resourceId,
      date,
      startTime,
      endTime,
      participants,
    });

    const created = await (this.prisma as any).booking.create({
      data: {
        bookingNumber: this.buildBookingNumber(),
        serviceId: service.id,
        slotId: slot.id,
        shopId,
        userId: String(input?.userId || shop.ownerId),
        customerName,
        customerPhone: dbCustomerPhone,
        customerEmail: input?.customerEmail ? String(input.customerEmail).trim().slice(0, 160) : '',
        date,
        startTime,
        endTime,
        participants,
        totalAmount: itemPrice * participants,
        currency: 'EGP',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        notes: notes || null,
        metadata,
      },
      include: { service: true, slot: true },
    });

    return this.serializeBooking(created);
  }

  async createForUser(userId: string, input: {
    shopId: string;
    itemId: string;
    itemName: string;
    itemImage?: string | null;
    itemPrice: number;
    customerPhone?: string;
    customerName?: string;
    customerEmail?: string;
    serviceId?: string;
    slotId?: string;
    resourceId?: string;
    participants?: number;
    notes?: string;
    addons?: any;
    variantSelection?: any;
    startAt?: Date | string | null;
    endAt?: Date | string | null;
    metadata?: any;
    bookingActivityType?: string;
    bookingActivityRoute?: string;
  }) {
    const uid = String(userId || '').trim();
    if (!uid) throw new BadRequestException('غير مصرح');

    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, phone: true },
    });
    if (!user) throw new BadRequestException('غير مصرح');

    const phoneFromForm = this.normalizePhone(input?.customerPhone);
    let customerPhone = this.normalizePhone(user.phone);

    if (phoneFromForm && phoneFromForm !== '__INVALID__') {
      if (!customerPhone) {
        try {
          await this.prisma.user.update({
            where: { id: uid },
            data: { phone: phoneFromForm },
          });
        } catch {
          // ignore duplicate phone errors
        }
      }
      customerPhone = phoneFromForm;
    }
    if (customerPhone === '__INVALID__' || phoneFromForm === '__INVALID__') {
      throw new BadRequestException('يرجى إدخال رقم هاتف صحيح');
    }

    const shopId = String(input?.shopId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');

    const itemId = String(input?.itemId || '').trim();
    const itemName = String(input?.itemName || '').trim();
    if (!itemId) throw new BadRequestException('itemId مطلوب');
    if (!itemName) throw new BadRequestException('itemName مطلوب');
    if (itemName.length > 160) throw new BadRequestException('itemName طويل جداً');

    const requestedCustomerName = String(input?.customerName || '').trim();

    return this.create({
      userId: uid,
      shopId,
      customerName: requestedCustomerName.slice(0, 120) || String(user.name || '').trim().slice(0, 120) || 'عميل',
      customerPhone: customerPhone && customerPhone !== '__INVALID__' ? customerPhone : null,
      customerEmail: input?.customerEmail,
      itemId,
      itemName,
      itemImage: input?.itemImage,
      itemPrice: input?.itemPrice,
      serviceId: input?.serviceId,
      slotId: input?.slotId,
      resourceId: input?.resourceId,
      participants: input?.participants,
      notes: input?.notes,
      startAt: input?.startAt ? (input.startAt instanceof Date ? input.startAt : new Date(String(input.startAt))) : null,
      endAt: input?.endAt ? (input.endAt instanceof Date ? input.endAt : new Date(String(input.endAt))) : null,
      bookingActivityType: input?.bookingActivityType || (input as any)?.metadata?.bookingActivityType,
      bookingActivityRoute: input?.bookingActivityRoute || (input as any)?.metadata?.bookingActivityRoute,
      metadata: {
        ...((input as any)?.metadata || {}),
        addons: (input as any)?.addons ?? null,
        variantSelection: (input as any)?.variantSelection ?? (input as any)?.variant_selection ?? null,
      },
    });
  }

  async listByShop(shopId: string, paging?: { page?: number; limit?: number }) {
    const id = String(shopId || '').trim();
    if (!id) throw new BadRequestException('shopId مطلوب');

    const pagination = this.getPagination(paging);
    const rows = await (this.prisma as any).booking.findMany({
      where: { shopId: id },
      orderBy: { createdAt: 'desc' },
      include: { service: true, slot: true },
      ...(pagination ? pagination : {}),
    });

    return rows.map((booking: any) => this.serializeBooking(booking));
  }

  async listByUserId(userId: string, paging?: { page?: number; limit?: number }) {
    const id = String(userId || '').trim();
    if (!id) throw new BadRequestException('userId مطلوب');

    const user = await this.prisma.user.findUnique({ where: { id }, select: { phone: true } });
    const phone = String(user?.phone || '').trim();
    if (!phone) return [];

    const pagination = this.getPagination(paging);
    const rows = await (this.prisma as any).booking.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: 'desc' },
      include: { service: true, slot: true },
      ...(pagination ? pagination : {}),
    });

    return rows.map((booking: any) => this.serializeBooking(booking));
  }

  async updateStatus(id: string, status: string, actor: { role: string; shopId?: string }) {
    const bookingId = String(id || '').trim();
    if (!bookingId) throw new BadRequestException('id مطلوب');

    const existing = await (this.prisma as any).booking.findUnique({
      where: { id: bookingId },
      select: { id: true, shopId: true, status: true },
    });

    if (!existing) throw new NotFoundException('الحجز غير موجود');

    const role = String(actor?.role || '').toUpperCase();
    if (role !== 'ADMIN' && actor?.shopId !== existing.shopId) {
      throw new ForbiddenException('صلاحيات غير كافية');
    }

    const normalized = this.normalizeStatus(status);

    if (normalized === 'COMPLETED' || normalized === 'CANCELLED' || normalized === 'CONFIRMED') {
      const updated = await (this.prisma as any).booking.update({
        where: { id: bookingId },
        data: {
          status: normalized,
          ...(normalized === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
          ...(normalized === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(normalized === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
        },
        include: { service: true, slot: true },
      });
      return this.serializeBooking(updated);
    }

    throw new BadRequestException('حالة غير مدعومة');
  }
}
