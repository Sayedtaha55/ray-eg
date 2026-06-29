import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@modules/product/product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductService Performance & Correctness Tests (Optimized)', () => {
  let service: ProductService;
  let prisma: any;
  let redis: any;

  const mockPrisma = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    shopImageHotspot: {
      findMany: jest.fn(),
    },
    shop: {
      findUnique: jest.fn(),
    },
  };

  const mockRedis = {
    getProduct: jest.fn(),
    cacheProduct: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    invalidateProductCache: jest.fn(),
    invalidatePattern: jest.fn(),
    invalidateShopCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should parallelize hotspot lookups', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1', category: 'cat1' };
      redis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]); // Parallel calls

      const result = await service.getById('p1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      // Should be parallelized
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFound if product is linked to a hotspot (linkedId)', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1', category: 'cat1' };
      redis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Parallel calls: linkedIds and labelKeys
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p1' }]) // linkedIds
        .mockResolvedValueOnce([]); // labelKeys

      await expect(service.getById('p1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listByShop', () => {
    it('should store FILTERED products in cache (Zero-DB Pattern)', async () => {
      const shopId = 's1';
      const mockProducts = [
        { id: 'p1', name: 'Visible', shopId },
        { id: 'p2', name: 'HiddenByHotspot', shopId },
      ];

      redis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p2' }]) // linkedIds
        .mockResolvedValueOnce([]); // labelKeys

      const result = await service.listByShop(shopId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Optimized: sets the cache with ALREADY FILTERED products
      expect(redis.set).toHaveBeenCalledWith(expect.any(String), [{ id: 'p1', name: 'Visible', shopId }], 600);
    });

    it('should return filtered products from cache hit IMMEDIATELY (Zero-DB Pattern)', async () => {
      const shopId = 's1';
      const filteredProducts = [
        { id: 'p1', name: 'Visible', shopId },
      ];

      redis.get.mockResolvedValue(filteredProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(filteredProducts);
      // Zero DB lookup!
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });

  describe('listAllActive', () => {
    it('should store filtered products in cache and return them on hit (Zero-DB Pattern)', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Visible' },
        { id: 'p2', name: 'HiddenByHotspot' },
      ];

      redis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([{ productId: 'p2' }]); // linkedIds

      const result = await service.listAllActive();

      expect(result).toHaveLength(1);
      expect(redis.set).toHaveBeenCalledWith(expect.any(String), [{ id: 'p1', name: 'Visible' }], 60);

      // Reset mocks before hit test
      mockPrisma.product.findMany.mockClear();
      mockPrisma.shopImageHotspot.findMany.mockClear();

      // Test cache hit
      redis.get.mockResolvedValue([{ id: 'p1', name: 'Visible' }]);
      const hitResult = await service.listAllActive();
      expect(hitResult).toHaveLength(1);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });
  });
});
