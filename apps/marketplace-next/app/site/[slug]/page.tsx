import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, MessageCircle, Store } from 'lucide-react';
import { api } from '@/lib/api';
import { getProducts, type Product } from '@/lib/services';
import { ProductCard } from '@/components/ProductCard';
import { siteConfig } from '@/lib/config';

export const revalidate = 120;

type BuilderConfig = Record<string, any>;

type PublicWebsite = {
  published: boolean;
  publishedAt?: string;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    phone?: string;
    address?: string;
  };
  config: BuilderConfig;
};

async function getWebsite(slug: string): Promise<PublicWebsite | null> {
  try {
    const data = await api.get<any>(`/shops/${slug}/website`, {
      revalidate: 120,
      tags: [`site:${slug}`],
    });
    return data?.data ?? null;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getWebsite(slug);
  if (!site) return { title: 'الموقع غير موجود', robots: { index: false } };

  const c = site.config || {};
  const title = `${site.shop.name} | ${siteConfig.name}`;
  const description =
    c.homeIntroText ||
    c.bannerSubtitle ||
    `${site.shop.name} - تسوق أونلاين من ${site.shop.name} على منصة ${siteConfig.name}`;
  const image = c.bannerUrl || site.shop.logoUrl || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: { canonical: `/site/${site.shop.slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
      locale: 'ar_EG',
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PublishedSitePage({ params }: Props) {
  const { slug } = await params;
  const site = await getWebsite(slug);
  if (!site) notFound();

  const c = site.config || {};
  const theme = (c as any).website?.theme || {};
  const tColors = theme.colors || {};
  const tTypo = theme.typography || {};
  const tRadius = theme.radius || {};
  const tShadows = theme.shadows || {};

  const primary = c.primaryColor || tColors.primary || '#00E5FF';
  const headerBg = c.headerBackgroundColor || tColors.surface || '#FFFFFF';
  const headerText = c.headerTextColor || tColors.textPrimary || '#0F172A';
  const pageBg = c.pageBackgroundColor || tColors.background || '#FFFFFF';
  const bannerUrl = c.bannerUrl;
  const footerBg = c.footerBackgroundColor || tColors.surface || '#FFFFFF';
  const footerText = c.footerTextColor || tColors.textPrimary || '#0F172A';

  // Full theme tokens from the builder (typography, radius, shadows)
  const fontBody = tTypo.fontBody || 'inherit';
  const fontHeading = tTypo.fontHeading || 'inherit';
  const rSm = tRadius.sm || '6px';
  const rMd = tRadius.md || '12px';
  const rLg = tRadius.lg || '16px';
  const rXl = tRadius.xl || '24px';
  const shadowSm = tShadows.sm || '0 1px 3px rgba(0,0,0,0.08)';
  const shadowMd = tShadows.md || '0 4px 12px rgba(0,0,0,0.1)';
  const cardRadius = c.productsLayout === 'horizontal' ? rLg : rMd;

  let products: Product[] = [];
  try {
    products = await getProducts(site.shop.id, 24);
  } catch {}

  const waPhone = (site.shop.phone || '').replace(/[^0-9]/g, '');
  const waLink = waPhone
    ? `https://wa.me/${waPhone.startsWith('20') ? waPhone : '2' + waPhone}?text=${encodeURIComponent(
        `مرحبًا، أريد الاستفسار عن منتجات ${site.shop.name}`
      )}`
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: site.shop.name,
    url: `${siteConfig.url}/site/${site.shop.slug}`,
    image: bannerUrl || site.shop.logoUrl,
    telephone: site.shop.phone,
    address: site.shop.address,
  };

  return (
    <div dir="rtl" className="pub-site min-h-screen" style={{ backgroundColor: pageBg }}>
      {/* Full theme tokens from the builder applied via CSS variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .pub-site { font-family: ${fontBody}; }
            .pub-site h1, .pub-site h2, .pub-site h3 { font-family: ${fontHeading}; }
            .pub-site .pub-wa { border-radius: ${rMd}; box-shadow: ${shadowSm}; }
            .pub-site .pub-logo { border-radius: ${rMd}; }
            .pub-site .pub-badge { border-radius: ${rSm}; box-shadow: ${shadowSm}; }
            .pub-site .pub-hero-title { border-radius: ${rXl}; }
            .pub-site .pub-card { border-radius: ${cardRadius}; box-shadow: ${shadowSm}; transition: box-shadow .2s; }
            .pub-site .pub-card:hover { box-shadow: ${shadowMd}; }
          `,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur border-b border-black/5"
        style={{ backgroundColor: `${headerBg}F2`, color: headerText }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {site.shop.logoUrl ? (
              <Image
                src={site.shop.logoUrl}
                alt={site.shop.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-cover shrink-0 pub-logo"
              />
            ) : (
              <div
                className="w-10 h-10 flex items-center justify-center shrink-0 pub-logo"
                style={{ backgroundColor: primary }}
              >
                <Store size={20} className="text-white" />
              </div>
            )}
            <span className="font-black text-lg truncate">{site.shop.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="pub-wa flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold hover:opacity-90 transition"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">اطلب واتساب</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero banner */}
      {bannerUrl && (
        <section className="relative w-full h-[42vh] min-h-[280px] max-h-[480px]">
          <Image
            src={bannerUrl}
            alt={site.shop.name}
            fill
            priority
            className="object-cover"
            style={{ objectPosition: `${c.bannerPosX || 50}% ${c.bannerPosY || 50}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white text-right">
            <h1 className="text-3xl sm:text-5xl font-black drop-shadow-lg">
              {c.bannerTitle || site.shop.name}
            </h1>
            {(c.bannerSubtitle || c.homeIntroText) && (
              <p className="mt-2 text-sm sm:text-lg text-white/90 max-w-2xl drop-shadow">
                {c.bannerSubtitle || c.homeIntroText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {c.allProductsPageName || 'منتجاتنا'}
          </h2>
          <span className="text-sm font-bold text-slate-400">{products.length} منتج</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-bold">
            لا توجد منتجات متاحة حاليًا
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              c.productsLayout === 'horizontal'
                ? 'grid-cols-1'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {products.map((p) => (
              <div key={p.id} className="pub-card">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-black/5 mt-8"
        style={{ backgroundColor: footerBg, color: footerText }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="font-black text-base">{site.shop.name}</div>
          {site.shop.address && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin size={14} />
              <span>{site.shop.address}</span>
            </div>
          )}
          <div className="text-slate-400 text-xs">مشغل بواسطة {siteConfig.name}</div>
        </div>
      </footer>
    </div>
  );
}