import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
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
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      shopId: payload.shopId,
    };
  }
}
