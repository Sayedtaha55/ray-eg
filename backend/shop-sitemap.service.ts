import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ShopSitemapService {
  constructor(private readonly prisma: PrismaService) {}

  async generateSitemap(): Promise<string> {
    const baseUrl = process.env.FRONTEND_URL || 'https://mnmknk.com';

    const staticPages = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/shops`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/restaurants`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.5' },
    ];

    const shops = await this.prisma.shop.findMany({
      where: { status: 'APPROVED' as any },
      select: { slug: true, updatedAt: true },
    });

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
    });

    const shopUrls = shops.map((shop) => ({
      loc: `${baseUrl}/shops/${shop.slug}`,
      lastmod: shop.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.9',
    }));

    const productUrls = products.map((product) => ({
      loc: `${baseUrl}/products/${product.id}`,
      lastmod: product.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    }));

    const allUrls = [...staticPages, ...shopUrls, ...productUrls];

    const urlset = allUrls
      .map((url) => {
        return `
    <url>
      <loc>${url.loc}</loc>
      ${'lastmod' in url ? `<lastmod>${(url as any).lastmod}</lastmod>` : ''}
      <changefreq>${url.changefreq}</changefreq>
      <priority>${url.priority}</priority>
    </url>`;
      })
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
  }
}
