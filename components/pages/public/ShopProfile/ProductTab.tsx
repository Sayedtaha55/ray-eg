import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/common/ui';
import { IS_LOW_END_DEVICE } from '@/lib/performance';

const MotionDiv = motion.div as any;

interface ProductTabProps {
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
  currentDesign: any;
  shop: any;
  handleAddToCart: (prod: any, price: number) => void;
  addedItemId: string | null;
  handleReserve: (data: any) => void;
  disableCardMotion: boolean;
  allowAddToCart?: boolean;
  allowReserve?: boolean;
}

const ProductTab: React.FC<ProductTabProps> = ({
  products,
  offersByProductId,
  activeCategory,
  categories,
  setActiveCategory,
  productsTabLoading,
  productsTabError,
  retryProductsTab,
  loadMoreProducts,
  hasMoreProducts,
  loadingMoreProducts,
  currentDesign,
  shop,
  handleAddToCart,
  addedItemId,
  handleReserve,
  disableCardMotion,
  allowAddToCart,
  allowReserve,
}) => {
  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';

  const filteredProducts = useMemo(() => (
    activeCategory === 'الكل'
      ? products
      : products.filter(p => String(p?.category || 'عام') === activeCategory)
  ), [activeCategory, products]);

  const isLowEndDevice = IS_LOW_END_DEVICE;

  const initialBatch = isLowEndDevice ? 18 : 36;
  const batchSize = isLowEndDevice ? 12 : 24;
  const [renderCount, setRenderCount] = useState(() => Math.min(initialBatch, filteredProducts.length));

  useEffect(() => {
    setRenderCount(Math.min(initialBatch, filteredProducts.length));
  }, [filteredProducts.length, initialBatch]);

  useEffect(() => {
    if (renderCount >= filteredProducts.length) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setRenderCount((prev) => {
        const next = Math.min(prev + batchSize, filteredProducts.length);
        return next;
      });
    };
    const t = setTimeout(tick, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [batchSize, filteredProducts.length, renderCount]);

  if (productsTabLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-50">
            <Skeleton className="aspect-square rounded-2xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (productsTabError && products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500 mb-4">{productsTabError}</p>
        <button
          onClick={retryProductsTab}
          className={`${buttonPadding} ${buttonShape} text-white font-black transition-opacity hover:opacity-90`}
          style={{ backgroundColor: primaryColor }}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar flex-row-reverse">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${buttonPadding} ${buttonShape} font-black text-xs md:text-sm whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'text-white shadow-lg scale-105' 
                  : 'bg-white text-slate-600 border border-slate-100 hover:border-slate-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: primaryColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد منتجات في هذا القسم حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
          {filteredProducts.slice(0, renderCount).map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              design={currentDesign}
              offer={offersByProductId.get(prod.id)}
              onAdd={handleAddToCart}
              isAdded={addedItemId === prod.id}
              onReserve={handleReserve}
              disableMotion={disableCardMotion}
              shopCategory={shop?.category}
              allowAddToCart={allowAddToCart}
              allowReserve={allowReserve}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMoreProducts && (
        <div className="flex justify-center pt-10">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMoreProducts}
            className={`${buttonPadding} ${buttonShape} bg-white border-2 font-black transition-all disabled:opacity-50`}
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            {loadingMoreProducts ? 'جاري التحميل...' : 'عرض المزيد من المنتجات'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductTab;
