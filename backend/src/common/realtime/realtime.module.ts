import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { PrismaModule } from '@common/prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
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
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}
