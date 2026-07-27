import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { SupportController } from '@modules/support/support.controller';
import { SupportService } from '@modules/support/support.service';

@Module({
  imports: [PrismaModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
