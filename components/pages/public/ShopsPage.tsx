
import React, { useEffect, useState } from 'react';
import { Search, MapPin, Store, ChevronLeft } from 'lucide-react';
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

const ShopsPage: React.FC = () => {
  const [governorate, setGovernorate] = useState('الكل');
  const [search, setSearch] = useState('');

  const [shopsList, setShopsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const PAGE_SIZE = 18;
    let mounted = true;
    let timer: any;

    const fetchFirstPage = async () => {
      setLoading(true);
      setHasMore(true);
      try {
        const data = await ApiService.getShops('approved', {
          take: PAGE_SIZE,
          skip: 0,
          category: Category.RETAIL,
          governorate: governorate === 'الكل' ? undefined : governorate,
          search: search.trim() ? search.trim() : undefined,
        });
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        setShopsList(list);
        setHasMore(list.length >= PAGE_SIZE);
      } catch {
        if (!mounted) return;
        setShopsList([]);
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
    const PAGE_SIZE = 18;
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = await ApiService.getShops('approved', {
        take: PAGE_SIZE,
        skip: shopsList.length,
        category: Category.RETAIL,
        governorate: governorate === 'الكل' ? undefined : governorate,
        search: search.trim() ? search.trim() : undefined,
      });
      const list = Array.isArray(next) ? next : [];
      setShopsList((prev) => [...prev, ...list]);
      setHasMore(list.length >= PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const shops = shopsList;

  // Simple in-view state for reveal
  const [visibleIdx, setVisibleIdx] = useState<number>(6);
  useEffect(() => {
    const handleScroll = () => {
      if (visibleIdx >= shops.length) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleIdx(prev => Math.min(shops.length, prev + 6));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shops.length, visibleIdx]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-12 text-right" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:gap-8 mb-8 md:mb-16">
        <div className="text-center md:text-right">
          <h1 className="text-2xl md:text-4xl lg:text-7xl font-black tracking-tighter mb-3 md:mb-4 leading-tight">اكتشف <span className="text-[#00E5FF]">المحلات.</span></h1>
          <p className="text-slate-400 text-sm md:text-lg md:text-xl font-medium">أفضل متاجر الملابس والإلكترونيات في منطقتك.</p>
        </div>
        <div className="w-full md:w-96 relative">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="ابحث عن محل..." 
             className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-14 pl-6 outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all font-bold text-sm md:text-base"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* Filter Bar - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-3 mb-6 md:mb-10 pb-2">
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

      {/* Shops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`shop-skel-${idx}`}
              className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] flex flex-col gap-6 md:gap-8"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <Skeleton className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-row-reverse justify-end mb-2">
                    <Skeleton className="h-5 md:h-6 w-44" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>

              <Skeleton className="relative aspect-video rounded-2xl" />
              <Skeleton className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl" />
            </div>
          ))
        ) : shops.length === 0 ? (
          <div className="text-slate-400 font-bold">لا توجد محلات حالياً</div>
        ) : (
          shops.map((shop, idx) => (
          <div
            key={shop.id}
            className={`cv-auto group bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] hover:shadow-2xl transition-all duration-700 flex flex-col gap-6 md:gap-8 ${
              idx < visibleIdx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                <img
                  loading="lazy"
                  src={getOptimizedImageUrl(shop.logoUrl || shop.logo_url, 'thumb') || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=200'}
                  className="w-full h-full object-cover"
                  alt={shop.name}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const original = shop.logoUrl || shop.logo_url;
                    if (original && img.src !== original) img.src = original;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-row-reverse justify-end mb-1">
                  <h3 className="text-lg md:text-xl font-black truncate">{shop.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black shrink-0 ${shop?.isActive === false ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {shop?.isActive === false ? 'مقفول' : 'مفتوح'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs md:text-sm font-bold flex items-center gap-1 truncate">
                  <MapPin size={12} /> {shop.city}
                </p>
              </div>
            </div>
            
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50">
               {(() => {
                 const bannerSrc = shop?.pageDesign?.bannerUrl || shop?.bannerUrl || shop?.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200';
                 const poster = shop?.pageDesign?.bannerPosterUrl;
                 if (isVideoUrl(bannerSrc)) {
                   return (
                     <video
                       src={bannerSrc}
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     alt={`${shop.name} banner`}
                     onError={(e) => {
                       const img = e.currentTarget;
                       if (bannerSrc && img.src !== bannerSrc) img.src = bannerSrc;
                     }}
                   />
                 );
               })()}
               <div className="absolute inset-0 bg-black/10" />
            </div>

            <Link 
              to={`/s/${shop.slug}`}
              className="w-full py-3 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 group-hover:bg-[#00E5FF] group-hover:text-black transition-all"
            >
              زيارة المتجر <ChevronLeft size={16} />
            </Link>
          </div>
          ))
        )}
      </div>

      {shops.length > 0 && hasMore && (
        <div className="mt-8 md:mt-16 flex items-center justify-center">
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

export default ShopsPage;
