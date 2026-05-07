import { serverFetch } from '@/lib/api/client';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getDictionary } from '@/i18n/dictionaries';
import { isValidLocale, type Locale } from '@/i18n/config';

export const revalidate = 60;

interface ProductData {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  model3dUrl?: string;
  category?: string;
  shop?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const dict = getDictionary(isValidLocale(locale) ? (locale as Locale) : 'ar');
  try {
    const product = await serverFetch<ProductData>(`/api/v1/products/${id}`);
    return {
      title: product.name,
      description: product.description || product.name,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
        type: 'website',
        locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      },
    };
  } catch {
    return { title: dict.common.notFound };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const activeLocale: Locale = isValidLocale(locale) ? (locale as Locale) : 'ar';
  const prefix = `/${locale}`;
  const dict = getDictionary(activeLocale);
  const dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
  const currency = dict.common.currency;
  let product: ProductData | null = null;

  try {
    product = await serverFetch<ProductData>(`/api/v1/products/${id}`);
  } catch {}

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir={dir}>
        <h1 className="text-3xl font-bold">{dict.product.notFound}</h1>
        <a href={`${prefix}/`} className="mt-4 rounded-lg bg-blue-600 text-white px-6 py-2 font-medium hover:bg-blue-700 transition-colors">
          {dict.common.backHome}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir={dir}>
      {product.shop && (
        <a href={`${prefix}/shop/${product.shop.slug}`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          {dir === 'rtl' ? '→' : '←'} {product.shop.name}
        </a>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden relative">
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl font-bold">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <Image key={i} src={img} alt={`${product.name} - ${i + 1}`} width={64} height={64} className="w-16 h-16 rounded-lg object-cover border-2 border-transparent hover:border-blue-500 cursor-pointer flex-shrink-0" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600">{product.price} {currency}</p>
          {product.stock !== undefined && (
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${dict.product.inStock} (${product.stock} ${dict.product.pieces})` : dict.product.outOfStock}
            </p>
          )}
          {product.description && (
            <div className="mt-6">
              <h2 className="font-bold mb-2">{dict.product.description}</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}
          {product.category && <p className="text-gray-500 text-sm">{dict.product.category}: {product.category}</p>}
        </div>
      </div>
    </div>
  );
}
