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
    delete: jest.fn(),
    update: jest.fn(),
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
    it('should return cached products without any database calls (Zero-DB Cache Hit)', async () => {
      const mockProducts = [{ id: 'p1', name: 'Product 1' }];
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop('shop1');

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should parallelize queries on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'Product 1' }]);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listByShop('shop1');

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalled();
    });
  });

  describe('listAllActive Performance', () => {
    it('should return cached products without any database calls (Zero-DB Cache Hit)', async () => {
      const mockProducts = [{ id: 'p1', name: 'Product 1' }];
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listAllActive();

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });
});
