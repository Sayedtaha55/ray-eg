import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

 const hasGoogleOAuthConfig =
   Boolean(String(process.env.GOOGLE_CLIENT_ID || '').trim()) &&
   Boolean(String(process.env.GOOGLE_CLIENT_SECRET || '').trim());

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: (() => {
          const secret = config.get<string>('JWT_SECRET');
          const env = String(process.env.NODE_ENV || '').toLowerCase();
          if (!secret && env === 'production') {
            throw new Error('JWT_SECRET must be set in production');
          }
          return secret || 'dev-fallback-secret-change-in-production';
        })(),
        signOptions: {
          expiresIn: (() => {
            const raw = String(config.get<string>('JWT_EXPIRES_IN') || '7d').trim();
            if (/^\d+$/.test(raw)) return Number(raw);
            if (/^\d+(ms|s|m|h|d|w|y)$/.test(raw)) return raw as any;
            return '7d' as any;
          })(),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...(hasGoogleOAuthConfig ? [GoogleStrategy] : []), ConfigService],
  exports: [AuthService],
})
export class AuthModule {}
