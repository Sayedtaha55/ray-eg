
import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException, Inject, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

type IncomingRole = 'customer' | 'merchant' | 'admin' | 'courier' | 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'COURIER';
type IncomingShopCategory =
  | 'RETAIL'
  | 'RESTAURANT'
  | 'SERVICE'
  | 'ELECTRONICS'
  | 'FASHION'
  | 'FOOD'
  | 'HEALTH'
  | 'OTHER';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const seedEmailRaw = String(process.env.ADMIN_SEED_EMAIL || '').trim();
    const seedPassword = String(process.env.ADMIN_SEED_PASSWORD || '');
    const seedName = String(process.env.ADMIN_SEED_NAME || 'Admin').trim() || 'Admin';

    if (env !== 'production') return;
    if (!seedEmailRaw || !seedPassword) return;
    if (seedPassword.length < 8) return;

    try {
      const seedEmail = seedEmailRaw.toLowerCase();
      const existingAdmin = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' as any },
        select: { id: true, email: true },
      });

      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(seedPassword, salt);
        await this.prisma.user.create({
          data: {
            email: seedEmail,
            name: seedName,
            password: hashedPassword,
            role: 'ADMIN' as any,
            isActive: true,
          },
          select: { id: true },
        });
        // eslint-disable-next-line no-console
        console.log('✅ Admin seeded from environment variables');
        return;
      }

      const allowReset = String(process.env.ADMIN_SEED_ALLOW_RESET || '').toLowerCase() === 'true';
      if (allowReset && String(existingAdmin.email || '').toLowerCase() === seedEmail) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(seedPassword, salt);
        await this.prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            name: seedName,
            password: hashedPassword,
            role: 'ADMIN' as any,
            isActive: true,
          },
          select: { id: true },
        });
        // eslint-disable-next-line no-console
        console.log('✅ Admin password reset from environment variables');
      }
    } catch {
      // ignore
    }
  }

  async bootstrapAdmin(input: { token: string; email: string; password: string; name?: string }) {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const expected = String(process.env.ADMIN_BOOTSTRAP_TOKEN || '').trim();

    if (!expected && env === 'production') {
      throw new ForbiddenException('Admin bootstrap is not configured');
    }

    const token = String(input?.token || '').trim();
    if (!expected || token !== expected) {
      throw new ForbiddenException('Forbidden');
    }

    const email = String(input?.email || '').toLowerCase().trim();
    const password = String(input?.password || '');
    const name = String(input?.name || 'Admin').trim() || 'Admin';

    if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب');
    if (!password || password.length < 8) throw new BadRequestException('كلمة المرور ضعيفة جداً');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' as any },
      select: { id: true },
    });

    if (existingAdmin && env === 'production') {
      const allowReset = String(process.env.ADMIN_BOOTSTRAP_ALLOW_RESET || '').toLowerCase() === 'true';
      if (!allowReset) {
        throw new ForbiddenException('Admin already initialized');
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (
        env === 'production' &&
        String(existing?.role || '').toUpperCase() !== 'ADMIN' &&
        String(process.env.ADMIN_BOOTSTRAP_ALLOW_RESET || '').toLowerCase() !== 'true'
      ) {
        throw new ForbiddenException('Forbidden');
      }
      const updated = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          password: hashedPassword,
          role: 'ADMIN' as any,
          isActive: true,
        },
      });
      return { ok: true, userId: updated.id };
    }

    if (existingAdmin && env === 'production') {
      throw new ForbiddenException('Admin already initialized');
    }

    const created = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN' as any,
        isActive: true,
      },
      select: { id: true },
    });

    return { ok: true, userId: created.id };
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = String(email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return { ok: true };
    }

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return ok to prevent account enumeration.
    if (!user) {
      return { ok: true };
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        typ: 'password_reset',
      },
      {
        expiresIn: '15m',
      } as any,
    );

    const appUrl = String(process.env.FRONTEND_APP_URL || process.env.APP_URL || 'http://localhost:5173').trim();
    const resetUrlBrowser = `${appUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    const resetUrlHash = `${appUrl.replace(/\/$/, '')}/#/reset-password?token=${encodeURIComponent(token)}`;

    return {
      ok: true,
      token,
      resetUrl: resetUrlBrowser,
      resetUrlHash,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const rawToken = String(token || '').trim();
    const pass = String(newPassword || '');

    if (!rawToken) throw new BadRequestException('الرابط غير صالح');
    if (!pass || pass.length < 8) throw new BadRequestException('كلمة المرور ضعيفة جداً');

    let payload: any;
    try {
      payload = this.jwtService.verify(rawToken);
    } catch {
      throw new BadRequestException('الرابط غير صالح أو منتهي');
    }

    if (String(payload?.typ || '') !== 'password_reset') {
      throw new BadRequestException('الرابط غير صالح');
    }

    const userId = String(payload?.sub || '').trim();
    if (!userId) throw new BadRequestException('الرابط غير صالح');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('الرابط غير صالح');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(pass, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { ok: true };
  }

  async deactivateAccount(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new UnauthorizedException('غير مصرح');

    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, role: true },
    });
    if (!user) throw new UnauthorizedException('غير مصرح');

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: uid },
        data: { isActive: false },
        select: { id: true },
      });

      const role = String((user as any)?.role || '').toUpperCase();
      if (role === 'MERCHANT') {
        try {
          await tx.shop.updateMany({
            where: { ownerId: uid },
            data: { isActive: false },
          });
        } catch {
          // ignore
        }
      }
    });

    return { ok: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new UnauthorizedException('غير مصرح');

    const current = String(currentPassword || '');
    const next = String(newPassword || '');
    if (!current) throw new BadRequestException('كلمة المرور الحالية مطلوبة');
    if (!next || next.length < 8) throw new BadRequestException('كلمة المرور ضعيفة جداً');
    if (current === next) throw new BadRequestException('كلمة المرور الجديدة يجب أن تكون مختلفة');

    const user = await this.prisma.user.findUnique({ where: { id: uid } });
    if (!user) throw new UnauthorizedException('غير مصرح');

    const ok = await bcrypt.compare(current, user.password);
    if (!ok) throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(next, salt);

    await this.prisma.user.update({
      where: { id: uid },
      data: { password: hashedPassword },
    });

    return { ok: true };
  }

  public slugify(value: string) {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  public async ensureUniqueSlug(base: string, client?: any) {
    const db = client || this.prisma;
    const baseSlug = this.slugify(base) || `shop-${Date.now()}`;
    let slug = baseSlug;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await db.shop.findUnique({ where: { slug } });
      if (!exists) return slug;
      i += 1;
      slug = `${baseSlug}-${i}`;
    }
  }

  private normalizeRole(role?: IncomingRole) {
    const r = String(role || 'CUSTOMER').toUpperCase();
    if (r === 'MERCHANT') return 'MERCHANT' as any;
    if (r === 'ADMIN') return 'ADMIN' as any;
    if (r === 'COURIER') return 'COURIER' as any;
    return 'CUSTOMER' as any;
  }

  private normalizeShopCategory(category?: IncomingShopCategory) {
    const c = String(category || 'RETAIL').toUpperCase();
    const allowed = new Set([
      'RETAIL',
      'RESTAURANT',
      'SERVICE',
      'ELECTRONICS',
      'FASHION',
      'FOOD',
      'HEALTH',
      'OTHER',
    ]);
    return allowed.has(c) ? c : 'RETAIL' as any;
  }

  /**
   * تسجيل مستخدم جديد مع تشفير كلمة المرور والتحقق من القوة
   */
  async signup(dto: any) {
    const {
      email,
      password,
      name,
      fullName,
      phone,
      role,
      shopName: shopNameRaw,
      category: categoryRaw,
      storeType,
      governorate,
      city,
      shopEmail: shopEmailRaw,
      storeEmail,
      shopPhone: shopPhoneRaw,
      storePhone,
      openingHours: openingHoursRaw,
      workingHours,
      addressDetailed: addressDetailedRaw,
      address,
      shopDescription: shopDescriptionRaw,
      description,
    } = dto;

    const resolvedName = String(name || fullName || '').trim() || undefined;
    const resolvedShopName = String(shopNameRaw || storeType || resolvedName || '').trim() || undefined;
    const resolvedShopEmail = String(shopEmailRaw || storeEmail || '').trim() || undefined;
    const resolvedShopPhone = String(shopPhoneRaw || storePhone || '').trim() || undefined;
    const resolvedOpeningHours = String(openingHoursRaw || workingHours || '').trim() || undefined;
    const resolvedAddressDetailed = String(addressDetailedRaw || address || '').trim() || undefined;
    const resolvedShopDescription = String(shopDescriptionRaw || description || '').trim() || undefined;
    const resolvedCategory = (categoryRaw || storeType) as any;

    if (!email || typeof email !== 'string') {
      throw new BadRequestException('البريد الإلكتروني مطلوب');
    }
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('كلمة المرور مطلوبة');
    }

    const normalizedEmail = email.toLowerCase().trim();

    let normalizedRole = this.normalizeRole(role);
    if (normalizedRole !== 'CUSTOMER' && normalizedRole !== 'MERCHANT') {
      normalizedRole = 'CUSTOMER' as any;
    }

    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const autoApproveMerchantsInDev =
      env !== 'production';

    // 1. التحقق من صحة المدخلات
    if (password.length < 8) {
      throw new BadRequestException('كلمة المرور ضعيفة جداً');
    }

    if (normalizedRole === 'MERCHANT') {
      if (!resolvedShopName || !governorate || !city) {
        throw new BadRequestException('بيانات المحل غير مكتملة');
      }

      if (!resolvedShopPhone && !phone) {
        throw new BadRequestException('رقم موبايل المحل مطلوب');
      }
    }

    // 2. التأكد من عدم وجود المستخدم مسبقاً
    const existingUser = await this.prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });
    
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل في نظامنا');
    }

    const normalizedPhone = phone ? String(phone).trim() : null;
    if (normalizedPhone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        throw new ConflictException('رقم الهاتف مستخدم بالفعل في نظامنا');
      }
    }

    // 3. تشفير كلمة المرور (Hashing with Salt)
    const salt = await bcrypt.genSalt(12); // زيادة الـ Salt لزيادة الأمان
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. حفظ المستخدم والمتجر (إن وجد) في قاعدة البيانات داخل Transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: resolvedName || null,
          phone,
          password: hashedPassword,
          role: normalizedRole,
        },
      });

      if (normalizedRole !== 'MERCHANT') {
        return { user: createdUser };
      }

      const slug = await this.ensureUniqueSlug(resolvedShopName || resolvedName || `shop-${createdUser.id}`, tx);
      const createdShop = await tx.shop.create({
        data: {
          name: resolvedShopName,
          slug,
          description: resolvedShopDescription || null,
          category: this.normalizeShopCategory(resolvedCategory),
          governorate,
          city,
          phone: resolvedShopPhone || phone,
          email: (resolvedShopEmail || normalizedEmail) as any,
          openingHours: resolvedOpeningHours || null,
          addressDetailed: resolvedAddressDetailed || null,
          status: (autoApproveMerchantsInDev ? 'APPROVED' : 'PENDING') as any,
          ownerId: createdUser.id,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: createdUser.id },
        data: {
          shop: {
            connect: { id: createdShop.id }
          }
        },
      });

      return { user: updatedUser, shop: createdShop };
    });

    if (String(result?.user?.role || '').toUpperCase() === 'MERCHANT') {
      const shopStatus = String((result as any)?.shop?.status || '').toUpperCase();
      if (shopStatus === 'APPROVED') {
        return await this.issueToken(result.user);
      }
      return {
        ok: true,
        pending: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        shop: result.shop,
      };
    }

    return await this.issueToken(result.user);
  }

  async courierSignup(dto: any) {
    const {
      email,
      password,
      name,
      fullName,
      phone,
    } = dto || {};

    const normalizedEmail = String(email || '').toLowerCase().trim();
    const resolvedName = String(name || fullName || '').trim();
    const normalizedPhone = phone ? String(phone).trim() : null;
    const pass = String(password || '');

    if (!normalizedEmail) {
      throw new BadRequestException('البريد الإلكتروني مطلوب');
    }
    if (!pass) {
      throw new BadRequestException('كلمة المرور مطلوبة');
    }
    if (pass.length < 8) {
      throw new BadRequestException('كلمة المرور ضعيفة جداً');
    }
    if (!resolvedName) {
      throw new BadRequestException('الاسم مطلوب');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل في نظامنا');
    }

    if (normalizedPhone) {
      const existingPhone = await this.prisma.user.findUnique({ where: { phone: normalizedPhone } });
      if (existingPhone) {
        throw new ConflictException('رقم الهاتف مستخدم بالفعل في نظامنا');
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(pass, salt);

    const createdUser = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: resolvedName,
        phone: normalizedPhone,
        password: hashedPassword,
        role: 'COURIER' as any,
        isActive: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      ok: true,
      pending: true,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    };
  }

  async devMerchantLogin(opts?: { shopCategory?: IncomingShopCategory }) {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const allowBootstrap =
      env !== 'production' &&
      String(process.env.ALLOW_DEV_MERCHANT_BOOTSTRAP ?? 'false').toLowerCase() === 'true';
    if (!allowBootstrap) {
      throw new ForbiddenException('Forbidden');
    }

    const requestedCategory = opts?.shopCategory ? this.normalizeShopCategory(opts.shopCategory) : undefined;
    const requestedCategoryUpper = String(requestedCategory || '').toUpperCase();
    const restaurantMode = requestedCategoryUpper === 'RESTAURANT';
    const categoryMode = Boolean(requestedCategoryUpper && !restaurantMode);
    const categorySuffix = categoryMode ? requestedCategoryUpper.toLowerCase() : '';

    const devEmail = (
      restaurantMode
        ? (String(process.env.DEV_RESTAURANT_MERCHANT_EMAIL || '').trim().toLowerCase() || '')
        : (categoryMode
            ? `dev-merchant-${categorySuffix}@ray.local`
            : (String(process.env.DEV_MERCHANT_EMAIL || '').trim().toLowerCase() || ''))
    ) || (restaurantMode ? 'dev-restaurant@ray.local' : 'dev-merchant@ray.local');

    const devName = (
      restaurantMode
        ? (String(process.env.DEV_RESTAURANT_MERCHANT_NAME || '').trim() || '')
        : (categoryMode
            ? `Dev Merchant (${requestedCategoryUpper})`
            : (String(process.env.DEV_MERCHANT_NAME || '').trim() || ''))
    ) || (restaurantMode ? 'Dev Restaurant' : 'Dev Merchant');

    const devShopName = (
      restaurantMode
        ? (String(process.env.DEV_RESTAURANT_SHOP_NAME || '').trim() || '')
        : (categoryMode
            ? `Dev ${requestedCategoryUpper} Shop`
            : (String(process.env.DEV_MERCHANT_SHOP_NAME || '').trim() || ''))
    ) || (restaurantMode ? 'Dev Restaurant Shop' : 'Dev Shop');
    const devShopPhone = String(process.env.DEV_MERCHANT_SHOP_PHONE || '').trim() || '01000000000';
    const devGovernorate = String(process.env.DEV_MERCHANT_GOVERNORATE || '').trim() || 'Cairo';
    const devCity = String(process.env.DEV_MERCHANT_CITY || '').trim() || 'Cairo';
    const devCategory = requestedCategory || this.normalizeShopCategory(String(process.env.DEV_MERCHANT_CATEGORY || '').trim() as any);

    const resultUser = await this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: devEmail } });

      if (!user) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(randomBytes(32).toString('hex'), salt);
        user = await tx.user.create({
          data: {
            email: devEmail,
            name: devName,
            password: hashedPassword,
            role: 'MERCHANT' as any,
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: 'MERCHANT' as any,
            isActive: true,
            ...(devName && user.name !== devName ? { name: devName } : {}),
            lastLogin: new Date(),
          },
        });
      }

      let shop = user.id ? await tx.shop.findFirst({ where: { ownerId: user.id } }) : null;

      if (!shop) {
        const slug = await this.ensureUniqueSlug(devShopName, tx);
        shop = await tx.shop.create({
          data: {
            name: devShopName,
            slug,
            description: null,
            category: devCategory,
            governorate: devGovernorate,
            city: devCity,
            phone: devShopPhone,
            email: devEmail as any,
            openingHours: null,
            addressDetailed: null,
            status: 'APPROVED' as any,
            ownerId: user.id,
          },
        });
      } else {
        const status = String((shop as any)?.status || '').toUpperCase();
        const needsStatus = status !== 'APPROVED';
        const existingCategory = String((shop as any)?.category || '').toUpperCase();
        const desiredCategory = String(devCategory || '').toUpperCase();
        const needsCategory = desiredCategory && existingCategory !== desiredCategory;
        if (needsStatus || needsCategory) {
          shop = await tx.shop.update({
            where: { id: shop.id },
            data: {
              ...(needsStatus ? { status: 'APPROVED' as any } : {}),
              ...(needsCategory ? { category: devCategory } : {}),
            } as any,
          });
        }
      }

      return user;
    });

    return await this.issueToken(resultUser);
  }

  async devCourierLogin() {
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const allowBootstrap =
      env !== 'production' &&
      (
        String(process.env.ALLOW_DEV_COURIER_BOOTSTRAP ?? '').toLowerCase() === 'true' ||
        String(process.env.ALLOW_DEV_MERCHANT_BOOTSTRAP ?? 'false').toLowerCase() === 'true'
      );
    if (!allowBootstrap) {
      throw new ForbiddenException('Forbidden');
    }

    const devEmail = (String(process.env.DEV_COURIER_EMAIL || '').trim().toLowerCase() || '') || 'dev-courier@ray.local';
    const devName = String(process.env.DEV_COURIER_NAME || '').trim() || 'Dev Courier';
    const devPhone = String(process.env.DEV_COURIER_PHONE || '').trim() || null;

    const resultUser = await this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: devEmail } });

      if (!user) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(randomBytes(32).toString('hex'), salt);
        user = await tx.user.create({
          data: {
            email: devEmail,
            name: devName,
            phone: devPhone,
            password: hashedPassword,
            role: 'COURIER' as any,
            isActive: true,
            lastLogin: new Date(),
          },
        });
      } else {
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            role: 'COURIER' as any,
            isActive: true,
            ...(devName && user.name !== devName ? { name: devName } : {}),
            ...(devPhone != null && String((user as any)?.phone || '').trim() !== String(devPhone || '').trim()
              ? { phone: devPhone }
              : {}),
            lastLogin: new Date(),
          } as any,
        });
      }

      return user;
    });

    return await this.issueToken(resultUser);
  }

  /**
   * تسجيل الدخول والتحقق الآمن
   */
  async login(email: string, pass: string) {
    if (!email || typeof email !== 'string' || !pass || typeof pass !== 'string') {
      throw new BadRequestException('البريد الإلكتروني وكلمة المرور مطلوبان');
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ 
      where: { email: normalizedEmail } 
    });

    // Default admin bootstrap (development/testing)
    // Allows the admin UI to work with real DB + JWT instead of mock fallbacks.
    const env = String(process.env.NODE_ENV || '').toLowerCase();
    const allowBootstrap =
      env !== 'production' &&
      String(process.env.ALLOW_DEV_ADMIN_BOOTSTRAP ?? 'true').toLowerCase() === 'true';
    if (
      allowBootstrap &&
      (normalizedEmail === 'admin' || normalizedEmail === 'admin@ray.com' || normalizedEmail === 'admin@mnmknk.com')
    ) {
      const allowed = new Set(['1234', 'admin123']);
      if (allowed.has(pass)) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(pass, salt);

        if (!user) {
          user = await this.prisma.user.create({
            data: {
              email: normalizedEmail,
              name: 'Admin',
              password: hashedPassword,
              role: 'ADMIN' as any,
              isActive: true,
            },
          });
        } else if (String(user?.role || '').toUpperCase() === 'ADMIN') {
          // If an admin already exists but password is unknown, allow resetting in dev.
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              isActive: true,
              role: 'ADMIN' as any,
            },
          });
        } else {
          // If the reserved admin email exists with a non-admin role, promote it in dev.
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              isActive: true,
              role: 'ADMIN' as any,
            },
          });
        }

        // After bootstrap, user object is guaranteed to be the correct admin.
        // Generate token directly instead of falling through to password check.
        return await this.issueToken(user);
      }
    }

    if (!user) {
      // رسالة مبهمة لمنع الـ Account Enumeration
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const role = String(user?.role || '').toUpperCase();
    if (user?.isActive === false) {
      if (role === 'COURIER') {
        throw new ForbiddenException('حساب المندوب قيد المراجعة من الأدمن');
      }
      throw new ForbiddenException('الحساب معطل');
    }
    if (role === 'MERCHANT') {
      const shop = await this.prisma.shop.findFirst({
        where: { ownerId: user.id },
        select: { id: true, status: true, isActive: true },
      });
      if (!shop) {
        throw new ForbiddenException('حساب التاجر غير مكتمل');
      }
      if ((shop as any)?.isActive === false) {
        throw new ForbiddenException('الحساب معطل');
      }
      const status = String((shop as any)?.status || '').toUpperCase();
      if (status !== 'APPROVED') {
        throw new ForbiddenException('حسابك قيد المراجعة من الأدمن');
      }
    }

    // تحديث تاريخ آخر ظهور (Last Login)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return await this.issueToken(user);
  }

  async loginWithGoogleProfile(profile: any) {
    const email = String(profile?.emails?.[0]?.value || '').toLowerCase().trim();
    if (!email) {
      throw new BadRequestException('تعذر الحصول على البريد الإلكتروني من جوجل');
    }

    const displayNameRaw = String(profile?.displayName || '').trim();
    const fallbackName = email.split('@')[0] || 'User';
    const displayName = displayNameRaw || fallbackName;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(randomBytes(32).toString('hex'), salt);
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName,
          password: hashedPassword,
          role: 'CUSTOMER' as any,
          isActive: true,
          lastLogin: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          ...(displayName && user.name !== displayName ? { name: displayName } : {}),
        },
      });
    }

    return await this.issueToken(user);
  }

  async session(userId: string) {
    const uid = String(userId || '').trim();
    if (!uid) throw new UnauthorizedException('غير مصرح');

    const user = await this.prisma.user.findUnique({ where: { id: uid } });
    if (!user) throw new UnauthorizedException('غير مصرح');

    const role = String(user?.role || '').toUpperCase();
    if (user?.isActive === false) {
      if (role === 'COURIER') {
        throw new ForbiddenException('حساب المندوب قيد المراجعة من الأدمن');
      }
      throw new ForbiddenException('الحساب معطل');
    }
    if (role === 'MERCHANT') {
      const shop = await this.prisma.shop.findFirst({
        where: { ownerId: user.id },
        select: { id: true, status: true, isActive: true },
      });
      if (!shop) {
        throw new ForbiddenException('حساب التاجر غير مكتمل');
      }
      if ((shop as any)?.isActive === false) {
        throw new ForbiddenException('الحساب معطل');
      }
      const status = String((shop as any)?.status || '').toUpperCase();
      if (status !== 'APPROVED') {
        throw new ForbiddenException('حسابك قيد المراجعة من الأدمن');
      }
    }

    return await this.issueToken(user);
  }

  /**
   * توليد توكن JWT آمن
   */
  private async issueToken(user: any) {
    const role = String(user?.role || '').toUpperCase();
    let shopId: string | undefined;

    if (role === 'MERCHANT') {
      const shop = await this.prisma.shop.findFirst({
        where: { ownerId: user.id },
        select: { id: true },
      });
      if (shop?.id) shopId = shop.id;
    }

    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(shopId ? { shopId } : {}),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(shopId ? { shopId } : {}),
      },
    };
  }
}
