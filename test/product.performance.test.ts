import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RedisService } from '@common/redis/redis.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductService } from '@modules/product/product.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  invalidateProductCache: jest.fn(),
  invalidatePattern: jest.fn(),
  invalidateShopCache: jest.fn(),
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  }
};

describe('ProductService Performance Tests', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: RedisService, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('listByShop Performance and Correctness', () => {
    it('should return pre-filtered products from cache (Zero-DB path)', async () => {
      const shopId = 'shop-1';
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId },
      ];

      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop(shopId);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');
      // Verify no DB queries were made for hotspots
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products on cache miss and cache PRE-FILTERED result', async () => {
      const shopId = 'shop-1';
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId },
        { id: 'p2', name: 'Product 2', shopId },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      // p2 is linked to a hotspot
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args) => {
        if (args.select?.productId) return Promise.resolve([{ productId: 'p2' }]);
        return Promise.resolve([]);
      });

      const result = await service.listByShop(shopId);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');

      // Verify that ONLY filtered products were cached
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        [{ id: 'p1', name: 'Product 1', shopId }],
        600
      );
    });
  });

  describe('listAllActive Performance and Correctness', () => {
    it('should return pre-filtered products from cache (Zero-DB path)', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1' },
      ];

      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listAllActive();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products on cache miss and cache PRE-FILTERED result', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1' },
        { id: 'p2', name: 'Product 2' },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      // p2 is linked to a hotspot globally
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args) => {
        if (args.select?.productId) return Promise.resolve([{ productId: 'p2' }]);
        return Promise.resolve([]);
      });

      const result = await service.listAllActive();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('p1');

      // Verify that ONLY filtered products were cached
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:all'),
        [{ id: 'p1', name: 'Product 1' }],
        60
      );
    });
  });

  describe('getById Performance and Correctness', () => {
    it('should parallelize hotspot queries and catch pre-filtered result', async () => {
      const id = 'p1';
      const mockProduct = { id: 'p1', name: 'Product 1', shopId: 'shop-1', isActive: true };

      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      const result = await service.getById(id);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
      expect(mockRedis.cacheProduct).toHaveBeenCalled();
    });

    it('should not cache if product is linked to a hotspot', async () => {
      const id = 'p1';
      const mockProduct = { id: 'p1', name: 'Product 1', shopId: 'shop-1', isActive: true };

      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Linked to hotspot
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args) => {
        if (args.select?.productId) return Promise.resolve([{ productId: 'p1' }]);
        return Promise.resolve([]);
      });

      await expect(service.getById(id)).rejects.toThrow(NotFoundException);
      expect(mockRedis.cacheProduct).not.toHaveBeenCalled();
    });
  });
});
