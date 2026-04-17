import React, { useMemo } from 'react';
import { Offer, Product, Shop } from '@/types';
import StorefrontShopCard from './StorefrontShopCard';

interface StorefrontShowcaseSectionProps {
  shops: Shop[];
  offers: Offer[];
  shopProductsById?: Record<string, Product[]>;
  loading?: boolean;
  onOpenShop: (shop: Shop) => void;
}

const EMPTY_ARRAY: any[] = [];

const StorefrontShowcaseSection: React.FC<StorefrontShowcaseSectionProps> = ({ shops, offers, shopProductsById = {}, loading = false, onOpenShop }) => {
  const approvedShops = useMemo(
    () =>
      (Array.isArray(shops) ? shops : []).filter((s) => {
        const status = String((s as any)?.status || '').trim().toLowerCase();
        if (!status) return Boolean((s as any)?.id);
        return status === 'approved';
      }),
    [shops],
  );

  const offersByShopId = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const offer of Array.isArray(offers) ? offers : []) {
      const sid = String((offer as any)?.shopId || '').trim();
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, []);
      if ((map.get(sid) || []).length < 12) {
        map.get(sid)!.push(offer);
      }
    }
    return map;
  }, [offers]);

  if (loading) {
    return (
      <section className="mb-16 md:mb-24">
        <div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse mb-8" />
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-4 md:p-6">
              <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!approvedShops.length) return null;

  return (
    <section className="mb-16 md:mb-24" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">المتاجر المتاحة الآن</h2>
        </div>
      </div>

      <div className="space-y-5 md:space-y-7">
        {approvedShops.slice(0, 8).map((shop) => {
          const sid = String(shop.id);
          return (
            <StorefrontShopCard
              key={sid}
              shop={shop}
              shopOffers={offersByShopId.get(sid) || EMPTY_ARRAY}
              shopProducts={shopProductsById[sid] || EMPTY_ARRAY}
              onOpenShop={onOpenShop}
            />
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(StorefrontShowcaseSection);
