import React, { lazy, Suspense } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/common/ui';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';

interface TabRendererProps {
  activeTab: 'home' | 'products' | 'gallery' | 'info';
  setActiveTab?: (tab: 'home' | 'products' | 'gallery' | 'info') => void;
  shop: any;
  currentDesign: any;
  products: any[];
  offersByProductId: Map<string, any>;
  activeCategory: string;
  categories: string[];
  setActiveCategory: (cat: string) => void;
  productsTabLoading: boolean;
  productsTabError: string | null;
  retryProductsTab: () => void;
  loadMoreProducts: () => void;
  hasMoreProducts: boolean;
  loadingMoreProducts: boolean;
  handleAddToCart: (prod: any, price: number) => void;
  addedItemId: string | null;
  handleReserve: (data: any) => void;
  disableCardMotion: boolean;
  allowAddToCart?: boolean;
  allowReserve?: boolean;
  galleryTabLoading: boolean;
  galleryTabError: string | null;
  galleryImages: any[];
  retryGalleryTab: () => void;
  isVisible: (key: string, fallback?: boolean) => boolean;
  whatsappHref: string;
  isPreview?: boolean;
  onProductClick?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

const ProductTab = lazy(() => import('./ProductTab'));
const InfoTab = lazy(() => import('./InfoTab'));
const ShopGalleryComponent = lazy(() => import('@features/shop/ShopGallery'));

const MotionDiv = motion.div as any;

const TabFallback = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="bg-white border border-slate-100 rounded-[1.5rem] p-4">
        <Skeleton className="aspect-[4/3] rounded-2xl mb-4" />
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-11 w-full rounded-2xl" />
      </div>
    ))}
  </div>
);

const GalleryFallback = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, idx) => (
      <Skeleton key={idx} className="aspect-square rounded-2xl" />
    ))}
  </div>
);

