import Image from 'next/image';
import Link from 'next/link';
import { Star, Tag } from 'lucide-react';
import type { Product } from '@/lib/services';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const image = product.imageUrl || product.images?.[0] || '/placeholder-product.png';
  const hasDiscount = product.oldPrice && product.oldPrice > (product.price || 0);
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice! - (product.price || 0)) / product.oldPrice!) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-brand-purple/20 hover:shadow-brand transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 rounded-lg text-[10px] font-black text-white shadow-lg">
            -{discountPercent}%
          </div>
        )}
        {product.isAvailable === false && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-black text-sm">غير متوفر</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-black text-xs md:text-sm text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-brand-purple transition-colors">
          {product.name}
        </h3>
        {product.shopName && (
          <p className="text-[10px] text-slate-400 font-bold mb-2">{product.shopName}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          {product.price != null && (
            <div className="flex items-center gap-2">
              <span className="font-black text-sm md:text-base text-slate-900 dark:text-white">
                {formatPrice(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through font-bold">
                  {formatPrice(product.oldPrice!, product.currency)}
                </span>
              )}
            </div>
          )}
          {product.rating != null && product.rating > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
