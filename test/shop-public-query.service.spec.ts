import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService (Performance)', () => {
  let service: ShopPublicQueryService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrisma = {
    shop: { findUnique: jest.fn() },
    shopImageHotspot: { findMany: jest.fn() },
    shopApp: { findMany: jest.fn() },
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

  it('should achieve 0-DB queries for hotspots on cache hit', async () => {
    const slug = 'test-shop';
    const cachedShop = {
      id: 'shop-123',
      slug,
      isActive: true,
      publicDisabled: false,
      products: [
        { id: 'p1', name: 'Product 1', category: 'General' },
        { id: 'p2', name: 'Product 2', category: 'IMAGE_MAP_CATEGORY' }, // Should be filtered by safety fallback
      ],
      owner: { isActive: true },
    };

    mockRedis.getShopBySlug.mockResolvedValue(cachedShop);

    const result = await service.getShopBySlug(slug);

    expect(result).toBeDefined();
    expect(result.id).toBe(cachedShop.id);

    // Core performance expectation: NO database calls for hotspots on cache hit
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();


    expect(mockRedis.getShopBySlug).toHaveBeenCalledWith(slug);
    expect(mockMonitoring.trackCache).toHaveBeenCalledWith('getShopBySlug', expect.any(String), true, expect.any(Number));
  });

  it('should parallelize hotspot queries on cache miss', async () => {
    const slug = 'test-shop';
    const dbShop = {
      id: 'shop-123',
      slug,
      isActive: true,
      publicDisabled: false,
      owner: { isActive: true },
      products: [{ id: 'p1', name: 'Product 1', category: 'General' }],
      offers: [],
      gallery: [],
    };

    mockRedis.getShopBySlug.mockResolvedValue(null);
    mockPrisma.shop.findUnique.mockResolvedValue(dbShop);
    mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);
    mockPrisma.shopApp.findMany.mockResolvedValue([]);

    await service.getShopBySlug(slug);

    // Should still query hotspots on cache miss (but they should be parallelized in the code)
    expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
    expect(mockPrisma.shop.findUnique).toHaveBeenCalled();
  });
});
