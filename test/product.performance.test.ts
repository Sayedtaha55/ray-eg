import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@modules/product/product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';

describe('ProductService Performance', () => {
  let service: ProductService;
  let prisma: PrismaService;
  let redis: RedisService;

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
    it('should perform hotspot checks in parallel', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', shopId: 's1', isActive: true };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.getById('p1');

      expect(mockPrisma.product.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('listByShop', () => {
    it('should filter hotspot-linked products BEFORE caching', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId: 's1', isActive: true },
        { id: 'p2', name: 'Product 2', shopId: 's1', isActive: true },
      ];
      const mockHotspots = [{ productId: 'p1' }];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce(mockHotspots) // linkedIds
        .mockResolvedValueOnce([]); // labelKeys

      const result = await service.listByShop('s1');

      // p1 should be filtered out
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');

      // VERIFY FIX: Check that the FILTERED list was cached
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        result, // <--- This is the FILTERED list!
        600
      );
    });

    it('should handle cache hits with pre-filtered data', async () => {
      const mockFilteredProducts = [
        { id: 'p2', name: 'Product 2', shopId: 's1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(mockFilteredProducts);

      const result = await service.listByShop('s1');

      expect(result).toEqual(mockFilteredProducts);
      // Zero-DB Cache Hit pattern: no DB calls on cache hit
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });

  describe('listAllActive', () => {
    it('should NOT perform global hotspot label scans (corrected behavior)', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId: 's1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listAllActive();

      // Should call getLinkedImageMapProductIds (global is ok for IDs as it filters by specific IDs)
      // but should NOT call getActiveImageMapHotspotLabelKeys without shopId
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
