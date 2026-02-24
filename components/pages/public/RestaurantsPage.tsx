
import React, { useEffect, useState } from 'react';
import { Search, MapPin, UtensilsCrossed, ChevronLeft, Star } from 'lucide-react';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { getOptimizedImageUrl } from '@/lib/image-utils';
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

  const [visibleIdx, setVisibleIdx] = useState(6);
  useEffect(() => {
    const handleScroll = () => {
      if (visibleIdx >= restaurants.length) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleIdx(prev => Math.min(restaurants.length, prev + 6));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [restaurants.length, visibleIdx]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-12 text-right" dir="rtl">
      <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
        <div className="text-center md:text-right">
          <h1 className="text-2xl md:text-4xl lg:text-7xl font-black tracking-tighter mb-3 md:mb-4">عالم <span className="text-[#BD00FF]">المطاعم.</span></h1>
          <p className="text-slate-400 text-sm md:text-lg md:text-xl font-medium">أفضل تجارب الطعام والعروض الشهية بانتظارك.</p>
        </div>
        <div className="w-full md:w-96 relative">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="ابحث عن مطعم أو وجبة..." 
             className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-14 pl-6 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all font-bold text-sm md:text-base"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-16">
         {['الكل', 'القاهرة', 'الجيزة', 'الإسكندرية'].map(g => (
           <button 
             key={g}
             onClick={() => setGovernorate(g)}
             className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-black text-sm md:text-base whitespace-nowrap transition-all ${
               governorate === g 
                 ? 'bg-slate-900 text-white shadow-xl' 
                 : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
             }`}
           >
             {g}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
          <div
            key={shop.id}
            className={`cv-auto group relative h-[400px] rounded-[3.5rem] overflow-hidden shadow-xl transition-all duration-700 ${
              idx < visibleIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
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
                  src={getOptimizedImageUrl(bannerSrc, 'md')}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                  alt={shop.name}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (bannerSrc && img.src !== bannerSrc) img.src = bannerSrc;
                  }}
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

            <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 left-6 md:left-10 flex items-end justify-between flex-row-reverse">
              <div className="text-right flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 justify-end mb-2">
                   <img
                     loading="lazy"
                     src={getOptimizedImageUrl(shop.logoUrl || shop.logo_url, 'thumb') || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=200'}
                     className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-white/20"
                     alt={shop.name}
                     onError={(e) => {
                        const img = e.currentTarget;
                        const original = shop.logoUrl || shop.logo_url;
                        if (original && img.src !== original) img.src = original;
                     }}
                   />
                   <h3 className="text-xl md:text-3xl font-black text-white truncate">{shop.name}</h3>
                   <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black shrink-0 ${shop?.isActive === false ? 'bg-white/90 text-rose-600' : 'bg-white/90 text-emerald-600'}`}>
                     {shop?.isActive === false ? 'مقفول' : 'مفتوح'}
                   </span>
                </div>
                <p className="text-white/60 font-bold text-sm md:text-lg flex items-center gap-2 justify-end truncate">
                   <MapPin className="w-3 h-3 md:w-4 md:h-4" /> {shop.city}, {shop.governorate}
                </p>
              </div>
              <Link 
                to={`/s/${shop.slug}`}
                className="bg-white text-black px-6 py-2 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl"
              >
                اطلب الآن
              </Link>
            </div>
          </div>
          ))
        )}
      </div>

      {restaurants.length > 0 && hasMore && (
        <div className="mt-8 md:mt-12 flex items-center justify-center">
          <button
            onClick={loadMore}
            className="px-8 py-3 md:px-10 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-60"
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
