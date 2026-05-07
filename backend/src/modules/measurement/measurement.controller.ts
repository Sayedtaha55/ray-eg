import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request, BadRequestException, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MeasurementService } from '@modules/measurement/measurement.service';
import { IsNumber, IsOptional, IsString, IsBoolean, Min, MinLength, IsArray, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateMeasurementDto {
  @IsOptional()
  @IsString()
  label?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  value!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateMeasurementDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  value?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class BulkCreateItemDto {
  @IsOptional()
  @IsString()
  label?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  value!: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class BulkCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(50)
  @Type(() => BulkCreateItemDto)
  items!: BulkCreateItemDto[];
}

class BulkUpdateItemDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  value?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class BulkUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(50)
  @Type(() => BulkUpdateItemDto)
  items!: BulkUpdateItemDto[];
}

function parseOptionalNumber(value: any) {
  if (value == null) return undefined;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : undefined;
}

@Controller('measurements')
export class MeasurementController {
  constructor(
    @Inject(MeasurementService) private readonly measurementService: MeasurementService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateMeasurementDto, @Request() req) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.create(String(userId), {
      label: body.label,
      value: body.value,
      unit: body.unit,
      notes: body.notes,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.listByUser(userId, {
      page: parseOptionalNumber(page),
      limit: parseOptionalNumber(limit),
    });
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.getSummary(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.getOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: UpdateMeasurementDto, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.update(id, userId, {
      label: body.label,
      value: body.value,
      unit: body.unit,
      notes: body.notes,
      isActive: body.isActive,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.remove(id, userId);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async bulkCreate(@Body() body: BulkCreateDto, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.bulkCreate(String(userId), body.items.map((item) => ({
      label: item.label,
      value: item.value,
      unit: item.unit,
      notes: item.notes,
    })));
  }

  @Patch('bulk')
  @UseGuards(JwtAuthGuard)
  async bulkUpdate(@Body() body: BulkUpdateDto, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.bulkUpdate(String(userId), body.items.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      unit: item.unit,
      notes: item.notes,
      isActive: item.isActive,
    })));
  }

  @Delete('me/all')
  @UseGuards(JwtAuthGuard)
  async deleteAll(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('غير مصرح');

    return this.measurementService.deleteAll(userId);
  }
}
