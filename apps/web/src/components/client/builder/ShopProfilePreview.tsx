'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, MapPin, Phone, Star, ShoppingBag, ImageIcon, Info } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import ProductPagePreview from './ProductPagePreview';

type Props = {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
  onProductClick?: () => void;
  focusSection?: 'top' | 'middle' | 'shopping' | 'productPage' | 'footer' | null;
};

function coerceBoolean(val: any, fallback = true): boolean {
  if (val === true || val === 'true' || val === 1 || val === '1') return true;
  if (val === false || val === 'false' || val === 0 || val === '0') return false;
  return fallback;
}

const ShopProfilePreview: React.FC<Props> = ({
  page, config, shop, logoDataUrl, isPreviewHeaderMenuOpen, setIsPreviewHeaderMenuOpen,
  isMobilePreview, onProductClick, focusSection,
}) => {
  const t = useT();

  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'info'>(() => {
    if (page === 'gallery') return 'gallery';
    if (page === 'info') return 'info';
    return 'products';
  });

  useEffect(() => {
    if (page === 'gallery') { setActiveTab('gallery'); return; }
    if (page === 'info') { setActiveTab('info'); return; }
    setActiveTab('products');
  }, [page]);

  const currentDesign = useMemo(() => ({
    layout: 'modern', primaryColor: '#00E5FF', secondaryColor: '#BD00FF', ...config,
  }), [config]);

  const previewShop = useMemo(() => ({
    ...(shop && typeof shop === 'object' ? shop : {}),
    name: (shop as any)?.name || t('business.builder.shopPreview.defaultShopName', 'متجر تجريبي'),
    description: (shop as any)?.description || t('business.builder.shopPreview.defaultShopDescription', 'وصف المتجر التجريبي'),
    logoUrl: logoDataUrl || (shop as any)?.logoUrl || (shop as any)?.logo_url || '',
  }), [shop, logoDataUrl]);

  const isVisible = useMemo(() => {
    const elementsVisibility = (currentDesign as any)?.elementsVisibility || {};
    return (key: string, fallback: boolean = true) => {
      if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
      if (!(key in elementsVisibility)) return fallback;
      return coerceBoolean((elementsVisibility as any)[key], fallback);
    };
  }, [currentDesign]);

  const headerBg = (currentDesign as any)?.headerTransparent
    ? `rgba(255,255,255,${Number((currentDesign as any)?.headerOpacity ?? 60) / 100})`
    : String((currentDesign as any)?.headerBackgroundColor || '#FFFFFF');
  const headerTextColor = String((currentDesign as any)?.headerTextColor || '#0F172A');

  const footerBg = (currentDesign as any)?.footerTransparent
    ? `rgba(255,255,255,${Number((currentDesign as any)?.footerOpacity ?? 90) / 100})`
    : String((currentDesign as any)?.footerBackgroundColor || '#FFFFFF');
  const footerTextColor = String((currentDesign as any)?.footerTextColor || '#0F172A');

  const isBold = String((currentDesign as any)?.layout || '').toLowerCase() === 'bold';
  const pageBgImageUrl = String((currentDesign as any)?.backgroundImageUrl || '').trim();

  const products = useMemo(() => [
    { id: 'preview-1', name: t('business.builder.shopPreview.products.p1.name', 'منتج 1'), description: t('business.builder.shopPreview.products.p1.description', 'وصف المنتج 1'), price: 129, imageUrl: '', stock: 12, category: t('business.builder.shopPreview.categories.products', 'منتجات') },
    { id: 'preview-2', name: t('business.builder.shopPreview.products.p2.name', 'منتج 2'), description: t('business.builder.shopPreview.products.p2.description', 'وصف المنتج 2'), price: 199, imageUrl: '', stock: 7, category: t('business.builder.shopPreview.categories.trial', 'تجريبي') },
    { id: 'preview-3', name: t('business.builder.shopPreview.products.p3.name', 'منتج 3'), description: t('business.builder.shopPreview.products.p3.description', 'وصف المنتج 3'), price: 259, imageUrl: '', stock: 4, category: t('business.builder.shopPreview.categories.products', 'منتجات') },
    { id: 'preview-4', name: t('business.builder.shopPreview.products.p4.name', 'منتج 4'), description: t('business.builder.shopPreview.products.p4.description', 'وصف المنتج 4'), price: 319, imageUrl: '', stock: 9, category: t('business.builder.shopPreview.categories.trial', 'تجريبي') },
    { id: 'preview-5', name: t('business.builder.shopPreview.products.p5.name', 'منتج 5'), description: t('business.builder.shopPreview.products.p5.description', 'وصف المنتج 5'), price: 89, imageUrl: '', stock: 14, category: t('business.builder.shopPreview.categories.general', 'عام') },
    { id: 'preview-6', name: t('business.builder.shopPreview.products.p6.name', 'منتج 6'), description: t('business.builder.shopPreview.products.p6.description', 'وصف المنتج 6'), price: 149, imageUrl: '', stock: 6, category: t('business.builder.shopPreview.categories.general', 'عام') },
  ], [t]);

  const categories = useMemo(() => [
    t('business.builder.shopPreview.categories.all', 'الكل'),
    t('business.builder.shopPreview.categories.products', 'منتجات'),
    t('business.builder.shopPreview.categories.trial', 'تجريبي'),
    t('business.builder.shopPreview.categories.general', 'عام'),
  ], [t]);

  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory || activeCategory === categories[0]) return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory, categories]);

  return (
    <div className="min-h-full" dir="rtl" style={{
      backgroundColor: currentDesign?.pageBackgroundColor || '#FFFFFF',
      backgroundImage: pageBgImageUrl ? `url("${pageBgImageUrl}")` : undefined,
      backgroundSize: pageBgImageUrl ? 'cover' : undefined,
      backgroundPosition: pageBgImageUrl ? 'center' : undefined,
      backgroundRepeat: pageBgImageUrl ? 'no-repeat' : undefined,
    }}>
      {page === 'product' ? (
        <div className={`transition-all duration-500 ${focusSection && focusSection !== 'productPage' ? 'opacity-30 scale-[0.98]' : focusSection === 'productPage' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-2xl' : ''}`}>
          <ProductPagePreview config={currentDesign} shop={previewShop} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className={`transition-all duration-500 ${focusSection && focusSection !== 'top' ? 'opacity-30 scale-[0.98]' : focusSection === 'top' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-b-2xl' : ''}`}>
            <header className="sticky top-0 z-30 border-b border-slate-100" style={{ backgroundColor: headerBg, color: headerTextColor }}>
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {previewShop.logoUrl ? <Image src={previewShop.logoUrl} alt="" width={48} height={48} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ShoppingBag size={20} /></div>}
                  </div>
                  <div>
                    <div className="font-black text-base" style={{ color: headerTextColor }}>{previewShop.name}</div>
                    <div className="text-xs font-bold opacity-60" style={{ color: headerTextColor }}>{previewShop.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isVisible('headerShareButton') && <button type="button" className="p-2 rounded-xl hover:bg-black/5 transition-all"><ExternalLink size={18} /></button>}
                </div>
              </div>
              {/* Tabs */}
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex gap-1 pb-3">
                {(['products', 'gallery', 'info'] as const).map(tab => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-2xl font-black text-sm transition-all ${activeTab === tab ? 'bg-slate-900 text-white' : 'hover:bg-black/5'}`} style={{ color: activeTab === tab ? '#fff' : headerTextColor }}>
                    {tab === 'products' && <span className="inline-flex items-center gap-1"><ShoppingBag size={14} /> {t('business.builder.shopPreview.tabs.products', 'منتجات')}</span>}
                    {tab === 'gallery' && <span className="inline-flex items-center gap-1"><ImageIcon size={14} /> {t('business.builder.shopPreview.tabs.gallery', 'معرض')}</span>}
                    {tab === 'info' && <span className="inline-flex items-center gap-1"><Info size={14} /> {t('business.builder.shopPreview.tabs.info', 'معلومات')}</span>}
                  </button>
                ))}
              </div>
            </header>
          </div>

          {/* Content */}
          <div className={`transition-all duration-500 ${focusSection && focusSection !== 'middle' && focusSection !== 'shopping' ? 'opacity-30 scale-[0.98]' : (focusSection === 'middle' || focusSection === 'shopping') ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-2xl' : ''}`}>
            <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10">
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Category filter */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-5 py-2 rounded-2xl font-black text-sm transition-all ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
                    ))}
                  </div>
                  {/* Product grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(p => (
                      <button key={p.id} type="button" onClick={() => onProductClick?.()} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-right hover:shadow-md transition-all group">
                        <div className="relative aspect-square bg-slate-100">
                          {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={32} /></div>}
                          {isVisible('productPrice') && <div className="absolute bottom-2 left-2 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-sm text-xs font-black" style={{ color: currentDesign?.primaryColor || '#00E5FF' }}>{t('business.pos.egpShort', 'ج.م')} {p.price}</div>}
                        </div>
                        <div className="p-4">
                          <div className="text-sm font-black text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="mt-1 text-xs font-bold text-slate-400 line-clamp-1">{p.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'gallery' && (
                <div className="text-center py-12 text-slate-400 font-bold">
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
                  {t('business.builder.shopPreview.galleryEmpty', 'لا توجد صور في المعرض بعد')}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
                    <h3 className="font-black text-slate-900 mb-4">{previewShop.name}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">{previewShop.description}</p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><MapPin size={16} className="text-slate-400" />{t('business.builder.shopPreview.info.location', 'الموقع غير محدد')}</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><Phone size={16} className="text-slate-400" />{t('business.builder.shopPreview.info.phone', 'غير محدد')}</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><Star size={16} className="text-slate-400" />{t('business.builder.shopPreview.info.rating', 'لا يوجد تقييم')}</div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* Footer */}
          <div className={`transition-all duration-500 ${focusSection && focusSection !== 'footer' ? 'opacity-30 scale-[0.98]' : focusSection === 'footer' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-t-2xl' : ''}`}>
            <footer className="border-t border-slate-100" style={{ backgroundColor: footerBg, color: footerTextColor }}>
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs font-bold opacity-60" style={{ color: footerTextColor }}>© {new Date().getFullYear()} {previewShop.name}</div>
                <div className="text-xs font-black opacity-40" style={{ color: footerTextColor }}>{t('business.builder.shopPreview.footer.poweredBy', 'بدعم من Ray')}</div>
              </div>
            </footer>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(ShopProfilePreview);
