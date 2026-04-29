import { Test, TestingModule } from '@nestjs/testing';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { RedisService } from '../backend/redis/redis.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';

describe('Bolt: Anti-Pattern Verification (Zero-DB Cache Hit)', () => {
  let service: ShopPublicQueryService;
  let prisma: any;
  let redis: any;

  beforeEach(async () => {
    prisma = {
      shop: { findUnique: jest.fn() },
      shopImageHotspot: { findMany: jest.fn() },
      shopApp: { findMany: jest.fn() },
    };
    redis = {
      getShopBySlug: jest.fn(),
      cacheShop: jest.fn(),
    };
    const monitoring = {
      trackPerformance: jest.fn(),
      trackCache: jest.fn(),
      trackDatabase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopPublicQueryService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        { provide: MonitoringService, useValue: monitoring },
      ],
    }).compile();

    service = module.get<ShopPublicQueryService>(ShopPublicQueryService);
  });

  it('should perform ZERO database queries for hotspots on a cache hit', async () => {
    const mockShop = {
      id: 'shop-1',
      slug: 'test-shop',
      products: [{ id: 'p1', name: 'Product 1' }],
      isActive: true,
    };

    redis.getShopBySlug.mockResolvedValue(mockShop);

    const result = await service.getShopBySlug('test-shop');

    expect(result).toEqual(mockShop);
    expect(redis.getShopBySlug).toHaveBeenCalledWith('test-shop');

    // THE CRITICAL CHECK:
    // No shopImageHotspot queries should be made because data is already filtered in cache.
    expect(prisma.shopImageHotspot.findMany).not.toHaveBeenCalled();
    expect(prisma.shop.findUnique).not.toHaveBeenCalled();
  });

  it('should parallelize hotspot queries on a cache miss', async () => {
    const mockShop = {
      id: 'shop-1',
      slug: 'test-shop',
      products: [{ id: 'p1', name: 'Product 1' }, { id: 'p2', name: 'Product 2' }],
      isActive: true,
    };

    redis.getShopBySlug.mockResolvedValue(null);
    prisma.shop.findUnique.mockResolvedValue(mockShop);
    prisma.shopImageHotspot.findMany.mockResolvedValue([]); // Return empty for simplicity
    prisma.shopApp.findMany.mockResolvedValue([]);

    await service.getShopBySlug('test-shop');

    // Should have called findMany twice (linkedIds and labelKeys)
    expect(prisma.shopImageHotspot.findMany).toHaveBeenCalledTimes(2);

    // Verify it attempted to cache the filtered results
    expect(redis.cacheShop).toHaveBeenCalled();
  });
});
