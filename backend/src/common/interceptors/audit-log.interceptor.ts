import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '@common/prisma/prisma.service';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/change',
  '/api/v1/auth/deactivate',
  '/api/v1/auth/bootstrap-admin',
  '/api/v1/shops',
  '/api/v1/products',
  '/api/v1/orders',
  '/api/v1/reservations',
  '/api/v1/offers',
  '/api/v1/admin',
];

function isSensitive(path: string): boolean {
  return SENSITIVE_PATHS.some((p) => path.startsWith(p));
}

function getClientIp(req: any): string {
  const forwarded = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwarded) return forwarded;
  return String(req?.ip || req?.socket?.remoteAddress || 'unknown');
}

function redactBody(body: any): any {
  if (!body || typeof body !== 'object') return body;
  const redacted = { ...body };
  const sensitiveKeys = ['password', 'newPassword', 'currentPassword', 'token', 'secret', 'creditCard', 'cvv'];
  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    }
  }
  return redacted;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = String(req?.method || '').toUpperCase();

    if (!MUTATION_METHODS.has(method) || !isSensitive(req?.path || '')) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.writeAuditLog(req, method, 200, startTime, null).catch(() => undefined);
        },
        error: (err) => {
          const status = err?.status || err?.statusCode || 500;
          this.writeAuditLog(req, method, status, startTime, err?.message).catch(() => undefined);
        },
      }),
    );
  }

  private async writeAuditLog(req: any, method: string, status: number, startTime: number, errorMsg: string | null) {
    try {
      const duration = Date.now() - startTime;
      const user = req?.user;
      const userId = user?.id ? String(user.id) : null;
      const userEmail = user?.email ? String(user.email) : null;
      const userRole = user?.role ? String(user.role) : null;
      const path = String(req?.path || req?.originalUrl || '');
      const ip = getClientIp(req);
      const userAgent = String(req?.headers?.['user-agent'] || '').slice(0, 500);

      const body = req?.body ? redactBody(req.body) : null;
      const bodyStr = body ? JSON.stringify(body).slice(0, 2000) : null;

      await this.prisma.authEvent.create({
        data: {
          userId,
          email: userEmail,
          action: `${method} ${path}`,
          status: status >= 400 ? 'failed' : 'success',
          ip,
          userAgent,
          metadata: {
            method,
            path,
            status,
            duration,
            role: userRole,
            ...(errorMsg ? { error: errorMsg.slice(0, 500) } : {}),
            ...(bodyStr ? { body: bodyStr } : {}),
          },
        } as any,
      });
    } catch {
      // swallow audit log errors
    }
  }
}
