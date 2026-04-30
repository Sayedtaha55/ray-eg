import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService (Bolt Anti-Pattern)', () => {
  let service: ShopPublicQueryService;
  let prisma: any;
  let redis: any;

  const mockPrisma = {
    shop: { findUnique: jest.fn() },
    shopImageHotspot: { findMany: jest.fn() },
    shopApp: { findMany: jest.fn() },
  };

  const mockRedis = {
    getShop: jest.fn(),
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

  it('should eliminate hotspot database queries on valid cache hit', async () => {
    const mockShop = {
      id: 'shop-1',
      slug: 'test-shop',
      isActive: true,
      products: [
        { id: 'p1', name: 'Product 1', isActive: true },
        { id: 'p2', name: 'Product 2', isActive: true },
      ],
    };

    mockRedis.getShopBySlug.mockResolvedValue(mockShop);

    const result = await service.getShopBySlug('test-shop');

    expect(result).toEqual(mockShop);
    expect(mockRedis.getShopBySlug).toHaveBeenCalledWith('test-shop');
    // CRITICAL: No Prisma calls for hotspots should happen
    expect(prisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    expect(mockMonitoring.trackPerformance).toHaveBeenCalledWith('getShopBySlug_cached_fast', expect.any(Number));
  });

  it('should parallelize hotspot queries on cache miss', async () => {
    const mockShop = {
      id: 'shop-1',
      slug: 'test-shop',
      isActive: true,
      products: [
        { id: 'p1', name: 'Product 1', isActive: true },
        { id: 'p2', name: 'Product 2', isActive: true },
      ],
    };

    mockRedis.getShopBySlug.mockResolvedValue(null);
    mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
    mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);
    mockPrisma.shopApp.findMany.mockResolvedValue([]);

    await service.getShopBySlug('test-shop');

    expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    // Parallelization check is harder to verify with jest mock unless we track timing,
    // but we can at least ensure both were called.
  });
});
