import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/common/ui';

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
  isPreview?: boolean;
  onProductClick?: () => void;
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
  isPreview,
  onProductClick,
}) => {
  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';

  const sectionsContainerRef = useRef<HTMLDivElement | null>(null);
  const categoryHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const normalizedCategories = useMemo(() => {
    const raw = Array.isArray(categories) ? categories : [];
    const out = raw.map((c) => String(c || '').trim()).filter(Boolean);
    if (!out.includes('الكل')) return ['الكل', ...out];
    return out;
  }, [categories]);

  const categorizedProducts = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const p of Array.isArray(products) ? products : []) {
      const cat = String(p?.category || 'عام').trim() || 'عام';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [products]);

  const displayCategories = useMemo(() => {
    const cats = normalizedCategories.filter((c) => c !== 'الكل');
    if (cats.length === 0) {
      return Array.from(categorizedProducts.keys());
    }
    const existing = new Set<string>(categorizedProducts.keys());
    return cats.filter((c) => existing.has(c));
  }, [categorizedProducts, normalizedCategories]);

  const isLowEndDevice = useMemo(() => {
    try {
      const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : undefined;
      const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const initialBatch = isLowEndDevice ? 18 : 36;
  const batchSize = isLowEndDevice ? 12 : 24;
  const totalProductsCount = products.length;
  const [renderCount, setRenderCount] = useState(() => Math.min(initialBatch, totalProductsCount));

  useEffect(() => {
    setRenderCount(Math.min(initialBatch, totalProductsCount));
  }, [totalProductsCount, initialBatch]);

  useEffect(() => {
    if (renderCount >= totalProductsCount) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setRenderCount((prev) => {
        const next = Math.min(prev + batchSize, totalProductsCount);
        return next;
      });
    };
    const t = setTimeout(tick, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [batchSize, totalProductsCount, renderCount]);

  const scrollToCategory = (cat: string) => {
    const normalized = String(cat || '').trim();
    if (!normalized) return;

    const topTarget = sectionsContainerRef.current;
    if (normalized === 'الكل') {
      if (topTarget) {
        try {
          topTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        } catch {
        }
      }
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
      }
      return;
    }

    const el = categoryHeaderRefs.current[normalized];
    if (el) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {
      }
      return;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (!displayCategories.length) return;

    const headers = displayCategories
      .map((c) => categoryHeaderRefs.current[c])
      .filter(Boolean) as HTMLDivElement[];
    if (!headers.length) return;

    let last: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));

        const topMost = visible[0]?.target as HTMLElement | undefined;
        const next = topMost ? String(topMost.dataset.category || '').trim() : '';
        if (next && next !== last) {
          last = next;
          if (activeCategory !== next) {
            setActiveCategory(next);
          }
        }
      },
      {
        root: null,
        threshold: [0.1, 0.2],
        rootMargin: '-110px 0px -70% 0px',
      },
    );

    headers.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [activeCategory, displayCategories, setActiveCategory]);

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
      {normalizedCategories.length > 1 && (
        <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 flex-row-reverse">
            {normalizedCategories.map((cat, idx) => {
              const shape = (currentDesign as any)?.categoryIconShape || 'circular';
              const size = (currentDesign as any)?.categoryIconSize || 'medium';
              const iconImage = (currentDesign as any)?.categoryIconImage || '';

              const sizeClasses = {
                small: 'w-10 h-10 text-lg',
                medium: 'w-14 h-14 text-2xl',
                large: 'w-20 h-20 text-3xl',
              };

              const shapeClasses = {
                circular: 'rounded-full',
                square: 'rounded-2xl',
                large: 'rounded-3xl',
              };

              const containerSizeClasses = {
                small: 'min-w-[60px]',
                medium: 'min-w-[80px]',
                large: 'min-w-[100px]',
              };

              const categoryIcons: Record<string, string> = {
                'الكل': '🏠',
                'ملابس': '👕',
                'إلكترونيات': '📱',
                'أحذية': '👟',
                'ساعات': '⌚',
                'عام': '📦',
              };

              const icon = categoryIcons[cat] || '📦';

              return (
                <div
                  key={cat}
                  className={`${containerSizeClasses[size]} flex flex-col items-center gap-2 cursor-pointer group`}
                  onClick={() => {
                    setActiveCategory(cat);
                    scrollToCategory(cat);
                  }}
                >
                  <div
                    className={`${sizeClasses[size]} ${shapeClasses[shape]} flex items-center justify-center bg-white shadow-lg border-2 ${
                      activeCategory === cat ? 'border-[#00E5FF] scale-110' : 'border-slate-100'
                    } transition-transform group-hover:scale-105 group-hover:shadow-xl`}
                    style={activeCategory === cat ? { borderColor: primaryColor } : undefined}
                  >
                    {iconImage ? (
                      <img src={iconImage} alt={cat} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>
                  <span className={`text-xs font-black ${activeCategory === cat ? 'text-[#00E5FF]' : 'text-slate-700'}`} style={activeCategory === cat ? { color: primaryColor } : undefined}>
                    {cat}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد منتجات في هذا القسم حالياً</p>
        </div>
      ) : (
        <div ref={sectionsContainerRef} className="space-y-10">
          {(() => {
            let remaining = renderCount;
            return displayCategories.map((cat) => {
              const list = categorizedProducts.get(cat) || [];
              if (!list.length) return null;
              const take = Math.max(0, Math.min(remaining, list.length));
              remaining -= take;
              const visible = list.slice(0, take);

              return (
                <section key={cat} className="space-y-5">
                  <div
                    ref={(el) => { categoryHeaderRefs.current[cat] = el; }}
                    data-category={cat}
                    className="scroll-mt-28"
                  >
                    <div className="flex items-center justify-between flex-row-reverse">
                      <h3 className="font-black text-base md:text-xl text-slate-900">{cat}</h3>
                      <span className="text-xs md:text-sm font-black text-slate-400">{list.length}</span>
                    </div>
                  </div>

                  {visible.length ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
                      {visible.map((prod) => (
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
                          isPreview={isPreview}
                          onProductClick={onProductClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-10">
                      {Array.from({ length: Math.min(6, list.length) }).map((_, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-50">
                          <Skeleton className="aspect-square rounded-2xl mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            });
          })()}
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
