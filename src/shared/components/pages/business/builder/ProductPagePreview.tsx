import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductGallery from '@/components/pages/public/product/ProductGallery';
import ProductDetails from '@/components/pages/public/product/ProductDetails';
import ProductTabs from '@/components/pages/public/product/ProductTabs';
import { useTranslation } from 'react-i18next';

type Props = {
  config: any;
  shop: any;
};

const ProductPagePreview: React.FC<Props> = ({ config, shop }) => {
  const { t } = useTranslation();
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    id: 'preview-product',
    name: t('business.builder.productPagePreview.productName'),
    description: t('business.builder.productPagePreview.productDescription'),
    price: 249,
    imageUrl: '',
    images: [],
    category: t('business.builder.shopPreview.categories.general'),
    stock: 8,
  };

  const offer = null;
  const galleryImages = [''];
  const displayedPrice = 249;

  const primaryColor = String(config?.primaryColor || '').trim() || '#00E5FF';
  const pageBgColor = String(config?.pageBackgroundColor || config?.backgroundColor || '#FFFFFF');
  const pageBgImage = String(config?.backgroundImageUrl || '').trim();

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  const handleAddToCart = () => {};
  const setIsResModalOpen = () => {};

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: pageBgColor }} dir="rtl">
      {pageBgImage ? (
        <img
          src={pageBgImage}
          alt=""
          className="fixed inset-0 z-0 pointer-events-none w-full h-full object-cover opacity-50"
        />
      ) : null}

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 pb-28 md:pb-12 text-right font-sans">
        <button className="flex items-center gap-2 text-slate-400 font-black mb-12 hover:text-black transition-all">
          <ArrowRight size={20} /> {t('business.builder.productPagePreview.goBack')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24" style={{ contentVisibility: 'auto' }}>
          <ProductGallery
            galleryImages={galleryImages}
            activeImageSrc={activeImageSrc}
            setActiveImageSrc={setActiveImageSrc}
            productName={product.name}
            hasDiscount={!!offer}
            discount={offer?.discount}
            onGalleryTouchStart={() => {}}
            onGalleryTouchEnd={() => {}}
          />

          <ProductDetails
            product={product}
            shop={shop}
            offer={offer}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            handleShare={() => {}}
            handleAddToCart={handleAddToCart}
            showAddToCartButton={true}
            showReserveButton={true}
            showPrice={true}
            setIsResModalOpen={setIsResModalOpen}
            displayedPrice={displayedPrice}
            hasDiscount={!!offer}
            isRestaurant={false}
            isFashion={false}
            hasPacks={false}
            packDefs={[]}
            selectedPackId=""
            setSelectedPackId={() => {}}
            menuVariantsDef={[]}
            selectedMenuTypeId=""
            setSelectedMenuTypeId={() => {}}
            selectedMenuSizeId=""
            setSelectedMenuSizeId={() => {}}
            fashionColors={[]}
            selectedFashionColorValue=""
            setSelectedFashionColorValue={() => {}}
            fashionSizes={[]}
            selectedFashionSize=""
            setSelectedFashionSize={() => {}}
            selectedAddons={[]}
            setSelectedAddons={() => {}}
            addonsDef={[]}
            whatsappHref=""
            primaryColor={primaryColor}
          />
        </div>

        <div className="mt-20">
          <ProductTabs
            activeTab={activeTab as any}
            setActiveTab={setActiveTab as any}
            productDescription={product.description}
            product={product}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPagePreview;
