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
  },
  shop: {
    findUnique: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
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
    it('should NOT make DB calls on cache hit', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' },
      ];

      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop('s1');

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();
      // Zero-DB cache hit verification
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should parallelize DB calls on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' },
      ]);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.listByShop('s1');

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      // We expect 2 calls to hotspot findMany (linkedIds and labelKeys)
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe('getById Performance', () => {
    it('should parallelize hotspot checks after product fetch', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.getById('p1');

      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      // Should call findMany twice (for linkedIds and labelKeys) via Promise.all
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
