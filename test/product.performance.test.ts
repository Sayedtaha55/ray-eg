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
  invalidatePattern: jest.fn(),
  invalidateShopCache: jest.fn(),
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

describe('ProductService Performance & Zero-DB Cache Hit', () => {
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

  describe('listByShop', () => {
    it('should return cached and filtered products without DB calls', async () => {
      const shopId = 'shop-123';
      const mockProducts = [
        { id: 'p1', name: 'Product 1', isActive: true },
        { id: 'p2', name: 'Product 2', isActive: true },
      ];

      // On cache hit, it should return the already filtered products
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();
      // ZERO DB calls for products or visibility on cache hit
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should fetch, filter and cache products on cache miss', async () => {
      const shopId = 'shop-123';
      const mockDbProducts = [
        { id: 'p1', name: 'Product 1', isActive: true },
        { id: 'p2', name: 'Product 2', isActive: true },
        { id: 'p3', name: 'Product 3', isActive: true },
      ];
      // p2 is linked to an image map
      const mockLinkedHotspots = [{ productId: 'p2' }];
      // "product 3" is a label on an active hotspot
      const mockLabelHotspots = [{ label: 'product 3' }];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockDbProducts);
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce(mockLinkedHotspots)
        .mockResolvedValueOnce(mockLabelHotspots);

      const result = await service.listByShop(shopId);

      // Only p1 should remain
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Should have cached the FILTERED list
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        expect.arrayContaining([{ id: 'p1', name: 'Product 1', isActive: true }]),
        600
      );
      // p2 and p3 should NOT be in cache
      const cachedData = mockRedis.set.mock.calls[0][1];
      expect(cachedData.find((p: any) => p.id === 'p2')).toBeUndefined();
      expect(cachedData.find((p: any) => p.id === 'p3')).toBeUndefined();
    });
  });

  describe('listAllActive', () => {
    it('should return cached results immediately', async () => {
      const mockProducts = [{ id: 'p1', name: 'P1' }];
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listAllActive();

      expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });
});
