import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';

// Note: Controller and Service are omitted as they are not currently required.
// This module remains as a placeholder to satisfy potential future booking activity packages integrations.
@Module({
  imports: [PrismaModule],
})
export class ActivityPackagesModule {}
