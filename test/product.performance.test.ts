import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../backend/src/modules/product/product.service';
import { PrismaService } from '../backend/src/common/prisma/prisma.service';
import { RedisService } from '../backend/src/common/redis/redis.service';

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
    }
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

  describe('listByShop Performance', () => {
    it('should NOT perform DB queries for filtering on cache hit (OPTIMIZED)', async () => {
      const shopId = 'shop-1';
      const cachedProducts = [{ id: 'p1', name: 'Product 1' }];
      mockRedis.get.mockResolvedValue(cachedProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(cachedProducts);
      expect(mockRedis.get).toHaveBeenCalled();

      // VERIFY OPTIMIZATION: NO extra DB queries on cache hit
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should perform DB queries in parallel on cache miss', async () => {
      const shopId = 'shop-1';
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'Product 1' }]);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listByShop(shopId);

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('getById Performance', () => {
    it('should perform visibility check DB queries on cache miss', async () => {
      const productId = 'p1';
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' });
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.getById(productId);

      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