const TabRenderer: React.FC<TabRendererProps> = (props) => {
  const { t } = useTranslation();
  const { activeTab } = props;

  const prefersReducedMotion = useReducedMotion();
  const Wrapper: any = prefersReducedMotion ? 'div' : MotionDiv;
  const wrapperMotionProps = prefersReducedMotion
    ? {}
    : {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 },
    };

  const primaryColor = String(props.currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((props.currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((props.currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';

  return (
    <Suspense fallback={activeTab === 'gallery' ? <GalleryFallback /> : <TabFallback />}>
      <AnimatePresence mode="wait" initial={false}>
        <Wrapper key={activeTab} {...wrapperMotionProps}>
          {activeTab === 'home' && (
            <div className="space-y-8" dir="rtl">
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
              <div className="overflow-hidden bg-white/40 backdrop-blur-sm border border-slate-100 rounded-2xl py-3.5 relative shadow-sm">
                <div className="flex gap-12 whitespace-nowrap animate-marquee flex-row-reverse">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🚚 {String(props.currentDesign?.homeRightAdTitle || 'شحن مجاني لكافة المحافظات!')}</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🔥 {String(props.currentDesign?.homeLeftAdTitle || 'خصم 15% على طلبك الأول!')}</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">⭐ {String(props.currentDesign?.homeStoryText || 'عروض حصرية لفترة محدودة!')}</span>
                  {/* Duplicate */}
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🚚 {String(props.currentDesign?.homeRightAdTitle || 'شحن مجاني لكافة المحافظات!')}</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">🔥 {String(props.currentDesign?.homeLeftAdTitle || 'خصم 15% على طلبك الأول!')}</span>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">⭐ {String(props.currentDesign?.homeStoryText || 'عروض حصرية لفترة محدودة!')}</span>
                </div>
              </div>

              {/* 2. Alternating Sections */}
              <div className="space-y-6">
                {/* Card 1: Text right, Image left */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-sm">
                  <div className="flex-1 text-right space-y-3">
                    <h3 className="text-lg md:text-2xl font-black text-slate-900">{String(props.currentDesign?.homeAboutTitle || 'من نحن وقيمتنا')}</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-bold leading-relaxed">
                      {String(props.currentDesign?.homeIntroText || 'نحن نقدم أفضل المنتجات جودة ودقة لتناسب احتياجات جميع العملاء وتقديم أفضل تجربة تسوق.')}
                    </p>
                  </div>
                  <div className="w-full md:w-[250px] aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={props.currentDesign?.homeAboutImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"} alt="About us" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Card 2: Image right, Text left */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center shadow-sm">
                  <div className="flex-1 text-right space-y-3">
                    <h3 className="text-lg md:text-2xl font-black text-slate-900">{String(props.currentDesign?.homeStoryTitle || 'خدماتنا وإعلاناتنا')}</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-bold leading-relaxed">
                      {String(props.currentDesign?.homeStoryText || 'استمتع بتجربة تسوق متكاملة مع خيارات دفع آمنة وسهلة، وتوصيل فائق السرعة لباب منزلك.')}
                    </p>
                  </div>
                  <div className="w-full md:w-[250px] aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={props.currentDesign?.homeStoryImageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600"} alt="Our story" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* 3. Highlighted Products / Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-row-reverse">
                  <h3 className="text-md md:text-xl font-black text-slate-900">أبرز المنتجات</h3>
                  <button 
                    type="button" 
                    onClick={() => {
                      props.setActiveCategory(t('shopProfile.all'));
                      if (props.setActiveTab) {
                        props.setActiveTab('products');
                      }
                    }} 
                    className="text-xs font-black text-cyan-600 hover:text-cyan-700"
                  >
                    عرض الكل
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                  {(() => {
                    const highlightedIds = Array.isArray(props.currentDesign?.homeHighlightedProductIds) 
                      ? props.currentDesign.homeHighlightedProductIds.map(String) 
                      : [];
                    const highlightedProducts = props.products.filter(p => highlightedIds.includes(String(p.id)));
                    const finalHighlightProducts = highlightedProducts.length > 0 
                      ? highlightedProducts.slice(0, 6) 
                      : props.products.slice(0, 3);

                    return finalHighlightProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        design={props.currentDesign}
                        offer={props.offersByProductId?.get(prod.id)}
                        onAdd={props.handleAddToCart}
                        isAdded={props.addedItemId === prod.id}
                        onReserve={props.handleReserve}
                        disableMotion={props.disableCardMotion}
                        shopCategory={props.shop?.category}
                        allowAddToCart={props.allowAddToCart}
                        allowReserve={props.allowReserve}
                        isPreview={props.isPreview}
                        onProductClick={props.onProductClick}
                      />
                    ));
                  })()}
                </div>
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      props.setActiveCategory(t('shopProfile.all'));
                      if (props.setActiveTab) {
                        props.setActiveTab('products');
                      }
                    }}
                    className={`${buttonPadding} ${buttonShape} text-white text-xs font-black shadow-md transition-all hover:opacity-90 active:scale-95`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    عرض جميع المنتجات
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductTab 
              products={props.products}
              offersByProductId={props.offersByProductId}
              activeCategory={props.activeCategory}
              categories={props.categories}
              setActiveCategory={props.setActiveCategory}
              productsTabLoading={props.productsTabLoading}
              productsTabError={props.productsTabError}
              retryProductsTab={props.retryProductsTab}
              loadMoreProducts={props.loadMoreProducts}
              hasMoreProducts={props.hasMoreProducts}
              loadingMoreProducts={props.loadingMoreProducts}
              currentDesign={props.currentDesign}
              shop={props.shop}
              handleAddToCart={props.handleAddToCart}
              addedItemId={props.addedItemId}
              handleReserve={props.handleReserve}
              disableCardMotion={props.disableCardMotion}
              allowAddToCart={props.allowAddToCart}
              allowReserve={props.allowReserve}
              isPreview={props.isPreview}
              onProductClick={props.onProductClick}
              searchQuery={props.searchQuery}
              setSearchQuery={props.setSearchQuery}
            />
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">
              {props.galleryTabLoading && props.galleryImages.length === 0 ? (
                <GalleryFallback />
              ) : props.galleryTabError && props.galleryImages.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-500 mb-4">{props.galleryTabError}</p>
                  <button
                    onClick={props.retryGalleryTab}
                    className={`${buttonPadding} ${buttonShape} text-white font-black transition-opacity hover:opacity-90`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('restaurantsPage.retry')}
                  </button>
                </div>
              ) : (
                <ShopGalleryComponent 
                  images={props.galleryImages} 
                  shopName={props.shop?.name}
                  primaryColor={props.currentDesign?.primaryColor}
                  layout={props.currentDesign?.layout}
                />
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <InfoTab 
              shop={props.shop}
              currentDesign={props.currentDesign}
              isVisible={props.isVisible}
              whatsappHref={props.whatsappHref}
            />
          )}
        </Wrapper>
      </AnimatePresence>
    </Suspense>
  );
};

export default React.memo(TabRenderer);
