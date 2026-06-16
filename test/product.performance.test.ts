import { Test, TestingModule } from '@nestjs/testing';
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
  invalidateShopCache: jest.fn(),
  invalidatePattern: jest.fn(),
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
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

  describe('listByShop Performance', () => {
    it('should return cached products without extra DB queries (Zero-DB Cache Hit)', async () => {
      const shopId = 'shop-1';
      const mockProducts = [{ id: 'p1', name: 'Product 1' }];

      // Setup Redis cache hit
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();

      // VERIFY: optimized implementation makes ZERO extra DB queries on cache hit
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products BEFORE caching (Correctness & Zero-DB Cache Hit)', async () => {
      const shopId = 'shop-1';
      const mockProducts = [
        { id: 'p1', name: 'Product 1', category: 'normal' },
        { id: 'p2', name: 'Hidden Product', category: 'normal' },
      ];

      // Setup cache miss
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      // Mock hotspot queries
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p2' }]) // getLinkedImageMapProductIds
        .mockResolvedValueOnce([]); // getActiveImageMapHotspotLabelKeys

      const result = await service.listByShop(shopId);

      // Result should only have p1
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // VERIFY: Optimized implementation caches the FILTERED list
      const lastSetCall = mockRedis.set.mock.calls[0];
      const cachedData = lastSetCall[1];

      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].id).toBe('p1');
    });
  });
});
