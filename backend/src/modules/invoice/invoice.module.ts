import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { InvoiceController } from '@modules/invoice/invoice.controller';
import { InvoiceService } from '@modules/invoice/invoice.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
