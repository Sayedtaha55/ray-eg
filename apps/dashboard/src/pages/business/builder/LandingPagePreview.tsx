import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, ShoppingCart, Check, Truck, ShieldCheck, Package,
  Star, Zap, Flame, Gift, Clock, MessageCircle, ChevronDown,
  Plus, Minus, Share2, Heart, Eye, Home as HomeIcon,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = {
  config: any;
  shop: any;
  logoDataUrl: string;
  isMobilePreview?: boolean;
};

const FEATURE_ICONS_MAP: Record<string, any> = {
  quality: { icon: Zap, label: 'جودة عالية', desc: 'منتج مصنوع من أفضل الخامات ليدوم معك طويلاً' },
  bestseller: { icon: Flame, label: 'الأكثر مبيعاً', desc: 'منتج رائج ومرغوب من عملاء كثيرين' },
  offer: { icon: Gift, label: 'عرض خاص', desc: 'سعر مميز لفترة محدودة - لا تفوت الفرصة' },
  delivery: { icon: Truck, label: 'توصيل سريع', desc: 'توصيل لجميع المناطق في أسرع وقت' },
  warranty: { icon: ShieldCheck, label: 'ضمان الجودة', desc: 'منتج أصلي 100% مع ضمان' },
  packaging: { icon: Package, label: 'تغليف آمن', desc: 'تغليف محكم يضمن وصول المنتج بأفضل حال' },
  fast24: { icon: Clock, label: 'توصيل خلال 24 ساعة', desc: 'توصيل سريع خلال 24 ساعة' },
  rating: { icon: Star, label: 'تقييم عالي', desc: 'تقييم 4.8 من 5 من آلاف العملاء' },
};

const TRUST_BADGES_MAP: Record<string, any> = {
  truck: { icon: Truck, label: 'توصيل سريع' },
  shield: { icon: ShieldCheck, label: 'ضمان الجودة' },
  package: { icon: Package, label: 'تغليف آمن' },
};

