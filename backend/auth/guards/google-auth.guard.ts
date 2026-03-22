import { Injectable, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext) {
    const hasGoogleOAuthConfig =
      Boolean(String(process.env.GOOGLE_CLIENT_ID || '').trim()) &&
      Boolean(String(process.env.GOOGLE_CLIENT_SECRET || '').trim());

    if (!hasGoogleOAuthConfig) {
      throw new NotFoundException('Google OAuth is disabled');
    }

    return super.canActivate(context) as any;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const normalizeReturnTo = (value: any) => {
      const rt = String(value || '').trim();
      if (!rt || !rt.startsWith('/') || rt.startsWith('//')) return undefined;
      return rt;
    };

    const returnTo = normalizeReturnTo(req?.query?.returnTo);
    const followShopId = String(req?.query?.followShopId || '').trim();
    const target = normalizeReturnTo(req?.query?.target);
    const merchantStatus = String(req?.query?.merchantStatus || '').trim().toLowerCase();

    const statePayload: any = {};
    if (returnTo) statePayload.returnTo = returnTo;
    if (followShopId) statePayload.followShopId = followShopId;
    if (target) statePayload.target = target;
    if (merchantStatus) statePayload.merchantStatus = merchantStatus;

    const state =
      Object.keys(statePayload).length > 0
        ? Buffer.from(JSON.stringify(statePayload), 'utf8').toString('base64url')
        : undefined;

    return {
      scope: ['email', 'profile'],
      prompt: 'select_account',
      ...(state ? { state } : {}),
    } as any;
  }
}
