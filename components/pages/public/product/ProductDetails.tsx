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
  showAddToCartButton?: boolean;
  showReserveButton?: boolean;
  showPrice?: boolean;
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
  const { product, shop, offer, isFavorite, toggleFavorite, handleShare, handleAddToCart, showAddToCartButton, showReserveButton, showPrice, setIsResModalOpen, displayedPrice, hasDiscount, isRestaurant, isFashion, hasPacks, packDefs, selectedPackId, setSelectedPackId, menuVariantsDef, selectedMenuTypeId, setSelectedMenuTypeId, selectedMenuSizeId, setSelectedMenuSizeId, fashionColors, selectedFashionColorValue, setSelectedFashionColorValue, fashionSizes, selectedFashionSize, setSelectedFashionSize, selectedAddons, setSelectedAddons, addonsDef, whatsappHref, primaryColor } = props;

  const canShowAddToCart = typeof showAddToCartButton === 'boolean' ? showAddToCartButton : true;
  const canShowReserve = typeof showReserveButton === 'boolean' ? showReserveButton : true;
  const canShowPrice = typeof showPrice === 'boolean' ? showPrice : true;
  const selectedMenuType = isRestaurant
    ? (Array.isArray(menuVariantsDef) ? menuVariantsDef : []).find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim())
    : null;
  const selectedMenuSizes = isRestaurant && selectedMenuType && Array.isArray((selectedMenuType as any)?.sizes)
    ? (selectedMenuType as any).sizes
    : [];

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

        {canShowPrice ? (
          <div className="flex items-baseline gap-4 justify-end flex-row-reverse">
            <span className="text-4xl font-black text-[#BD00FF]">ج.م {displayedPrice}</span>
            {hasDiscount && (
              <span className="text-xl font-bold text-slate-300 line-through">ج.م {offer.oldPrice || product.price}</span>
            )}
          </div>
        ) : null}
      </header>

      {/* Options Selection */}
      <div className="space-y-8">
        {isRestaurant && Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0 && (
          <div className="space-y-4" dir="rtl">
            <div className="text-right">
              <p className="font-black text-slate-900">الأحجام</p>
              <p className="text-xs font-bold text-slate-400 mt-1">اختر النوع ثم الحجم</p>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">النوع</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(menuVariantsDef as any[]).map((t: any) => {
                  const tid = String(t?.id || t?.typeId || t?.variantId || '').trim();
                  if (!tid) return null;
                  const tname = String(t?.name || t?.label || '').trim() || tid;
                  const isSelected = String(selectedMenuTypeId || '').trim() === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => setSelectedMenuTypeId(tid)}
                      className={`p-4 rounded-2xl border-2 text-right transition-all ${isSelected ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <p className="font-black text-sm text-slate-900">{tname}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الحجم</div>
              <div className="flex flex-wrap gap-2 justify-end">
                {(selectedMenuSizes as any[]).map((s: any) => {
                  const sid = String(s?.id || s?.sizeId || '').trim();
                  if (!sid) return null;
                  const label = String(s?.label || s?.name || '').trim() || sid;
                  const priceRaw = typeof s?.price === 'number' ? s.price : Number(s?.price || NaN);
                  const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : NaN;
                  const isSelected = String(selectedMenuSizeId || '').trim() === sid;
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setSelectedMenuSizeId(sid)}
                      className={`px-5 py-3 rounded-xl border-2 font-black text-sm transition-all ${isSelected ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      {label}{Number.isFinite(price) ? ` (ج.م ${price})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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

        {isRestaurant && addonsDef.length > 0 && (
          <div className="space-y-4">
            <p className="font-black text-slate-900">الإضافات</p>
            <div className="space-y-4">
              {(addonsDef || []).map((g: any) => {
                const groupId = String(g?.id || '').trim() || 'addons';
                const groupTitle = String(g?.title || g?.name || g?.label || '').trim();
                const options = Array.isArray(g?.options) ? g.options : [];
                if (options.length === 0) return null;

                return (
                  <div key={groupId} className="space-y-3">
                    {groupTitle ? (
                      <div className="text-xs font-black text-slate-500">{groupTitle}</div>
                    ) : null}

                    <div className="space-y-3">
                      {options.map((opt: any) => {
                        const optId = String(opt?.id || '').trim();
                        if (!optId) return null;
                        const optName = String(opt?.name || opt?.title || '').trim() || optId;
                        const img = typeof opt?.imageUrl === 'string' ? String(opt.imageUrl).trim() : '';
                        const variants = Array.isArray(opt?.variants) ? opt.variants : [];
                        if (variants.length === 0) return null;

                        const selectedVariantId = (selectedAddons || []).find((x: any) => String(x?.optionId) === optId)?.variantId;

                        return (
                          <div key={optId} className="p-4 rounded-2xl border-2 border-slate-100 bg-white">
                            <div className="flex items-center gap-3 flex-row-reverse justify-between">
                              <div className="flex items-center gap-3 flex-row-reverse">
                                {img ? (
                                  <img src={img} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                                ) : null}
                                <div className="text-right">
                                  <div className="font-black text-sm text-slate-900">{optName}</div>
                                  <div className="text-[10px] font-bold text-slate-400">اختر الحجم</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end mt-3">
                              {variants.map((v: any) => {
                                const vid = String(v?.id || '').trim();
                                if (!vid) return null;
                                const vLabel = String(v?.label || v?.name || '').trim() || vid;
                                const vPrice = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
                                const isSelected = String(selectedVariantId || '') === vid;

                                return (
                                  <button
                                    key={vid}
                                    type="button"
                                    onClick={() => {
                                      const arr = Array.isArray(selectedAddons) ? selectedAddons : [];
                                      const next = arr.filter((x: any) => String(x?.optionId) !== optId);
                                      if (isSelected) {
                                        setSelectedAddons(next);
                                        return;
                                      }
                                      setSelectedAddons([...next, { optionId: optId, variantId: vid }]);
                                    }}
                                    className={`px-4 py-2 rounded-xl border-2 font-black text-xs transition-all ${isSelected ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                  >
                                    {vLabel}{Number.isFinite(vPrice) && vPrice > 0 ? ` (+${vPrice})` : ''}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-auto pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {canShowAddToCart ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-slate-900 text-white h-16 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl"
            >
              <ShoppingCart size={24} /> إضافة للسلة
            </button>
          ) : null}
          {canShowReserve ? (
            <button
              onClick={() => setIsResModalOpen(true)}
              className="flex-1 bg-[#00E5FF] text-slate-900 h-16 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl"
            >
              <CalendarCheck size={24} /> حجز الآن
            </button>
          ) : null}
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
