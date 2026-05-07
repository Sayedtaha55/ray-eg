import { serverFetch } from '@/lib/api/client';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getDictionary } from '@/i18n/dictionaries';
import { isValidLocale, type Locale } from '@/i18n/config';

export const revalidate = 60;

interface ShopData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  coverUrl?: string;
  address?: string;
  phone?: string;
  theme?: string;
  customColors?: Record<string, string>;
  status: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const dict = getDictionary(isValidLocale(locale) ? (locale as Locale) : 'ar');
  try {
    const shop = await serverFetch<ShopData>(`/api/v1/shops/slug/${slug}`);
    return {
      title: shop.name,
      description: shop.description || shop.name,
      openGraph: {
        title: shop.name,
        description: shop.description,
        images: shop.logoUrl ? [{ url: shop.logoUrl }] : [],
        type: 'website',
        locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      },
    };
  } catch {
    return { title: dict.common.notFound, description: dict.common.notFound };
  }
}

export default async function ShopProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const activeLocale: Locale = isValidLocale(locale) ? (locale as Locale) : 'ar';
  const prefix = `/${locale}`;
  const dict = getDictionary(activeLocale);
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const currency = dict.common.currency;
  let shop: ShopData | null = null;
  let products: unknown[] = [];

  try {
    shop = await serverFetch<ShopData>(`/api/v1/shops/slug/${slug}`);
    products = await serverFetch<unknown[]>(`/api/v1/products?shopId=${shop.id}&limit=20`);
  } catch {}

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir={dir}>
        <h1 className="text-3xl font-bold">{dict.shop.notFound}</h1>
        <a href={`${prefix}/`} className="mt-4 rounded-lg bg-blue-600 text-white px-6 py-2 font-medium hover:bg-blue-700 transition-colors">
          {dict.common.backHome}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="relative h-48 md:h-64 bg-gradient-to-b from-blue-600 to-blue-800 flex items-end">
        {shop.coverUrl && (
          <Image src={shop.coverUrl} alt={shop.name} fill sizes="100vw" className="object-cover opacity-30" />
        )}
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-4 flex items-end gap-4">
          {shop.logoUrl ? (
            <Image src={shop.logoUrl} alt={shop.name} width={96} height={96} sizes="80px" className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white shadow-lg object-cover" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white shadow-lg bg-white/20 flex items-center justify-center text-3xl font-bold text-white">
              {shop.name.charAt(0)}
            </div>
          )}
          <div className="mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{shop.name}</h1>
            <p className="text-white/80 text-sm">{shop.category}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {shop.description && <p className="text-gray-700 mb-6">{shop.description}</p>}
        {shop.address && <p className="text-gray-500 text-sm mb-2">📍 {shop.address}</p>}
        {shop.phone && <p className="text-gray-500 text-sm mb-4">📞 {shop.phone}</p>}

        <h2 className="text-xl font-bold mb-4">{dict.shop.products}</h2>
        {Array.isArray(products) && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as { id: string; name: string; price: number; images?: string[] }[]).map((product) => (
              <a
                key={product.id}
                href={`${prefix}/product/${product.id}`}
                className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">{product.price} {currency}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">{dict.shop.noProducts}</p>
        )}
      </div>
    </div>
  );
}