const LandingPagePreview: React.FC<Props> = ({ config, shop, logoDataUrl, isMobilePreview }) => {
  const landing = (config?.landingPage || {}) as Record<string, any>;
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [realProduct, setRealProduct] = useState<any>(null);

  // Fetch a real product from the shop for preview
  useEffect(() => {
    const shopId = shop?.id;
    if (!shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const products = await ApiService.getProducts(String(shopId), { limit: 1 });
        if (!cancelled && Array.isArray(products) && products.length > 0) {
          setRealProduct(products[0]);
        }
      } catch {
        // keep using mock product
      }
    })();
    return () => { cancelled = true; };
  }, [shop?.id]);

  const primaryColor = String(config?.primaryColor || '#00E5FF').trim();
  const ctaColor = String(landing.ctaColor || primaryColor).trim();
  const ctaTextColor = String(landing.ctaTextColor || '#FFFFFF').trim();
  const finalCtaBg = String(landing.finalCtaBg || '#0F172A').trim();
  const pageBgColor = String(config?.pageBackgroundColor || config?.backgroundColor || '#FFFFFF').trim();

  const sections = landing.sections || {
    hero: true, features: true, description: true, gallery: true,
    faq: true, reviews: true, specs: true, cta: true, stickyBar: true,
  };

  const selectedFeatures: string[] = landing.selectedFeatures || ['quality', 'bestseller', 'offer'];
  const selectedBadges: string[] = landing.selectedBadges || ['truck', 'shield', 'package'];
  const faqItems: { q: string; a: string }[] = landing.faqItems || [
    { q: 'هل التوصيل متاح؟', a: 'نعم، نوصل لجميع المناطق. وقت التوصيل من 1-3 أيام.' },
    { q: 'هل يمكنني الإرجاع؟', a: 'نعم، يمكنك إرجاع المنتج خلال 14 يوم.' },
    { q: 'كيف أتواصل؟', a: 'يمكنك مراسلتنا عبر واتساب.' },
  ];

  const ctaText = String(landing.ctaText || 'أضف للسلة');
  const reserveText = String(landing.reserveText || 'احجز الآن');
  const finalCtaText = String(landing.finalCtaText || 'احصل عليه الآن');
  const ctaStyle = String(landing.ctaStyle || 'solid');
  const imageShape = String(landing.imageShape || 'rounded');
  const landingTheme = String(landing.landingTheme || 'classic').trim();
  const isBannerTheme = landingTheme === 'banner';

  const showQuantity = landing.showQuantity !== false;
  const showDiscountBadge = landing.showDiscountBadge !== false;
  const showRating = landing.showRating !== false;
  const showFavorite = landing.showFavorite !== false;
  const showShare = landing.showShare !== false;
  const showWhatsapp = landing.showWhatsapp !== false;

  const shopName = shop?.name || 'اسم المتجر';
  const shopLogo = logoDataUrl || shop?.logoUrl || '';

  const previewProduct = useMemo(() => {
    if (realProduct) {
      const extras = Array.isArray((realProduct as any)?.images) ? (realProduct as any).images : [];
      const main = String((realProduct as any)?.imageUrl || (realProduct as any)?.image_url || '').trim();
      const images = [main, ...extras].map((u) => String(u || '').trim()).filter(Boolean);
      return {
        name: String(realProduct.name || 'منتج'),
        description: String(realProduct.description || ''),
        price: Number(realProduct.price) || 0,
        oldPrice: 0,
        category: String(realProduct.category || 'منتجات'),
        images,
        imageUrl: main,
      };
    }
    return {
      name: 'منتج تجريبي - اسم المنتج هنا',
      description: 'هذا وصف تجريبي للمنتج. يمكنك تعديل تفاصيل المنتج من قسم المنتجات. المنتج عالي الجودة ومصنوع من أفضل الخامات.',
      price: 299,
      oldPrice: 399,
      category: 'منتجات',
      images: [] as string[],
      imageUrl: '',
    };
  }, [realProduct]);

  const discountPct = previewProduct.oldPrice > previewProduct.price
    ? Math.round((1 - previewProduct.price / previewProduct.oldPrice) * 100)
    : 0;

  const imageRadius = imageShape === 'sharp' ? 'rounded-none' : imageShape === 'circle' ? 'rounded-full' : 'rounded-[2rem] md:rounded-[3rem]';

  const ctaButtonClass = React.useMemo(() => {
    const base = 'w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]';
    if (ctaStyle === 'gradient') return `${base} text-[${ctaTextColor}]`;
    if (ctaStyle === 'outline') return `${base} border-2`;
    return `${base} text-[${ctaTextColor}]`;
  }, [ctaStyle, ctaTextColor]);

  const ctaButtonStyle = React.useMemo(() => {
    if (ctaStyle === 'gradient') {
      return { background: `linear-gradient(135deg, ${ctaColor}, ${primaryColor})`, color: ctaTextColor };
    }
    if (ctaStyle === 'outline') {
      return { borderColor: ctaColor, color: ctaColor, backgroundColor: 'transparent' };
    }
    return { backgroundColor: ctaColor, color: ctaTextColor };
  }, [ctaStyle, ctaColor, primaryColor, ctaTextColor]);

  return (
    <div className="min-h-full bg-slate-50" dir="rtl" style={{ backgroundColor: pageBgColor }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <button className="flex items-center gap-2 text-slate-600 font-black text-sm">
            <ArrowRight size={16} /> رجوع
          </button>
          <div className="flex items-center gap-2">
            {shopLogo && <img src={shopLogo} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />}
            <span className="font-black text-xs text-slate-900">{shopName}</span>
          </div>
          <div className="relative">
            <ShoppingCart size={18} className="text-slate-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">0</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {sections.hero !== false && isBannerTheme && (
        <div className="pb-6 md:pb-10">
          <div className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-white border-b border-slate-100">
            {previewProduct.imageUrl ? (
              <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Package size={64} className="text-slate-300" />
              </div>
            )}
            {showDiscountBadge && discountPct > 0 && (
              <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-2xl font-black text-base shadow-xl">
                -{discountPct}%
              </div>
            )}
            {showFavorite && (
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                  <Heart size={18} className="text-slate-600" />
                </div>
                {showShare && (
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                    <Share2 size={18} className="text-slate-600" />
                  </div>
                )}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pt-16 pb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-black mb-2">
                {previewProduct.category}
              </span>
              <h1 className="text-xl md:text-4xl font-black text-white leading-tight">
                {previewProduct.name}
              </h1>
            </div>
          </div>

          <div className="px-4 pt-6 md:pt-8 max-w-[700px] mx-auto space-y-4 text-center">
            {showRating && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-500">(4.0)</span>
              </div>
            )}
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-2xl md:text-4xl font-black" style={{ color: primaryColor }}>
                ج.م {previewProduct.price}
              </span>
              {discountPct > 0 && (
                <span className="text-lg font-bold text-slate-300 line-through">
                  ج.م {previewProduct.oldPrice}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              {previewProduct.description}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Check size={16} className="text-emerald-500" />
              <span className="text-xs font-black text-emerald-600">متوفر في المخزون</span>
            </div>

            {showQuantity && (
              <div className="flex items-center justify-center gap-3">
                <span className="font-black text-xs text-slate-700">الكمية</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"><Minus size={14} /></button>
                  <span className="w-8 text-center font-black text-base">{quantity}</span>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"><Plus size={14} /></button>
                </div>
              </div>
            )}

            <button className={ctaButtonClass} style={ctaButtonStyle}>
              <ShoppingCart size={20} /> {ctaText} - ج.م {previewProduct.price * quantity}
            </button>

            <button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg">
              <Clock size={18} /> {reserveText}
            </button>

            {showWhatsapp && (
              <div className="w-full h-12 rounded-2xl bg-[#25D366] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                <MessageCircle size={18} /> تواصل عبر واتساب
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2">
              {selectedBadges.map((key) => {
                const badge = TRUST_BADGES_MAP[key];
                if (!badge) return null;
                const Icon = badge.icon;
                return (
                  <div key={key} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100">
                    <Icon size={18} className="text-slate-700" />
                    <span className="text-[9px] font-black text-slate-600 text-center">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {sections.hero !== false && !isBannerTheme && (
        <div className="px-4 py-6 md:py-10">
          <div className={`grid grid-cols-1 ${isMobilePreview ? '' : 'lg:grid-cols-2'} gap-6 md:gap-12 items-start`}>
            {/* Image */}
            <div className="space-y-3">
              <div className={`relative aspect-square ${imageRadius} overflow-hidden bg-white border border-slate-100 shadow-2xl`}>
                {previewProduct.imageUrl ? (
                  <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <Package size={48} className="text-slate-300" />
                  </div>
                )}
                {showDiscountBadge && discountPct > 0 && (
                  <div className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1.5 rounded-xl font-black text-sm shadow-xl">
                    -{discountPct}%
                  </div>
                )}
                {showFavorite && (
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                      <Heart size={16} className="text-slate-600" />
                    </div>
                    {showShare && (
                      <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                        <Share2 size={16} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black">
                {previewProduct.category}
              </span>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                {previewProduct.name}
              </h1>
              {showRating && (
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="flex gap-1 flex-row-reverse">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-500">(4.0)</span>
                </div>
              )}
              <div className="flex items-baseline gap-3 flex-row-reverse">
                <span className="text-2xl md:text-4xl font-black" style={{ color: primaryColor }}>
                  ج.م {previewProduct.price}
                </span>
                {discountPct > 0 && (
                  <span className="text-lg font-bold text-slate-300 line-through">
                    ج.م {previewProduct.oldPrice}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-600 leading-relaxed line-clamp-2">
                {previewProduct.description}
              </p>
              <div className="flex items-center gap-2 flex-row-reverse">
                <Check size={16} className="text-emerald-500" />
                <span className="text-xs font-black text-emerald-600">متوفر في المخزون</span>
              </div>

              {showQuantity && (
                <div className="flex items-center gap-3 flex-row-reverse">
                  <span className="font-black text-xs text-slate-700">الكمية</span>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"><Minus size={14} /></button>
                    <span className="w-8 text-center font-black text-base">{quantity}</span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"><Plus size={14} /></button>
                  </div>
                </div>
              )}

              <button className={ctaButtonClass} style={ctaButtonStyle}>
                <ShoppingCart size={20} /> {ctaText} - ج.م {previewProduct.price * quantity}
              </button>

              <button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                <Clock size={18} /> {reserveText}
              </button>

              {showWhatsapp && (
                <div className="w-full h-12 rounded-2xl bg-[#25D366] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                  <MessageCircle size={18} /> تواصل عبر واتساب
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {selectedBadges.map((key) => {
                  const badge = TRUST_BADGES_MAP[key];
                  if (!badge) return null;
                  const Icon = badge.icon;
                  return (
                    <div key={key} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100">
                      <Icon size={18} className="text-slate-700" />
                      <span className="text-[9px] font-black text-slate-600 text-center">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      {sections.features !== false && selectedFeatures.length > 0 && (
        <div className="bg-white border-y border-slate-100 py-8 md:py-12">
          <div className="px-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 text-center mb-6">لماذا تختار هذا المنتج؟</h2>
            <div className={`grid grid-cols-1 ${isMobilePreview ? '' : 'md:grid-cols-3'} gap-4`}>
              {selectedFeatures.slice(0, 3).map((key) => {
                const feature = FEATURE_ICONS_MAP[key];
                if (!feature) return null;
                const Icon = feature.icon;
                return (
                  <div key={key} className="flex flex-col items-center gap-3 text-center p-5 rounded-2xl bg-slate-50">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <Icon size={24} style={{ color: primaryColor }} />
                    </div>
                    <h3 className="font-black text-base text-slate-900">{feature.label}</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      {sections.description !== false && (
        <div className="py-8 md:py-12">
          <div className="max-w-[800px] mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 text-center">تفاصيل المنتج</h2>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-8 shadow-sm">
              <p className="text-xs md:text-sm font-bold text-slate-600 leading-loose whitespace-pre-line">
                {previewProduct.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {sections.reviews !== false && (
        <div className="bg-white border-y border-slate-100 py-8 md:py-12">
          <div className="px-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 text-center mb-6">آراء العملاء</h2>
            <div className={`grid grid-cols-1 ${isMobilePreview ? '' : 'md:grid-cols-3'} gap-4`}>
              {[
                { name: 'أحمد م.', text: 'منتج ممتاز وجودة عالية!', stars: 5 },
                { name: 'سارة ع.', text: 'سعر رائع مقابل الجودة', stars: 4 },
                { name: 'محمد ك.', text: 'التوصيل كان سريع جداً', stars: 5 },
              ].map((review, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                      {review.name.charAt(0)}
                    </div>
                    <span className="font-black text-sm text-slate-900">{review.name}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2 flex-row-reverse">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} className={s <= review.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Specs */}
      {sections.specs !== false && (
        <div className="py-8 md:py-12">
          <div className="max-w-[800px] mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 text-center">المواصفات</h2>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {[
                { label: 'الماركة', value: 'منتج أصلي' },
                { label: 'الضمان', value: '12 شهر' },
                { label: 'الوزن', value: '1.5 كجم' },
                { label: 'المقاس', value: 'متوسط' },
              ].map((spec, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 ${idx > 0 ? 'border-t border-slate-50' : ''}`}>
                  <span className="font-black text-xs text-slate-700">{spec.label}</span>
                  <span className="font-bold text-xs text-slate-500">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {sections.faq !== false && (
        <div className="py-8 md:py-12">
          <div className="max-w-[700px] mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 text-center">الأسئلة الشائعة</h2>
            <div className="space-y-2">
              {faqItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-right"
                  >
                    <span className="font-black text-xs text-slate-900">{item.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${openFaqIdx === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIdx === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-xs font-bold text-slate-500 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      {sections.cta !== false && (
        <div className="py-12 md:py-16" style={{ backgroundColor: finalCtaBg }}>
          <div className="max-w-[700px] mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">{finalCtaText}</h2>
            <p className="text-slate-400 font-bold text-sm md:text-base mb-6">
              {previewProduct.name} - ج.م {previewProduct.price}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="h-14 px-8 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-2xl" style={ctaButtonStyle}>
                <ShoppingCart size={22} /> {ctaText}
              </button>
              {showWhatsapp && (
                <div className="h-14 px-8 rounded-2xl bg-[#25D366] text-white font-black text-base flex items-center justify-center gap-2 shadow-xl">
                  <MessageCircle size={22} /> واتساب
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-950 py-6">
        <div className="px-4 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2">
            {shopLogo && <img src={shopLogo} alt="" className="w-7 h-7 rounded-full object-cover" />}
            <span className="font-black text-xs text-white">{shopName}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">زيارة المتجر ←</span>
        </div>
      </div>

      {/* Sticky bar (mobile) */}
      {sections.stickyBar !== false && (
        <div className="bg-white border-t border-slate-200 shadow-2xl">
          <div className="flex items-center justify-between p-2.5 gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs text-slate-900 truncate">{previewProduct.name}</p>
              <p className="font-black text-xs" style={{ color: primaryColor }}>ج.م {previewProduct.price}</p>
            </div>
            <button className="h-10 px-5 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0" style={ctaButtonStyle}>
              <ShoppingCart size={16} /> {ctaText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(LandingPagePreview);
