import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PortalAuthService } from './portal-auth.service';

@Injectable()
export class PortalJwtStrategy extends PassportStrategy(Strategy, 'portal-jwt') {
  constructor(
    @Inject(ConfigService) configService: ConfigService,
    @Inject(PortalAuthService) private readonly portalAuthService: PortalAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          const header = String(req?.headers?.cookie || '');
          if (!header) return null;
          const parts = header.split(';');
          for (const p of parts) {
            const trimmed = p.trim();
            if (!trimmed) continue;
            const eq = trimmed.indexOf('=');
            if (eq <= 0) continue;
            const k = trimmed.slice(0, eq).trim();
            if (k !== 'portal_session') continue;
            return trimmed.slice(eq + 1).trim() || null;
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
    const typ = String(payload?.typ || '');
    if (typ !== 'portal' && typ !== 'portal_impersonate') {
      return null;
    }
    return this.portalAuthService.validatePortalToken(payload);
  }
}
