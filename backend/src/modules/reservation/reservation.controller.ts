import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request, BadRequestException, Inject, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { BookingsService } from '@modules/bookings/bookings.service';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { parseOptionalNumber } from '@common/utils/booking-helpers';

class CreateReservationDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  itemImage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  itemPrice?: number;

  @IsString()
  @MinLength(1)
  shopId!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  addons?: any;

  @IsOptional()
  variantSelection?: any;

  @IsOptional()
  startTime?: any;

  @IsOptional()
  guests?: any;

  @IsOptional()
  notes?: any;
}

class UpdateReservationStatusDto {
  @IsString()
  status!: string;
}

@Controller('reservations')
export class ReservationController {
  constructor(
    @Inject(BookingsService) private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateReservationDto, @Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }

    const startAt = (body as any)?.startTime || (body as any)?.dateTime || (body as any)?.reservationDateTime
      || (body as any)?.datetime || (body as any)?.reservationDate
      || ((body as any)?.date && (body as any)?.time ? `${(body as any).date}T${(body as any).time}Z` : undefined);

    // In dev mode, resolve shopId from user token if not provided
    let shopId = body?.shopId;
    const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production';
    if (!shopId && isDev) {
      shopId = req.user?.shopId as any;
    }

    const result = await this.bookingsService.createForUser(String(userId), {
      itemId: body?.itemId,
      itemName: body?.itemName,
      itemImage: body?.itemImage,
      itemPrice: body?.itemPrice,
      shopId,
      customerName: body?.customerName,
      customerPhone: body?.customerPhone,
      customerEmail: body?.customerEmail,
      addons: (body as any)?.addons,
      variantSelection: (body as any)?.variantSelection ?? (body as any)?.variant_selection,
      startAt,
      participants: (body as any)?.partySize || (body as any)?.guests || (body as any)?.numberOfGuests || (body as any)?.numberOfPeople || undefined,
      notes: (body as any)?.notes,
    });

    if (result) {
      const r = result as any;
      if (!r.reservationDateTime && r.startTime) r.reservationDateTime = r.startTime;
      if (!r.reservationDate && r.startTime) r.reservationDate = r.startTime;
      if (!r.reservationDate && (body as any)?.reservationDate) r.reservationDate = (body as any).reservationDate;
      if (!r.start && r.startTime) r.start = r.startTime;
      if (!r.start && (body as any)?.reservationDate) r.start = (body as any).reservationDate;
      if (!r.datetime && r.startTime) r.datetime = r.startTime;
      if (!r.datetime && (body as any)?.datetime) r.datetime = (body as any).datetime;
      if (!r.end && r.endTime) r.end = r.endTime;
      if (!r.end && (body as any)?.endDate) r.end = (body as any).endDate;
      if (!r.partySize && r.participants) r.partySize = r.participants;
      if (!r.numberOfPeople && r.participants) r.numberOfPeople = r.participants;
      if (!r.numberOfPeople && (body as any)?.numberOfPeople) r.numberOfPeople = (body as any).numberOfPeople;
      if (!r.guests && r.participants) r.guests = r.participants;
      if (!r.guests && (body as any)?.numberOfGuests) r.guests = (body as any).numberOfGuests;
      if (!r.guests && (body as any)?.partySize) r.guests = (body as any).partySize;
      if (!r.numberOfGuests && r.participants) r.numberOfGuests = r.participants;
      if (!r.numberOfGuests && (body as any)?.numberOfGuests) r.numberOfGuests = (body as any).numberOfGuests;
      if (!r.shopId && (body as any)?.shopId) r.shopId = (body as any).shopId;
      if (!r.date && (body as any)?.date) r.date = (body as any).date;
      if (!r.time && (body as any)?.time) r.time = (body as any).time;
      if (!r.date && r.startTime) {
        try { r.date = String(r.startTime).split('T')[0]; } catch {}
      }
      if (!r.time && r.startTime) {
        try { const parts = String(r.startTime).split('T'); if (parts[1]) r.time = parts[1].replace(/Z$/, '').substring(0, 8); } catch {}
      }
    }

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('غير مصرح');
    }
    return this.bookingsService.listByUserId(userId, {
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

    return this.bookingsService.listByShop(targetShopId, {
      page: parseOptionalNumber(page),
      limit: parseOptionalNumber(limit),
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('merchant', 'admin')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateReservationStatusDto, @Request() req) {
    return this.bookingsService.updateStatus(id, body?.status, { role: req.user?.role, shopId: req.user?.shopId });
  }
}
