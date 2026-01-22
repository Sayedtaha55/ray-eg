
import React, { useEffect, useState } from 'react';
import { Search, MapPin, UtensilsCrossed, ChevronLeft, Star } from 'lucide-react';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { Skeleton } from '@/components/common/ui';

const { Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const isVideoUrl = (url: string) => {
  const u = String(url || '').toLowerCase();
  return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
};

const RestaurantsPage: React.FC = () => {
  const [governorate, setGovernorate] = useState('الكل');
  const [search, setSearch] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const PAGE_SIZE = 12;
    let mounted = true;
    let timer: any;

    const fetchFirstPage = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const data = await ApiService.getShops('approved', {
          take: PAGE_SIZE,
          skip: 0,
          category: Category.RESTAURANT,
          governorate: governorate === 'الكل' ? undefined : governorate,
          search: search.trim() ? search.trim() : undefined,
        });
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        setShops(list);
        setHasMore(list.length >= PAGE_SIZE);
      } catch {
        if (!mounted) return;
        setShops([]);
        setHasMore(false);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    timer = setTimeout(fetchFirstPage, 250);
    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [governorate, search]);

  const loadMore = async () => {
    const PAGE_SIZE = 12;
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = await ApiService.getShops('approved', {
        take: PAGE_SIZE,
        skip: shops.length,
        category: Category.RESTAURANT,
        governorate: governorate === 'الكل' ? undefined : governorate,
        search: search.trim() ? search.trim() : undefined,
      });
      const list = Array.isArray(next) ? next : [];
      setShops((prev) => [...prev, ...list]);
      setHasMore(list.length >= PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const restaurants = shops;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">عالم <span className="text-[#BD00FF]">المطاعم.</span></h1>
          <p className="text-slate-400 text-xl font-medium">أفضل تجارب الطعام والعروض الشهية بانتظارك.</p>
        </div>
        <div className="w-full md:w-96 relative">
           <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="ابحث عن مطعم أو وجبة..." 
             className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-14 pl-6 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all font-bold"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-16">
         {['الكل', 'القاهرة', 'الجيزة', 'الإسكندرية'].map(g => (
           <button 
             key={g}
             onClick={() => setGovernorate(g)}
             className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${governorate === g ? 'bg-[#BD00FF] text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
           >
             {g}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`restaurant-skel-${idx}`}
              className="group relative h-[400px] rounded-[3.5rem] overflow-hidden shadow-xl bg-white"
            >
              <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute top-8 left-8">
                <div className="glass px-6 py-2.5 rounded-full flex items-center gap-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>

              <div className="absolute bottom-10 right-10 left-10 flex items-end justify-between flex-row-reverse">
                <div className="text-right flex-1">
                  <div className="flex items-center gap-3 justify-end mb-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
                <Skeleton className="h-14 w-40 rounded-2xl" />
              </div>
            </div>
          ))
        ) : restaurants.length === 0 ? (
          <div className="text-slate-400 font-bold">لا توجد مطاعم حالياً</div>
        ) : (
          restaurants.map((shop, idx) => (
          <MotionDiv 
            key={shop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative h-[400px] rounded-[3.5rem] overflow-hidden shadow-xl"
          >
            {(() => {
              const bannerSrc = shop?.pageDesign?.bannerUrl || shop?.bannerUrl || shop?.banner_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200';
              const poster = shop?.pageDesign?.bannerPosterUrl;
              if (isVideoUrl(bannerSrc)) {
                return (
                  <video
                    src={bannerSrc}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={poster || undefined}
                  />
                );
              }
              return (
                <img
                  loading="lazy"
                  src={bannerSrc}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                  alt={shop.name}
                />
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-8 left-8">
               <div className="glass px-6 py-2.5 rounded-full flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-black font-black text-xs">{shop.rating}</span>
               </div>
            </div>

            <div className="absolute bottom-10 right-10 left-10 flex items-end justify-between flex-row-reverse">
              <div className="text-right">
                <div className="flex items-center gap-3 justify-end mb-2">
                   <img loading="lazy" src={shop.logoUrl || shop.logo_url || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=200'} className="w-10 h-10 rounded-xl border border-white/20" />
                   <h3 className="text-3xl font-black text-white">{shop.name}</h3>
                   <span className={`px-4 py-1.5 rounded-full text-[11px] font-black ${shop?.isActive === false ? 'bg-white/90 text-rose-600' : 'bg-white/90 text-emerald-600'}`}>
                     {shop?.isActive === false ? 'مقفول' : 'مفتوح'}
                   </span>
                </div>
                <p className="text-white/60 font-bold text-lg flex items-center gap-2 justify-end">
                   <MapPin className="w-4 h-4" /> {shop.city}, {shop.governorate}
                </p>
              </div>
              <Link 
                to={`/s/${shop.slug}`}
                className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl"
              >
                اطلب الآن
              </Link>
            </div>
          </MotionDiv>
          ))
        )}
      </div>

      {restaurants.length > 0 && hasMore && (
        <div className="mt-12 flex items-center justify-center">
          <button
            onClick={loadMore}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl"
            disabled={loadingMore}
          >
            <span>{loadingMore ? 'تحميل...' : 'تحميل المزيد'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
