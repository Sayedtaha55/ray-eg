import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService (Performance Verification)', () => {
  let service: ShopPublicQueryService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrisma = {
    shop: {
      findUnique: jest.fn(),
    },
    shopImageHotspot: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    shopApp: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const mockRedis = {
    getShopBySlug: jest.fn(),
    cacheShop: jest.fn(),
    getShop: jest.fn(),
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

  it('should NOT call database for hotspots on cache hit (Zero-DB Cache Hit)', async () => {
    const mockShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      products: [
        { id: 'p1', name: 'Product 1', category: 'General' },
        { id: 'p2', name: 'Product 2', category: '__IMAGE_MAP__' },
      ],
    };

    mockRedis.getShopBySlug.mockResolvedValue(mockShop);

    await service.getShopBySlug('test-shop');

    // OPTIMIZED BEHAVIOR:
    // Should NOT call database for hotspots on cache hit.
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
  });
});
