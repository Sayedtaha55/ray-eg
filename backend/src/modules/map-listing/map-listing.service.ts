import { Injectable, Inject, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

type Actor = { role?: string; shopId?: string; id?: string };

@Injectable()
export class MapListingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  private assertAdmin(actor: Actor) {
    if (String(actor?.role || '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('صلاحيات مدير مطلوبة');
    }
  }

  async publicSubmit(input: {
    title: string;
    category?: string;
    description?: string;
    websiteUrl?: string;
    phone?: string;
    whatsapp?: string;
    socialLinks?: any;
    logoUrl?: string;
    coverUrl?: string;
    linkedShopId?: string;
    branch: {
      name?: string;
      latitude: number;
      longitude: number;
      addressLabel?: string;
      governorate?: string;
      city?: string;
      phone?: string;
    };
  }) {
    const title = String(input.title || '').trim();
    if (!title) throw new BadRequestException('اسم النشاط مطلوب');

    const lat = Number(input.branch?.latitude);
    const lng = Number(input.branch?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('الموقع على الخريطة مطلوب');
    }

    const listing = await this.prisma.mapListing.create({
      data: {
        title,
        category: input.category || null,
        description: input.description || null,
        websiteUrl: input.websiteUrl || null,
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        socialLinks: input.socialLinks || undefined,
        logoUrl: input.logoUrl || null,
        coverUrl: input.coverUrl || null,
        linkedShopId: input.linkedShopId || null,
        status: 'PENDING',
        branches: {
          create: {
            name: input.branch.name || null,
            latitude: lat,
            longitude: lng,
            addressLabel: input.branch.addressLabel || null,
            governorate: input.branch.governorate || null,
            city: input.branch.city || null,
            phone: input.branch.phone || null,
            isPrimary: true,
          },
        },
      },
      include: { branches: true },
    });

    return listing;
  }

  async addBranch(listingId: string, input: {
    name?: string;
    latitude: number;
    longitude: number;
    addressLabel?: string;
    governorate?: string;
    city?: string;
    phone?: string;
  }, actor: Actor) {
    const listing = await this.prisma.mapListing.findUnique({ where: { id: listingId } });
    if (!listing) throw new BadRequestException('النشاط غير موجود');

    // Only admin or the linked shop owner can add branches
    if (listing.linkedShopId && actor.shopId === listing.linkedShopId) {
      // allowed
    } else {
      this.assertAdmin(actor);
    }

    const lat = Number(input.latitude);
    const lng = Number(input.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new BadRequestException('الموقع على الخريطة مطلوب');
    }

    return this.prisma.mapListingBranch.create({
      data: {
        listingId,
        name: input.name || null,
        latitude: lat,
        longitude: lng,
        addressLabel: input.addressLabel || null,
        governorate: input.governorate || null,
        city: input.city || null,
        phone: input.phone || null,
        isPrimary: false,
      },
    });
  }

  async getPendingListings(actor: Actor, opts?: { page?: number; limit?: number }) {
    this.assertAdmin(actor);

    const page = Math.max(1, opts?.page || 1);
    const limit = Math.min(100, Math.max(1, opts?.limit || 50));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.mapListing.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { branches: true },
      }),
      this.prisma.mapListing.count({ where: { status: 'PENDING' } }),
    ]);

    return { items, total, page, limit };
  }

  async approve(id: string, actor: Actor, note?: string) {
    this.assertAdmin(actor);

    const listing = await this.prisma.mapListing.findUnique({ where: { id } });
    if (!listing) throw new BadRequestException('النشاط غير موجود');

    return this.prisma.mapListing.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedByAdminId: actor.id || null,
        reviewNote: note || null,
      },
    });
  }

  async reject(id: string, actor: Actor, note?: string) {
    this.assertAdmin(actor);

    const listing = await this.prisma.mapListing.findUnique({ where: { id } });
    if (!listing) throw new BadRequestException('النشاط غير موجود');

    return this.prisma.mapListing.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedByAdminId: actor.id || null,
        reviewNote: note || null,
      },
    });
  }

  async suspend(id: string, actor: Actor, note?: string) {
    this.assertAdmin(actor);

    const listing = await this.prisma.mapListing.findUnique({ where: { id } });
    if (!listing) throw new BadRequestException('النشاط غير موجود');

    return this.prisma.mapListing.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        reviewedAt: new Date(),
        reviewedByAdminId: actor.id || null,
        reviewNote: note || null,
      },
    });
  }

  async getListing(id: string) {
    const listing = await this.prisma.mapListing.findUnique({
      where: { id },
      include: { branches: true },
    });
    if (!listing) throw new BadRequestException('النشاط غير موجود');
    return listing;
  }

  async getPins(opts?: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    category?: string;
    q?: string;
    governorate?: string;
    city?: string;
  }) {
    // 1) Approved shops with coordinates
    const shopWhere: any = {
      status: 'APPROVED',
      isActive: true,
      publicDisabled: false,
      latitude: { not: null },
      longitude: { not: null },
    };
    if (opts?.category) shopWhere.category = String(opts.category).toUpperCase();
    if (opts?.governorate) shopWhere.governorate = opts.governorate;
    if (opts?.city) shopWhere.city = opts.city;
    if (opts?.q) shopWhere.name = { contains: opts.q, mode: 'insensitive' };

    const shops = await this.prisma.shop.findMany({
      where: shopWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        governorate: true,
        city: true,
        latitude: true,
        longitude: true,
        displayAddress: true,
        mapLabel: true,
        phone: true,
        logoUrl: true,
      },
    });

    // 2) Approved map listings with branches
    const listingWhere: any = { status: 'APPROVED' };
    if (opts?.category) listingWhere.category = opts.category;
    if (opts?.q) listingWhere.title = { contains: opts.q, mode: 'insensitive' };

    const listings = await this.prisma.mapListing.findMany({
      where: listingWhere,
      include: { branches: true },
    });

    // 3) Flatten into unified pins
    const shopPins = shops.map((s: any) => ({
      type: 'shop' as const,
      id: s.id,
      slug: s.slug,
      title: s.mapLabel || s.name,
      category: s.category,
      governorate: s.governorate,
      city: s.city,
      latitude: s.latitude,
      longitude: s.longitude,
      addressLabel: s.displayAddress || '',
      phone: s.phone || '',
      logoUrl: s.logoUrl || '',
      websiteUrl: null,
      whatsapp: null,
    }));

    const listingPins: any[] = [];
    for (const l of listings) {
      for (const b of l.branches) {
        if (opts?.governorate && b.governorate !== opts.governorate) continue;
        if (opts?.city && b.city !== opts.city) continue;

        listingPins.push({
          type: 'listing' as const,
          id: l.id,
          slug: null,
          title: b.name ? `${l.title} - ${b.name}` : l.title,
          category: l.category,
          governorate: b.governorate || '',
          city: b.city || '',
          latitude: b.latitude,
          longitude: b.longitude,
          addressLabel: b.addressLabel || '',
          phone: b.phone || l.phone || '',
          logoUrl: l.logoUrl || '',
          websiteUrl: l.websiteUrl || '',
          whatsapp: l.whatsapp || '',
        });
      }
    }

    let allPins = [...shopPins, ...listingPins];

    // 4) Optional radius filter (server-side rough filter)
    if (opts?.lat != null && opts?.lng != null && opts?.radiusKm) {
      const R = 6371;
      const toRad = (x: number) => (x * Math.PI) / 180;
      const lat1 = toRad(opts.lat);
      const lng1 = toRad(opts.lng);

      allPins = allPins.filter((p) => {
        if (p.latitude == null || p.longitude == null) return false;
        const lat2 = toRad(p.latitude);
        const lng2 = toRad(p.longitude);
        const dLat = lat2 - lat1;
        const dLng = lng2 - lng1;
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const dist = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
        return dist <= (opts.radiusKm ?? 50);
      });
    }

    // 5) Sort by distance if user coords provided
    if (opts?.lat != null && opts?.lng != null) {
      const toRad = (x: number) => (x * Math.PI) / 180;
      const lat1 = toRad(opts.lat);
      const lng1 = toRad(opts.lng);
      const R = 6371;

      allPins.sort((a, b) => {
        const dA = (a.latitude != null && a.longitude != null)
          ? 2 * R * Math.asin(Math.min(1, Math.sqrt(
              Math.sin((toRad(a.latitude) - lat1) / 2) ** 2 +
              Math.cos(lat1) * Math.cos(toRad(a.latitude)) * Math.sin((toRad(a.longitude) - lng1) / 2) ** 2
            )))
          : Infinity;
        const dB = (b.latitude != null && b.longitude != null)
          ? 2 * R * Math.asin(Math.min(1, Math.sqrt(
              Math.sin((toRad(b.latitude) - lat1) / 2) ** 2 +
              Math.cos(lat1) * Math.cos(toRad(b.latitude)) * Math.sin((toRad(b.longitude) - lng1) / 2) ** 2
            )))
          : Infinity;
        return dA - dB;
      });
    }

    return allPins;
  }
}
