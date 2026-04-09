import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          const header = String(req?.headers?.cookie || '');
          if (!header) return null;

          // Minimal cookie parsing without cookie-parser dependency
          // Format: key=value; key2=value2
          const parts = header.split(';');
          for (const p of parts) {
            const trimmed = p.trim();
            if (!trimmed) continue;
            const eq = trimmed.indexOf('=');
            if (eq <= 0) continue;
            const k = trimmed.slice(0, eq).trim();
            if (k !== 'ray_session') continue;
            const v = trimmed.slice(eq + 1).trim();
            return v || null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        const env = String(process.env.NODE_ENV || '').toLowerCase();
        if (!secret && env === 'production') {
          throw new Error('JWT_SECRET must be set in production');
        }
        return secret || 'dev-fallback-secret-change-in-production';
      })(),
    });
  }

  async validate(payload: any) {
    const userId = String(payload?.sub || '').trim();
    if (!userId) {
      throw new ForbiddenException('غير مصرح');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, shopId: true, isActive: true },
    });

    if (!user || user.isActive === false) {
      throw new ForbiddenException('غير مصرح');
    }

    const role = String((user as any)?.role || '').toUpperCase();
    let shop: { id: string; deliveryDisabled: boolean } | undefined;
    if (role === 'MERCHANT') {
      const shopId = String((user as any)?.shopId || '').trim();
      let shopRecord: any = null;

      if (shopId) {
        shopRecord = await this.prisma.shop.findUnique({
          where: { id: shopId },
          select: { id: true, status: true, deliveryDisabled: true, ownerId: true, createdAt: true },
        });
      }

      const status = String((shopRecord as any)?.status || '').toUpperCase();
      const ownerMatches = shopRecord ? String((shopRecord as any)?.ownerId || '') === String((user as any)?.id || '') : false;
      if (!shopRecord || !ownerMatches || status !== 'APPROVED') {
        const ownerShops = await this.prisma.shop.findMany({
          where: { ownerId: String((user as any)?.id || '') },
          select: { id: true, status: true, deliveryDisabled: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        const approvedShop = ownerShops.find((s: any) => String((s as any)?.status || '').toUpperCase() === 'APPROVED');
        if (approvedShop) {
          shopRecord = approvedShop;
          try {
            await this.prisma.user.update({
              where: { id: String((user as any).id) },
              data: { shopId: String((approvedShop as any).id) as any },
            });
          } catch {
          }
        }
      }

      const normalizedStatus = String((shopRecord as any)?.status || '').toUpperCase();
      if (!shopRecord || normalizedStatus !== 'APPROVED') {
        throw new ForbiddenException('حسابك قيد المراجعة من الأدمن');
      }

      shop = {
        id: String((shopRecord as any).id),
        deliveryDisabled: (shopRecord as any).deliveryDisabled ?? false,
      };
    }

    return {
      id: String((user as any).id),
      email: String((user as any).email),
      role: (user as any).role,
      shopId: (user as any).shopId,
      shop,
    };
  }
}
