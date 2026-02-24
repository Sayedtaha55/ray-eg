import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, CalendarCheck, ShoppingCart } from 'lucide-react';

const MotionDiv = motion.div as any;

interface OfferCardProps {
  offer: any;
  idx: number;
  navigate: (url: string) => void;
  setSelectedItem: (item: any) => void;
  playSound: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, idx, navigate, setSelectedItem, playSound }) => {
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = () => {
    const productId = String(offer.productId || offer.id || '').trim();
    const shopSlug = String(offer.shopSlug || '').trim();
    if (productId && shopSlug) {
      navigate(`/shop/${shopSlug}/product/${productId}?from=offers`);
      return;
    }
    navigate(`/product/${productId || offer.id}`);
  };

  const handleAddToCart = () => {
    playSound();
    const event = new CustomEvent('add-to-cart', {
      detail: {
        ...offer,
        id: offer.productId || offer.id,
        productId: offer.productId,
        shopId: offer.shopId,
        shopName: offer.shopName,
        name: offer.title,
        price: offer.newPrice,
        quantity: 1,
        __skipSound: true,
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <MotionDiv 
      initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      className="group bg-white p-3 md:p-5 rounded-[2rem] md:rounded-[3rem] border border-slate-50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      <div 
        onClick={handleNavigate}
        className="relative aspect-[4/5] rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden mb-4 md:mb-6 bg-slate-50 cursor-pointer"
      >
        <img
          loading={idx === 0 ? 'eager' : 'lazy'}
          fetchPriority={idx === 0 ? 'high' : 'auto'}
          decoding="async"
          src={offer.imageUrl}
          alt={offer.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
        />
        <div className="absolute top-3 left-3 md:top-5 md:left-5 bg-[#BD00FF] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-purple-500/30">-{offer.discount}%</div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <Eye size={24} className="text-white drop-shadow-lg sm:w-8 sm:h-8" />
        </div>
      </div>
      <div className="px-1 md:px-3 text-right">
        <h3 className="text-sm md:text-xl lg:text-2xl font-black mb-3 md:mb-6 line-clamp-1 leading-tight">{offer.title}</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:flex-row-reverse">
           <div className="text-right">
              <p className="text-slate-300 line-through text-[9px] md:text-xs font-bold">ج.م {offer.oldPrice}</p>
              <p className="text-base md:text-2xl lg:text-3xl font-black text-[#BD00FF] tracking-tighter">ج.م {offer.newPrice}</p>
           </div>
           <div className="flex items-center justify-between gap-2 sm:justify-start">
              <button
                type="button"
                aria-label="حجز"
                onClick={() => setSelectedItem(offer)}
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[#00E5FF] rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md"
              >
                <CalendarCheck size={16} className="md:w-5 md:h-5" />
              </button>
              <button 
                type="button"
                aria-label="إضافة للسلة"
                onClick={handleAddToCart}
                className="w-8 h-8 md:w-10 md:h-12 bg-slate-900 text-white rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-md"
              >
                <ShoppingCart size={18} className="md:w-5 md:h-5" />
              </button>
           </div>
        </div>
      </div>
    </MotionDiv>
  );
};

export default React.memo(OfferCard);
