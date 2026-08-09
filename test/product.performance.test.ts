import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '@common/redis/redis.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ProductService } from '@modules/product/product.service';

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
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateMany: jest.fn(),
  },
  shopImageHotspot: {
    findMany: jest.fn(),
  },
  shop: {
    findUnique: jest.fn(),
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

  describe('getById Performance', () => {
    it('should return cached product quickly', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(mockProduct);

      const result = await service.getById('p1');

      expect(result).toEqual(mockProduct);
      expect(mockRedis.getProduct).toHaveBeenCalledWith('p1');
      expect(mockPrisma.product.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch from database and filter visibility on cache miss', async () => {
      const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
      mockRedis.getProduct.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      (mockPrisma as any).shopImageHotspot.findMany.mockResolvedValue([]);

      const result = await service.getById('p1');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalled();
      // It should call shopImageHotspot twice: once for linkedIds and once for labelKeys
      expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
      expect(mockRedis.cacheProduct).toHaveBeenCalled();
    });

    it('should hide product if linked to hotspot', async () => {
        const mockProduct = { id: 'p1', name: 'Product 1', isActive: true, shopId: 's1' };
        mockRedis.getProduct.mockResolvedValue(null);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

        // Mock linkedIds check to return p1
        (mockPrisma as any).shopImageHotspot.findMany
            .mockResolvedValueOnce([{ productId: 'p1' }]) // linkedIds
            .mockResolvedValueOnce([]); // labelKeys

        await expect(service.getById('p1')).rejects.toThrow('لم يتم العثور على المنتج');
    });

    it('should hide product if name matches active hotspot label', async () => {
        const mockProduct = { id: 'p1', name: 'Hotspot Label', isActive: true, shopId: 's1' };
        mockRedis.getProduct.mockResolvedValue(null);
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

        (mockPrisma as any).shopImageHotspot.findMany.mockImplementation((args) => {
            if (args.where.productId) {
                // linkedIds call
                return Promise.resolve([]);
            }
            if (args.where.map) {
                // labelKeys call
                return Promise.resolve([{ label: 'Hotspot Label' }]);
            }
            return Promise.resolve([]);
        });

        await expect(service.getById('p1')).rejects.toThrow('لم يتم العثور على المنتج');
    });
  });
});
