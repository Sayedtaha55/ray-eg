import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@modules/product/product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  invalidateProductCache: jest.fn(),
  invalidateShopCache: jest.fn(),
  invalidatePattern: jest.fn(),
};

describe('ProductService Performance', () => {
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
    (mockPrisma as any).shopImageHotspot = { findMany: jest.fn() };
  });

  describe('listByShop Performance (Zero-DB Cache Hit)', () => {
    it('should return filtered products from cache with ZERO database queries', async () => {
      const shopId = 'shop-123';
      const cacheKey = 'products:shop:{"shopId":"shop-123"}';
      const cachedProducts = [
        { id: 'p1', name: 'Product 1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(cachedProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(cachedProducts);
      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);

      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products BEFORE caching on cache miss', async () => {
      const shopId = 'shop-123';
      const cacheKey = 'products:shop:{"shopId":"shop-123"}';

      const dbProducts = [
        { id: 'p1', name: 'Visible Product', isActive: true },
        { id: 'p2', name: 'Hidden Product', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(dbProducts);
      // Mock hotspots to hide p2
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args: any) => {
        if (args.select.productId) {
           return Promise.resolve([{ productId: 'p2' }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.listByShop(shopId);

      // We expect only p1 to be returned
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // CRITICAL: We expect the FILTERED result to be cached
      // Currently, it caches 'deduped' which is UNFILTERED.
      // So this expectation should FAIL on current code.
      expect(mockRedis.set).toHaveBeenCalledWith(cacheKey, expect.arrayContaining([expect.objectContaining({ id: 'p1' })]), 600);
      expect(mockRedis.set).not.toHaveBeenCalledWith(cacheKey, expect.arrayContaining([expect.objectContaining({ id: 'p2' })]), 600);
    });
  });

  describe('listAllActive Performance (Zero-DB Cache Hit)', () => {
    it('should return filtered products from cache with ZERO database queries', async () => {
      const cacheKey = 'products:all:{}';
      const cachedProducts = [
        { id: 'p1', name: 'Product 1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(cachedProducts);

      const result = await service.listAllActive();

      expect(result).toEqual(cachedProducts);
      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);

      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products BEFORE caching on cache miss', async () => {
      const cacheKey = 'products:all:{}';
      const dbProducts = [
        { id: 'p1', name: 'Visible', isActive: true },
        { id: 'p2', name: 'Hidden', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(dbProducts);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([{ productId: 'p2' }]);

      const result = await service.listAllActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Should cache filtered result
      expect(mockRedis.set).toHaveBeenCalledWith(cacheKey, expect.arrayContaining([expect.objectContaining({ id: 'p1' })]), 60);
      expect(mockRedis.set).not.toHaveBeenCalledWith(cacheKey, expect.arrayContaining([expect.objectContaining({ id: 'p2' })]), 60);
    });
  });
});
