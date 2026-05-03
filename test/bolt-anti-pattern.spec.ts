import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/src/modules/shop/shop-public-query.service';
import { PrismaService } from '../backend/src/common/prisma/prisma.service';
import { RedisService } from '../backend/src/common/redis/redis.service';
import { MonitoringService } from '../backend/src/common/monitoring/monitoring.service';

describe('Bolt: Zero-DB Cache Hit Optimization', () => {
  let service: ShopPublicQueryService;
  let redis: RedisService;
  let prisma: PrismaService;

  const mockRedis = {
    getShopBySlug: jest.fn(),
    getShop: jest.fn(),
    cacheShop: jest.fn(),
  };

  const mockPrisma = {
    shop: {
      findUnique: jest.fn(),
    },
    shopApp: {
      findMany: jest.fn(),
    },
    shopImageHotspot: {
      findMany: jest.fn(),
    },
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

  it('should eliminate DB queries for hotspots on Redis cache hit', async () => {
    const mockShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      products: [{ id: 'p1', name: 'Product 1' }],
    };

    mockRedis.getShopBySlug.mockResolvedValue(mockShop);

    const result = await service.getShopBySlug('test-shop');

    expect(result).toEqual(mockShop);
    expect(mockRedis.getShopBySlug).toHaveBeenCalledWith('test-shop');

    // VERIFY: No database calls were made for hotspots
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
  });

  it('should parallelize hotspot lookups on cache miss', async () => {
    const mockShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      products: [{ id: 'p1', name: 'Product 1' }],
    };

    mockRedis.getShopBySlug.mockResolvedValue(null);
    mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
    mockPrisma.shopApp.findMany.mockResolvedValue([]);
    mockPrisma.shopImageHotspot.findMany.mockResolvedValue([]);

    await service.getShopBySlug('test-shop');

    expect(mockPrisma.shop.findUnique).toHaveBeenCalled();
    // It should call hotspot findMany for linkedIds and labelKeys
    expect(mockPrisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);
  });
});
