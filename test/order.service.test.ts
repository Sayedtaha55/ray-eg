import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderService } from '@modules/order/order.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import { CourierDispatchService } from '@modules/courier/courier-dispatch.service';
import { NotificationService } from '@modules/notification/notification.service';

const mockPrisma: any = {
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

const mockRedis = {
  cacheOrder: jest.fn(),
  getShopOrders: jest.fn(),
  cacheShopOrders: jest.fn(),
  invalidateOrderCache: jest.fn(),
  invalidateShopOrdersCache: jest.fn(),
};

const mockCourierDispatch = {
  dispatch: jest.fn(),
  assignCourier: jest.fn(),
};

const mockNotificationService = {
  notifyShop: jest.fn(),
  notifyUser: jest.fn(),
  createNotification: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: CourierDispatchService, useValue: mockCourierDispatch },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should throw BadRequestException if id is empty', async () => {
      await expect(service.getById('')).rejects.toThrow(BadRequestException);
    });

    it('should return order if found', async () => {
      const mockOrder = {
        id: 'order-1',
        shopId: 'shop-1',
        status: 'PENDING',
        items: [],
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getById('order-1');

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-1' },
        }),
      );
    });
  });

  describe('listByShop', () => {
    it('should return orders for a shop from database', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'PENDING' },
        { id: 'order-2', status: 'CONFIRMED' },
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.listByShop('shop-1', { role: 'MERCHANT', shopId: 'shop-1' });

      expect(result).toEqual(mockOrders);
      expect(mockPrisma.order.findMany).toHaveBeenCalled();
    });

    it('should fetch from database', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await service.listByShop('shop-1', { role: 'MERCHANT', shopId: 'shop-1' });

      expect(result).toEqual([]);
      expect(mockPrisma.order.findMany).toHaveBeenCalled();
    });
  });

  describe('listAllAdmin', () => {
    it('should return all orders for admin', async () => {
      const mockOrders = [
        { id: 'order-1', shopId: 'shop-1' },
        { id: 'order-2', shopId: 'shop-2' },
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.listAllAdmin({}, { page: 1, limit: 10 });

      expect(result).toEqual(mockOrders);
    });

    it('should filter by shopId when provided', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);

      await service.listAllAdmin({ shopId: 'shop-1' }, { page: 1, limit: 10 });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            shopId: 'shop-1',
          }),
        }),
      );
    });
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if shopId is missing', async () => {
      await expect(
        service.createOrder({ shopId: '', userId: 'user-1', items: [] }, { role: 'CUSTOMER' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.createOrder({ shopId: 'shop-1', userId: '', items: [] }, { role: 'CUSTOMER' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if merchant tries to create order for different shop', async () => {
      await expect(
        service.createOrder(
          { shopId: 'shop-1', userId: 'user-1', items: [{ productId: 'p1', quantity: 1 }] },
          { role: 'MERCHANT', shopId: 'shop-2' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if items array is empty', async () => {
      await expect(
        service.createOrder({ shopId: 'shop-1', userId: 'user-1', items: [] }, { role: 'CUSTOMER' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if customer phone is missing for non-POS orders', async () => {
      await expect(
        service.createOrder(
          { shopId: 'shop-1', userId: 'user-1', items: [{ productId: 'p1', quantity: 1 }] },
          { role: 'CUSTOMER' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listReturnsForOrder', () => {
    it('should throw BadRequestException if orderId is empty', async () => {
      await expect(
        service.listReturnsForOrder('', { role: 'ADMIN' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if role is not admin or merchant', async () => {
      await expect(
        service.listReturnsForOrder('order-1', { role: 'CUSTOMER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if merchant tries to access another shop order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order-1', shopId: 'shop-1' });

      await expect(
        service.listReturnsForOrder('order-1', { role: 'MERCHANT', shopId: 'shop-2' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
