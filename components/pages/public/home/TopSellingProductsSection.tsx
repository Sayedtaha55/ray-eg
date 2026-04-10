import React, { useMemo, useRef, useCallback } from 'react';
import { TrendingUp, ShoppingBag, ChevronLeft, ChevronRight, Eye, CalendarCheck, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Offer, Product } from '@/types';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product & { shopId?: string; shopName?: string; shopSlug?: string };
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  shopId?: string;
  createdAt?: string;
}

interface TopSellingProductsSectionProps {
  orders: Order[];
  offers: Offer[];
  loading: boolean;
  onSelectItem?: (item: any) => void;
  onAddToCart?: (item: any) => void;
}

// استخدام IntersectionObserver لتأثير الظهور
const useInView = (options?: IntersectionObserverInit) => {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(ref);
      }
    }, options);
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, inView] as const;
};

interface ProductCardProps {
  item: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    shopId?: string;
    shopName?: string;
    shopSlug?: string;
    productId?: string;
    soldCount?: number;
  };
  idx: number;
  onSelectItem?: (item: any) => void;
  onAddToCart?: (item: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, idx, onSelectItem, onAddToCart }) => {
  const [setRef, inView] = useInView({ rootMargin: '50px' });
  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const handleNavigate = () => {
    if (item.shopSlug && item.productId) {
      window.location.href = `/shop/${item.shopSlug}/product/${item.productId}?from=topselling`;
    } else if (item.productId) {
      window.location.href = `/product/${item.productId}`;
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        ...item,
        id: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }
  };

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectItem) {
      onSelectItem({
        ...item,
        id: item.productId || item.id,
        title: item.name,
        imageUrl: item.imageUrl,
        newPrice: item.price,
        shopId: item.shopId,
        shopName: item.shopName,
      });
    }
  };

  return (
    <div
      ref={setRef}
      className={`group flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] ${
        !prefersReducedMotion ? 'transition-all duration-700' : ''
      } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${Math.min(idx * 80, 500)}ms` }}
    >
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
        {/* صورة المنتج */}
        <div
          onClick={handleNavigate}
          className="relative aspect-[4/5] overflow-hidden bg-slate-50 cursor-pointer"
        >
          <img
            loading={idx < 4 ? 'eager' : 'lazy'}
            src={getOptimizedImageUrl(item.imageUrl, 'md')}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== item.imageUrl) {
                img.src = item.imageUrl;
              }
            }}
          />

          {/* عدد المبيعات */}
          {item.soldCount && item.soldCount > 0 && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-black flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#BD00FF]" />
              <span>{item.soldCount.toLocaleString('ar-EG')} مبيع</span>
            </div>
          )}

          {/* الخصم */}
          {item.discount && item.discount > 0 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#BD00FF] text-white px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-purple-500/30">
              -{item.discount}%
            </div>
          )}

          {/* Overlay عند hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye size={20} className="text-white drop-shadow-lg md:w-6 md:h-6" />
          </div>
        </div>

        {/* معلومات المنتج */}
        <div className="p-3 md:p-4 text-right">
          <h3
            onClick={handleNavigate}
            className="text-xs md:text-sm font-black text-slate-900 mb-1 line-clamp-1 cursor-pointer hover:text-cyan-600 transition-colors"
          >
            {item.name}
          </h3>

          {item.shopName && (
            <p className="text-[10px] md:text-xs text-slate-500 mb-2 truncate">
              {item.shopName}
            </p>
          )}

          {/* السعر والأزرار */}
          <div className="flex items-center justify-between flex-row-reverse">
            <div className="text-left">
              {item.originalPrice && item.originalPrice > item.price && (
                <p className="text-[10px] text-slate-400 line-through">
                  ج.م {item.originalPrice}
                </p>
              )}
              <p className="text-sm md:text-lg font-black text-[#BD00FF] tracking-tighter">
                ج.م {item.price}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReserve}
                className="w-7 h-7 md:w-9 md:h-9 bg-[#00E5FF] rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-md"
                aria-label="حجز"
              >
                <CalendarCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
              <button
                onClick={handleAddToCart}
                className="w-7 h-7 md:w-9 md:h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-all shadow-md"
                aria-label="إضافة للسلة"
              >
                <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TopSellingProductsSection: React.FC<TopSellingProductsSectionProps> = ({
  orders,
  offers,
  loading,
  onSelectItem,
  onAddToCart,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // حساب المنتجات الأكثر مبيعًا من الطلبات
  const topProducts = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const productSales: Record<
      string,
      {
        id: string;
        productId: string;
        name: string;
        imageUrl: string;
        price: number;
        shopId?: string;
        shopName?: string;
        shopSlug?: string;
        totalSold: number;
        originalPrice?: number;
      }
    > = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const pid = item.productId;
        if (!pid) return;

        const product = item.product;
        const existing = productSales[pid];

        if (existing) {
          existing.totalSold += item.quantity || 1;
        } else {
          productSales[pid] = {
            id: pid,
            productId: pid,
            name: product?.name || 'منتج',
            imageUrl: product?.imageUrl || '',
            price: product?.price || item.price || 0,
            shopId: order.shopId || product?.shopId,
            shopName: product?.shopName,
            shopSlug: (product as any)?.shopSlug,
            totalSold: item.quantity || 1,
            originalPrice: (product as any)?.originalPrice,
          };
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 12);
  }, [orders]);

  // fallback للعروض إذا لا توجد طلبات
  const displayItems = useMemo(() => {
    if (topProducts.length > 0) {
      return topProducts.map((p) => ({
        id: p.id,
        productId: p.productId,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0,
        shopId: p.shopId,
        shopName: p.shopName,
        shopSlug: p.shopSlug,
        soldCount: p.totalSold,
      }));
    }

    // استخدام العروض كـ fallback
    if (!offers || offers.length === 0) return [];
    return offers.slice(0, 12).map((offer) => ({
      id: offer.id,
      productId: offer.productId,
      name: offer.title,
      imageUrl: offer.imageUrl,
      price: offer.newPrice,
      originalPrice: offer.oldPrice,
      discount: offer.discount,
      shopId: offer.shopId,
      shopName: offer.shopName,
      shopSlug: (offer as any).shopSlug,
      soldCount: undefined,
    }));
  }, [topProducts, offers]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, []);

  const hasOrderData = topProducts.length > 0;
  const sectionTitle = hasOrderData ? 'الأكثر مبيعًا' : 'عروض مميزة';
  const SectionIcon = hasOrderData ? TrendingUp : ShoppingBag;
  const sectionColor = hasOrderData ? 'from-purple-500 to-purple-600' : 'from-cyan-500 to-cyan-600';

  // Skeleton loading
  if (loading) {
    return (
      <section className="mb-12 md:mb-20">
        <div className="flex items-center justify-between mb-6 md:mb-10 px-2">
          <div className="h-8 md:h-10 w-48 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-3 md:gap-4 overflow-hidden px-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] bg-slate-50 rounded-[2rem] overflow-hidden"
            >
              <div className="aspect-[4/5] bg-slate-100 animate-pulse" />
              <div className="p-3 md:p-4">
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse mb-3" />
                <div className="h-8 w-full bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // لا توجد بيانات
  if (displayItems.length === 0) {
    return (
      <section className="mb-12 md:mb-20">
        <div className="flex items-center justify-between mb-6 md:mb-10 px-2 md:px-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${sectionColor} rounded-2xl flex items-center justify-center shadow-lg`}
            >
              <SectionIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tighter text-slate-900">
                {sectionTitle}
              </h2>
              <p className="text-[10px] md:text-sm text-slate-500 font-medium">
                لا توجد بيانات متاحة حالياً.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 md:mb-20">
      {/* العنوان مع أزرار التنقل */}
      <div className="flex items-center justify-between mb-6 md:mb-10 px-2 md:px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${sectionColor} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <SectionIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tighter text-slate-900">
              {sectionTitle}
            </h2>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium hidden sm:block">
              {hasOrderData
                ? 'المنتجات الأكثر طلبًا من عملائنا'
                : 'اكتشف أحدث العروض والتخفيضات'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/offers"
            className="text-xs md:text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors ml-2"
          >
            عرض الكل
          </Link>
          {/* أزرار التنقل - تظهر فقط على الشاشات الكبيرة */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600"
              aria-label="التالي"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600"
              aria-label="السابق"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* قائمة المنتجات - Scroll أفقي */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-5 overflow-x-auto pb-4 px-2 md:px-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayItems.map((item, idx) => (
          <div key={item.id} className="snap-start">
            <ProductCard
              item={item}
              idx={idx}
              onSelectItem={onSelectItem}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(TopSellingProductsSection);
