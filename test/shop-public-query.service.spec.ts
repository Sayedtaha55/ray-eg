import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('ShopPublicQueryService Performance (Zero-DB Hit)', () => {
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
    shopImageHotspot: {
      findMany: jest.fn(),
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

  it('should achieve 0 DB queries on a valid cache hit', async () => {
    const mockShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      products: [
        { id: 'p1', name: 'Product 1', category: 'Category 1' },
        { id: 'p2', name: 'Product 2', category: '__IMAGE_MAP__' }, // Should be filtered in-memory
      ],
    };

    (mockRedis.getShopBySlug as jest.Mock).mockResolvedValue(mockShop);

    const result = await service.getShopBySlug('test-shop');

    expect(result).toBeDefined();
    expect(result.id).toBe('shop-123');
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('p1');

    // VERIFY: No database calls made
    expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.shopImageHotspot.findMany).not.toHaveBeenCalled();

    // Verify monitoring
    expect(mockMonitoring.trackCache).toHaveBeenCalledWith('getShopBySlug', expect.stringContaining('test-shop'), true, expect.any(Number));
  });

  it('should fall back to database if cached shop has no products array', async () => {
     // Scenario: warmCache might have stored an incomplete shop object
    const incompleteShop = {
      id: 'shop-123',
      slug: 'test-shop',
      isActive: true,
      // products missing or not an array
    };

    (mockRedis.getShopBySlug as jest.Mock).mockResolvedValue(incompleteShop);
    (mockPrisma.shop.findUnique as jest.Mock).mockResolvedValue({
        ...incompleteShop,
        products: []
    });

    await service.getShopBySlug('test-shop');

    // VERIFY: Database was called because cache was incomplete
    expect(mockPrisma.shop.findUnique).toHaveBeenCalled();
  });
});
