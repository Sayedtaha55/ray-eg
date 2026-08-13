'use client';

import React, { useState } from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import {
  getUnifiedColors,
  getButtonColors,
} from '@/lib/builder/colorSystem';
import {
  ArrowRight, ShoppingCart, Heart, Share2, Star, Plus, Minus, Truck, ShieldCheck, Package, Check, MessageCircle
} from 'lucide-react';

interface ProductPagePreviewProps {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  shop?: {
    name?: string;
  };
}

export default function ProductPagePreview({ config, previewMode, shop = {} }: ProductPagePreviewProps) {
  const colors = getUnifiedColors(config);
  const buttonColors = getButtonColors(config);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  const primaryColor = config.primaryColor || colors.primary;
  const pageBgColor = config.pageBackgroundColor || config.backgroundColor || colors.background;
  const pageBgImage = config.backgroundImageUrl || '';

  const containerStyle = {
    width: previewMode === 'desktop' ? '100%' : 
           previewMode === 'tablet' ? '768px' : '375px',
    height: '100%',
    backgroundColor: pageBgColor,
    backgroundImage: pageBgImage ? `url("${pageBgImage}")` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: config.typography?.fontFamily?.body || 'Inter',
    direction: 'rtl' as const,
    overflowY: 'auto' as const,
  };

  const product = {
    id: 'preview-product',
    name: 'منتج تجريبي - اسم المنتج هنا',
    description: 'هذا وصف تجريبي للمنتج. يمكنك تعديل تفاصيل المنتج من قسم المنتجات. المنتج عالي الجودة ومصنوع من أفضل الخامات.',
    price: 299,
    oldPrice: 399,
    category: 'منتجات',
    stock: 8,
    rating: 4.8,
    reviews: 124,
    images: [] as string[],
  };

  const galleryImages = product.images.length > 0 ? product.images : [''];

  const discountPct = product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div style={containerStyle} className="transition-all duration-300 relative">
      {/* Background Image Overlay */}
      {pageBgImage && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30" style={{ backgroundColor: pageBgColor }} />
      )}

      <div className="relative z-10 px-4 md:px-8 py-8 md:py-12 pb-28 md:pb-12">
        {/* Back Button */}
        <button className="flex items-center gap-2 text-slate-400 font-black mb-8 hover:text-black transition-all">
          <ArrowRight size={20} /> رجوع
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Product Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              {galleryImages[activeImageIdx] ? (
                <img src={galleryImages[activeImageIdx]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                  <Package size={64} className="text-slate-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIdx === idx ? 'border-cyan-500' : 'border-slate-100'
                  }`}
                >
                  {galleryImages[idx] ? (
                    <img src={galleryImages[idx]} alt={`${idx}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <Package size={24} className="text-slate-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-black">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-600">
                  {product.rating} ({product.reviews} تقييم)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black" style={{ color: primaryColor }}>
                  {product.price} ج.م
                </span>
                {product.oldPrice > product.price && (
                  <span className="text-xl text-slate-400 line-through font-bold">
                    {product.oldPrice} ج.م
                  </span>
                )}
              </div>
              {discountPct > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm font-black">
                  خصم {discountPct}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 font-bold leading-relaxed">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-bold text-slate-600">
                متوفر ({product.stock} قطعة)
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-black text-sm">الكمية:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 transition-all"
                >
                  <Minus size={20} />
                </button>
                <span className="font-black text-xl w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                className="flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingCart size={20} />
                أضف للسلة
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
              >
                <Heart size={20} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
              </button>
              <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                <Share2 size={20} className="text-slate-400" />
              </button>
            </div>

            {/* WhatsApp Button */}
            <button className="w-full h-14 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl bg-green-500 hover:bg-green-600">
              <MessageCircle size={20} />
              تواصل عبر واتساب
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl mb-2 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <Truck size={20} style={{ color: primaryColor }} />
                </div>
                <p className="text-xs font-bold text-slate-600">توصيل سريع</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl mb-2 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <ShieldCheck size={20} style={{ color: primaryColor }} />
                </div>
                <p className="text-xs font-bold text-slate-600">ضمان الجودة</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl mb-2 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <Package size={20} style={{ color: primaryColor }} />
                </div>
                <p className="text-xs font-bold text-slate-600">تغليف آمن</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-20">
          <div className="border-b border-slate-200 mb-6">
            <div className="flex gap-8">
              {[
                { id: 'details' as const, label: 'الوصف' },
                { id: 'specs' as const, label: 'المواصفات' },
                { id: 'shipping' as const, label: 'الشحن' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 font-black text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-cyan-500 text-cyan-500'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100">
            {activeTab === 'details' && (
              <div>
                <h3 className="font-black text-lg mb-4">وصف المنتج</h3>
                <p className="text-sm text-slate-600 font-bold leading-relaxed">
                  {product.description}
                </p>
                <p className="text-sm text-slate-600 font-bold leading-relaxed mt-4">
                  هذا المنتج مصنوع من أفضل الخامات لضمان الجودة والأداء العالي. مناسب للاستخدام اليومي ومصمم ليدوم طويلاً.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="font-black text-lg mb-4">المواصفات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-600">النوع</span>
                    <span className="font-black">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-600">المادة</span>
                    <span className="font-black">عالي الجودة</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-600">الضمان</span>
                    <span className="font-black">سنة واحدة</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-slate-600">المنشأ</span>
                    <span className="font-black">محلي</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <h3 className="font-black text-lg mb-4">معلومات الشحن</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck size={20} className="mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-black text-sm">توصيل سريع</p>
                      <p className="text-xs text-slate-600 font-bold mt-1">توصيل لجميع المناطق خلال 1-3 أيام عمل</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-black text-sm">ضمان الجودة</p>
                      <p className="text-xs text-slate-600 font-bold mt-1">منتج أصلي 100% مع ضمان لمدة سنة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package size={20} className="mt-1" style={{ color: primaryColor }} />
                    <div>
                      <p className="font-black text-sm">تغليف آمن</p>
                      <p className="text-xs text-slate-600 font-bold mt-1">تغليف محكم يضمن وصول المنتج بأفضل حال</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Padding for Mobile Bottom Nav */}
      <div className="h-20" />
    </div>
  );
}