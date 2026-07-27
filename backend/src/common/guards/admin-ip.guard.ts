import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

const ADMIN_IP_ALLOWLIST = String(process.env.ADMIN_IP_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);

const ADMIN_PATH_PREFIXES = [
  '/api/v1/admin',
  '/api/v1/shops/admin',
  '/api/v1/users/admin',
  '/api/v1/products/admin',
  '/api/v1/orders/admin',
];

function isAdminPath(path: string): boolean {
  return ADMIN_PATH_PREFIXES.some((p) => path.startsWith(p));
}

function getClientIp(req: any): string {
  const forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwarded) return forwarded;
  return String(req?.ip || req?.socket?.remoteAddress || 'unknown');
}

@Injectable()
export class AdminIpGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    if (!isProd) return true;

    if (ADMIN_IP_ALLOWLIST.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const path = String(req?.path || req?.originalUrl || '');

    if (!isAdminPath(path)) return true;

    const clientIp = getClientIp(req);
    const normalizedIp = clientIp.replace(/^::ffff:/, '');

    const allowed = ADMIN_IP_ALLOWLIST.some((allowedIp) => {
      const normalized = allowedIp.replace(/^::ffff:/, '');
      return normalizedIp === normalized || normalizedIp.endsWith(normalized);
    });

    if (!allowed) {
      throw new ForbiddenException('عنوان IP غير مصرح به للوصول إلى لوحة الإدارة');
    }

    return true;
  }
}
