import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  private get shiftModel() {
    return (this.prisma as any).cashierShift;
  }

  async openShift(input: { shopId: string; userId: string; openingAmount?: number }) {
    const shopId = String(input?.shopId || '').trim();
    const userId = String(input?.userId || '').trim();
    if (!shopId) throw new BadRequestException('shopId مطلوب');
    if (!userId) throw new BadRequestException('userId مطلوب');

    const existing = await this.shiftModel.findFirst({
      where: { shopId, userId, status: 'OPEN' },
    });
    if (existing) throw new BadRequestException('يوجد وردية مفتوحة بالفعل');

    return this.shiftModel.create({
      data: {
        shopId,
        userId,
        status: 'OPEN',
        openingAmount: Number(input?.openingAmount || 0),
        totalSales: 0,
        ordersCount: 0,
      },
    });
  }

  async closeShift(input: {
    shiftId: string;
    closingAmount?: number;
    note?: string;
  }) {
    const shiftId = String(input?.shiftId || '').trim();
    if (!shiftId) throw new BadRequestException('shiftId مطلوب');

    const shift = await this.shiftModel.findUnique({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException('الوردية غير موجودة');
    if (shift.status !== 'OPEN') throw new BadRequestException('هذه الوردية مغلقة بالفعل');

    const closingAmount = Number(input?.closingAmount || 0);
    const expectedAmount = shift.openingAmount + shift.totalSales;
    const difference = closingAmount - expectedAmount;

    return this.shiftModel.update({
      where: { id: shiftId },
      data: {
        status: 'CLOSED',
        closingAmount,
        expectedAmount,
        difference,
        note: input?.note || null,
        closedAt: new Date(),
      },
    });
  }

  async getMyActiveShift(shopId: string, userId: string) {
    return this.shiftModel.findFirst({
      where: { shopId, userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    });
  }

  async getShiftById(id: string) {
    const shift = await this.shiftModel.findUnique({ where: { id } });
    if (!shift) throw new NotFoundException('الوردية غير موجودة');
    return shift;
  }

  async listShifts(input: {
    shopId?: string;
    userId?: string;
    status?: string;
    from?: string;
    to?: string;
    take?: number;
  }) {
    const where: any = {};
    if (input?.shopId) where.shopId = String(input.shopId).trim();
    if (input?.userId) where.userId = String(input.userId).trim();
    if (input?.status) where.status = String(input.status).trim().toUpperCase();

    if (input?.from || input?.to) {
      where.openedAt = {};
      if (input.from) where.openedAt.gte = new Date(input.from);
      if (input.to) where.openedAt.lte = new Date(input.to);
    }

    const take = Math.min(100, Math.max(1, Number(input?.take || 50)));
    return this.shiftModel.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take,
    });
  }

  async updateShiftSales(shiftId: string, orderTotal: number) {
    const shift = await this.shiftModel.findUnique({ where: { id: shiftId } });
    if (!shift || shift.status !== 'OPEN') return null;

    return this.shiftModel.update({
      where: { id: shiftId },
      data: {
        totalSales: shift.totalSales + Number(orderTotal || 0),
        ordersCount: shift.ordersCount + 1,
      },
    });
  }

  async getShiftSummary(shopId: string, from?: string, to?: string) {
    const where: any = { shopId };
    if (from || to) {
      where.openedAt = {};
      if (from) where.openedAt.gte = new Date(from);
      if (to) where.openedAt.lte = new Date(to);
    }

    const shifts = await this.shiftModel.findMany({
      where,
      orderBy: { openedAt: 'desc' },
    });

    const totalSales = shifts.reduce((sum: number, s: any) => sum + Number(s.totalSales || 0), 0);
    const totalOrders = shifts.reduce((sum: number, s: any) => sum + Number(s.ordersCount || 0), 0);
    const openCount = shifts.filter((s: any) => s.status === 'OPEN').length;
    const closedCount = shifts.filter((s: any) => s.status === 'CLOSED').length;

    return {
      totalShifts: shifts.length,
      openCount,
      closedCount,
      totalSales,
      totalOrders,
      shifts,
    };
  }
}
