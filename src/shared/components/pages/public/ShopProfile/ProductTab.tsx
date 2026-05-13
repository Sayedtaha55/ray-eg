import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search, ShoppingBag, X } from 'lucide-react';
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

type RowConfig = {
  id: string;
  imageShape: 'square' | 'portrait' | 'landscape';
  displayMode: 'cards' | 'list' | 'minimal';
  itemsPerRow: number;
  rowMode?: 'grid' | 'carousel';
  layoutDirection?: 'rtl' | 'ltr';
  showArrows?: boolean;
  productNames?: string[];
  scheduleStartAt?: string;
  scheduleEndAt?: string;
  sortMode?: 'default' | 'inStockFirst' | 'topSelling';
  hideOutOfStock?: boolean;
};

const chunkProducts = (input: any[], size: number) => {
  if (!Array.isArray(input) || !input.length) return [] as any[][];
  const validSize = Math.max(1, Math.min(20, Number(size) || 1));
  const out: any[][] = [];
  for (let i = 0; i < input.length; i += validSize) {
    out.push(input.slice(i, i + validSize));
  }
  return out;
};

const ProductRow: React.FC<{
  products: any[];
  rowCfg?: Partial<RowConfig>;
  design: any;
  primaryColor: string;
  offersByProductId: Map<string, any>;
  handleAddToCart: (prod: any, price: number) => void;
  addedItemId: string | null;
  handleReserve: (data: any) => void;
  disableCardMotion: boolean;
  shop: any;
  allowAddToCart?: boolean;
  allowReserve?: boolean;
  isPreview?: boolean;
  onProductClick?: () => void;
}> = ({
  products,
  rowCfg,
  design,
  primaryColor,
  offersByProductId,
  handleAddToCart,
  addedItemId,
  handleReserve,
  disableCardMotion,
  shop,
  allowAddToCart,
  allowReserve,
  isPreview,
  onProductClick,
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const rowMode = String(rowCfg?.rowMode || 'grid');
  const dir = String(rowCfg?.layoutDirection || 'rtl').toLowerCase() === 'ltr' ? 'ltr' : 'rtl';
  const showArrows = rowCfg?.showArrows !== false;
  const itemsPerRow = Math.max(2, Math.min(10, Number(rowCfg?.itemsPerRow) || 3));

  const rowDesign = useMemo(
    () => ({
      ...(design || {}),
      imageAspectRatio: rowCfg?.imageShape || (design as any)?.imageAspectRatio,
      productDisplay: rowCfg?.displayMode || (design as any)?.productDisplay,
    }),
    [design, rowCfg?.displayMode, rowCfg?.imageShape],
  );

  if (!products.length) return null;

  if (rowMode === 'carousel') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-row-reverse gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {showArrows ? (
              <>
                <button
                  type="button"
                  onClick={() => sliderRef.current?.scrollBy({ left: dir === 'rtl' ? 320 : -320, behavior: 'smooth' })}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-all"
                  aria-label={t('shopProfile.prevAria')}
                >
                  {dir === 'rtl' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => sliderRef.current?.scrollBy({ left: dir === 'rtl' ? -320 : 320, behavior: 'smooth' })}
                  className="w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-all"
                  aria-label={t('shopProfile.nextAria')}
                >
                  {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </>
            ) : null}
          </div>
          <span className="text-xs font-black text-slate-500">{t('shopProfile.horizontalView')} ({itemsPerRow} {t('shopProfile.perRow')})</span>
        </div>

        <div
          ref={sliderRef}
          dir={dir}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((prod) => (
            <div
              key={prod.id}
              style={{
                flex: `0 0 clamp(190px, ${Math.round(1000 / itemsPerRow) / 10}%, 330px)`,
                scrollSnapAlign: 'start',
              }}
            >
              <ProductCard
                product={prod}
                design={rowDesign}
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  const colsClass =
    itemsPerRow >= 6
      ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
      : itemsPerRow === 5
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        : itemsPerRow === 4
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          : itemsPerRow === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colsClass} gap-3 md:gap-6 lg:gap-8`}>
      {products.map((prod) => (
        <ProductCard
          key={prod.id}
          product={prod}
          design={rowDesign}
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
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  // Bolt: Use deferred value for search to keep typing responsive during expensive filtering/renders
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const { t } = useTranslation();
  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();

  const sectionsContainerRef = useRef<HTMLDivElement | null>(null);
  const categoryHeaderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const normalizedCategories = useMemo(() => {
    const raw = Array.isArray(categories) ? categories : [];
    const out = raw.map((c) => String(c || '').trim()).filter(Boolean);
    if (!out.includes(t('shopProfile.all'))) return [t('shopProfile.all'), ...out];
    return out;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!normalizedSearchQuery) return Array.isArray(products) ? products : [];
    return (Array.isArray(products) ? products : []).filter((p) => {
      const name = String((p as any)?.name || '').toLowerCase();
      const category = String((p as any)?.category || '').toLowerCase();
      const description = String((p as any)?.description || '').toLowerCase();
      return name.includes(normalizedSearchQuery) || category.includes(normalizedSearchQuery) || description.includes(normalizedSearchQuery);
    });
  }, [products, normalizedSearchQuery]);

  const categorizedProducts = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const p of filteredProducts) {
      const cat = String(p?.category || t('shopProfile.general')).trim() || t('shopProfile.general');
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [filteredProducts]);

  const rowsConfig = useMemo(() => {
    const raw = Array.isArray((currentDesign as any)?.rowsConfig) ? (currentDesign as any).rowsConfig : [];
    return raw
      .filter((row: any) => row && typeof row === 'object')
      .map((row: any, idx: number) => ({
        id: String(row.id || `row-${idx + 1}`),
        imageShape: (String(row.imageShape || 'square') as RowConfig['imageShape']),
        displayMode: (String(row.displayMode || 'cards') as RowConfig['displayMode']),
        itemsPerRow: Math.max(2, Math.min(10, Number(row.itemsPerRow) || 3)),
        rowMode: String(row.rowMode || 'grid') === 'carousel' ? 'carousel' : 'grid',
        layoutDirection: String(row.layoutDirection || 'rtl') === 'ltr' ? 'ltr' : 'rtl',
        showArrows: row.showArrows !== false,
        productNames: Array.isArray(row.productNames)
          ? row.productNames.map((x: any) => String(x || '').trim()).filter(Boolean)
          : [],
        scheduleStartAt: String(row.scheduleStartAt || '').trim(),
        scheduleEndAt: String(row.scheduleEndAt || '').trim(),
        sortMode: String(row.sortMode || 'default') === 'inStockFirst'
          ? 'inStockFirst'
          : String(row.sortMode || 'default') === 'topSelling'
            ? 'topSelling'
            : 'default',
        hideOutOfStock: Boolean(row.hideOutOfStock),
      })) as RowConfig[];
  }, [currentDesign]);

  const displayCategories = useMemo(() => {
    const cats = normalizedCategories.filter((c) => c !== t('shopProfile.all'));
    if (cats.length === 0) return Array.from(categorizedProducts.keys());
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
  const totalProductsCount = filteredProducts.length;
  const [renderCount, setRenderCount] = useState(() => Math.min(initialBatch, totalProductsCount));

  useEffect(() => {
    setRenderCount(Math.min(initialBatch, totalProductsCount));
  }, [totalProductsCount, initialBatch]);

  useEffect(() => {
    if (renderCount >= totalProductsCount) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setRenderCount((prev) => Math.min(prev + batchSize, totalProductsCount));
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
    if (normalized === t('shopProfile.all')) {
      const topTarget = sectionsContainerRef.current;
      if (topTarget) {
        try { topTarget.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; } catch {}
      }
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
      return;
    }
    const el = categoryHeaderRefs.current[normalized];
    if (!el) return;
    try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined' || !displayCategories.length) return;
    const headers = displayCategories.map((c) => categoryHeaderRefs.current[c]).filter(Boolean) as HTMLDivElement[];
    if (!headers.length) return;

    let last: string | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        const topMost = visible[0]?.target as HTMLElement | undefined;
        const next = topMost ? String(topMost.dataset.category || '').trim() : '';
        if (next && next !== last) {
          last = next;
          if (activeCategory !== next) setActiveCategory(next);
        }
      },
      { root: null, threshold: [0.1, 0.2], rootMargin: '-110px 0px -70% 0px' },
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
        <button onClick={retryProductsTab} className={`${buttonPadding} ${buttonShape} text-white font-black transition-opacity hover:opacity-90`} style={{ backgroundColor: primaryColor }}>
          {t('shopProfile.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          dir="rtl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('shopProfile.searchProducts')}
          className="w-full h-12 pr-11 pl-11 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-300 transition-all"
        />
        {searchQuery ? (
          <button
            type="button"
            aria-label={t('shopProfile.clearSearch')}
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {normalizedCategories.length > 1 && (
        <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-4">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 flex-row-reverse">
            {normalizedCategories.map((cat) => {
              const shape = (currentDesign as any)?.categoryIconShape || 'circular';
              const size = (currentDesign as any)?.categoryIconSize || 'medium';
              const categoryImages = ((currentDesign as any)?.categoryImages || {}) as Record<string, string>;
              const legacyDefault = String((currentDesign as any)?.categoryIconImage || '');
              const perCategory = String(categoryImages?.[cat] || '');
              const defaultAll = String(categoryImages?.[t('shopProfile.all')] || '');
              const iconImage = String(
                perCategory ||
                  (cat === t('shopProfile.all') ? defaultAll : '') ||
                  legacyDefault ||
                  '',
              );
              const sizeClasses: Record<string, string> = { small: 'w-10 h-10 text-lg', medium: 'w-14 h-14 text-2xl', large: 'w-20 h-20 text-3xl' };
              const shapeClasses: Record<string, string> = { circular: 'rounded-full', square: 'rounded-2xl', large: 'rounded-3xl' };
              const containerSizeClasses: Record<string, string> = { small: 'min-w-[60px]', medium: 'min-w-[80px]', large: 'min-w-[100px]' };
              const categoryIcons: Record<string, string> = { [t('shopProfile.all')]: '🏠', [t('restaurantsPage.categoryIcons.clothing')]: '👕', [t('restaurantsPage.categoryIcons.electronics')]: '📱', [t('restaurantsPage.categoryIcons.shoes')]: '👟', [t('restaurantsPage.categoryIcons.watches')]: '⌚', [t('shopProfile.general')]: '📦' };
              const icon = categoryIcons[cat] || '📦';
              const active = activeCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  className={`${containerSizeClasses[size]} flex flex-col items-center gap-2 group`}
                  onClick={() => { setActiveCategory(cat); scrollToCategory(cat); }}
                >
                  <div
                    className={`${sizeClasses[size]} ${shapeClasses[shape]} flex items-center justify-center bg-white border-2 transition-all ${active ? 'scale-110 shadow-xl' : 'shadow-md'} group-active:scale-95`}
                    style={{ borderColor: active ? primaryColor : '#E2E8F0', boxShadow: active ? `0 12px 30px ${primaryColor}33` : undefined }}
                  >
                    {iconImage ? (
                      <img
                        src={iconImage}
                        alt={cat}
                        className={`w-full h-full object-cover ${shapeClasses[shape] || 'rounded-full'}`}
                      />
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>
                  <span className={`text-xs font-black transition-colors ${active ? 'text-[#00E5FF]' : 'text-slate-700'}`} style={active ? { color: primaryColor } : undefined}>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="py-32 text-center">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">
            {normalizedSearchQuery ? t('shopProfile.noProductsSearch') : t('shopProfile.noProducts')}
          </p>
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

              let working = [...visible];
              const rowGroups: Array<{ key: string; items: any[]; rowCfg?: RowConfig }> = [];
              rowsConfig.forEach((cfg, idx) => {
                const now = Date.now();
                const from = cfg.scheduleStartAt ? Date.parse(cfg.scheduleStartAt) : NaN;
                const to = cfg.scheduleEndAt ? Date.parse(cfg.scheduleEndAt) : NaN;
                if (Number.isFinite(from) && now < from) return;
                if (Number.isFinite(to) && now > to) return;

                let source = [...working];
                if (cfg.hideOutOfStock) {
                  source = source.filter((p: any) => Number((p as any)?.stock ?? 0) > 0);
                }
                if (cfg.sortMode === 'inStockFirst') {
                  source.sort((a: any, b: any) => Number((b as any)?.stock ?? 0) - Number((a as any)?.stock ?? 0));
                } else if (cfg.sortMode === 'topSelling') {
                  source.sort((a: any, b: any) => {
                    const ao = offersByProductId.get(String((a as any)?.id || ''));
                    const bo = offersByProductId.get(String((b as any)?.id || ''));
                    const as = Number((ao as any)?.discount || 0);
                    const bs = Number((bo as any)?.discount || 0);
                    return bs - as;
                  });
                }

                if (Array.isArray(cfg.productNames) && cfg.productNames.length) {
                  const nameSet = new Set(cfg.productNames.map((n) => String(n).trim().toLowerCase()));
                  source = source.filter((p: any) => nameSet.has(String((p as any)?.name || '').trim().toLowerCase()));
                }

                if (!source.length) return;
                const rowItems = source.slice(0, Math.max(1, cfg.itemsPerRow));
                rowGroups.push({ key: `${cat}-cfg-${cfg.id || idx}`, items: rowItems, rowCfg: cfg });
                const used = new Set(rowItems.map((x: any) => String((x as any)?.id || '')));
                working = working.filter((x: any) => !used.has(String((x as any)?.id || '')));
              });
              const remainingRows: Array<{ key: string; items: any[]; rowCfg?: RowConfig }> = chunkProducts(working, 3).map((items, idx) => ({ key: `${cat}-default-${idx}`, items }));
              const allRows = [...rowGroups, ...remainingRows];

              return (
                <section key={cat} className="space-y-5">
                  <div ref={(el) => { categoryHeaderRefs.current[cat] = el; }} data-category={cat} className="scroll-mt-28">
                    <div className="flex items-center justify-between flex-row-reverse">
                      <h3 className="font-black text-base md:text-xl text-slate-900">{cat}</h3>
                      <span className="text-xs md:text-sm font-black text-slate-400">{list.length}</span>
                    </div>
                  </div>

                  {visible.length ? (
                    <div className="space-y-5">
                      {allRows.map((row) => (
                        <ProductRow
                          key={row.key}
                          products={row.items}
                          rowCfg={row.rowCfg}
                          design={currentDesign}
                          primaryColor={primaryColor}
                          offersByProductId={offersByProductId}
                          handleAddToCart={handleAddToCart}
                          addedItemId={addedItemId}
                          handleReserve={handleReserve}
                          disableCardMotion={disableCardMotion}
                          shop={shop}
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

      {hasMoreProducts && (
        <div className="flex justify-center pt-10">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMoreProducts}
            className={`${buttonPadding} ${buttonShape} bg-white border-2 font-black transition-all disabled:opacity-50`}
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            {loadingMoreProducts ? t('shopProfile.loadingMore') : t('shopProfile.loadMoreProducts')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductTab;
