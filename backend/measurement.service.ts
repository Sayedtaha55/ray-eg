import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
 
@Injectable()
export class MeasurementService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}
 
  private assertSmallJsonPayload(value: any, label: string) {
    if (typeof value === 'undefined') return;
    try {
      const s = JSON.stringify(value);
      if (s.length > 20_000) {
        throw new BadRequestException(`${label} كبير جداً`);
      }
    } catch {
      throw new BadRequestException(`${label} غير صالح`);
    }
  }
 
  private getPagination(paging?: { page?: number; limit?: number }) {
    const page = typeof paging?.page === 'number' ? paging.page : undefined;
    const limit = typeof paging?.limit === 'number' ? paging.limit : undefined;
    if (page == null && limit == null) return null;
 
    const safeLimitRaw = limit == null ? 20 : limit;
    const safeLimit = Math.min(Math.max(Math.floor(safeLimitRaw), 1), 100);
    const safePage = Math.max(Math.floor(page == null ? 1 : page), 1);
    const skip = (safePage - 1) * safeLimit;
 
    return { take: safeLimit, skip };
  }
 
  async create(userId: string, data: { label?: string; value: number; unit?: string; notes?: string }) {
    if (!data.value || typeof data.value !== 'number' || data.value <= 0) {
      throw new BadRequestException('القيمة مطلوبة ويجب أن تكون رقم أكبر من صفر');
    }
    const unit = data.unit || 'cm';
    if (!['cm', 'inch', 'mm'].includes(unit)) {
      throw new BadRequestException('الوحدة يجب أن تكون cm أو inch أو mm');
    }
 
    return this.prisma.userMeasurement.create({
      data: {
        userId,
        label: data.label || null,
        value: data.value,
        unit,
        notes: data.notes || null,
      },
    });
  }
 
  async listByUser(userId: string, paging?: { page?: number; limit?: number }) {
    const pagination = this.getPagination(paging);
    const [items, total] = await Promise.all([
      this.prisma.userMeasurement.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
        ...(pagination ?? {}),
      }),
      this.prisma.userMeasurement.count({ where: { userId, isActive: true } }),
    ]);
 
    return pagination
      ? { items, total, page: paging!.page ?? 1, limit: paging!.limit ?? 20 }
      : items;
  }
 
  async getOne(id: string, userId: string) {
    const m = await this.prisma.userMeasurement.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('القياس غير موجود');
    if (m.userId !== userId) throw new ForbiddenException('غير مصرح');
    return m;
  }
 
  async update(id: string, userId: string, data: { label?: string; value?: number; unit?: string; notes?: string; isActive?: boolean }) {
    await this.getOne(id, userId);
 
    if (data.value !== undefined && (typeof data.value !== 'number' || data.value <= 0)) {
      throw new BadRequestException('القيمة يجب أن تكون رقم أكبر من صفر');
    }
    if (data.unit !== undefined && !['cm', 'inch', 'mm'].includes(data.unit)) {
      throw new BadRequestException('الوحدة يجب أن تكون cm أو inch أو mm');
    }
 
    return this.prisma.userMeasurement.update({
      where: { id },
      data: {
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }
 
  async remove(id: string, userId: string) {
    await this.getOne(id, userId);
    return this.prisma.userMeasurement.update({
      where: { id },
      data: { isActive: false },
    });
  }
 
  async bulkCreate(userId: string, items: Array<{ label?: string; value: number; unit?: string; notes?: string }>) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('يجب إرسال مصفوفة من القياسات');
    }
    if (items.length > 50) {
      throw new BadRequestException('الحد الأقصى 50 قياس في المرة الواحدة');
    }
 
    const data = items.map((item) => ({
      userId,
      label: item.label || null,
      value: item.value,
      unit: item.unit || 'cm',
      notes: item.notes || null,
    }));
 
    const result = await this.prisma.userMeasurement.createMany({ data });
    return { created: result.count };
  }
 
  async bulkUpdate(userId: string, items: Array<{ id: string; label?: string; value?: number; unit?: string; notes?: string; isActive?: boolean }>) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('يجب إرسال مصفوفة من القياسات');
    }
    if (items.length > 50) {
      throw new BadRequestException('الحد الأقصى 50 قياس في المرة الواحدة');
    }
 
    const results = [];
    for (const item of items) {
      const existing = await this.prisma.userMeasurement.findUnique({ where: { id: item.id } });
      if (!existing || existing.userId !== userId) continue;
 
      const updated = await this.prisma.userMeasurement.update({
        where: { id: item.id },
        data: {
          ...(item.label !== undefined ? { label: item.label } : {}),
          ...(item.value !== undefined ? { value: item.value } : {}),
          ...(item.unit !== undefined ? { unit: item.unit } : {}),
          ...(item.notes !== undefined ? { notes: item.notes } : {}),
          ...(item.isActive !== undefined ? { isActive: item.isActive } : {}),
        },
      });
      results.push(updated);
    }
    return results;
  }
 
  async getSummary(userId: string) {
    const measurements = await this.prisma.userMeasurement.findMany({
      where: { userId, isActive: true },
      orderBy: { label: 'asc' },
    });
 
    const byLabel: Record<string, typeof measurements> = {};
    for (const m of measurements) {
      const key = m.label || 'unlabeled';
      if (!byLabel[key]) byLabel[key] = [];
      byLabel[key].push(m);
    }
 
    return { total: measurements.length, byLabel };
  }
 
  async deleteAll(userId: string) {
    const result = await this.prisma.userMeasurement.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    return { deactivated: result.count };
  }
}