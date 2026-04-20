import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService (Performance)', () => {
  let service: ShopPublicQueryService;
  let redis: RedisService;
  let prisma: any;

  const mockRedis = {
    getShopBySlug: jest.fn(),
    cacheShop: jest.fn(),
  };

  const mockPrisma = {
    shopImageHotspot: {
      findMany: jest.fn(),
    },
    shop: {
      findUnique: jest.fn(),
    },
  };

  const mockMonitoring = {
    trackCache: jest.fn(),
    trackPerformance: jest.fn(),
    trackDatabase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopPublicQueryService,
        { provide: RedisService, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MonitoringService, useValue: mockMonitoring },
      ],
    }).compile();

    service = module.get<ShopPublicQueryService>(ShopPublicQueryService);
    redis = module.get<RedisService>(RedisService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should NOT call DB for hotspots on cache hit (Optimized)', async () => {
    const mockShop = {
      id: 'shop-1',
      slug: 'shop-1',
      isActive: true,
      products: [{ id: 'p1', name: 'Product 1' }],
    };
    mockRedis.getShopBySlug.mockResolvedValue(mockShop);

    await service.getShopBySlug('shop-1');

    expect(mockRedis.getShopBySlug).toHaveBeenCalledWith('shop-1');
    // Database should NOT be called on cache hit anymore
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
  });
});
