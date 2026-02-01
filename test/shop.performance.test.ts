import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../backend/redis/redis.service';
import { PrismaService } from '../backend/prisma/prisma.service';
import { ShopService } from '../backend/shop.service';
import { MonitoringService } from '../backend/monitoring/monitoring.service';
import { MediaCompressionService } from '../backend/media-compression.service';
import { EmailService } from '../backend/email.service';

// Mock Redis
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

// Mock Prisma
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

// Mock Monitoring
const mockMonitoring = {
  trackPerformance: jest.fn(),
  trackCache: jest.fn(),
  trackDatabase: jest.fn(),
  logBusiness: jest.fn(),
};

// Mock MediaCompressionService
const mockMediaCompression = {
  getVideoDuration: jest.fn(),
  optimizeVideoMp4: jest.fn(),
  optimizeVideoWebm: jest.fn(),
  generateVideoThumbnailWebp: jest.fn(),
  ensureDir: jest.fn(),
  writeWebpVariants: jest.fn(),
};

// Mock EmailService
const mockEmail = {
  sendMail: jest.fn(),
};

describe('ShopService Performance Tests', () => {
  let service: ShopService;
  let redisService: RedisService;
  let prismaService: PrismaService;
  let monitoringService: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        {
          provide: RedisService,
          useValue: mockRedis,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: MonitoringService,
          useValue: mockMonitoring,
        },
        {
          provide: MediaCompressionService,
          useValue: mockMediaCompression,
        },
        {
          provide: EmailService,
          useValue: mockEmail,
        },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
    redisService = module.get<RedisService>(RedisService);
    prismaService = module.get<PrismaService>(PrismaService);
    monitoringService = module.get<MonitoringService>(MonitoringService);

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

      // Cache should be fast
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
          select: expect.any(Object),
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

  describe('getShopBySlug Performance', () => {
    it('should return cached shop quickly', async () => {
      const mockShop = { id: '1', name: 'Shop 1', slug: 'shop-1' };

      mockRedis.getShopBySlug.mockResolvedValue(mockShop);

      const startTime = Date.now();
      const result = await service.getShopBySlug('shop-1');
      const duration = Date.now() - startTime;

      expect(result).toEqual(mockShop);
      expect(mockRedis.getShopBySlug).toHaveBeenCalledWith('shop-1');
      expect(mockPrisma.shop.findUnique).not.toHaveBeenCalled();
      expect(mockMonitoring.trackCache).toHaveBeenCalledWith('getShopBySlug', 'shop:slug:shop-1', true, expect.any(Number));

      // Cache should be fast
      expect(duration).toBeLessThan(150);
    });

    it('should fetch from database when cache is empty', async () => {
      const mockShop = { id: '1', name: 'Shop 1', slug: 'shop-1' };

      mockRedis.getShopBySlug.mockResolvedValue(null);
      mockPrisma.shop.findUnique.mockResolvedValue(mockShop);

      const result = await service.getShopBySlug('shop-1');

      expect(result).toEqual(mockShop);
      expect(mockRedis.getShopBySlug).toHaveBeenCalledWith('shop-1');
      expect(mockPrisma.shop.findUnique).toHaveBeenCalledWith({
        where: { slug: 'shop-1' },
        include: expect.any(Object),
      });
      expect(mockRedis.cacheShop).toHaveBeenCalledWith('1', mockShop, 3600);
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

      // Cache warming should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Analytics Performance', () => {
    it('should cache analytics results', async () => {
      const now = new Date();
      const mockShop = { id: '1', visitors: 100, followers: 5 };
      const mockOrders = [
        { id: 'o1', userId: 'u1', total: 1000, createdAt: now },
      ];

      mockRedis.get.mockResolvedValue(null);
      mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.getShopAnalytics('1');

      expect(result).toEqual(
        expect.objectContaining({
          totalRevenue: 1000,
          totalOrders: 1,
          visitorsCount: 100,
          followersCount: 5,
          chartData: expect.any(Array),
        }),
      );
      expect((result as any).chartData.length).toBe(7);
      expect((result as any).chartData[0]).toEqual({
        name: expect.any(String),
        sales: expect.any(Number),
      });
      expect(mockRedis.set).toHaveBeenCalledWith('shop:1:analytics:null:null', expect.any(Object), 300);
    });

    it('should return cached analytics quickly', async () => {
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

      mockRedis.get.mockResolvedValue(mockAnalytics);

      const startTime = Date.now();
      const result = await service.getShopAnalytics('1');
      const duration = Date.now() - startTime;

      expect(result).toEqual(mockAnalytics);
      expect(mockPrisma.order.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.reservation.findMany).not.toHaveBeenCalled();

      // Cached analytics should be fast
      expect(duration).toBeLessThan(150);
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
