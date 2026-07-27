import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@common/prisma/prisma.module';
import { PortalAuthService } from './portal-auth.service';
import { PortalJwtStrategy } from './portal-jwt.strategy';
import { PortalController } from '@modules/portal/portal.controller';
import { MapListingService } from '@modules/map-listing/map-listing.service';
import { getJwtSecret } from '@common/security/jwt-secret.util';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: getJwtSecret(config),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [PortalController],
  providers: [PortalAuthService, PortalJwtStrategy, MapListingService],
  exports: [PortalAuthService],
})
export class PortalModule {}
