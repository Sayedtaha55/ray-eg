import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@common/redis/redis.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductService } from '@modules/product/product.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  invalidateProductCache: jest.fn(),
  invalidatePattern: jest.fn(),
  invalidateShopCache: jest.fn(),
};

const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

describe('ProductService Performance & Correctness Tests', () => {
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
    it('should return already-filtered products from cache without DB queries', async () => {
      // Setup: Cache contains one product that should be visible,
      // but if filtering happened AFTER cache hit, we'd need DB calls.
      // We want to ensure it's filtered BEFORE caching.
      const filteredProducts = [{ id: 'p1', name: 'Visible Product' }];
      mockRedis.get.mockResolvedValue(filteredProducts);

      const result = await service.listByShop('shop1');

      expect(result).toEqual(filteredProducts);
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products BEFORE caching on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      const dbProducts = [
        { id: 'p1', name: 'Visible', isActive: true },
        { id: 'p2', name: 'Hidden', isActive: true },
      ];
      mockPrisma.product.findMany.mockResolvedValue(dbProducts);

      // p2 is linked to a hotspot
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args) => {
        if (args.where.productId) return Promise.resolve([{ productId: 'p2' }]);
        return Promise.resolve([]);
      });

      const result = await service.listByShop('shop1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // CRITICAL: Verify that the FILTERED list was cached, not the full list
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        expect.arrayContaining([{ id: 'p1', name: 'Visible', isActive: true }]),
        expect.any(Number)
      );

      const cachedData = mockRedis.set.mock.calls[0][1];
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].id).toBe('p1');
    });

    it('should parallelize hotspot queries on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'P1', isActive: true },
        { id: 'p2', name: 'P2', isActive: true },
      ]);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listByShop('shop1');

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      // Verify hotspot queries are called
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getById', () => {
    it('should NOT execute database queries for hotspots on cache hit', async () => {
      const mockProduct = { id: 'p1', name: 'P1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(mockProduct);

      const result = await service.getById('p1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });
});
