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

  describe('listByShop Performance and Correctness', () => {
    it('should return filtered products on cache hit (Zero-DB pattern)', async () => {
      const shopId = 'shop-1';
      // Cache already contains filtered products
      const mockFilteredProducts = [
        { id: 'p2', name: 'Product 2', isActive: true, shopId },
      ];

      mockRedis.get.mockResolvedValue(mockFilteredProducts);

      const result = await service.listByShop(shopId);

      expect(result).toEqual(mockFilteredProducts);
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should fetch and filter products on cache miss, then cache filtered results', async () => {
      const shopId = 'shop-1';
      const mockProducts = [
        { id: 'p1', name: 'Product 1', isActive: true, shopId },
        { id: 'p2', name: 'Product 2', isActive: true, shopId },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      // Mock p1 as linked to a hotspot
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p1' }]) // getLinkedImageMapProductIds
        .mockResolvedValueOnce([]); // getActiveImageMapHotspotLabelKeys

      const result = await service.listByShop(shopId);

      const expectedFiltered = [{ id: 'p2', name: 'Product 2', isActive: true, shopId }];

      // p1 should be filtered out
      expect(result).toEqual(expectedFiltered);
      // Verify it cached the FILTERED products
      expect(mockRedis.set).toHaveBeenCalledWith(expect.stringContaining('products:shop'), expectedFiltered, 600);
    });
  });

  describe('getById Performance', () => {
    it('should fetch from cache if available', async () => {
      const productId = 'p1';
      const mockProduct = { id: productId, name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(mockProduct);

      const result = await service.getById(productId);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
    });

    it('should perform parallel visibility checks on cache miss', async () => {
      const productId = 'p1';
      const mockProduct = { id: productId, name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // We can't easily verify parallel execution with Jest mocks alone without custom implementation,
      // but we can verify that the necessary queries were made.
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

      await service.getById(productId);

      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
