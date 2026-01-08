import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { MonitoringService } from './monitoring/monitoring.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly monitoring: MonitoringService
  ) {}

  async getAllShops() {
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cachedShops = await this.redis.getShopsList();
      if (cachedShops) {
        const duration = Date.now() - startTime;
        this.monitoring.trackCache('getShopsList', 'shops:list', true, duration);
        this.monitoring.trackPerformance('getAllShops_cached', duration);
        return cachedShops;
      }

      // If not in cache, fetch from database
      const shops = await this.prisma.shop.findMany({
        where: { isActive: true, status: 'APPROVED' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              offers: true,
            },
          },
        },
      });

      // Cache the result for 30 minutes
      await this.redis.cacheShopsList(shops, 1800);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, true);
      this.monitoring.trackPerformance('getAllShops_database', duration);
      
      return shops;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shops', duration, false);
      throw error;
    }
  }

  async getShopBySlug(slug: string) {
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cachedShop = await this.redis.getShopBySlug(slug);
      if (cachedShop) {
        const duration = Date.now() - startTime;
        this.monitoring.trackCache('getShopBySlug', `shop:slug:${slug}`, true, duration);
        this.monitoring.trackPerformance('getShopBySlug_cached', duration);
        
        // Increment visitors counter asynchronously
        this.incrementVisitors(cachedShop.id).catch(console.error);
        return cachedShop;
      }

      // If not in cache, fetch from database
      const shop = await this.prisma.shop.findUnique({
        where: { slug },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          products: {
            where: { isActive: true },
            take: 10,
          },
          offers: {
            where: { isActive: true },
            take: 5,
          },
          gallery: {
            where: { isActive: true },
            take: 6,
          },
        },
      });

      if (shop) {
        // Cache the shop data for 1 hour
        await this.redis.cacheShop(shop.id, shop, 3600);
        
        // Increment visitors
        await this.incrementVisitors(shop.id);
      }

      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, true);
      this.monitoring.trackPerformance('getShopBySlug_database', duration);
      
      return shop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findUnique', 'shops', duration, false);
      throw error;
    }
  }

  async incrementVisitors(shopId: string) {
    const startTime = Date.now();
    
    try {
      // Update database
      await this.prisma.shop.update({
        where: { id: shopId },
        data: {
          visitors: {
            increment: 1,
          },
        },
      });

      // Update cache counter
      await this.redis.incrementCounter(`shop:${shopId}:visitors`);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('incrementVisitors', duration);
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
  }

  async toggleFollow(shopId: string, userId: string) {
    // This would need a followers table in the schema
    // For now, return a mock response
    this.monitoring.trackPerformance('toggleFollow', 0);
    return { followed: true };
  }

  async updateShopDesign(shopId: string, designConfig: any) {
    const startTime = Date.now();
    
    try {
      // Update database
      const updatedShop = await this.prisma.shop.update({
        where: { id: shopId },
        data: {
          pageDesign: designConfig,
        },
      });

      // Invalidate cache for this shop
      await this.redis.invalidateShopCache(shopId, updatedShop.slug);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, true);
      this.monitoring.trackPerformance('updateShopDesign', duration);
      
      return updatedShop;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('update', 'shops', duration, false);
      throw error;
    }
  }

  async getShopAnalytics(shopId: string) {
    const startTime = Date.now();
    const cacheKey = `shop:${shopId}:analytics`;
    
    try {
      // Try to get from cache first (cache for 5 minutes)
      const cachedAnalytics = await this.redis.get(cacheKey);
      if (cachedAnalytics) {
        const duration = Date.now() - startTime;
        this.monitoring.trackCache('getShopAnalytics', cacheKey, true, duration);
        this.monitoring.trackPerformance('getShopAnalytics_cached', duration);
        return cachedAnalytics;
      }

      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const analytics = await this.prisma.shopAnalytics.findMany({
        where: {
          shopId,
          date: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);
      const totalOrders = analytics.reduce((sum, a) => sum + a.ordersCount, 0);
      const totalVisitors = analytics.reduce((sum, a) => sum + a.visitorsCount, 0);

      const result = {
        revenue: totalRevenue,
        orders: totalOrders,
        visitors: totalVisitors,
        dailyAnalytics: analytics,
      };

      // Cache analytics for 5 minutes
      await this.redis.set(cacheKey, result, 300);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shop_analytics', duration, true);
      this.monitoring.trackPerformance('getShopAnalytics_database', duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackDatabase('findMany', 'shop_analytics', duration, false);
      throw error;
    }
  }

  // Cache management methods
  async clearShopCache(shopId: string, slug?: string) {
    const startTime = Date.now();
    
    try {
      await this.redis.invalidateShopCache(shopId, slug);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackCache('invalidateShopCache', `shop:${shopId}`, false, duration);
      this.monitoring.trackPerformance('clearShopCache', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackCache('invalidateShopCache', `shop:${shopId}`, false, duration);
      throw error;
    }
  }

  async warmCache() {
    const startTime = Date.now();
    
    try {
      // Pre-populate cache with popular shops
      const popularShops = await this.prisma.shop.findMany({
        where: { 
          isActive: true, 
          status: 'APPROVED',
          visitors: { gte: 100 } // Popular shops
        },
        take: 20,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { products: true, offers: true } },
        },
      });

      // Cache popular shops
      for (const shop of popularShops) {
        await this.redis.cacheShop(shop.id, shop, 3600);
      }

      // Cache shops list
      await this.redis.cacheShopsList(popularShops, 1800);
      
      const duration = Date.now() - startTime;
      this.monitoring.trackPerformance('warmCache', duration);
      this.monitoring.logBusiness('cache_warmed', { shopsCount: popularShops.length });
      
      return popularShops.length;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.monitoring.trackPerformance('warmCache', duration);
      throw error;
    }
  }
}
