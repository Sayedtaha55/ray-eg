import { Injectable, Inject, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException('المصادقة مطلوبة');
    }

    const userRole = String(user?.role || '').toUpperCase();
    const allowedRoles = requiredRoles.map((r) => String(r).toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(`صلاحيات غير كافية. مطلوب: ${allowedRoles.join(', ')}`);
    }

    return true;
  }
}
