'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/i18n/useT';

type Props = {
  config: any;
  shop: any;
};

const ProductPagePreview: React.FC<Props> = ({ config, shop }) => {
  const t = useT();
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    id: 'preview-product',
    name: t('business.builder.productPagePreview.productName', 'منتج تجريبي'),
    description: t('business.builder.productPagePreview.productDescription', 'وصف المنتج التجريبي'),
    price: 249,
    imageUrl: '',
    images: [] as string[],
    category: t('business.builder.shopPreview.categories.general', 'عام'),
    stock: 8,
  };

  const primaryColor = String(config?.primaryColor || '').trim() || '#00E5FF';
  const pageBgColor = String(config?.pageBackgroundColor || config?.backgroundColor || '#FFFFFF');
  const pageBgImage = String(config?.backgroundImageUrl || '').trim();
  const displayedPrice = 249;

  const tabItems: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'details', label: t('business.builder.productPagePreview.tabs.details', 'التفاصيل') },
    { id: 'specs', label: t('business.builder.productPagePreview.tabs.specs', 'المواصفات') },
    { id: 'shipping', label: t('business.builder.productPagePreview.tabs.shipping', 'التوصيل') },
  ];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: pageBgColor }} dir="rtl">
      {pageBgImage ? (
        <Image src={pageBgImage} alt="" fill className="fixed inset-0 z-0 pointer-events-none object-cover opacity-50" sizes="100vw" />
      ) : null}

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 pb-28 md:pb-12 text-right font-sans">
        <button className="flex items-center gap-2 text-slate-400 font-black mb-12 hover:text-black transition-all">
          <ArrowRight size={20} /> {t('business.builder.productPagePreview.goBack', 'رجوع')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200">
              {activeImageSrc ? (
                <Image src={activeImageSrc} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <div className="text-center">
                    <div className="text-6xl font-black">{t('business.builder.productPagePreview.noImage', 'صورة')}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(product.images.length > 0 ? product.images : ['']).map((img: string, idx: number) => (
                <button key={idx} type="button" onClick={() => img && setActiveImageSrc(img)} className={`flex-shrink-0 w-20 h-20 rounded-2xl border overflow-hidden ${activeImageSrc === img ? 'border-slate-900 ring-2 ring-offset-2' : 'border-slate-200'}`}>
                  {img ? <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" /> : <div className="w-full h-full bg-slate-50" />}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{product.category}</div>
              <h1 className="mt-2 text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-black" style={{ color: primaryColor }}>{t('business.pos.egpShort', 'ج.م')} {displayedPrice}</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={() => setIsFavorite(!isFavorite)} className={`px-5 py-3 rounded-2xl font-black text-sm border transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {isFavorite ? '♥' : '♡'} {t('business.builder.productPagePreview.favorite', 'مفضلة')}
              </button>
              <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm text-slate-900" style={{ backgroundColor: primaryColor }}>
                {t('business.builder.productPagePreview.addToCart', 'أضف للسلة')}
              </button>
              <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                {t('business.builder.productPagePreview.reserve', 'احجز')}
              </button>
            </div>

            <div className="text-sm font-bold text-slate-500 leading-relaxed">{product.description}</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 p-4">
                <div className="text-xs font-black text-slate-400">{t('business.builder.productPagePreview.stock', 'المخزون')}</div>
                <div className="mt-1 text-sm font-black text-slate-900">{product.stock}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <div className="text-xs font-black text-slate-400">{t('business.builder.productPagePreview.shop', 'المتجر')}</div>
                <div className="mt-1 text-sm font-black text-slate-900">{shop?.name || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-20">
          <div className="flex gap-2 border-b border-slate-100">
            {tabItems.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 font-black text-sm border-b-2 transition-all ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-6 text-sm font-bold text-slate-600 leading-relaxed">
            {activeTab === 'details' && product.description}
            {activeTab === 'specs' && t('business.builder.productPagePreview.specsContent', 'لا توجد مواصفات بعد')}
            {activeTab === 'shipping' && t('business.builder.productPagePreview.shippingContent', 'معلومات التوصيل غير متاحة بعد')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPagePreview;
