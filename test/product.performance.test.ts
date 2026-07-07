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
  invalidateShopCache: jest.fn(),
  invalidatePattern: jest.fn(),
};

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

describe('ProductService Performance & Correctness', () => {
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
    it('should filter out image-map linked products BEFORE caching (Zero-DB Cache Hit)', async () => {
      const shopId = 'shop-123';
      const products = [
        { id: 'p1', name: 'Visible Product', category: 'General' },
        { id: 'p2', name: 'Linked to Map', category: 'General' },
        { id: 'p3', name: 'Hotspot Label Match', category: 'General' },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(products);

      // p2 is linked to an image map
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args: any) => {
        if (args.where.productId) {
          return Promise.resolve([{ productId: 'p2' }]);
        }
        if (args.where.map) {
          return Promise.resolve([{ label: 'hotspot label match' }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.listByShop(shopId);

      // Current behavior (unoptimized):
      // 1. Fetches products.
      // 2. Caches products (unfiltered!).
      // 3. Fetches visibility data.
      // 4. Returns filtered list.

      // Expected optimized behavior:
      // 1. Fetches products and visibility data in parallel.
      // 2. Filters products.
      // 3. Caches ONLY filtered products.
      // 4. Returns filtered list.

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // VERIFY CURRENT BUG: check what was cached
      const cacheCall = mockRedis.set.mock.calls.find(call => call[0].startsWith('products:shop'));
      expect(cacheCall).toBeDefined();

      // In the current buggy version, it caches ALL 3 products
      // We want it to cache only 1.
      const cachedValue = cacheCall[1];

      // Expectation: Caching happens AFTER filtering.
      // Current behavior will have 3 here, failing the test.
      expect(cachedValue).toHaveLength(1);
      expect(cachedValue[0].id).toBe('p1');
    });
  });

  describe('Parallelization', () => {
    it('should call Prisma and visibility checks concurrently in listByShop', async () => {
      // This is hard to test with just mocks without checking timing or call order
      // but we can at least ensure they are all called.
      const shopId = 'shop-123';
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listByShop(shopId);

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
