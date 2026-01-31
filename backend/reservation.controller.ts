import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { ReservationService } from './reservation.service';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

function parseOptionalNumber(value: any) {
  if (value == null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
}

class CreateReservationDto {
  @IsString()
  @MinLength(1)
  itemId!: string;

  @IsString()
  @MinLength(1)
  itemName!: string;

  @IsOptional()
  @IsString()
  itemImage?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  itemPrice!: number;

  @IsString()
  @MinLength(1)
  shopId!: string;
}

class UpdateReservationStatusDto {
  @IsString()
  status!: string;
}

@Controller('api/v1/reservations')
export class ReservationController {
  constructor(
    @Inject(ReservationService) private readonly reservationService: ReservationService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateReservationDto, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }

    return this.reservationService.createForUser(String(userId), {
      itemId: body?.itemId,
      itemName: body?.itemName,
      itemImage: body?.itemImage,
      itemPrice: body?.itemPrice,
      shopId: body?.shopId,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }
    return this.reservationService.listByUserId(userId, {
      page: parseOptionalNumber(page),
      limit: parseOptionalNumber(limit),
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async listByShop(@Query('shopId') shopId: string, @Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    const role = String(req.user?.role || '').toUpperCase();
    const shopIdFromToken = req.user?.shopId;
    const shopIdFromQuery = typeof shopId === 'string' ? shopId : undefined;

    const targetShopId = role === 'ADMIN' ? shopIdFromQuery : shopIdFromToken;
    if (!targetShopId) {
      throw new BadRequestException('shopId مطلوب');
    }

    return this.reservationService.listByShop(targetShopId, {
      page: parseOptionalNumber(page),
      limit: parseOptionalNumber(limit),
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateReservationStatusDto, @Request() req) {
    return this.reservationService.updateStatus(id, body?.status, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
