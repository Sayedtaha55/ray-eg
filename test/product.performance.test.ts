import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@common/redis/redis.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductService } from '@modules/product/product.service';
import { NotFoundException } from '@nestjs/common';

const mockRedis = {
  getProduct: jest.fn(),
  cacheProduct: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
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

describe('ProductService Performance & Visibility Tests', () => {
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

  describe('getById', () => {
    it('should return cached product quickly if it exists in cache', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(mockProduct);

      const result = await service.getById('p1');
      expect(result).toEqual(mockProduct);
      expect(mockRedis.getProduct).toHaveBeenCalledWith('p1');
      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
    });

    it('should query the database, parallelize visibility metadata lookups on cache miss, and cache the finalized validated product', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // Image map hotspots
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]); // No hotspot matches

      const result = await service.getById('p1');
      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'p1' },
        select: expect.any(Object),
      });
      // Verify parallel database queries for visibility logic are triggered
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
      expect(mockRedis.cacheProduct).toHaveBeenCalledWith('p1', mockProduct, 300);
    });

    it('should fail-closed and throw NotFoundException if linked map ID lookup fails with an error', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.shopImageHotspot.findMany.mockRejectedValue(new Error('Database connectivity issue'));

      await expect(service.getById('p1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if product is linked to an image map', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      // First findMany call for getLinkedImageMapProductIds, returning matching linked id
      mockPrisma.shopImageHotspot.findMany.mockImplementation((params: any) => {
        if (params.where?.productId) {
          return Promise.resolve([{ productId: 'p1' }]);
        }
        return Promise.resolve([]);
      });

      await expect(service.getById('p1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listByShop', () => {
    it('should return already-filtered products from cache (Zero-DB Cache Hit)', async () => {
      const mockCached = [{ id: 'p1', name: 'Product 1' }];
      mockRedis.get.mockResolvedValue(mockCached);

      const result = await service.listByShop('s1');
      expect(result).toEqual(mockCached);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should perform parallelized retrieval of products and visibility metadata on cache miss, filter before caching', async () => {
      const mockDbProducts = [
        { id: 'p1', name: 'Product 1', category: 'General' },
        { id: 'p2', name: 'Product 2', category: 'General' },
        { id: 'p3', name: 'Product 3', category: 'General' },
      ];
      mockRedis.get.mockResolvedValue(null);

      // Mock findMany for products
      mockPrisma.product.findMany.mockResolvedValue(mockDbProducts);

      // Mock shopImageHotspot.findMany to return:
      // - p2 is linked by productId
      // - Product 3 has active hotspot label matching its name key
      mockPrisma.shopImageHotspot.findMany.mockImplementation((params: any) => {
        if (params.where?.productId) {
          return Promise.resolve([{ productId: 'p2' }]);
        }
        return Promise.resolve([{ label: 'Product 3' }]);
      });

      const result = await service.listByShop('s1');
      // Only Product 1 should survive the filter
      expect(result).toEqual([{ id: 'p1', name: 'Product 1', category: 'General' }]);
      expect(mockRedis.set).toHaveBeenCalledWith(expect.any(String), [{ id: 'p1', name: 'Product 1', category: 'General' }], 600);
    });
  });

  describe('listAllActive', () => {
    it('should fetch active list from cache directly if present', async () => {
      const mockCached = [{ id: 'p1', name: 'Product 1' }];
      mockRedis.get.mockResolvedValue(mockCached);

      const result = await service.listAllActive();
      expect(result).toEqual(mockCached);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should perform parallelized retrieval and filter linked ids before caching on miss', async () => {
      const mockDbProducts = [
        { id: 'p1', name: 'Product 1' },
        { id: 'p2', name: 'Product 2' },
      ];
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(mockDbProducts);
      mockPrisma.shopImageHotspot.findMany.mockResolvedValue([{ productId: 'p2' }]);

      const result = await service.listAllActive();
      expect(result).toEqual([{ id: 'p1', name: 'Product 1' }]);
      expect(mockRedis.set).toHaveBeenCalledWith(expect.any(String), [{ id: 'p1', name: 'Product 1' }], 60);
    });
  });
});
