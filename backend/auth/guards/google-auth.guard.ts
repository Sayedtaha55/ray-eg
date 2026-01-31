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

    const returnTo = String(req?.query?.returnTo || '').trim();
    const followShopId = String(req?.query?.followShopId || '').trim();

    const statePayload: any = {};
    if (returnTo) statePayload.returnTo = returnTo;
    if (followShopId) statePayload.followShopId = followShopId;

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
