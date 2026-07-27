import { ConfigService } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'dev-fallback-secret-change-in-production';

let cachedSecret: string | null = null;

export function getJwtSecret(configService?: ConfigService): string {
  if (cachedSecret) return cachedSecret;

  const secret = configService
    ? configService.get<string>('JWT_SECRET')
    : String(process.env.JWT_SECRET || '').trim();

  const env = String(process.env.NODE_ENV || '').toLowerCase();
  const isDev = env === 'development' || env === '' || env === 'dev';

  if (!secret) {
    if (!isDev) {
      throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('[SECURITY] Using dev fallback JWT secret — do NOT use in production or staging');
    return DEV_FALLBACK_SECRET;
  }

  cachedSecret = secret;
  return secret;
}

export function clearJwtSecretCache() {
  cachedSecret = null;
}
