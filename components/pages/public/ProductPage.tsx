
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '@/constants';
import { Product, Offer, Shop } from '@/types';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, CalendarCheck, ArrowRight, Heart, 
  Share2, ShieldCheck, Truck, Package, Store, Loader2, AlertCircle, Home
} from 'lucide-react';
import ReservationModal from '../shared/ReservationModal';
import { Skeleton } from '@/components/common/ui';
import { ApiService } from '@/services/api.service';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Array<{ optionId: string; variantId: string }>>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        if (!id) {
          setError(true);
          return;
        }

        setSelectedAddons([]);

        let p: any = null;
        try {
          p = await ApiService.getProductById(String(id));
        } catch {
          p = null;
        }

        let o: any = null;
        if (p?.id) {
          setProduct(p);

          const shopId = (p as any).shopId || (p as any).shop_id;
          const [offerRes, shopRes] = await Promise.allSettled([
            ApiService.getOfferByProductId(String(p.id)),
            shopId ? ApiService.getShopBySlugOrId(String(shopId)) : Promise.resolve(null),
          ]);

          if (offerRes.status === 'fulfilled') {
            o = offerRes.value;
            if (o) setOffer(o);
          }

          if (shopRes.status === 'fulfilled') {
            const s = shopRes.value as any;
            if (s) {
              setShop(s);
              if ((s as any)?.id) {
                ApiService.incrementVisitors(String((s as any).id)).catch(() => {});
              }
            }
          }

          const favs = RayDB.getFavorites();
          setIsFavorite(favs.includes(String(p.id)));
          return;
        }

        // Fallback: treat id as offerId
        const found = await ApiService.getOfferById(String(id));
        if (found) {
          setOffer(found as any);

          const productId = (found as any)?.productId;
          let prodResolved: any = null;
          if (productId) {
            try {
              prodResolved = await ApiService.getProductById(String(productId));
            } catch {
              prodResolved = null;
            }
          }
          if (prodResolved?.id) {
            setProduct(prodResolved);
            const favs = RayDB.getFavorites();
            setIsFavorite(favs.includes(String(prodResolved.id)));
          } else {
            setError(true);
          }

          const shopId = (found as any)?.shopId;
          if (shopId) {
            try {
              const s = await ApiService.getShopBySlugOrId(String(shopId));
              setShop(s);
              if (s?.id) {
                await ApiService.incrementVisitors(String(s.id));
              }
            } catch {
            }
          }
        } else {
          setError(true);
        }
      } catch (err) {
        // Error loading product - handled silently
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const toggleFavorite = () => {
    if (product) {
      const state = RayDB.toggleFavorite(product.id);
      setIsFavorite(state);
      // Notify other components that favorites changed
      window.dispatchEvent(new Event('ray-db-update'));
      
      // Show toast notification
      const message = state ? 'تمت إضافة المنتج للمفضلة! ❤️' : 'تم حذف المنتج من المفضلة';
      // Simple notification (you can replace with a proper toast system)
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm animate-pulse';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const addonsTotal = (() => {
      const addonsDef = Array.isArray((product as any)?.addons) ? (product as any).addons : [];
      const priceByKey = new Map<string, number>();
      const labelByKey = new Map<string, string>();
      const optionNameById = new Map<string, string>();
      const optionImageById = new Map<string, string>();
      for (const g of addonsDef || []) {
        const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
        for (const opt of options) {
          const optId = String(opt?.id || '').trim();
          if (!optId) continue;
          optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
          if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
            optionImageById.set(optId, String(opt.imageUrl).trim());
          }
          const vars = Array.isArray(opt?.variants) ? opt.variants : [];
          for (const v of vars) {
            const vid = String(v?.id || '').trim();
            if (!vid) continue;
            const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
            priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
            labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
          }
        }
      }
      return (selectedAddons || []).reduce((sum, a) => sum + (priceByKey.get(`${a.optionId}:${a.variantId}`) || 0), 0);
    })();

    const normalizedAddons = (() => {
      const addonsDef = Array.isArray((product as any)?.addons) ? (product as any).addons : [];
      const priceByKey = new Map<string, number>();
      const labelByKey = new Map<string, string>();
      const optionNameById = new Map<string, string>();
      const optionImageById = new Map<string, string>();
      for (const g of addonsDef || []) {
        const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
        for (const opt of options) {
          const optId = String(opt?.id || '').trim();
          if (!optId) continue;
          optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
          if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
            optionImageById.set(optId, String(opt.imageUrl).trim());
          }
          const vars = Array.isArray(opt?.variants) ? opt.variants : [];
          for (const v of vars) {
            const vid = String(v?.id || '').trim();
            if (!vid) continue;
            const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
            priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
            labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
          }
        }
      }

      return (selectedAddons || []).map((a) => {
        const key = `${a.optionId}:${a.variantId}`;
        return {
          optionId: a.optionId,
          optionName: optionNameById.get(a.optionId) || a.optionId,
          optionImage: optionImageById.get(a.optionId) || null,
          variantId: a.variantId,
          variantLabel: labelByKey.get(key) || a.variantId,
          price: priceByKey.get(key) || 0,
        };
      });
    })();

    const unitPrice = (Number(offer ? offer.newPrice : product.price) || 0) + (Number(addonsTotal) || 0);
    const event = new CustomEvent('add-to-cart', { 
      detail: { 
        ...product, 
        price: unitPrice,
        quantity: 1, 
        shopId: shop?.id, 
        shopName: shop?.name,
        addons: normalizedAddons,
      } 
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
            <div className="lg:col-span-6">
              <Skeleton className="w-full aspect-[4/5] rounded-[2.5rem]" />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex items-center gap-3 justify-end">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-black mb-4">عفواً، المنتج غير متاح</h2>
        <p className="text-slate-500 font-bold mb-8">ربما تم حذفه أو أن الرابط غير صحيح.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2"
        >
          <Home size={18} /> العودة للرئيسية
        </button>
      </div>
    );
  }

  const currentPrice = offer ? offer.newPrice : product.price;
  const addonsDef = Array.isArray((product as any)?.addons) ? (product as any).addons : [];
  const addonsTotal = (() => {
    const priceByKey = new Map<string, number>();
    for (const g of addonsDef || []) {
      const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
      for (const opt of options) {
        const optId = String(opt?.id || '').trim();
        if (!optId) continue;
        const vars = Array.isArray(opt?.variants) ? opt.variants : [];
        for (const v of vars) {
          const vid = String(v?.id || '').trim();
          if (!vid) continue;
          const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
        }
      }
    }
    return (selectedAddons || []).reduce((sum, a) => sum + (priceByKey.get(`${a.optionId}:${a.variantId}`) || 0), 0);
  })();
  const unitPrice = (Number(currentPrice) || 0) + (Number(addonsTotal) || 0);
  const hasDiscount = !!offer;
  const isRestaurant = shop?.category === Category.RESTAURANT;
  const trackStock = typeof (product as any)?.trackStock === 'boolean'
    ? (product as any).trackStock
    : (typeof (product as any)?.track_stock === 'boolean' ? (product as any).track_stock : true);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20 text-right font-sans" dir="rtl">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 font-black mb-12 hover:text-black transition-all"
      >
        <ArrowRight size={20} /> العودة للسابق
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        {/* Left: Image Gallery */}
        <MotionDiv 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl"
        >
          <img loading="lazy" src={product.imageUrl || (product as any).image_url} className="w-full h-full object-cover" alt={product.name} />
          {hasDiscount && (
            <div className="absolute top-10 left-10 bg-[#BD00FF] text-white px-8 py-3 rounded-2xl font-black text-xl shadow-2xl">
              -{offer?.discount}%
            </div>
          )}
          <button 
            onClick={toggleFavorite}
            className={`absolute top-10 right-10 p-5 rounded-3xl backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/40 text-slate-900 hover:bg-white'}`}
          >
            <Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </MotionDiv>

        {/* Right: Info */}
        <MotionDiv 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
             {shop && (
               <Link to={`/shop/${shop.slug}`} className="inline-flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-full border border-slate-100 group">
                  <img src={shop.logoUrl || (shop as any).logo_url} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-black text-slate-900 group-hover:text-[#00E5FF] transition-colors">{shop.name}</span>
               </Link>
             )}
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">{product.name}</h1>
             <div className="flex items-center gap-6">
                <span className="text-4xl md:text-6xl font-black text-[#00E5FF] tracking-tighter">ج.م {unitPrice}</span>
                {hasDiscount && (
                  <span className="text-2xl md:text-3xl text-slate-300 line-through font-bold">ج.م {product.price}</span>
                )}
             </div>
          </div>

          <div className="space-y-6">
             {isRestaurant && Array.isArray(addonsDef) && addonsDef.length > 0 && (
               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black">منتجات إضافية</h3>
                   <span className="text-xs font-black text-slate-400">اختياري</span>
                 </div>

                 <div className="space-y-6">
                   {(addonsDef as any[]).map((group, gi) => (
                     <div key={String(group?.id || gi)} className="space-y-4">
                       {group?.title ? <p className="text-xs font-black text-slate-500">{String(group.title)}</p> : null}
                       <div className="space-y-3">
                         {(Array.isArray(group?.options) ? group.options : []).map((opt: any) => {
                           const optId = String(opt?.id || '').trim();
                           if (!optId) return null;
                           const currentVariantId = selectedAddons.find((a) => a.optionId === optId)?.variantId || '';
                           const variants = Array.isArray(opt?.variants) ? opt.variants : [];
                           return (
                             <div key={optId} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                               {opt?.imageUrl && (
                                 <img src={String(opt.imageUrl)} className="w-12 h-12 rounded-xl object-cover" alt={String(opt?.name || '')} />
                               )}
                               <div className="flex-1">
                                 <p className="font-black text-sm text-slate-900">{String(opt?.name || 'إضافة')}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">اختر الحجم</p>
                               </div>
                               <select
                                 value={currentVariantId}
                                 onChange={(e) => {
                                   const v = String(e.target.value || '');
                                   setSelectedAddons((prev) => {
                                     const next = Array.isArray(prev) ? [...prev] : [];
                                     const idx = next.findIndex((x) => x.optionId === optId);
                                     if (!v) {
                                       if (idx >= 0) next.splice(idx, 1);
                                       return next;
                                     }
                                     if (idx >= 0) next[idx] = { optionId: optId, variantId: v };
                                     else next.push({ optionId: optId, variantId: v });
                                     return next;
                                   });
                                 }}
                                 className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-black"
                               >
                                 <option value="">بدون</option>
                                 {variants.map((v: any, idx: number) => {
                                   const vid = String(v?.id || idx).trim();
                                   const label = String(v?.label || v?.name || '').trim() || 'اختيار';
                                   const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
                                   return (
                                     <option key={vid} value={vid}>
                                       {label} (+{Number.isFinite(p) ? p : 0} ج.م)
                                     </option>
                                   );
                                 })}
                               </select>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#BD00FF] shadow-sm">
                   <Package size={24} />
                </div>
                <div>
                   <p className="font-black text-slate-900">حالة المخزون</p>
                   <p className="text-sm text-slate-400 font-bold">
                     {!trackStock ? 'متوفر' : (product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية')}
                   </p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                  <ShoppingCart size={28} /> أضف للسلة
                </button>
                <button 
                  onClick={() => setIsResModalOpen(true)}
                  className="flex-1 py-6 bg-[#00E5FF] text-black rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4"
                >
                  <CalendarCheck size={28} /> حجز العرض
                </button>
             </div>

             {shop && (
               <button
                 onClick={() => navigate(`/shop/${shop.slug}`)}
                 className="w-full py-5 bg-slate-50 text-slate-900 rounded-[2.5rem] font-black text-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100"
               >
                 <Store size={22} /> {isRestaurant ? 'زيارة المطعم' : 'زيارة المحل'}
               </button>
             )}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-12 border-t border-slate-100">
             <div className="flex items-center gap-4">
                <Truck className="text-slate-300" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">توصيل سريع</p>
                   <p className="font-bold text-sm">خلال ٢٤-٤٨ ساعة</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <ShieldCheck className="text-slate-300" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">ضمان MNMKNK</p>
                   <p className="font-bold text-sm">منتج أصلي ١٠٠٪</p>
                </div>
             </div>
          </div>
        </MotionDiv>
      </div>

      <ReservationModal 
        isOpen={isResModalOpen} 
        onClose={() => setIsResModalOpen(false)} 
        item={{
          id: product.id,
          name: product.name,
          image: product.imageUrl || (product as any).image_url,
          price: unitPrice,
          shopId: shop?.id || 's1',
          shopName: shop?.name || 'MNMKNK',
          addons: (() => {
            const addonsDef = Array.isArray((product as any)?.addons) ? (product as any).addons : [];
            const priceByKey = new Map<string, number>();
            const labelByKey = new Map<string, string>();
            const optionNameById = new Map<string, string>();
            const optionImageById = new Map<string, string>();
            for (const g of addonsDef || []) {
              const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
              for (const opt of options) {
                const optId = String(opt?.id || '').trim();
                if (!optId) continue;
                optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
                if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
                  optionImageById.set(optId, String(opt.imageUrl).trim());
                }
                const vars = Array.isArray(opt?.variants) ? opt.variants : [];
                for (const v of vars) {
                  const vid = String(v?.id || '').trim();
                  if (!vid) continue;
                  const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
                  priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
                  labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
                }
              }
            }
            return (selectedAddons || []).map((a) => {
              const key = `${a.optionId}:${a.variantId}`;
              return {
                optionId: a.optionId,
                optionName: optionNameById.get(a.optionId) || a.optionId,
                optionImage: optionImageById.get(a.optionId) || null,
                variantId: a.variantId,
                variantLabel: labelByKey.get(key) || a.variantId,
                price: priceByKey.get(key) || 0,
              };
            });
          })(),
        }}
      />
    </div>
  );
};

export default ProductPage;
