import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { AppsController } from '@modules/apps/apps.controller';
import { AppsService } from '@modules/apps/apps.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
