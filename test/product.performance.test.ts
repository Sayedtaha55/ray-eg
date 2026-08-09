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
  shop: {
    findUnique: jest.fn(),
  }
};

describe('ProductService Performance Tests (Zero-DB Cache Hit)', () => {
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
      const mockProducts = [
        { id: 'p1', name: 'Product 1', shopId: 's1', isActive: true },
        { id: 'p2', name: 'Product 2', shopId: 's1', isActive: true },
      ];

      // Setup cache hit
      mockRedis.get.mockResolvedValue(mockProducts);

      const result = await service.listByShop('s1');

      expect(result).toEqual(mockProducts);

      // VERIFY: No database calls were made on cache hit
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should parallelize DB queries on cache miss and store filtered results', async () => {
      const shopId = 's1';
      const mockProducts = [
        { id: 'p1', name: 'Public Product', shopId, isActive: true, category: 'General' },
        { id: 'p2', name: 'Linked Product', shopId, isActive: true, category: 'General' },
        { id: 'p3', name: 'Label Product', shopId, isActive: true, category: 'General' },
      ];

      // Setup cache miss
      mockRedis.get.mockResolvedValue(null);

      // Setup DB returns
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      // Linked product hotspot
      mockPrisma.shopImageHotspot.findMany.mockImplementation((params: any) => {
        if (params.where?.productId?.not === null) {
          return Promise.resolve([{ productId: 'p2' }]);
        }
        if (params.where?.map?.isActive === true) {
          return Promise.resolve([{ label: 'Label Product' }]);
        }
        return Promise.resolve([]);
      });

      const result = await service.listByShop(shopId);

      // p2 is linked, p3 name matches label -> only p1 remains
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p1');

      // Verify Redis.set was called with the FILTERED result
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('products:shop'),
        expect.arrayContaining([{ id: 'p1', name: 'Public Product', shopId, isActive: true, category: 'General' }]),
        600
      );

      // Verify Redis.set did NOT contain filtered out products
      const cachedValue = mockRedis.set.mock.calls[0][1];
      expect(cachedValue).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'p2' })]));
      expect(cachedValue).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'p3' })]));
    });
  });

  describe('listAllActive Performance', () => {
    it('should return cached results without DB calls', async () => {
      mockRedis.get.mockResolvedValue([{ id: 'p1' }]);
      const result = await service.listAllActive();
      expect(result).toHaveLength(1);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getById Performance', () => {
    it('should return cached result without DB calls', async () => {
      const mockProduct = { id: 'p1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(mockProduct);
      const result = await service.getById('p1');
      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
    });
  });
});
