import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@common/prisma/prisma.module';
import { PortalAuthService } from './portal-auth.service';
import { PortalJwtStrategy } from './portal-jwt.strategy';
import { PortalController } from '@modules/portal/portal.controller';
import { MapListingService } from '@modules/map-listing/map-listing.service';

@Module({
  imports: [
    PrismaModule,
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
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [PortalController],
  providers: [PortalAuthService, PortalJwtStrategy, MapListingService],
  exports: [PortalAuthService],
})
export class PortalModule {}
