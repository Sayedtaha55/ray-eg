import React, { useEffect, useMemo, useState } from 'react';
import { Home } from 'lucide-react';
import ProfileHeader from '@/components/pages/public/ShopProfile/ProfileHeader';
import TabRenderer from '@/components/pages/public/ShopProfile/TabRenderer';
import ProfileFooter from '@/components/pages/public/ShopProfile/ProfileFooter';
import ProductPagePreview from './ProductPagePreview';
import { coerceBoolean, hexToRgba } from '@/components/pages/public/ShopProfile/utils';
import { useTranslation } from 'react-i18next';

type Props = {
  page: 'home' | 'products' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
  onProductClick?: () => void;
  focusSection?: 'top' | 'middle' | 'shopping' | 'productPage' | 'footer' | null;
  bannerPreview?: string;
  backgroundPreview?: string;
  bannerFile?: File | null;
};

const ShopProfilePreview: React.FC<Props> = ({
  page,
  config,
  shop,
  logoDataUrl,
  isPreviewHeaderMenuOpen,
  setIsPreviewHeaderMenuOpen,
  isMobilePreview,
  onProductClick,
  focusSection,
  bannerPreview,
  backgroundPreview,
  bannerFile,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'gallery' | 'info'>(() => {
    if (page === 'gallery') return 'gallery';
    if (page === 'info') return 'info';
    if (page === 'products') return 'products';
    if (page === 'home') {
      return String(config?.homeLayoutMode || '') === 'banner_ads_story' ? 'home' : 'products';
    }
    return 'home';
  });

  useEffect(() => {
    if (page === 'gallery') {
      setActiveTab('gallery');
      return;
    }
    if (page === 'info') {
      setActiveTab('info');
      return;
    }
    if (page === 'products') {
      setActiveTab('products');
      return;
    }
    if (page === 'home') {
      setActiveTab(String(config?.homeLayoutMode || '') === 'banner_ads_story' ? 'home' : 'products');
      return;
    }
    setActiveTab(page as any);
  }, [page, config?.homeLayoutMode]);

  const currentDesign = useMemo(() => ({
    layout: 'modern',
    primaryColor: '#00E5FF',
    secondaryColor: '#BD00FF',
    ...config,
    ...(bannerPreview ? { bannerUrl: bannerPreview } : {}),
    ...(backgroundPreview ? { backgroundImageUrl: backgroundPreview } : {}),
    ...(bannerPreview ? { bannerIsVideo: (bannerFile && bannerFile.type.startsWith('video/')) } : {}),
  }), [config, bannerPreview, backgroundPreview, bannerFile]);

  const previewShop = useMemo(() => ({
    ...(shop && typeof shop === 'object' ? shop : {}),
    name: (shop && (shop as any).name) ? (shop as any).name : t('business.builder.shopPreview.defaultShopName'),
    description: (shop && (shop as any).description) ? (shop as any).description : t('business.builder.shopPreview.defaultShopDescription'),
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

  const headerBackgroundColor = String((currentDesign as any)?.headerBackgroundColor || '#FFFFFF');
  const headerOpacity = Number((currentDesign as any)?.headerOpacity ?? 60) / 100;
  const headerTransparent = coerceBoolean((currentDesign as any)?.headerTransparent, false);
  const headerBg = headerTransparent ? hexToRgba(headerBackgroundColor, headerOpacity) : headerBackgroundColor;

  const headerTextColor = String((currentDesign as any)?.headerTextColor || '#0F172A');

  const footerBackgroundColor = String((currentDesign as any)?.footerBackgroundColor || '#FFFFFF');
  const footerOpacity = Number((currentDesign as any)?.footerOpacity ?? 90) / 100;
  const footerTransparent = coerceBoolean((currentDesign as any)?.footerTransparent, false);
  const footerBg = footerTransparent ? hexToRgba(footerBackgroundColor, footerOpacity) : footerBackgroundColor;

  const footerTextColor = String((currentDesign as any)?.footerTextColor || '#0F172A');

  const isBold = String((currentDesign as any)?.layout || '').toLowerCase() === 'bold';

  const pageBgImageUrl = String((currentDesign as any)?.backgroundImageUrl || '').trim();

  const products = useMemo(() => ([
    {
      id: 'preview-1',
      name: t('business.builder.shopPreview.products.p1.name'),
      description: t('business.builder.shopPreview.products.p1.description'),
      price: 129,
      imageUrl: '',
      stock: 12,
      category: t('business.builder.shopPreview.categories.products'),
    },
    {
      id: 'preview-2',
      name: t('business.builder.shopPreview.products.p2.name'),
      description: t('business.builder.shopPreview.products.p2.description'),
      price: 199,
      imageUrl: '',
      stock: 7,
      category: t('business.builder.shopPreview.categories.trial'),
    },
    {
      id: 'preview-3',
      name: t('business.builder.shopPreview.products.p3.name'),
      description: t('business.builder.shopPreview.products.p3.description'),
      price: 259,
      imageUrl: '',
      stock: 4,
      category: t('business.builder.shopPreview.categories.products'),
    },
    {
      id: 'preview-4',
      name: t('business.builder.shopPreview.products.p4.name'),
      description: t('business.builder.shopPreview.products.p4.description'),
      price: 319,
      imageUrl: '',
      stock: 9,
      category: t('business.builder.shopPreview.categories.trial'),
    },
    {
      id: 'preview-5',
      name: t('business.builder.shopPreview.products.p5.name'),
      description: t('business.builder.shopPreview.products.p5.description'),
      price: 89,
      imageUrl: '',
      stock: 14,
      category: t('business.builder.shopPreview.categories.general'),
    },
    {
      id: 'preview-6',
      name: t('business.builder.shopPreview.products.p6.name'),
      description: t('business.builder.shopPreview.products.p6.description'),
      price: 149,
      imageUrl: '',
      stock: 6,
      category: t('business.builder.shopPreview.categories.general'),
    },
  ]), [t]);

  const offersByProductId = useMemo(() => new Map<string, any>(), []);

  const categories = useMemo(() => [t('business.builder.shopPreview.categories.all'), t('business.builder.shopPreview.categories.products'), t('business.builder.shopPreview.categories.trial'), t('business.builder.shopPreview.categories.general')], [t]);

  const prefersReducedMotion = true;

  return (
    <div
      className="min-h-full"
      dir="rtl"
      style={{
        backgroundColor: currentDesign?.pageBackgroundColor || '#FFFFFF',
        backgroundImage: pageBgImageUrl ? `url("${pageBgImageUrl}")` : undefined,
        backgroundSize: pageBgImageUrl ? 'cover' : undefined,
        backgroundPosition: pageBgImageUrl ? 'center' : undefined,
        backgroundRepeat: pageBgImageUrl ? 'no-repeat' : undefined,
      }}
    >
      {/* Focus section dimming: non-focused sections get reduced opacity */}
      {page === 'product' ? (
        <div className={`transition-all duration-500 ${focusSection && focusSection !== 'productPage' ? 'opacity-30 scale-[0.98]' : focusSection === 'productPage' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-2xl' : ''}`}>
          <ProductPagePreview config={currentDesign} shop={previewShop} />
        </div>
      ) : (
        <>
          {/* ─── Top Section (header + banner) ─── */}
          <div className={`transition-all duration-500 ${focusSection && focusSection !== 'top' ? 'opacity-30 scale-[0.98]' : focusSection === 'top' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-b-2xl' : ''}`}>
            <ProfileHeader
              shop={previewShop}
              currentDesign={currentDesign}
              activeTab={activeTab}
              setActiveTab={setActiveTab as any}
              isHeaderMenuOpen={isPreviewHeaderMenuOpen}
              setIsHeaderMenuOpen={setIsPreviewHeaderMenuOpen}
              hasFollowed={false}
              followLoading={false}
              handleFollow={() => {}}
              handleShare={() => {}}
              isVisible={isVisible as any}
              prefersReducedMotion={prefersReducedMotion}
              headerBg={headerBg}
              headerTextColor={headerTextColor}
              bannerReady={true}
              isBuilderPreview={true}
            />
          </div>

          {/* ─── Middle Section (content + cards) ─── */}
          <div className={`transition-all duration-500 ${focusSection && focusSection !== 'middle' && focusSection !== 'shopping' ? 'opacity-30 scale-[0.98]' : (focusSection === 'middle' || focusSection === 'shopping') ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-2xl' : ''}`}>
            {activeTab === 'home' && String(currentDesign?.homeLayoutMode || '') === 'banner_ads_story' ? (
              <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
                {/* 1. Marquee Offers */}
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                  }
                  .animate-marquee {
                    display: inline-flex;
                    animation: marquee 20s linear infinite;
                  }
                `}</style>
                <div className="overflow-hidden bg-slate-50 border border-slate-100 rounded-2xl py-3.5 relative shadow-sm">
                  <div className="flex gap-12 whitespace-nowrap animate-marquee flex-row-reverse">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🚚 {String(currentDesign.homeRightAdTitle || 'شحن مجاني لكافة المحافظات!')}</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🔥 {String(currentDesign.homeLeftAdTitle || 'خصم 15% على طلبك الأول!')}</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">⭐ {String(currentDesign.homeStoryText || 'عروض حصرية لفترة محدودة!')}</span>
                    {/* Duplicate */}
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🚚 {String(currentDesign.homeRightAdTitle || 'شحن مجاني لكافة المحافظات!')}</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🔥 {String(currentDesign.homeLeftAdTitle || 'خصم 15% على طلبك الأول!')}</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">⭐ {String(currentDesign.homeStoryText || 'عروض حصرية لفترة محدودة!')}</span>
                  </div>
                </div>

                {/* 2. Alternating Sections */}
                <div className="space-y-6">
                  {/* Card 1: Text right, Image left */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-sm">
                    <div className="flex-1 text-right space-y-3">
                      <h3 className="text-lg md:text-2xl font-black text-slate-900">{String(currentDesign.homeAboutTitle || 'من نحن وقيمتنا')}</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-bold leading-relaxed">
                        {String(currentDesign.homeIntroText || 'نحن نقدم أفضل المنتجات جودة ودقة لتناسب احتياجات جميع العملاء وتقديم أفضل تجربة تسوق.')}
                      </p>
                    </div>
                    <div className="w-full md:w-[250px] aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={currentDesign.homeAboutImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} alt="About us" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Card 2: Image right, Text left */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center shadow-sm">
                    <div className="flex-1 text-right space-y-3">
                      <h3 className="text-lg md:text-2xl font-black text-slate-900">{String(currentDesign.homeStoryTitle || 'خدماتنا وإعلاناتنا')}</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-bold leading-relaxed">
                        {String(currentDesign.homeStoryText || 'استمتع بتجربة تسوق متكاملة مع خيارات دفع آمنة وسهلة، وتوصيل فائق السرعة لباب منزلك.')}
                      </p>
                    </div>
                    <div className="w-full md:w-[250px] aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={currentDesign.homeStoryImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"} alt="Our story" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* 3. Highlighted Products / Services */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <h3 className="text-md md:text-xl font-black text-slate-900">أبرز المنتجات</h3>
                    <button type="button" onClick={() => setActiveTab('products')} className="text-xs font-black text-cyan-600 hover:text-cyan-700">
                      عرض الكل
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      const highlightedIds = Array.isArray(currentDesign?.homeHighlightedProductIds) 
                        ? currentDesign.homeHighlightedProductIds.map(String) 
                        : [];
                      const finalPreviewProducts = highlightedIds.length > 0 
                        ? products.slice(0, Math.min(6, highlightedIds.length)) 
                        : products.slice(0, 3);

                      return finalPreviewProducts.map((prod) => (
                        <div key={prod.id} className="bg-white border border-slate-100 rounded-2xl p-3.5 space-y-3 flex flex-col shadow-sm text-right">
                          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300" alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs md:text-sm font-black text-slate-900 leading-tight">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1">{prod.description}</p>
                          </div>
                          <div className="flex items-center justify-between flex-row-reverse">
                            <span className="text-xs font-black text-slate-900">{prod.price} ج.م</span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('products')}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black hover:bg-black transition-all"
                            >
                              اطلب الآن
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="pt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('products')}
                      className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-md hover:bg-black transition-all"
                      style={{ backgroundColor: currentDesign.primaryColor }}
                    >
                      عرض جميع المنتجات
                    </button>
                  </div>
                </div>
              </main>
            ) : (
              <main className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10">
                <TabRenderer
                  activeTab={activeTab === 'home' ? 'products' : activeTab}
                  shop={previewShop}
                  currentDesign={currentDesign}
                  products={products}
                  offersByProductId={offersByProductId}
                  activeCategory={t('business.builder.shopPreview.categories.all')}
                  categories={categories}
                  setActiveCategory={() => {}}
                  productsTabLoading={false}
                  productsTabError={null}
                  retryProductsTab={() => {}}
                  loadMoreProducts={() => {}}
                  hasMoreProducts={false}
                  loadingMoreProducts={false}
                  handleAddToCart={() => {}}
                  addedItemId={null}
                  handleReserve={() => {}}
                  disableCardMotion={true}
                  galleryTabLoading={false}
                  galleryTabError={null}
                  galleryImages={[]}
                  retryGalleryTab={() => {}}
                  isVisible={isVisible as any}
                  whatsappHref={''}
                  isPreview={true}
                  onProductClick={() => {
                    if (onProductClick) {
                      onProductClick();
                    }
                  }}
                />
              </main>
            )}
          </div>

          {/* ─── Footer Section ─── */}
          {(activeTab !== 'products' || focusSection === 'footer') && (
            <div className={`transition-all duration-500 ${focusSection && focusSection !== 'footer' ? 'opacity-30 scale-[0.98]' : focusSection === 'footer' ? 'ring-2 ring-[#00E5FF]/40 ring-offset-2 rounded-t-2xl' : ''}`}>
              <ProfileFooter
                shop={previewShop}
                currentDesign={currentDesign}
                footerBg={footerBg}
                footerTextColor={footerTextColor}
                isVisible={isVisible as any}
                isBold={isBold}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(ShopProfilePreview);
