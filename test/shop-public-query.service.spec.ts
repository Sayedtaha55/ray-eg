import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService Performance (Anti-Pattern Check)', () => {
  let service: ShopPublicQueryService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrisma = {
    shop: {
      findUnique: jest.fn(),
    },
    shopImageHotspot: {
      findMany: jest.fn(),
    },
    shopApp: {
      findMany: jest.fn(),
    },
  };

  const mockRedis = {
    getShopBySlug: jest.fn(),
    cacheShop: jest.fn(),
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
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: MonitoringService, useValue: mockMonitoring },
      ],
    }).compile();

    service = module.get<ShopPublicQueryService>(ShopPublicQueryService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('SHOULD NOT call database when shop is found in cache (Zero-DB Cache Hit)', async () => {
    const mockShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      products: [
        { id: 'p1', name: 'Product 1', isActive: true },
      ],
    };

    (redis.getShopBySlug as jest.Mock).mockResolvedValue(mockShop);

    await service.getShopBySlug('test-shop');

    // Hotspot queries should NOT be called on cache hit
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
  });

  it('should parallelize hotspot lookups on cache miss', async () => {
    (redis.getShopBySlug as jest.Mock).mockResolvedValue(null);
    (mockPrisma.shop.findUnique as jest.Mock).mockResolvedValue({
        id: 'shop-123',
        slug: 'test-shop',
        isActive: true,
        products: []
    });

    await service.getShopBySlug('test-shop');

    // Verify it still calls hotspots on cache miss
    expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
  });
});
