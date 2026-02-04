import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listCouriers() {
    return this.prisma.user.findMany({
      where: { role: 'COURIER' as any },
      orderBy: { createdAt: 'desc' },
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
    const phone = input?.phone ? String(input.phone).trim() : null;

    if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب');
    if (!password) throw new BadRequestException('كلمة المرور مطلوبة');
    if (password.length < 8) throw new BadRequestException('كلمة المرور ضعيفة جداً');
    if (!name) throw new BadRequestException('الاسم مطلوب');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('البريد الإلكتروني مستخدم بالفعل في نظامنا');

    if (phone) {
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

  async listPendingCouriers() {
    return this.prisma.user.findMany({
      where: {
        role: 'COURIER' as any,
        isActive: false,
      },
      orderBy: { createdAt: 'desc' },
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
}
