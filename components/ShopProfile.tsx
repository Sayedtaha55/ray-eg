
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '../constants';
import { Shop, Product, ShopDesign } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Share2, Info, ChevronRight, X, 
  ArrowLeft, Plus, Check, Heart, Users, CalendarCheck, Eye 
} from 'lucide-react';
import ReservationModal from './ReservationModal';

const { useParams, Link, useNavigate } = ReactRouterDOM as any;
const MotionImg = motion.img as any;
const MotionDiv = motion.div as any;

const ProductCard: React.FC<{ 
  product: Product, 
  design: ShopDesign, 
  onAdd: (p: Product) => void,
  isAdded: boolean,
  onReserve: (p: Product) => void
}> = ({ product, design, onAdd, isAdded, onReserve }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isBold = design.layout === 'bold';
  const navigate = useNavigate();

  useEffect(() => {
    const favs = RayDB.getFavorites();
    setIsFavorite(favs.includes(product.id));
  }, [product.id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = RayDB.toggleFavorite(product.id);
    setIsFavorite(state);
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      className={`group relative bg-white transition-all duration-500 flex flex-col h-full ${
        isBold ? 'rounded-[2rem] border-2 p-3 md:p-5 shadow-xl' : 
        'rounded-[1.5rem] border border-slate-100 shadow-md p-0 hover:shadow-xl'
      }`}
      style={{ borderColor: isBold ? `${design.primaryColor}15` : undefined }}
    >
      <div 
        onClick={() => navigate(`/product/${product.id}`)}
        className={`aspect-[1/1] sm:aspect-[3/4] bg-slate-50 overflow-hidden relative cursor-pointer ${
          isBold ? 'rounded-[1.5rem]' : 'rounded-t-[1.4rem]'
        }`}
      >
        <img 
          src={product.imageUrl} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1s]" 
          alt={product.name} 
          loading="lazy"
        />
        
        {/* Mobile Quick Actions (always visible on touch or visible on hover) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 shadow-xl">
              <Eye size={20} />
           </div>
        </div>

        <button 
          onClick={toggleFav} 
          className={`absolute top-3 left-3 p-2.5 rounded-xl transition-all z-10 ${
            isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white/40 backdrop-blur-md text-white'
          }`}
        >
           <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4 md:p-6 flex flex-col flex-1 text-right">
        <h4 className={`font-black mb-2 line-clamp-2 leading-tight ${isBold ? 'text-lg md:text-2xl' : 'text-base md:text-lg'}`}>
          {product.name}
        </h4>
        <div className="mt-auto pt-4 flex flex-col gap-3">
          <span className="font-black text-xl md:text-2xl tracking-tighter" style={{ color: design.primaryColor }}>
            ج.م {product.price}
          </span>
          
          <div className="flex gap-2">
             <button 
               onClick={(e) => { e.stopPropagation(); onAdd(product); }}
               className={`flex-1 py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                 isAdded ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'
               }`}
             >
               {isAdded ? <Check size={16} /> : <Plus size={16} />}
               <span className="text-[11px] font-black uppercase tracking-wider">{isAdded ? 'بالسلة' : 'للسلة'}</span>
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onReserve(product); }}
               className="flex-1 py-3.5 bg-[#00E5FF] text-black rounded-2xl shadow-sm flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider active:scale-95"
             >
               <CalendarCheck size={16} /> حجز
             </button>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};

const ShopProfile: React.FC = () => {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [spatialMode, setSpatialMode] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [selectedProductForRes, setSelectedProductForRes] = useState<Product | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fix: Made syncData async to await RayDB promises
    const syncData = async () => {
      const shops = await RayDB.getShops();
      const currentShopData = (await RayDB.getShopBySlug(slug)) || shops[0];
      setShop(currentShopData);
      setProducts(await RayDB.getProducts());
    };
    syncData();
    
    // Fix: Refactored to handle initial increment safely
    const initVisit = async () => {
      const shops = await RayDB.getShops();
      const currentShopData = (await RayDB.getShopBySlug(slug)) || shops[0];
      if (currentShopData) {
        RayDB.incrementVisitors(currentShopData.id);
      }
    };
    initVisit();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('ray-db-update', syncData);
    return () => window.removeEventListener('ray-db-update', syncData);
  }, [slug]);

  const handleAddToCart = (product: Product) => {
    setAddedItemId(product.id);
    const event = new CustomEvent('add-to-cart', { 
      detail: { ...product, quantity: 1, shopId: shop?.id, shopName: shop?.name } 
    });
    window.dispatchEvent(event);
    setTimeout(() => setAddedItemId(null), 2000);
  };

  const handleFollow = () => {
    if (!shop || hasFollowed) return;
    RayDB.followShop(shop.id);
    setHasFollowed(true);
  };

  if (!shop) return null;
  const { pageDesign } = shop;

  return (
    <div className="min-h-screen bg-white text-right font-sans overflow-x-hidden" dir="rtl">
      {/* Back Button Overlay */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 right-6 z-[110] w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg md:hidden"
      >
        <ChevronRight size={24} />
      </button>

      {/* Banner */}
      <section className="relative h-[40vh] md:h-[75vh] w-full overflow-hidden bg-slate-900">
        <MotionImg 
          initial={{ scale: 1.1 }} 
          animate={{ scale: 1 }} 
          transition={{ duration: 15 }} 
          src={pageDesign.bannerUrl} 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
        <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
          <button 
            onClick={() => setSpatialMode(true)} 
            className="group w-full max-w-sm md:w-auto bg-white/95 backdrop-blur-md text-slate-900 px-8 md:px-12 py-4 md:py-5 rounded-[1.5rem] font-black text-sm md:text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl border border-white"
          >
            <Eye size={20} className="text-[#00E5FF]" /> استكشاف المتجر 3D
          </button>
        </div>
      </section>

      {/* Profile Info Section */}
      <div className="max-w-[1400px] mx-auto px-5 -mt-12 md:-mt-32 relative z-10 pb-24">
        <div className="flex flex-col items-center md:items-end md:flex-row-reverse gap-6 md:gap-12">
          {/* Logo Card */}
          <MotionDiv 
            initial={{ y: 40, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="rounded-[2.5rem] md:rounded-[4rem] bg-white p-1.5 shadow-2xl w-32 h-32 md:w-56 md:h-56 shrink-0 ring-1 ring-slate-100"
          >
            <img src={shop.logoUrl} className="w-full h-full object-cover rounded-[2rem] md:rounded-[3.5rem]" alt="logo" />
          </MotionDiv>
          
          <div className="flex-1 text-center md:text-right pt-4">
            <h1 
              className="text-4xl md:text-[5.5rem] font-black tracking-tighter mb-4 leading-[1.1]" 
              style={{ color: pageDesign.primaryColor }}
            >
              {shop.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-slate-900 font-black text-sm">{shop.rating}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                 <Users className="w-4 h-4 text-slate-400" />
                 <span className="text-slate-900 font-black text-sm">{shop.followers.toLocaleString()} متابع</span>
              </div>
            </div>
            
            <button 
              onClick={handleFollow}
              disabled={hasFollowed}
              className={`w-full max-w-xs md:w-auto px-10 py-4.5 rounded-[1.8rem] text-white font-black text-lg md:text-xl shadow-xl transition-all active:scale-95 ${
                hasFollowed ? 'bg-green-500' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: !hasFollowed ? pageDesign.primaryColor : undefined }}
            >
              {hasFollowed ? 'تمت المتابعة' : 'متابعة المتجر'}
            </button>
          </div>
        </div>

        {/* Categories / Filter placeholder */}
        <div className="mt-20 flex gap-3 overflow-x-auto no-scrollbar pb-2">
           {['الكل', 'وصل حديثاً', 'الأكثر مبيعاً', 'تخفيضات'].map((cat, i) => (
             <button key={cat} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all border ${i === 0 ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}>
                {cat}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        <section className="mt-12 md:mt-20">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-2xl md:text-5xl font-black tracking-tight">المجموعة الجديدة</h2>
             <span className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">{products.length} منتج</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
            {products.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                design={pageDesign} 
                onAdd={handleAddToCart} 
                isAdded={addedItemId === p.id} 
                onReserve={setSelectedProductForRes}
              />
            ))}
          </div>
        </section>
      </div>

      <ReservationModal 
        isOpen={!!selectedProductForRes} 
        onClose={() => setSelectedProductForRes(null)} 
        item={selectedProductForRes ? {
          id: selectedProductForRes.id,
          name: selectedProductForRes.name,
          image: selectedProductForRes.imageUrl,
          price: selectedProductForRes.price,
          shopId: shop.id,
          shopName: shop.name
        } : null}
      />

      {/* Spatial Overlay */}
      <AnimatePresence>
        {spatialMode && (
          <MotionDiv 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 text-center text-white"
          >
             <div className="w-16 h-16 border-4 rounded-full border-white/10 border-t-[#00E5FF] animate-spin mb-10" />
             <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">جاري تهيئة التجربة المكانية...</h2>
             <p className="text-slate-400 font-bold max-w-sm mx-auto mb-12">قريباً ستتمكن من التجول داخل المتجر واختيار المنتجات بشكل تفاعلي بالكامل.</p>
             <button 
              onClick={() => setSpatialMode(false)} 
              className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all border border-white/10"
             >
              إغلاق
             </button>
             <button onClick={() => setSpatialMode(false)} className="absolute top-10 left-10 p-3 hover:bg-white/10 rounded-full">
               <X size={32} />
             </button>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopProfile;
