import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../backend/src/modules/product/product.service';
import { PrismaService } from '../backend/src/common/prisma/prisma.service';
import { RedisService } from '../backend/src/common/redis/redis.service';

describe('ProductService Performance & Correctness', () => {
  let service: ProductService;
  let prisma: any;
  let redis: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      shopImageHotspot: {
        findMany: jest.fn(),
      },
    };
    redis = {
      getProduct: jest.fn(),
      cacheProduct: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      invalidateProductCache: jest.fn(),
      invalidatePattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should implement Zero-DB Cache Hit in listByShop', async () => {
    const shopId = 'shop-1';
    const cacheKey = 'products:shop:{"shopId":"shop-1"}';
    const cachedProducts = [{ id: 'p1', name: 'Product 1' }];

    redis.get.mockResolvedValue(cachedProducts);

    const result = await service.listByShop(shopId);

    expect(result).toEqual(cachedProducts);
    expect(redis.get).toHaveBeenCalledWith(cacheKey);
    // Should NOT call prisma if cache hits (Zero-DB Cache Hit)
    expect(prisma.product.findMany).not.toHaveBeenCalled();
    expect(prisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
  });

  it('should parallelize queries in listByShop on cache miss', async () => {
    const shopId = 'shop-1';
    redis.get.mockResolvedValue(null);
    prisma.product.findMany.mockResolvedValue([{ id: 'p1', name: 'Product 1' }]);
    prisma.shopImageHotspot.findMany.mockResolvedValue([]);

    const result = await service.listByShop(shopId);

    expect(result).toHaveLength(1);
    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(prisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2); // linkedIds and labelKeys
  });
});
