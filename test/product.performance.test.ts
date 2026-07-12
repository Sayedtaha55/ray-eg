import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '@modules/product/product.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';

describe('ProductService Performance Optimizations', () => {
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
  };

  const mockRedis = {
    getProduct: jest.fn(),
    cacheProduct: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
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

  describe('Zero-DB Cache Hit (listByShop)', () => {
    it('should return cached products without calling database', async () => {
      const shopId = 'shop-1';
      const cacheKey = 'products:shop:{"shopId":"shop-1"}';
      const cachedProducts = [{ id: 'p1', name: 'Product 1' }];

      mockRedis.get.mockResolvedValue(cachedProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(cachedProducts);
      expect(mockRedis.get).toHaveBeenCalledWith(cacheKey);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter products before caching on cache miss', async () => {
      const shopId = 'shop-1';
      const products = [
        { id: 'p1', name: 'Visible Product' },
        { id: 'p2', name: 'Hidden Product (Hotspot)' },
      ];
      const hotspots = [{ productId: 'p2' }];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(products);
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce(hotspots) // For getLinkedImageMapProductIds
        .mockResolvedValueOnce([]); // For getActiveImageMapHotspotLabelKeys

      const result = await service.listByShop(shopId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Verify filtering happened BEFORE caching
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([expect.objectContaining({ id: 'p1' })]),
        expect.any(Number)
      );

      // The cached value should NOT contain p2
      const cachedValue = mockRedis.set.mock.calls[0][1];
      expect(cachedValue.find((p: any) => p.id === 'p2')).toBeUndefined();
    });
  });

  describe('Parallelization', () => {
    it('should parallelize queries in listByShop', async () => {
      mockRedis.get.mockResolvedValue(null);

      // We'll use a delay to ensure they are called roughly at the same time
      mockPrisma.product.findMany.mockImplementation(() => new Promise(res => setTimeout(() => res([]), 10)));
      mockPrisma.shopImageHotspot.findMany.mockImplementation(() => new Promise(res => setTimeout(() => res([]), 10)));

      await service.listByShop('shop-1');

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });

    it('should parallelize visibility checks in getById', async () => {
      const productId = 'p1';
      const product = { id: 'p1', shopId: 'shop-1', isActive: true, category: 'GENERAL' };

      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.getById(productId);

      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
