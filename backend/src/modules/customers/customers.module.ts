import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CustomersController } from '@modules/customers/customers.controller';
import { CustomersService } from '@modules/customers/customers.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
