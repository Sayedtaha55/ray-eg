import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductService } from '@modules/product/product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';

const mockPrisma: any = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  productFurnitureMeta: {
    create: jest.fn(),
  },
  $transaction: jest.fn((cb: any) => cb(mockPrisma)),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  invalidateProductCache: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should throw BadRequestException if id is empty', async () => {
      await expect(service.getById('')).rejects.toThrow(BadRequestException);
    });

    it('should return product if found', async () => {
      const mockProduct = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        shopId: 'shop-1',
        isActive: true,
        category: 'general',
      };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getById('prod-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
        }),
      );
    });
  });

  describe('listByShop', () => {
    it('should throw BadRequestException if shopId is empty', async () => {
      await expect(service.listByShop('')).rejects.toThrow(BadRequestException);
    });

    it('should return products for a shop', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', price: 50 },
        { id: 'prod-2', name: 'Product 2', price: 100 },
      ];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.listByShop('shop-1', { page: 1, limit: 10 });

      expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if shop does not exist', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          shopId: 'nonexistent',
          name: 'Test Product',
          price: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create product with default trackStock for non-restaurant', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: 'shop-1',
        slug: 'shop-1',
        category: 'RETAIL',
      });
      const mockCreated = {
        id: 'prod-1',
        name: 'Test Product',
        price: 100,
        stock: 0,
        trackStock: true,
      };
      mockPrisma.product.create.mockResolvedValue(mockCreated);
      mockPrisma.product.findUnique.mockResolvedValue(mockCreated);

      await service.create({
        shopId: 'shop-1',
        name: 'Test Product',
        price: 100,
      });

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          shopId: 'shop-1',
          name: 'Test Product',
          price: 100,
          trackStock: true,
        }),
      });
    });

    it('should set trackStock to false for restaurant category', async () => {
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: 'shop-1',
        slug: 'shop-1',
        category: 'RESTAURANT',
      });
      mockPrisma.product.create.mockResolvedValue({
        id: 'prod-1',
        name: 'Dish',
        price: 50,
        trackStock: false,
      });
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        name: 'Dish',
        price: 50,
        trackStock: false,
      });

      await service.create({
        shopId: 'shop-1',
        name: 'Dish',
        price: 50,
      });

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackStock: false,
        }),
      });
    });
  });

  describe('updateStock', () => {
    it('should throw BadRequestException if productId is empty', async () => {
      await expect(service.updateStock('', 10, { role: 'MERCHANT' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if stock is negative', async () => {
      await expect(service.updateStock('prod-1', -5, { role: 'MERCHANT' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if stock is NaN', async () => {
      await expect(service.updateStock('prod-1', NaN, { role: 'MERCHANT' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should throw BadRequestException if productId is empty', async () => {
      await expect(service.delete('', { role: 'MERCHANT' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update product name', async () => {
      const mockExisting = {
        id: 'prod-1',
        name: 'Old Name',
        price: 100,
        shopId: 'shop-1',
      };
      const mockUpdated = { ...mockExisting, name: 'New Name' };
      // First call: check existing; Second call: return updated inside transaction
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(mockUpdated);
      mockPrisma.product.update.mockResolvedValue(mockUpdated);

      const result = await service.update('prod-1', { name: 'New Name' }, { role: 'MERCHANT', shopId: 'shop-1' });

      expect(result.name).toBe('New Name');
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: expect.objectContaining({ name: 'New Name' }),
      });
    });
  });
});
