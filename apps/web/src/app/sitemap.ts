import { type MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mnmknk.com';
  const locales = ['ar', 'en'];

  const staticPages = [
    '',
    '/offers',
    '/map',
    '/about',
    '/contact',
    '/support',
    '/blog',
    '/directory',
    '/courier',
    '/terms',
    '/privacy',
    '/return-policy',
    '/filter',
    '/login',
    '/signup',
    '/business',
    '/business/signup',
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.7,
      });
    }
  }

  return entries;
}
