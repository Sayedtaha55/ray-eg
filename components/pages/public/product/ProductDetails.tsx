import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, ShoppingCart, CalendarCheck, MessageCircle, Store, ShieldCheck, Truck, Package } from 'lucide-react';

const MotionDiv = motion.div as any;

interface ProductDetailsProps {
  product: any;
  shop: any;
  offer: any;
  isFavorite: boolean;
  toggleFavorite: () => void;
  handleShare: () => void;
  handleAddToCart: () => void;
  setIsResModalOpen: (val: boolean) => void;
  displayedPrice: number;
  hasDiscount: boolean;
  isRestaurant: boolean;
  isFashion: boolean;
  hasPacks: boolean;
  packDefs: any[];
  selectedPackId: string;
  setSelectedPackId: (id: string) => void;
  menuVariantsDef: any[];
  selectedMenuTypeId: string;
  setSelectedMenuTypeId: (id: string) => void;
  selectedMenuSizeId: string;
  setSelectedMenuSizeId: (id: string) => void;
  fashionColors: any[];
  selectedFashionColorValue: string;
  setSelectedFashionColorValue: (val: string) => void;
  fashionSizes: any[];
  selectedFashionSize: string;
  setSelectedFashionSize: (val: string) => void;
  selectedAddons: any[];
  setSelectedAddons: (val: any) => void;
  addonsDef: any[];
  whatsappHref: string;
  primaryColor: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = (props) => {
  const { product, shop, offer, isFavorite, toggleFavorite, handleShare, handleAddToCart, setIsResModalOpen, displayedPrice, hasDiscount, isRestaurant, isFashion, hasPacks, packDefs, selectedPackId, setSelectedPackId, menuVariantsDef, selectedMenuTypeId, setSelectedMenuTypeId, selectedMenuSizeId, setSelectedMenuSizeId, fashionColors, selectedFashionColorValue, setSelectedFashionColorValue, fashionSizes, selectedFashionSize, setSelectedFashionSize, selectedAddons, setSelectedAddons, addonsDef, whatsappHref, primaryColor } = props;

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-8 md:gap-10"
    >
      <header className="space-y-4">
        <div className="flex items-start justify-between flex-row-reverse">
          <div className="flex-1 text-right">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 justify-end text-slate-400 font-bold text-sm">
              <Store size={16} />
              <span>{shop.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all">
              <Share2 size={20} />
            </button>
            <button onClick={toggleFavorite} className={`p-3 rounded-2xl transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
              <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-4 justify-end flex-row-reverse">
          <span className="text-4xl font-black text-[#BD00FF]">ج.م {displayedPrice}</span>
          {hasDiscount && (
            <span className="text-xl font-bold text-slate-300 line-through">ج.م {offer.oldPrice || product.price}</span>
          )}
        </div>
      </header>

      {/* Options Selection */}
      <div className="space-y-8">
        {hasPacks && (
          <div className="space-y-4">
            <p className="font-black text-slate-900">اختر الباقة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packDefs.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPackId(p.id)}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${selectedPackId === p.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <p className="font-black text-sm">{p.label || p.name}</p>
                  <p className="font-bold text-[#00E5FF] text-xs mt-1">ج.م {p.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isFashion && (
          <>
            {fashionColors.length > 0 && (
              <div className="space-y-4 text-right">
                <p className="font-black text-slate-900">اللون المختار</p>
                <div className="flex flex-wrap gap-3 justify-end">
                  {fashionColors.map((c: any) => (
                    <button
                      key={c.value}
                      onClick={() => setSelectedFashionColorValue(c.value)}
                      className={`group relative w-12 h-12 rounded-full ring-2 ring-offset-4 transition-all ${selectedFashionColorValue === c.value ? 'ring-slate-900 scale-110 shadow-lg' : 'ring-transparent opacity-60'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}
            {fashionSizes.length > 0 && (
              <div className="space-y-4 text-right">
                <p className="font-black text-slate-900">المقاس</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {fashionSizes.map((s: any) => (
                    <button
                      key={s.label}
                      onClick={() => setSelectedFashionSize(s.label)}
                      className={`px-6 py-3 rounded-xl border-2 font-black transition-all ${selectedFashionSize === s.label ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Addons Selection */}
        {addonsDef.length > 0 && (
          <div className="space-y-6 text-right">
            <p className="font-black text-slate-900 text-lg">الإضافات المتاحة</p>
            <div className="space-y-4">
              {addonsDef.map((group: any) => (
                <div key={group.id} className="space-y-3">
                  {group.title && group.title !== 'addons' && (
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{group.title}</p>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    {group.options?.map((opt: any) => (
                      <div key={opt.id} className="p-4 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse gap-4">
                        <div className="flex items-center gap-4 flex-row-reverse">
                          {opt.imageUrl && (
                            <img src={opt.imageUrl} alt={opt.name} className="w-12 h-12 rounded-2xl object-cover bg-white" />
                          )}
                          <div className="text-right">
                            <p className="font-black text-slate-900">{opt.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-start">
                          {opt.variants?.map((v: any) => {
                            const isSelected = selectedAddons.some((a: any) => a.optionId === opt.id && a.variantId === v.id);
                            return (
                              <button
                                key={v.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedAddons((prev: any[]) => prev.filter((a: any) => !(a.optionId === opt.id && a.variantId === v.id)));
                                  } else {
                                    setSelectedAddons((prev: any[]) => [...prev.filter((a: any) => a.optionId !== opt.id), { optionId: opt.id, variantId: v.id }]);
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${isSelected ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'}`}
                              >
                                {v.label} (+{v.price} ج)
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-auto pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl"
          >
            <ShoppingCart size={24} /> إضافة للسلة
          </button>
          <button
            onClick={() => setIsResModalOpen(true)}
            className="flex-1 bg-[#00E5FF] text-slate-900 h-16 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl"
          >
            <CalendarCheck size={24} /> حجز الآن
          </button>
        </div>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white h-16 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl"
          >
            <MessageCircle size={24} /> تواصل عبر واتساب
          </a>
        )}
      </div>
    </MotionDiv>
  );
};

export default React.memo(ProductDetails);
