import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
