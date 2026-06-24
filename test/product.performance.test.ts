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

describe('ProductService Performance (Zero-DB Cache Hit)', () => {
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
    it('should result in zero database calls on cache hit (including hotspot metadata)', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId: 's1', isActive: true },
        { id: 'p2', name: 'Product 2', shopId: 's1', isActive: true },
      ];

      // Setup cache hit
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop('s1');

      expect(result).toEqual(mockProducts);
      expect(mockRedis.get).toHaveBeenCalled();

      // THE CRITICAL CHECK: No database calls for products OR hotspots
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should filter hotspots before caching on cache miss', async () => {
      const dbProducts = [
        { id: 'p1', name: 'Visible Product', shopId: 's1', isActive: true },
        { id: 'p2', name: 'Hidden Product (Hotspot)', shopId: 's1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue(dbProducts);

      // Mock hotspots: p2 is linked to a hotspot
      mockPrisma.shopImageHotspot.findMany.mockImplementation((args) => {
        if (args.where.productId) {
           return Promise.resolve([{ productId: 'p2' }]);
        }
        return Promise.resolve([]); // No label hotspots
      });

      const result = await service.listByShop('s1');

      // Result should only contain p1
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Verify that the FILTERED list was cached
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        expect.arrayContaining([expect.objectContaining({ id: 'p1' })]),
        600
      );

      const cachedData = mockRedis.set.mock.calls[0][1];
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0].id).toBe('p1');
    });
  });

  describe('listAllActive Performance', () => {
    it('should result in zero database calls on cache hit', async () => {
      const mockProducts = [{ id: 'p1', name: 'Product 1', shopId: 's1', isActive: true }];
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listAllActive();

      expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });
  });
});
