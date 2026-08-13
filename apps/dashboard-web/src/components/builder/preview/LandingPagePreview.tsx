'use client';

import React, { useState } from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import {
  getUnifiedColors,
  getButtonColors,
} from '@/lib/builder/colorSystem';
import {
  ArrowRight, ShoppingCart, Check, Truck, ShieldCheck, Package,
  Star, Zap, Flame, Gift, Clock, MessageCircle, ChevronDown,
  Plus, Minus, Share2, Heart, Eye, Home as HomeIcon, Image as ImageIcon,
} from 'lucide-react';

interface LandingPagePreviewProps {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  shop?: {
    name?: string;
    logoUrl?: string;
  };
}

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

export default function LandingPagePreview({ config, previewMode, shop = {} }: LandingPagePreviewProps) {
  const colors = getUnifiedColors(config);
  const buttonColors = getButtonColors(config);
  
  const landing = (config.landingPage || {}) as Record<string, any>;
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const primaryColor = config.primaryColor || colors.primary;
  const ctaColor = landing.ctaColor || primaryColor;
  const ctaTextColor = landing.ctaTextColor || '#FFFFFF';
  const finalCtaBg = landing.finalCtaBg || '#0F172A';
  const pageBgColor = config.pageBackgroundColor || config.backgroundColor || colors.background;

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

  const ctaText = landing.ctaText || 'أضف للسلة';
  const reserveText = landing.reserveText || 'احجز الآن';
  const finalCtaText = landing.finalCtaText || 'احصل عليه الآن';
  const ctaStyle = landing.ctaStyle || 'solid';
  const imageShape = landing.imageShape || 'rounded';
  const landingTheme = landing.landingTheme || 'classic';

  const containerStyle = {
    width: previewMode === 'desktop' ? '100%' : 
           previewMode === 'tablet' ? '768px' : '375px',
    height: '100%',
    backgroundColor: pageBgColor,
    fontFamily: config.typography?.fontFamily?.body || 'Inter',
    direction: 'rtl' as const,
    overflowY: 'auto' as const,
  };

  const imageRadius = imageShape === 'sharp' ? 'rounded-none' : imageShape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  const previewProduct = {
    name: 'منتج تجريبي - اسم المنتج هنا',
    description: 'هذا وصف تجريبي للمنتج. يمكنك تعديل تفاصيل المنتج من قسم المنتجات. المنتج عالي الجودة ومصنوع من أفضل الخامات.',
    price: 299,
    oldPrice: 399,
    category: 'منتجات',
    imageUrl: '',
  };

  const discountPct = previewProduct.oldPrice > previewProduct.price
    ? Math.round((1 - previewProduct.price / previewProduct.oldPrice) * 100)
    : 0;

  return (
    <div style={containerStyle} className="transition-all duration-300">
      {/* Top Bar */}
      {sections.stickyBar !== false && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
          <div className="px-4 h-14 flex items-center justify-between">
            <button className="flex items-center gap-2 text-slate-600 font-black text-sm">
              <ArrowRight size={16} /> رجوع
            </button>
            <div className="flex items-center gap-2">
              {shop.logoUrl && (
                <img src={shop.logoUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
              )}
              <span className="font-black text-xs text-slate-900">{shop.name || 'المتجر'}</span>
            </div>
            <div className="relative">
              <ShoppingCart size={18} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">0</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {sections.hero !== false && (
        <div className="pb-6 md:pb-10">
          {landingTheme === 'banner' ? (
            <div className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden bg-white border-b border-slate-100">
              {previewProduct.imageUrl ? (
                <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <Package size={64} className="text-slate-300" />
                </div>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className={`aspect-square ${imageRadius} overflow-hidden bg-white border border-slate-100`}>
                  {previewProduct.imageUrl ? (
                    <img src={previewProduct.imageUrl} alt={previewProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <Package size={64} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="order-1 md:order-2 text-right space-y-4">
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black">
                  {previewProduct.category}
                </span>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900">
                  {previewProduct.name}
                </h1>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
                  {previewProduct.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black" style={{ color: primaryColor }}>
                      {previewProduct.price} ج.م
                    </span>
                    {previewProduct.oldPrice > previewProduct.price && (
                      <span className="text-lg text-slate-400 line-through font-bold">
                        {previewProduct.oldPrice} ج.م
                      </span>
                    )}
                  </div>
                  {discountPct > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-black">
                      خصم {discountPct}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-black text-lg w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  className="w-full h-14 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
                  style={{ backgroundColor: ctaColor, color: ctaTextColor }}
                >
                  <ShoppingCart size={20} />
                  {ctaText}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      {sections.features !== false && selectedFeatures.length > 0 && (
        <div className="px-4 md:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedFeatures.map((feature) => {
              const featureData = FEATURE_ICONS_MAP[feature];
              const Icon = featureData?.icon || Zap;
              return (
                <div key={feature} className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Icon size={24} style={{ color: primaryColor }} />
                  </div>
                  <h3 className="font-black text-sm mb-1">{featureData?.label || ''}</h3>
                  <p className="text-xs text-slate-500 font-bold">{featureData?.desc || ''}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description Section */}
      {sections.description !== false && (
        <div className="px-4 md:px-12 py-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-black mb-4">تفاصيل المنتج</h2>
            <p className="text-sm text-slate-600 font-bold leading-relaxed">
              {previewProduct.description}
            </p>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {sections.gallery !== false && (
        <div className="px-4 md:px-12 py-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 text-center">معرض الصور</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`aspect-square ${imageRadius} overflow-hidden bg-slate-100 border border-slate-200`}>
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {sections.faq !== false && (
        <div className="px-4 md:px-12 py-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 text-center">الأسئلة الشائعة</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-right font-bold text-sm"
                >
                  {item.q}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${openFaqIdx === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqIdx === idx && (
                  <div className="px-6 pb-4 text-xs text-slate-600 font-bold">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {sections.reviews !== false && (
        <div className="px-4 md:px-12 py-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 text-center">التقييمات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="font-black text-slate-500">ع</span>
                  </div>
                  <div>
                    <p className="font-black text-sm">عميل {i}</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} className={star <= 4 ? 'fill-yellow-400' : 'text-slate-300'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-bold">
                  منتج رائع جداً وجودة عالية. أنصح الجميع بالشراء.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specs Section */}
      {sections.specs !== false && selectedBadges.length > 0 && (
        <div className="px-4 md:px-12 py-8">
          <h2 className="text-xl md:text-2xl font-black mb-6 text-center">لماذا نحن؟</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {selectedBadges.map((badge) => {
              const badgeData = TRUST_BADGES_MAP[badge];
              const Icon = badgeData?.icon || Check;
              return (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200">
                  <Icon size={18} style={{ color: primaryColor }} />
                  <span className="font-black text-sm">{badgeData?.label || ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Section */}
      {sections.cta !== false && (
        <div className="px-4 md:px-12 py-8">
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: finalCtaBg, color: 'white' }}>
            <h2 className="text-2xl md:text-3xl font-black mb-4">{finalCtaText}</h2>
            <p className="text-sm opacity-80 mb-6 font-bold">
              احصل على هذا المنتج الآن مع خصم خاص لفترة محدودة
            </p>
            <button
              className="px-8 py-4 rounded-2xl font-black text-white inline-flex items-center gap-3 transition-all hover:scale-105"
              style={{ backgroundColor: ctaColor }}
            >
              <ShoppingCart size={20} />
              {ctaText}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Padding for Mobile Bottom Nav */}
      <div className="h-20" />
    </div>
  );
}