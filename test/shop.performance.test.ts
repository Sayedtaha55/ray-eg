import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../backend/redis/redis.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { ShopService } from '../backend/shop.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';
import { MediaCompressionService } from '../backend/media-compression.service';
import { EmailService } from '../backend/email.service';
import { ShopSettingsService } from '../backend/shop-settings.service';
import { ShopPublicQueryService } from '../backend/shop-public-query.service';
import { ShopMediaService } from '../backend/shop-media.service';
import { ShopAnalyticsService } from '../backend/shop-analytics.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incrementCounter: jest.fn(),
  cacheShop: jest.fn(),
  getShopBySlug: jest.fn(),
  getShopsList: jest.fn(),
  cacheShopsList: jest.fn(),
  invalidateShopCache: jest.fn(),
};

const mockPrisma = {
  shop: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findMany: jest.fn(),
  },
  reservation: {
    findMany: jest.fn(),
  },
};

const mockMonitoring = {
  trackPerformance: jest.fn(),
  trackCache: jest.fn(),
  trackDatabase: jest.fn(),
  logBusiness: jest.fn(),
};

const mockMediaCompression = {
  getVideoDuration: jest.fn(),
  optimizeVideoMp4: jest.fn(),
  optimizeVideoWebm: jest.fn(),
  generateVideoThumbnailWebp: jest.fn(),
  ensureDir: jest.fn(),
  writeWebpVariants: jest.fn(),
};

const mockEmail = { sendMail: jest.fn() };
const mockShopSettings = { getShopSettings: jest.fn(), updateShopSettings: jest.fn() };
const mockShopPublicQuery = { getShopBySlug: jest.fn() };
const mockShopMedia = { processShopMedia: jest.fn() };
const mockShopAnalytics = { getShopAnalytics: jest.fn() };

describe('ShopService Performance Tests', () => {
  let service: ShopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        { provide: RedisService, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MonitoringService, useValue: mockMonitoring },
        { provide: MediaCompressionService, useValue: mockMediaCompression },
        { provide: EmailService, useValue: mockEmail },
        { provide: ShopSettingsService, useValue: mockShopSettings },
        { provide: ShopPublicQueryService, useValue: mockShopPublicQuery },
        { provide: ShopMediaService, useValue: mockShopMedia },
        { provide: ShopAnalyticsService, useValue: mockShopAnalytics },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
    jest.clearAllMocks();
  });

  describe('getAllShops Performance', () => {
    it('should return cached shops quickly', async () => {
      const mockShops = [
        { id: '1', name: 'Shop 1', slug: 'shop-1' },
        { id: '2', name: 'Shop 2', slug: 'shop-2' },
      ];

      mockRedis.getShopsList.mockResolvedValue(mockShops);

      const startTime = Date.now();
      const result = await service.getAllShops();
      const duration = Date.now() - startTime;

      expect(result).toEqual(mockShops);
      expect(mockRedis.getShopsList).toHaveBeenCalled();
      expect(mockPrisma.shop.findMany).not.toHaveBeenCalled();
      expect(mockMonitoring.trackCache).toHaveBeenCalledWith('getShopsList', 'shops:list', true, expect.any(Number));
      expect(mockMonitoring.trackPerformance).toHaveBeenCalledWith('getAllShops_cached', expect.any(Number));
      expect(duration).toBeLessThan(150);
    });

    it('should fetch from database when cache is empty', async () => {
      const mockShops = [
        { id: '1', name: 'Shop 1', slug: 'shop-1' },
        { id: '2', name: 'Shop 2', slug: 'shop-2' },
      ];

      mockRedis.getShopsList.mockResolvedValue(null);
      mockPrisma.shop.findMany.mockResolvedValue(mockShops);

      const result = await service.getAllShops();

      expect(result).toEqual(mockShops);
      expect(mockRedis.getShopsList).toHaveBeenCalled();
      expect(mockPrisma.shop.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
      expect(mockRedis.cacheShopsList).toHaveBeenCalledWith(mockShops, 1800);
      expect(mockMonitoring.trackDatabase).toHaveBeenCalledWith('findMany', 'shops', expect.any(Number), true);
    });

    it('should handle database errors gracefully', async () => {
      mockRedis.getShopsList.mockResolvedValue(null);
      mockPrisma.shop.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllShops()).rejects.toThrow('Database error');
      expect(mockMonitoring.trackDatabase).toHaveBeenCalledWith('findMany', 'shops', expect.any(Number), false);
    });
  });

  describe('Delegation Performance', () => {
    it('should delegate getShopBySlug to ShopPublicQueryService', async () => {
      const mockShop = { id: '1', name: 'Shop 1', slug: 'shop-1' };
      mockShopPublicQuery.getShopBySlug.mockResolvedValue(mockShop);

      const startTime = Date.now();
      const result = await service.getShopBySlug('shop-1');
      const duration = Date.now() - startTime;

      expect(result).toEqual(mockShop);
      expect(mockShopPublicQuery.getShopBySlug).toHaveBeenCalledWith('shop-1');
      expect(duration).toBeLessThan(150);
    });

    it('should delegate getShopAnalytics to ShopAnalyticsService', async () => {
      const mockAnalytics = {
        totalRevenue: 1000,
        totalOrders: 10,
        totalUsers: 3,
        visitorsCount: 100,
        followersCount: 5,
        salesCountToday: 0,
        revenueToday: 0,
        chartData: [],
      };
      mockShopAnalytics.getShopAnalytics.mockResolvedValue(mockAnalytics);

      const startTime = Date.now();
      const result = await service.getShopAnalytics('1');
      const duration = Date.now() - startTime;

      expect(result).toEqual(mockAnalytics);
      expect(mockShopAnalytics.getShopAnalytics).toHaveBeenCalledWith('1', undefined);
      expect(duration).toBeLessThan(150);
    });
  });

  describe('Cache Performance', () => {
    it('should warm cache efficiently', async () => {
      const mockShops = Array.from({ length: 20 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Shop ${i + 1}`,
        slug: `shop-${i + 1}`,
        visitors: 100,
      }));

      mockPrisma.shop.findMany.mockResolvedValue(mockShops);

      const startTime = Date.now();
      const result = await service.warmCache();
      const duration = Date.now() - startTime;

      expect(result).toBe(20);
      expect(mockPrisma.shop.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          status: 'APPROVED',
          visitors: { gte: 100 },
        },
        take: 20,
        include: expect.any(Object),
      });
      expect(mockRedis.cacheShop).toHaveBeenCalledTimes(20);
      expect(mockRedis.cacheShopsList).toHaveBeenCalled();
      expect(mockMonitoring.trackPerformance).toHaveBeenCalledWith('warmCache', expect.any(Number));
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle Redis failures gracefully', async () => {
      mockRedis.getShopsList.mockRejectedValue(new Error('Redis error'));
      mockPrisma.shop.findMany.mockResolvedValue([]);

      const result = await service.getAllShops();

      expect(result).toEqual([]);
      expect(mockPrisma.shop.findMany).toHaveBeenCalled();
    });

    it('should handle cache invalidation errors', async () => {
      mockRedis.invalidateShopCache.mockRejectedValue(new Error('Cache error'));

      await expect(service.clearShopCache('1', 'shop-1')).rejects.toThrow('Cache error');
      expect(mockMonitoring.trackCache).toHaveBeenCalledWith('invalidateShopCache', 'shop:1', false, expect.any(Number));
    });
  });
});
