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
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
  productFurnitureMeta: {
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
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

  describe('listByShop Performance', () => {
    it('should return filtered products on cache miss', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', category: 'cat1' },
        { id: 'p2', name: 'Product 2', category: 'cat1' },
      ];
      const mockHotspots = [
        { productId: 'p1', label: 'Product 1' }
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      (mockPrisma as any).shopImageHotspot.findMany.mockResolvedValue(mockHotspots);

      const result = await service.listByShop('shop1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');
    });

    it('should NOT perform DB queries on cache hit (Zero-DB Cache Hit)', async () => {
      const mockCachedProducts = [
        { id: 'p2', name: 'Product 2', category: 'cat1' }
      ];
      mockRedis.get.mockResolvedValue(mockCachedProducts);

      const result = await service.listByShop('shop1');

      expect(result).toEqual(mockCachedProducts);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();

      // ASSERT: Currently this fails because current code calls these even on cache hits!
      expect((mockPrisma as any).shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });

  describe('listAllActive Performance', () => {
    it('should return filtered products on cache miss', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', category: 'cat1' },
        { id: 'p2', name: 'Product 2', category: 'cat1' },
      ];
      const mockHotspots = [
        { productId: 'p1' }
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      (mockPrisma as any).shopImageHotspot.findMany.mockResolvedValue(mockHotspots);

      const result = await service.listAllActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');
    });

    it('should NOT perform DB queries on cache hit (Zero-DB Cache Hit)', async () => {
      const mockCachedProducts = [
        { id: 'p2', name: 'Product 2', category: 'cat1' }
      ];
      mockRedis.get.mockResolvedValue(mockCachedProducts);

      const result = await service.listAllActive();

      expect(result).toEqual(mockCachedProducts);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect((mockPrisma as any).shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });
});
