import { Injectable, BadRequestException, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@common/prisma/prisma.service';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PortalAuthService {
  private readonly logger = new Logger(PortalAuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async registerWithPassword(input: { email: string; password: string; name?: string; phone?: string }) {
    const email = this.normalizeEmail(input?.email);
    const password = String(input?.password || '');
    const name = input?.name != null ? String(input.name).trim() : '';
    const phone = input?.phone ? this.normalizePhone(input.phone) : '';

    if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب');
    if (!password || password.length < 8) throw new BadRequestException('كلمة المرور يجب ألا تقل عن 8 أحرف');

    const existingEmail = await this.prisma.mapListingOwner.findFirst({ where: { email } });
    if (existingEmail) throw new BadRequestException('البريد مستخدم بالفعل');

    if (phone) {
      const existingPhone = await this.prisma.mapListingOwner.findFirst({ where: { phone } });
      if (existingPhone) throw new BadRequestException('رقم الموبايل مستخدم بالفعل');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const now = new Date();

    const owner = await this.prisma.mapListingOwner.create({
      data: {
        email,
        passwordHash,
        ...(phone ? { phone } : {}),
        ...(name ? { name } : {}),
        lastLogin: now,
        isActive: true,
      },
    });

    const token = this.issuePortalToken(owner.id, owner.phone || undefined);

    return {
      ok: true,
      access_token: token,
      owner: {
        id: owner.id,
        phone: owner.phone,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
      },
    };
  }

  async loginWithPassword(input: { email: string; password: string }) {
    const email = this.normalizeEmail(input?.email);
    const password = String(input?.password || '');
    if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب');
    if (!password) throw new BadRequestException('كلمة المرور مطلوبة');

    const owner = await this.prisma.mapListingOwner.findFirst({ where: { email } });
    if (!owner || !owner.isActive) throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    if (!owner.passwordHash) throw new UnauthorizedException('الحساب غير مفعّل بكلمة مرور');

    const match = await bcrypt.compare(password, owner.passwordHash);
    if (!match) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const now = new Date();
    await this.prisma.mapListingOwner.update({
      where: { id: owner.id },
      data: { lastLogin: now },
    });

    const token = this.issuePortalToken(owner.id, owner.phone || undefined);

    return {
      ok: true,
      access_token: token,
      owner: {
        id: owner.id,
        phone: owner.phone,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
      },
    };
  }

  async devPortalLogin() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    if (env === 'production') {
      throw new BadRequestException('غير متاح في الإنتاج');
    }

    const devEmail = 'dev-portal@ray.local';
    const devName = 'مطور (نشاط خارجي)';

    let owner = await this.prisma.mapListingOwner.findFirst({ where: { email: devEmail } });

    if (!owner) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('devportal123', salt);
      owner = await this.prisma.mapListingOwner.create({
        data: {
          email: devEmail,
          name: devName,
          passwordHash,
          isActive: true,
          lastLogin: new Date(),
        },
      });
    } else {
      await this.prisma.mapListingOwner.update({
        where: { id: owner.id },
        data: { lastLogin: new Date(), isActive: true },
      });
    }

    const token = this.issuePortalToken(owner.id, owner.phone || undefined);

    return {
      ok: true,
      access_token: token,
      owner: {
        id: owner.id,
        phone: owner.phone,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
      },
    };
  }

  async changePassword(ownerId: string, currentPassword: string, newPassword: string) {
    const owner = await this.prisma.mapListingOwner.findUnique({ where: { id: ownerId } });
    if (!owner || !owner.isActive) throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    if (!owner.passwordHash) throw new BadRequestException('الحساب ليس لديه كلمة مرور');

    const match = await bcrypt.compare(currentPassword, owner.passwordHash);
    if (!match) throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');

    if (!newPassword || newPassword.length < 8) throw new BadRequestException('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.mapListingOwner.update({
      where: { id: ownerId },
      data: { passwordHash },
    });

    return { ok: true };
  }

  async requestOtp(phone: string, purpose: string = 'login', ip?: string) {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) throw new BadRequestException('رقم الموبايل مطلوب');

    // Rate limit: max 5 OTP per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.prisma.portalOtpCode.count({
      where: { phone: normalizedPhone, purpose, createdAt: { gte: oneHourAgo } },
    });
    if (recent >= 5) {
      throw new BadRequestException('تم إرسال كود كتير، حاول بعد ساعة');
    }

    // Invalidate previous unverified codes for this phone+purpose
    await this.prisma.portalOtpCode.updateMany({
      where: { phone: normalizedPhone, purpose, verified: false, expiresAt: { gt: new Date() } },
      data: { verified: true }, // mark as consumed
    });

    // Generate 6-digit code
    const code = String(randomInt(100000, 999999));
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.portalOtpCode.create({
      data: { phone: normalizedPhone, codeHash, purpose, expiresAt },
    });

    // ─── SMS Provider Integration Point ──────────────────────────────────
    // In production, send `code` via SMS provider (Twilio, MessageBird, etc.)
    // For now: Dev Mode — log the code and return it in dev only
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const isDev = env !== 'production';

    if (isDev) {
      this.logger.log(`[DEV OTP] phone=${normalizedPhone} code=${code} purpose=${purpose}`);
    }

    // TODO: Replace with actual SMS send
    // await this.smsProvider.send(normalizedPhone, `كود التحقق: ${code}`);

    return {
      ok: true,
      ...(isDev ? { devCode: code } : {}),
    };
  }

  async verifyOtp(phone: string, code: string, purpose: string = 'login') {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) throw new BadRequestException('رقم الموبايل مطلوب');
    const disableOtp = String(process.env.PORTAL_DISABLE_OTP || '').toLowerCase().trim() === 'true';
    if (!disableOtp) {
      if (!code || code.length !== 6) throw new BadRequestException('كود التحقق مطلوب');
    }

    const now = new Date();

    if (disableOtp) {
      const owner = await this.prisma.mapListingOwner.upsert({
        where: { phone: normalizedPhone },
        update: { lastLogin: now, isActive: true },
        create: { phone: normalizedPhone, lastLogin: now, isActive: true },
      });

      const token = this.issuePortalToken(owner.id, normalizedPhone, purpose);

      return {
        ok: true,
        access_token: token,
        owner: {
          id: owner.id,
          phone: owner.phone,
          name: owner.name,
          email: owner.email,
          avatarUrl: owner.avatarUrl,
        },
      };
    }

    // Find the latest valid OTP for this phone+purpose
    const otpRecord = await this.prisma.portalOtpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('كود التحقق غير صالح أو منتهي');
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      throw new BadRequestException('عدد المحاولات خلص، اطلب كود جديد');
    }

    // Increment attempts
    await this.prisma.portalOtpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify code
    const match = await bcrypt.compare(code, otpRecord.codeHash);
    if (!match) {
      throw new BadRequestException('كود التحقق غلط');
    }

    // Mark as verified
    await this.prisma.portalOtpCode.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find or create owner
    const owner = await this.prisma.mapListingOwner.upsert({
      where: { phone: normalizedPhone },
      update: { lastLogin: now, isActive: true },
      create: { phone: normalizedPhone, lastLogin: now, isActive: true },
    });

    // Issue portal JWT
    const token = this.issuePortalToken(owner.id, normalizedPhone, purpose);

    return {
      ok: true,
      access_token: token,
      owner: {
        id: owner.id,
        phone: owner.phone,
        name: owner.name,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
      },
    };
  }

  // ─── JWT ───────────────────────────────────────────────────────────────

  issuePortalToken(ownerId: string, phone?: string, purpose?: string) {
    return this.jwtService.sign(
      {
        sub: ownerId,
        ...(phone ? { phone } : {}),
        typ: 'portal',
        ...(purpose ? { purpose } : {}),
      },
      { expiresIn: '7d' } as any,
    );
  }

  issueImpersonationToken(ownerId: string, phone: string, listingId: string) {
    return this.jwtService.sign(
      {
        sub: ownerId,
        phone,
        typ: 'portal_impersonate',
        listingId,
      },
      { expiresIn: '15m' } as any,
    );
  }

  async validatePortalToken(payload: any) {
    const typ = String(payload?.typ || '');
    if (typ !== 'portal' && typ !== 'portal_impersonate') {
      throw new UnauthorizedException('Token غير صالح');
    }

    const ownerId = String(payload?.sub || '').trim();
    if (!ownerId) throw new UnauthorizedException('غير مصرح');

    const owner = await this.prisma.mapListingOwner.findUnique({
      where: { id: ownerId },
    });

    if (!owner || !owner.isActive) {
      throw new UnauthorizedException('الحساب غير مفعل');
    }

    return {
      id: owner.id,
      phone: owner.phone,
      name: owner.name,
      email: owner.email,
      avatarUrl: owner.avatarUrl,
      typ,
      ...(payload.listingId ? { listingId: payload.listingId } : {}),
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private normalizePhone(phone: string): string {
    let p = String(phone || '').trim().replace(/[\s\-()]/g, '');
    // Egyptian numbers: accept 01xxxxxxxxx or +20xxxxxxxxx
    if (/^01\d{9}$/.test(p)) return `+2${p}`;
    if (/^\+20\d{9}$/.test(p)) return p;
    if (/^20\d{9}$/.test(p)) return `+${p}`;
    if (/^\+?\d{7,15}$/.test(p)) return p.startsWith('+') ? p : `+${p}`;
    return '';
  }

  private normalizeEmail(email: string): string {
    const e = String(email || '').trim().toLowerCase();
    if (!e) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return '';
    return e;
  }
}
