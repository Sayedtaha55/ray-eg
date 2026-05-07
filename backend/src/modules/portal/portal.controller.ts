import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards, Inject, BadRequestException, ForbiddenException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PortalJwtAuthGuard } from './portal-jwt-auth.guard';
import { PortalAuthService } from './portal-auth.service';
import { MapListingService } from '@modules/map-listing/map-listing.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PrismaService } from '@common/prisma/prisma.service';

@Controller('portal')
export class PortalController {
  constructor(
    @Inject(PortalAuthService) private readonly portalAuth: PortalAuthService,
    @Inject(MapListingService) private readonly listingService: MapListingService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private getCookieOptions() {
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    const domain = String(process.env.COOKIE_DOMAIN || '').trim() || undefined;
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...(domain ? { domain } : {}),
    } as any;
  }

  // ─── OTP Auth ────────────────────────────────────────────────────────────

  @Post('auth/otp/request')
  async requestOtp(@Body() body: any, @Request() req: any) {
    const phone = String(body?.phone || '').trim();
    const purpose = String(body?.purpose || 'login').trim();
    if (!phone) throw new BadRequestException('رقم الموبايل مطلوب');

    const ip = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0]?.trim()
      || String(req?.ip || '').trim();

    return this.portalAuth.requestOtp(phone, purpose, ip);
  }

  @Post('auth/otp/verify')
  async verifyOtp(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const phone = String(body?.phone || '').trim();
    const code = String(body?.code || '').trim();
    const purpose = String(body?.purpose || 'login').trim();

    const result = await this.portalAuth.verifyOtp(phone, code, purpose);

    if (result.access_token) {
      res.cookie('portal_session', String(result.access_token), this.getCookieOptions());
    }

    return result;
  }

  @Post('auth/register')
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');
    const name = body?.name != null ? String(body.name).trim() : undefined;
    const phone = body?.phone != null ? String(body.phone).trim() : undefined;

    const result = await this.portalAuth.registerWithPassword({ email, password, name, phone });
    if (result.access_token) {
      res.cookie('portal_session', String(result.access_token), this.getCookieOptions());
    }
    return result;
  }

  @Post('auth/login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    const result = await this.portalAuth.loginWithPassword({ email, password });
    if (result.access_token) {
      res.cookie('portal_session', String(result.access_token), this.getCookieOptions());
    }
    return result;
  }

  @Post('auth/dev-portal-login')
  async devPortalLogin(@Res({ passthrough: true }) res: Response) {
    const result = await this.portalAuth.devPortalLogin();
    if (result.access_token) {
      res.cookie('portal_session', String(result.access_token), this.getCookieOptions());
    }
    return result;
  }

  @Post('auth/change-password')
  @UseGuards(PortalJwtAuthGuard)
  async changePassword(@Request() req: any, @Body() body: any) {
    const ownerId = String(req?.user?.id || '').trim();
    const currentPassword = String(body?.currentPassword || '');
    const newPassword = String(body?.newPassword || '');
    return this.portalAuth.changePassword(ownerId, currentPassword, newPassword);
  }

  @Post('auth/logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('portal_session', this.getCookieOptions());
    return { ok: true };
  }

  // ─── Owner Profile ──────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(PortalJwtAuthGuard)
  async getMe(@Request() req: any) {
    const ownerId = String(req?.user?.id || '').trim();
    const owner = await this.prisma.mapListingOwner.findUnique({
      where: { id: ownerId },
      select: { id: true, phone: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });
    if (!owner) throw new ForbiddenException('غير مصرح');
    return owner;
  }

  @Patch('me')
  @UseGuards(PortalJwtAuthGuard)
  async updateMe(@Request() req: any, @Body() body: any) {
    const ownerId = String(req?.user?.id || '').trim();
    return this.prisma.mapListingOwner.update({
      where: { id: ownerId },
      data: {
        ...(body?.name != null ? { name: String(body.name).trim() || null } : {}),
        ...(body?.email != null ? { email: String(body.email).trim() || null } : {}),
        ...(body?.avatarUrl != null ? { avatarUrl: String(body.avatarUrl).trim() || null } : {}),
      },
      select: { id: true, phone: true, name: true, email: true, avatarUrl: true },
    });
  }

  // ─── My Listings ────────────────────────────────────────────────────────

  @Get('listings')
  @UseGuards(PortalJwtAuthGuard)
  async myListings(@Request() req: any) {
    const ownerId = String(req?.user?.id || '').trim();
    const ownerships = await this.prisma.mapListingOwnership.findMany({
      where: { ownerId },
      include: {
        listing: {
          include: { branches: true, _count: { select: { analyticsEvents: true } } },
        },
      },
      orderBy: { grantedAt: 'desc' },
    });
    return ownerships.map((o: any) => ({
      role: o.role,
      grantedAt: o.grantedAt,
      ...o.listing,
    }));
  }

  // ─── Claim Listing ─────────────────────────────────────────────────────

  @Post('claim')
  @UseGuards(PortalJwtAuthGuard)
  async claimListing(@Request() req: any, @Body() body: any) {
    const ownerId = String(req?.user?.id || '').trim();
    const listingId = String(body?.listingId || '').trim();
    if (!listingId) throw new BadRequestException('معرف النشاط مطلوب');

    // Check listing exists and is APPROVED
    const listing = await this.prisma.mapListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new BadRequestException('النشاط غير موجود');
    if (listing.status !== 'APPROVED') throw new BadRequestException('النشاط مش مقبول بعد');

    // Check not already owned
    const existing = await this.prisma.mapListingOwnership.findFirst({
      where: { listingId, ownerId },
    });
    if (existing) throw new BadRequestException('أنت مالك بالفعل');

    // Check not already requested
    const pendingClaim = await this.prisma.mapListingClaimRequest.findFirst({
      where: { listingId, ownerId, status: 'PENDING' },
    });
    if (pendingClaim) throw new BadRequestException('عندك طلب قائم بالفعل');

    // Auto-approve if owner phone matches listing phone
    const autoApprove = listing.phone && req.user.phone === listing.phone;

    if (autoApprove) {
      await this.prisma.mapListingOwnership.create({
        data: { listingId, ownerId, role: 'OWNER' },
      });
      await this.prisma.mapListingClaimRequest.create({
        data: { listingId, ownerId, otpVerified: true, status: 'APPROVED', reviewedAt: new Date() },
      });
      return { ok: true, autoApproved: true };
    }

    // Otherwise create pending claim request
    await this.prisma.mapListingClaimRequest.create({
      data: { listingId, ownerId, otpVerified: true, status: 'PENDING' },
    });

    return { ok: true, autoApproved: false, message: 'تم إرسال الطلب، هنراجعه ونعطلك نتيجة' };
  }

  // ─── Edit Listing ───────────────────────────────────────────────────────

  @Patch('listings/:id')
  @UseGuards(PortalJwtAuthGuard)
  async editListing(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const ownerId = String(req?.user?.id || '').trim();
    await this.assertOwnerOrManager(ownerId, id);

    return this.prisma.mapListing.update({
      where: { id },
      data: {
        ...(body?.title != null ? { title: String(body.title).trim() } : {}),
        ...(body?.category != null ? { category: String(body.category).trim() || null } : {}),
        ...(body?.description != null ? { description: String(body.description).trim() || null } : {}),
        ...(body?.websiteUrl != null ? { websiteUrl: String(body.websiteUrl).trim() || null } : {}),
        ...(body?.phone != null ? { phone: String(body.phone).trim() || null } : {}),
        ...(body?.whatsapp != null ? { whatsapp: String(body.whatsapp).trim() || null } : {}),
        ...(body?.socialLinks != null ? { socialLinks: body.socialLinks } : {}),
        ...(body?.logoUrl != null ? { logoUrl: String(body.logoUrl).trim() || null } : {}),
        ...(body?.coverUrl != null ? { coverUrl: String(body.coverUrl).trim() || null } : {}),
      },
      include: { branches: true },
    });
  }

  // ─── Branches ───────────────────────────────────────────────────────────

  @Post('listings/:id/branches')
  @UseGuards(PortalJwtAuthGuard)
  async addBranch(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const ownerId = String(req?.user?.id || '').trim();
    await this.assertOwnerOrManager(ownerId, id);

    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('الموقع على الخريطة مطلوب');
    }

    return this.prisma.mapListingBranch.create({
      data: {
        listingId: id,
        name: body?.name || null,
        latitude: lat,
        longitude: lng,
        addressLabel: body?.addressLabel || null,
        governorate: body?.governorate || null,
        city: body?.city || null,
        phone: body?.phone || null,
        isPrimary: false,
      },
    });
  }

  @Patch('listings/:id/branches/:branchId')
  @UseGuards(PortalJwtAuthGuard)
  async editBranch(
    @Request() req: any,
    @Param('id') id: string,
    @Param('branchId') branchId: string,
    @Body() body: any,
  ) {
    const ownerId = String(req?.user?.id || '').trim();
    await this.assertOwnerOrManager(ownerId, id);

    const branch = await this.prisma.mapListingBranch.findUnique({ where: { id: branchId } });
    if (!branch || branch.listingId !== id) {
      throw new BadRequestException('الفرع غير موجود');
    }

    return this.prisma.mapListingBranch.update({
      where: { id: branchId },
      data: {
        ...(body?.name != null ? { name: String(body.name).trim() || null } : {}),
        ...(body?.latitude != null && Number.isFinite(Number(body.latitude)) ? { latitude: Number(body.latitude) } : {}),
        ...(body?.longitude != null && Number.isFinite(Number(body.longitude)) ? { longitude: Number(body.longitude) } : {}),
        ...(body?.addressLabel != null ? { addressLabel: String(body.addressLabel).trim() || null } : {}),
        ...(body?.governorate != null ? { governorate: String(body.governorate).trim() || null } : {}),
        ...(body?.city != null ? { city: String(body.city).trim() || null } : {}),
        ...(body?.phone != null ? { phone: String(body.phone).trim() || null } : {}),
      },
    });
  }

  @Post('listings/:id/branches/:branchId/set-primary')
  @UseGuards(PortalJwtAuthGuard)
  async setPrimaryBranch(@Request() req: any, @Param('id') id: string, @Param('branchId') branchId: string) {
    const ownerId = String(req?.user?.id || '').trim();
    await this.assertOwnerOrManager(ownerId, id);

    const branch = await this.prisma.mapListingBranch.findUnique({ where: { id: branchId } });
    if (!branch || branch.listingId !== id) throw new BadRequestException('الفرع غير موجود');

    await this.prisma.$transaction([
      this.prisma.mapListingBranch.updateMany({ where: { listingId: id }, data: { isPrimary: false } }),
      this.prisma.mapListingBranch.update({ where: { id: branchId }, data: { isPrimary: true } }),
    ]);

    return { ok: true };
  }

  // ─── Analytics ──────────────────────────────────────────────────────────

  @Post('listings/:id/events')
  @UseGuards(PortalJwtAuthGuard)
  async trackEvent(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const type = String(body?.type || '').trim();
    const validTypes = ['LISTING_VIEW', 'WEBSITE_CLICK', 'WHATSAPP_CLICK', 'PHONE_CLICK', 'DIRECTIONS_CLICK'];
    if (!validTypes.includes(type)) throw new BadRequestException('نوع الحدث غير صالح');

    const ip = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0]?.trim() || String(req?.ip || '').trim() || null;
    const userAgent = String(req?.headers?.['user-agent'] || '').trim() || null;

    await this.prisma.mapListingAnalyticsEvent.create({
      data: { listingId: id, type: type as any, ip, userAgent, meta: body?.meta || undefined },
    });

    return { ok: true };
  }

  @Get('listings/:id/analytics')
  @UseGuards(PortalJwtAuthGuard)
  async getAnalytics(
    @Request() req: any,
    @Param('id') id: string,
    @Query('range') range?: string,
  ) {
    const ownerId = String(req?.user?.id || '').trim();
    await this.assertOwnerOrManager(ownerId, id);

    const days = Math.min(365, Math.max(1, Number(range) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.mapListingAnalyticsEvent.findMany({
      where: { listingId: id, createdAt: { gte: since } },
      select: { type: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate counts by type
    const byType: Record<string, number> = {};
    for (const e of events) {
      const t = String(e.type);
      byType[t] = (byType[t] || 0) + 1;
    }

    // Aggregate daily counts
    const daily: Record<string, number> = {};
    for (const e of events) {
      const day = new Date(e.createdAt).toISOString().slice(0, 10);
      daily[day] = (daily[day] || 0) + 1;
    }

    return {
      total: events.length,
      byType,
      daily,
      days,
    };
  }

  // ─── Admin: Developer Impersonation ─────────────────────────────────────

  @Post('admin/dev-impersonate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async devImpersonate(@Body() body: any) {
    const listingId = String(body?.listingId || '').trim();
    const ownerId = String(body?.ownerId || '').trim();

    if (!listingId && !ownerId) {
      throw new BadRequestException('listingId أو ownerId مطلوب');
    }

    // If listingId given, find the owner
    let targetOwnerId = ownerId;
    let targetPhone = '';

    if (listingId && !ownerId) {
      const ownership = await this.prisma.mapListingOwnership.findFirst({
        where: { listingId, role: 'OWNER' },
        include: { owner: true },
      });
      if (!ownership) throw new BadRequestException('مفيش مالك للنشاط ده');
      targetOwnerId = ownership.ownerId;
      targetPhone = ownership.owner.phone;
    } else if (ownerId) {
      const owner = await this.prisma.mapListingOwner.findUnique({ where: { id: ownerId } });
      if (!owner) throw new BadRequestException('المالك غير موجود');
      targetPhone = owner.phone;
    }

    const token = this.portalAuth.issueImpersonationToken(targetOwnerId, targetPhone, listingId);

    return {
      ok: true,
      access_token: token,
      ownerId: targetOwnerId,
      phone: targetPhone,
      expiresIn: '15m',
    };
  }

  // ─── Admin: Claim Requests Management ──────────────────────────────────

  @Get('admin/claims')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listClaims(@Query('status') status?: string) {
    const where: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    return this.prisma.mapListingClaimRequest.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, phone: true, status: true } },
        owner: { select: { id: true, phone: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Post('admin/claims/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveClaim(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const claim = await this.prisma.mapListingClaimRequest.findUnique({ where: { id } });
    if (!claim) throw new BadRequestException('الطلب غير موجود');
    if (claim.status !== 'PENDING') throw new BadRequestException('الطلب مش قائم');

    const adminId = String(req?.user?.id || '').trim();

    await this.prisma.$transaction([
      this.prisma.mapListingClaimRequest.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date(), reviewedBy: adminId, adminNote: body?.note || null },
      }),
      this.prisma.mapListingOwnership.upsert({
        where: { listingId_ownerId: { listingId: claim.listingId, ownerId: claim.ownerId } },
        update: { role: 'OWNER' },
        create: { listingId: claim.listingId, ownerId: claim.ownerId, role: 'OWNER' },
      }),
    ]);

    return { ok: true };
  }

  @Post('admin/claims/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectClaim(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const claim = await this.prisma.mapListingClaimRequest.findUnique({ where: { id } });
    if (!claim) throw new BadRequestException('الطلب غير موجود');
    if (claim.status !== 'PENDING') throw new BadRequestException('الطلب مش قائم');

    const adminId = String(req?.user?.id || '').trim();

    await this.prisma.mapListingClaimRequest.update({
      where: { id },
      data: { status: 'REJECTED', reviewedAt: new Date(), reviewedBy: adminId, adminNote: body?.note || null },
    });

    return { ok: true };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private async assertOwnerOrManager(ownerId: string, listingId: string) {
    const ownership = await this.prisma.mapListingOwnership.findFirst({
      where: { listingId, ownerId, role: { in: ['OWNER', 'MANAGER'] } },
    });
    if (!ownership) throw new ForbiddenException('مش مصرحلك تعدل النشاط ده');
  }
}
