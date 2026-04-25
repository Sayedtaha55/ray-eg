import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService Performance', () => {
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
    trackPerformance: jest.fn(),
    trackCache: jest.fn(),
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

  it('should not call database on a full cache hit', async () => {
    const shopId = 'shop-123';
    const slug = 'test-shop';
    const cachedData = {
      id: shopId,
      slug: slug,
      isActive: true,
      publicDisabled: false,
      products: [
        { id: 'p1', name: 'Product 1', category: 'General', isActive: true }
      ],
      owner: { isActive: true }
    };

    mockRedis.getShopBySlug.mockResolvedValue(cachedData);

    // We want to verify that when data is in cache, we don't call DB for hotspots
    // If the optimization is working, it should NOT call prisma.shopImageHotspot.findMany

    const result = await service.getShopBySlug(slug);

    expect(result).toBeDefined();
    expect(result.id).toBe(shopId);

    // If these are called, it means we are still hitting the DB even on cache hit
    expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
  });
});
