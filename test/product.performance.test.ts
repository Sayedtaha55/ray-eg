import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@common/redis/redis.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductService } from '@modules/product/product.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
};

describe('ProductService Performance & Zero-DB Cache', () => {
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

  describe('listByShop Zero-DB Cache Pattern', () => {
    it('should filter products BEFORE caching (Zero-DB pattern)', async () => {
      const shopId = 'shop-1';
      const rawProducts = [
        { id: 'p1', name: 'Product 1', category: 'cat1' },
        { id: 'p2', name: 'Product 2', category: 'cat2' },
      ];

      mockRedis.get.mockResolvedValue(null);
      // Prisma sequence for listByShop:
      // 1. Prisma findMany (products)
      // 2. getLinkedImageMapProductIds calls shopImageHotspot.findMany
      // 3. getActiveImageMapHotspotLabelKeys calls shopImageHotspot.findMany
      mockPrisma.product.findMany.mockResolvedValue(rawProducts);
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p2' }]) // for linkedIds
        .mockResolvedValueOnce([]); // for labelKeys

      const result = await service.listByShop(shopId);

      // Should only contain p1
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // The key verification: what was saved to Redis?
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        expect.arrayContaining([expect.objectContaining({ id: 'p1' })]),
        600
      );

      const cachedData = mockRedis.set.mock.calls[0][1];
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].id).toBe('p1'); // p2 should NOT be in cache
    });

    it('should return cached results directly without DB calls', async () => {
      const shopId = 'shop-1';
      const cachedProducts = [{ id: 'p1', name: 'Product 1' }];

      mockRedis.get.mockResolvedValue(cachedProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(cachedProducts);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getById Parallelization', () => {
    it('should fetch product and then visibility metadata', async () => {
      const productId = 'p1';
      const product = { id: 'p1', name: 'Product 1', isActive: true, shopId: 'shop-1' };

      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]); // linkedIds and labelKeys

      await service.getById(productId);

      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
    });
  });
});
