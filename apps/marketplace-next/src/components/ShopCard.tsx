import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Store } from 'lucide-react';
import type { Shop } from '@/lib/services';
import { cn } from '@/lib/utils';

export function ShopCard({ shop }: { shop: Shop }) {
  const coverImage = shop.coverImage || shop.banner || shop.logo || '/placeholder-shop.png';

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="card-contain group block bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-brand-cyan/20 hover:shadow-brand transition-all duration-300"
    >
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={coverImage}
          alt={shop.name || 'متجر'}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {shop.isVerified && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-brand-cyan rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-3.5 h-3.5 text-black fill-black" />
          </div>
        )}
        {shop.isApproved === false && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500/90 rounded-lg text-xs font-semibold text-white">
            قيد المراجعة
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand-black flex items-center justify-center flex-shrink-0 overflow-hidden">
            {shop.logo ? (
              <Image src={shop.logo} alt={shop.name || 'متجر'} width={40} height={40} className="object-cover" />
            ) : (
              <Store className="w-5 h-5 text-brand-cyan" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate group-hover:text-brand-cyan transition-colors">
              {shop.name}
            </h3>
            {shop.city && (
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold mt-0.5">
                <MapPin className="w-3 h-3" />
                {shop.city}
                {shop.district ? ` - ${shop.district}` : ''}
              </div>
            )}
          </div>
        </div>

        {shop.bio && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold line-clamp-2 mb-3">
            {shop.bio}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs font-semibold">
          {shop.rating != null && shop.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              {shop.rating.toFixed(1)}
            </span>
          )}
          {shop.productCount != null && shop.productCount > 0 && (
            <span className="text-slate-500">{shop.productCount} منتج</span>
          )}
          {shop.followerCount != null && shop.followerCount > 0 && (
            <span className="text-slate-500">{shop.followerCount} متابع</span>
          )}
        </div>
      </div>
    </Link>
  );
}
