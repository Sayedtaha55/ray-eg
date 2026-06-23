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
    findUnique: jest.fn(),
    findMany: jest.fn(),
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

  describe('listByShop Performance (Zero-DB Cache Hit)', () => {
    it('should return pre-filtered products from cache without hitting database', async () => {
      const mockFilteredProducts = [
        { id: 'p1', name: 'Product 1', isActive: true },
      ];

      mockRedis.get.mockResolvedValue(mockFilteredProducts);

      const result = await service.listByShop('shop1');

      expect(result).toEqual(mockFilteredProducts);
      expect(mockRedis.get).toHaveBeenCalled();
      // Ensure NO database calls were made for hotspots (verified by lack of prisma calls)
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    });

    it('should parallelize DB calls on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'p1', name: 'Product 1', isActive: true },
        { id: 'p2', name: 'Visible Product', isActive: true },
      ]);
      // mock hotspot results
      mockPrisma.shopImageHotspot.findMany
        .mockResolvedValueOnce([{ productId: 'p1' }]) // linkedIds
        .mockResolvedValueOnce([{ label: 'Some Label' }]); // labelKeys

      const result = await service.listByShop('shop1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('p2');
      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
      expect(mockRedis.set).toHaveBeenCalledWith(expect.stringContaining('products:shop'), result, 600);
    });
  });
});
