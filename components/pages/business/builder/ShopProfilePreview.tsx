import React, { useEffect, useMemo, useState } from 'react';
import { Home, ShoppingCart, User } from 'lucide-react';
import ProfileHeader from '@/components/pages/public/ShopProfile/ProfileHeader';
import TabRenderer from '@/components/pages/public/ShopProfile/TabRenderer';
import ProfileFooter from '@/components/pages/public/ShopProfile/ProfileFooter';
import { coerceBoolean } from '@/components/pages/public/ShopProfile/utils';

type Props = {
  page: 'home' | 'product' | 'gallery' | 'info';
  config: any;
  shop: any;
  logoDataUrl: string;
  isPreviewHeaderMenuOpen: boolean;
  setIsPreviewHeaderMenuOpen: (val: boolean) => void;
  isMobilePreview?: boolean;
};

const ShopProfilePreview: React.FC<Props> = ({
  page,
  config,
  shop,
  logoDataUrl,
  isPreviewHeaderMenuOpen,
  setIsPreviewHeaderMenuOpen,
  isMobilePreview,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'info'>(() => {
    if (page === 'gallery') return 'gallery';
    if (page === 'info') return 'info';
    return 'products';
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
    setActiveTab('products');
  }, [page]);

  const currentDesign = useMemo(() => ({
    layout: 'modern',
    primaryColor: '#00E5FF',
    secondaryColor: '#BD00FF',
    bannerUrl: '/placeholder-banner.jpg',
    ...config,
  }), [config]);

  const previewShop = useMemo(() => ({
    ...(shop && typeof shop === 'object' ? shop : {}),
    name: (shop && (shop as any).name) ? (shop as any).name : 'معاينة المتجر',
    description: (shop && (shop as any).description) ? (shop as any).description : 'وصف بسيط للمتجر يظهر للعملاء',
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

  const showMobileBottomNav = isVisible('mobileBottomNav', true);
  const showMobileBottomNavHome = isVisible('mobileBottomNavHome', true);
  const showMobileBottomNavCart = isVisible('mobileBottomNavCart', true);
  const showMobileBottomNavAccount = isVisible('mobileBottomNavAccount', true);

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

  const products = useMemo(() => ([
    {
      id: 'preview-1',
      name: 'منتج تجريبي',
      description: 'وصف مختصر للمنتج',
      price: 249,
      imageUrl: '',
      stock: 8,
      category: 'عام',
    },
    {
      id: 'preview-2',
      name: 'منتج تجريبي 2',
      description: 'تفاصيل المنتج',
      price: 99,
      imageUrl: '',
      stock: 0,
      category: 'عام',
    },
  ]), []);

  const offersByProductId = useMemo(() => new Map<string, any>(), []);

  const categories = useMemo(() => ['الكل', 'عام'], []);

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
      />

      <main
        className={`relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 ${
          isMobilePreview && showMobileBottomNav ? 'pb-28 md:pb-10' : ''
        }`}
      >
        <TabRenderer
          activeTab={activeTab}
          shop={previewShop}
          currentDesign={currentDesign}
          products={products}
          offersByProductId={offersByProductId}
          activeCategory={'الكل'}
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
        />
      </main>

      <ProfileFooter
        shop={previewShop}
        currentDesign={currentDesign}
        footerBg={footerBg}
        footerTextColor={footerTextColor}
        isVisible={isVisible as any}
        isBold={isBold}
      />

      {isMobilePreview && showMobileBottomNav ? (
        <div className="fixed bottom-0 left-0 right-0 z-[350] md:hidden">
          <div className="mx-auto max-w-[1400px] px-4 pb-4">
            <div className="rounded-[1.8rem] bg-white/95 backdrop-blur border border-slate-100 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavHome ? '' : 'hidden'} ${activeTab === 'products' ? 'text-slate-900 bg-slate-50' : 'text-slate-500'}`}
                >
                  <Home size={18} />
                  الرئيسية
                </button>

                <button
                  type="button"
                  onClick={() => {}}
                  className={`relative py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavCart ? '' : 'hidden'} text-slate-500`}
                >
                  <ShoppingCart size={18} />
                  السلة
                </button>

                <button
                  type="button"
                  onClick={() => {}}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavAccount ? '' : 'hidden'} text-slate-500`}
                >
                  <User size={18} />
                  حسابي
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(ShopProfilePreview);
