import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}


  private getPaging(input?: { take?: number; skip?: number }) {
    const takeRaw = typeof input?.take === 'number' && Number.isFinite(input.take) ? input.take : 50;
    const skipRaw = typeof input?.skip === 'number' && Number.isFinite(input.skip) ? input.skip : 0;
    return {
      take: Math.min(200, Math.max(1, Math.floor(takeRaw))),
      skip: Math.max(0, Math.floor(skipRaw)),
    };
  }

  private parseBoolFilter(value?: string) {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const raw = value.trim().toLowerCase();
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return undefined;
  }


  async updateMe(userIdRaw: string, input: { name?: string; phone?: string | null }) {
    const userId = String(userIdRaw || '').trim();
    if (!userId) throw new BadRequestException('غير مصرح');

    const name = input?.name != null ? String(input.name).trim() : undefined;
    const phone = input?.phone != null ? String(input.phone).trim() : undefined;

    const data: any = {};
    if (name != null) {
      if (!name) throw new BadRequestException('الاسم مطلوب');
      if (name.length > 80) throw new BadRequestException('الاسم طويل جداً');
      data.name = name;
    }

    if (phone != null) {
      if (!phone) {
        data.phone = null;
      } else {
        const normalizedPhone = phone.replace(/\s+/g, '');
        if (normalizedPhone.length > 32) throw new BadRequestException('رقم الهاتف غير صحيح');
        if (!/^\+?[0-9]{6,32}$/.test(normalizedPhone)) throw new BadRequestException('رقم الهاتف غير صحيح');

        const existingPhone = await this.prisma.user.findUnique({ where: { phone: normalizedPhone } });
        if (existingPhone && String(existingPhone.id) !== String(userId)) {
          throw new ConflictException('رقم الهاتف مستخدم بالفعل في نظامنا');
        }
        data.phone = normalizedPhone;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('لا توجد بيانات للتحديث');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async listCouriers(input?: { take?: number; skip?: number; search?: string; isActive?: string }) {
    const paging = this.getPaging(input);
    const search = String(input?.search || '').trim();
    const isActive = this.parseBoolFilter(input?.isActive);
    return this.prisma.user.findMany({
      where: {
        role: 'COURIER' as any,
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: paging.take,
      skip: paging.skip,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createCourier(input: { email: string; password: string; name: string; phone?: string | null }) {
    const email = String(input?.email || '').toLowerCase().trim();
    const password = String(input?.password || '');
    const name = String(input?.name || '').trim();
    const phoneRaw = input?.phone ? String(input.phone).trim() : null;
    const phone = phoneRaw ? phoneRaw.replace(/\s+/g, '') : null;

    if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب');
    if (!password) throw new BadRequestException('كلمة المرور مطلوبة');
    if (password.length < 8) throw new BadRequestException('كلمة المرور ضعيفة جداً');
    if (!name) throw new BadRequestException('الاسم مطلوب');
    if (name.length > 80) throw new BadRequestException('الاسم طويل جداً');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('البريد الإلكتروني مستخدم بالفعل في نظامنا');

    if (phone) {
      if (phone.length > 32) throw new BadRequestException('رقم الهاتف غير صحيح');
      if (!/^\+?[0-9]{6,32}$/.test(phone)) throw new BadRequestException('رقم الهاتف غير صحيح');
      const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
      if (existingPhone) throw new ConflictException('رقم الهاتف مستخدم بالفعل في نظامنا');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const created = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'COURIER' as any,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return created;
  }

  async listPendingCouriers(input?: { take?: number; skip?: number; search?: string }) {
    const paging = this.getPaging(input);
    const search = String(input?.search || '').trim();
    return this.prisma.user.findMany({
      where: {
        role: 'COURIER' as any,
        isActive: false,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { email: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search, mode: 'insensitive' as any } },
          ],
        } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: paging.take,
      skip: paging.skip,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async approveCourier(idRaw: string) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async rejectCourier(idRaw: string) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!existing) throw new BadRequestException('المندوب غير موجود');

    const role = String((existing as any)?.role || '').toUpperCase();
    if (role !== 'COURIER') throw new BadRequestException('هذا الحساب ليس مندوباً');
    if (existing.isActive) throw new BadRequestException('لا يمكن رفض مندوب مُفعّل');

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  async getCourierAdminDetails(idRaw: string) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const courier = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    if (!courier) throw new BadRequestException('المندوب غير موجود');
    if (String((courier as any)?.role || '').toUpperCase() !== 'COURIER') {
      throw new BadRequestException('هذا الحساب ليس مندوباً');
    }

    const [state, orders] = await Promise.all([
      (this.prisma as any).courierState.findUnique({
        where: { userId: id },
      }).catch(() => null),
      this.prisma.order.findMany({
        where: { courierId: id } as any,
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          handedToCourierAt: true,
          deliveredAt: true,
          shops: { select: { id: true, name: true, city: true, governorate: true } },
          users_orders_userIdTousers: { select: { id: true, name: true, phone: true } },
        } as any,
      }),
    ]);

    const totalOrders = orders.length;
    const activeOrders = orders.filter((o: any) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(String(o?.status || '').toUpperCase())).length;
    const deliveredOrders = orders.filter((o: any) => String(o?.status || '').toUpperCase() === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o: any) => String(o?.status || '').toUpperCase() === 'CANCELLED').length;
    const deliveredRevenue = orders
      .filter((o: any) => String(o?.status || '').toUpperCase() === 'DELIVERED')
      .reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0);

    return {
      courier,
      state: state || null,
      stats: {
        totalOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        deliveredRevenue,
      },
      recentOrders: (orders || []).map((o: any) => ({
        ...o,
        shop: o?.shops || null,
        customer: o?.users_orders_userIdTousers || null,
      })),
    };
  }

  async setCourierActiveStatus(idRaw: string, isActiveRaw: boolean) {
    const id = String(idRaw || '').trim();
    if (!id) throw new BadRequestException('id مطلوب');

    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!existing) throw new BadRequestException('المندوب غير موجود');
    if (String((existing as any)?.role || '').toUpperCase() !== 'COURIER') {
      throw new BadRequestException('هذا الحساب ليس مندوباً');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActiveRaw) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

}
