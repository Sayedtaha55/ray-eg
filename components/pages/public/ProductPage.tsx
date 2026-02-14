
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { RayDB } from '@/constants';
import { Product, Offer, Shop } from '@/types';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, CalendarCheck, ArrowRight, Heart, 
  Share2, ShieldCheck, Truck, Package, Store, Loader2, AlertCircle, Home, MessageCircle
} from 'lucide-react';
import ReservationModal from '../shared/ReservationModal';
import CartDrawer from '../shared/CartDrawer';
import { Skeleton } from '@/components/common/ui';
import { ApiService } from '@/services/api.service';
import { useCartSound } from '@/hooks/useCartSound';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSound } = useCartSound();
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Array<{ optionId: string; variantId: string }>>([]);
  const [selectedMenuTypeId, setSelectedMenuTypeId] = useState('');
  const [selectedMenuSizeId, setSelectedMenuSizeId] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedFashionColorValue, setSelectedFashionColorValue] = useState('');
  const [selectedFashionSize, setSelectedFashionSize] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');

  useEffect(() => {
    const syncCart = () => setCartItems(RayDB.getCart());
    syncCart();
    window.addEventListener('cart-updated', syncCart);
    return () => window.removeEventListener('cart-updated', syncCart);
  }, []);

  useEffect(() => {
    setSelectedFashionColorValue('');
    setSelectedFashionSize('');
    setSelectedPackId('');
  }, [(product as any)?.id]);

  const removeFromCart = (lineId: string) => RayDB.removeFromCart(lineId);
  const updateCartItemQuantity = (lineId: string, delta: number) => RayDB.updateCartItemQuantity(lineId, delta);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);
      try {
        if (!id) {
          setError(true);
          return;
        }

        setSelectedAddons([]);
        setSelectedMenuTypeId('');
        setSelectedMenuSizeId('');

        let p: any = null;
        try {
          p = await ApiService.getProductById(String(id));
        } catch {
          p = null;
        }

        let o: any = null;
        if (p?.id) {
          setProduct(p);

          const shopId = (p as any).shopId || (p as any).shop_id;
          const [offerRes, shopRes] = await Promise.allSettled([
            ApiService.getOfferByProductId(String(p.id)),
            shopId ? ApiService.getShopBySlugOrId(String(shopId)) : Promise.resolve(null),
          ]);

          if (offerRes.status === 'fulfilled') {
            o = offerRes.value;
            if (o) setOffer(o);
          }

          if (shopRes.status === 'fulfilled') {
            const s = shopRes.value as any;
            if (s) {
              setShop(s);
              // Note: Don't track visit here - only track on shop page, not product page
              // to prevent inflated visit numbers
            }
          }

          const favs = RayDB.getFavorites();
          setIsFavorite(favs.includes(String(p.id)));
          return;
        }

        // Fallback: treat id as offerId
        const found = await ApiService.getOfferById(String(id));
        if (found) {
          setOffer(found as any);

          const productId = (found as any)?.productId;
          let prodResolved: any = null;
          if (productId) {
            try {
              prodResolved = await ApiService.getProductById(String(productId));
            } catch {
              prodResolved = null;
            }
          }
          if (prodResolved?.id) {
            setProduct(prodResolved);
            const favs = RayDB.getFavorites();
            setIsFavorite(favs.includes(String(prodResolved.id)));
          } else {
            setError(true);
          }

          const shopId = (found as any)?.shopId;
          if (shopId) {
            try {
              const s = await ApiService.getShopBySlugOrId(String(shopId));
              setShop(s);
              // Note: Don't track visit here - only track on shop page, not product page
              // to prevent inflated visit numbers
            } catch {
            }
          }
        } else {
          setError(true);
        }
      } catch (err) {
        // Error loading product - handled silently
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  useEffect(() => {
    const isRestaurant = shop?.category === Category.RESTAURANT;
    if (!isRestaurant) {
      setSelectedMenuTypeId('');
      setSelectedMenuSizeId('');
      return;
    }

    const defs = Array.isArray((product as any)?.menuVariants)
      ? (product as any).menuVariants
      : (Array.isArray((product as any)?.menu_variants) ? (product as any).menu_variants : []);
    if (!Array.isArray(defs) || defs.length === 0) {
      setSelectedMenuTypeId('');
      setSelectedMenuSizeId('');
      return;
    }

    setSelectedMenuTypeId((prev) => {
      const exists = defs.some((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(prev || '').trim());
      if (exists) return prev;
      return String(defs[0]?.id || defs[0]?.typeId || defs[0]?.variantId || '').trim();
    });
  }, [shop?.category, (product as any)?.id]);

  useEffect(() => {
    const isRestaurant = shop?.category === Category.RESTAURANT;
    if (!isRestaurant) return;
    const defs = Array.isArray((product as any)?.menuVariants)
      ? (product as any).menuVariants
      : (Array.isArray((product as any)?.menu_variants) ? (product as any).menu_variants : []);
    if (!Array.isArray(defs) || defs.length === 0) return;

    const type = defs.find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim());
    const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
    if (sizes.length === 0) {
      setSelectedMenuSizeId('');
      return;
    }

    setSelectedMenuSizeId((prev) => {
      const exists = sizes.some((s: any) => String(s?.id || s?.sizeId || '').trim() === String(prev || '').trim());
      if (exists) return prev;
      return String(sizes[0]?.id || sizes[0]?.sizeId || '').trim();
    });
  }, [shop?.category, (product as any)?.id, selectedMenuTypeId]);

  const toggleFavorite = () => {
    if (product) {
      const state = RayDB.toggleFavorite(product.id);
      setIsFavorite(state);
      // Notify other components that favorites changed
      window.dispatchEvent(new Event('ray-db-update'));
      
      // Show toast notification
      const message = state ? 'تمت إضافة المنتج للمفضلة! ❤️' : 'تم حذف المنتج من المفضلة';
      // Simple notification (you can replace with a proper toast system)
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm animate-pulse';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const isFood = shop?.category === Category.FOOD;
    const packDefs = isFood
      ? (Array.isArray((product as any)?.packOptions)
        ? (product as any).packOptions
        : (Array.isArray((product as any)?.pack_options) ? (product as any).pack_options : []))
      : [];
    const hasPacks = Array.isArray(packDefs) && packDefs.length > 0;
    const selectedPack = hasPacks
      ? (packDefs as any[]).find((p: any) => String(p?.id || '').trim() === String(selectedPackId || '').trim())
      : null;
    const packPriceRaw = selectedPack ? (typeof selectedPack?.price === 'number' ? selectedPack.price : Number(selectedPack?.price || NaN)) : NaN;
    const packPrice = Number.isFinite(packPriceRaw) && packPriceRaw >= 0 ? packPriceRaw : NaN;

    const menuVariantsDef = isRestaurant
      ? (Array.isArray((product as any)?.menuVariants)
        ? (product as any).menuVariants
        : (Array.isArray((product as any)?.menu_variants) ? (product as any).menu_variants : []))
      : [];
    const hasMenuVariants = Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0;
    if (hasMenuVariants && (!selectedMenuTypeId || !selectedMenuSizeId)) {
      try {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
        toast.textContent = 'يرجى اختيار النوع والحجم';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      } catch {
      }
      return;
    }

    if (shop?.category === Category.FASHION) {
      if (fashionColors.length === 0 || fashionSizes.length === 0) {
        try {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
          toast.textContent = 'هذا المنتج يحتاج تحديد لون ومقاس من لوحة التاجر';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2500);
        } catch {
        }
        return;
      }
      if (!selectedFashionColorValue || !selectedFashionSize) {
        try {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
          toast.textContent = 'يرجى اختيار اللون والمقاس';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2500);
        } catch {
        }
        return;
      }
    }

    if (hasPacks && !selectedPackId) {
      try {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
        toast.textContent = 'يرجى اختيار الباقة';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      } catch {
      }
      return;
    }

    // Play directly on click for mobile browsers (iOS) to allow audio
    playSound();

    const addonsTotal = (() => {
      const isRestaurant = shop?.category === Category.RESTAURANT;
      const addonsDef = isRestaurant
        ? (Array.isArray((shop as any)?.addons) ? (shop as any).addons : [])
        : (Array.isArray((product as any)?.addons) ? (product as any).addons : []);
      const priceByKey = new Map<string, number>();
      const labelByKey = new Map<string, string>();
      const optionNameById = new Map<string, string>();
      const optionImageById = new Map<string, string>();
      for (const g of addonsDef || []) {
        const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
        for (const opt of options) {
          const optId = String(opt?.id || '').trim();
          if (!optId) continue;
          optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
          if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
            optionImageById.set(optId, String(opt.imageUrl).trim());
          }
          const vars = Array.isArray(opt?.variants) ? opt.variants : [];
          for (const v of vars) {
            const vid = String(v?.id || '').trim();
            if (!vid) continue;
            const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
            priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
            labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
          }
        }
      }
      return (selectedAddons || []).reduce((sum, a) => sum + (priceByKey.get(`${a.optionId}:${a.variantId}`) || 0), 0);
    })();

    const normalizedAddons = (() => {
      const isRestaurant = shop?.category === Category.RESTAURANT;
      const addonsDef = isRestaurant
        ? (Array.isArray((shop as any)?.addons) ? (shop as any).addons : [])
        : (Array.isArray((product as any)?.addons) ? (product as any).addons : []);
      const priceByKey = new Map<string, number>();
      const labelByKey = new Map<string, string>();
      const optionNameById = new Map<string, string>();
      const optionImageById = new Map<string, string>();
      for (const g of addonsDef || []) {
        const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
        for (const opt of options) {
          const optId = String(opt?.id || '').trim();
          if (!optId) continue;
          optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
          if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
            optionImageById.set(optId, String(opt.imageUrl).trim());
          }
          const vars = Array.isArray(opt?.variants) ? opt.variants : [];
          for (const v of vars) {
            const vid = String(v?.id || '').trim();
            if (!vid) continue;
            const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
            priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
            labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
          }
        }
      }

      return (selectedAddons || []).map((a) => {
        const key = `${a.optionId}:${a.variantId}`;
        return {
          optionId: a.optionId,
          optionName: optionNameById.get(a.optionId) || a.optionId,
          optionImage: optionImageById.get(a.optionId) || null,
          variantId: a.variantId,
          variantLabel: labelByKey.get(key) || a.variantId,
          price: priceByKey.get(key) || 0,
        };
      });
    })();

    const selectedMenuVariant = (() => {
      if (!hasMenuVariants) return null;
      const type = (menuVariantsDef as any[]).find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim());
      if (!type) return null;
      const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
      const size = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === String(selectedMenuSizeId || '').trim());
      if (!size) return null;
      const priceRaw = typeof (size as any)?.price === 'number' ? (size as any).price : Number((size as any)?.price || 0);
      const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;
      return {
        typeId: String((type as any)?.id || (type as any)?.typeId || (type as any)?.variantId || '').trim(),
        typeName: String((type as any)?.name || (type as any)?.label || '').trim() || String(selectedMenuTypeId || ''),
        sizeId: String((size as any)?.id || (size as any)?.sizeId || '').trim(),
        sizeLabel: String((size as any)?.label || (size as any)?.name || '').trim() || String(selectedMenuSizeId || ''),
        price,
      };
    })();

    const basePrice = hasMenuVariants
      ? Number((selectedMenuVariant as any)?.price || 0)
      : (hasPacks && Number.isFinite(packPrice)
        ? packPrice
        : (() => {
        if (shop?.category === Category.FASHION) {
          const sizeLabel = String(selectedFashionSize || '').trim();
          const selected = (fashionSizes as any[]).find((s: any) => String(s?.label || '').trim() === sizeLabel);
          const prices = (fashionSizes as any[])
            .map((s: any) => Number(s?.price))
            .filter((n: any) => Number.isFinite(n) && n >= 0);
          const minSize = prices.length > 0 ? Math.min(...prices) : NaN;
          const rawPrice = selected && Number.isFinite(Number((selected as any)?.price))
            ? Number((selected as any)?.price)
            : (Number.isFinite(minSize) ? minSize : Number(offer ? offer.newPrice : product.price) || 0);
          const disc = typeof (offer as any)?.discount === 'number' ? (offer as any).discount : Number((offer as any)?.discount);
          if (Number.isFinite(disc) && disc > 0) {
            return Math.round(rawPrice * (1 - disc / 100) * 100) / 100;
          }
          return rawPrice;
        }
        return Number(offer ? offer.newPrice : product.price) || 0;
      })());

    const unitPrice = (Number(basePrice) || 0) + (Number(addonsTotal) || 0);
    const event = new CustomEvent('add-to-cart', { 
      detail: { 
        ...product, 
        price: unitPrice,
        quantity: 1, 
        shopId: shop?.id, 
        shopName: shop?.name,
        addons: normalizedAddons,
        variantSelection: shop?.category === Category.FASHION
          ? {
              kind: 'fashion',
              colorName: String((fashionColors.find((c: any) => String(c?.value || '').trim() === String(selectedFashionColorValue || '').trim()) as any)?.name || '').trim(),
              colorValue: String(selectedFashionColorValue || '').trim(),
              size: String(selectedFashionSize || '').trim(),
            }
          : (hasPacks
            ? { kind: 'pack', packId: String(selectedPackId || '').trim() }
            : selectedMenuVariant),
        unit: (product as any)?.unit,
        __skipSound: true,
      } 
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white" dir="rtl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
            <div className="lg:col-span-6">
              <Skeleton className="w-full aspect-[4/5] rounded-[2.5rem]" />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex items-center gap-3 justify-end">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-black mb-4">عفواً، المنتج غير متاح</h2>
        <p className="text-slate-500 font-bold mb-8">ربما تم حذفه أو أن الرابط غير صحيح.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2"
        >
          <Home size={18} /> العودة للرئيسية
        </button>
      </div>
    );
  }

  const currentPrice = offer ? offer.newPrice : product.price;
  const isRestaurant = shop?.category === Category.RESTAURANT;
  const isFashion = shop?.category === Category.FASHION;
  const productImageSrc = String((product as any)?.imageUrl || (product as any)?.image_url || '').trim();
  const galleryImages = useMemo(() => {
    const extras = Array.isArray((product as any)?.images) ? (product as any).images : [];
    const merged = [productImageSrc, ...extras]
      .map((u) => String(u || '').trim())
      .filter(Boolean);
    const uniq: string[] = [];
    for (const u of merged) {
      if (!uniq.includes(u)) uniq.push(u);
    }
    return uniq;
  }, [productImageSrc, (product as any)?.images]);
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const touchStartXRef = useRef<number | null>(null);
  useEffect(() => {
    setActiveImageSrc((prev) => {
      const next = String(prev || '').trim();
      if (next && galleryImages.includes(next)) return next;
      return galleryImages[0] || '';
    });
  }, [galleryImages]);

  const goToGalleryIndex = (nextIndex: number) => {
    if (!galleryImages.length) return;
    const idx = Math.max(0, Math.min(nextIndex, galleryImages.length - 1));
    setActiveImageSrc(galleryImages[idx] || '');
  };

  const onGalleryTouchStart = (e: React.TouchEvent) => {
    try {
      touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
    } catch {
      touchStartXRef.current = null;
    }
  };

  const onGalleryTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (typeof startX !== 'number') return;
    const endX = (() => {
      try {
        return e.changedTouches?.[0]?.clientX;
      } catch {
        return undefined;
      }
    })();
    if (typeof endX !== 'number') return;

    const dx = endX - startX;
    if (Math.abs(dx) < 35) return;
    const currentIndex = galleryImages.indexOf(activeImageSrc);
    const idx = currentIndex >= 0 ? currentIndex : 0;
    // RTL: swipe left => next, swipe right => prev
    if (dx < 0) goToGalleryIndex(idx + 1);
    else goToGalleryIndex(idx - 1);
  };

  const fashionColors = useMemo(() => {
    const raw = (product as any)?.colors;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((c: any) => ({ name: String(c?.name || '').trim(), value: String(c?.value || '').trim() }))
      .filter((c: any) => c.name && c.value);
  }, [(product as any)?.colors]);
  const fashionSizes = useMemo(() => {
    const raw = (product as any)?.sizes;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((s: any) => {
        if (typeof s === 'string') {
          const label = String(s || '').trim();
          if (!label) return null;
          return { label, price: NaN };
        }
        if (s && typeof s === 'object') {
          const label = String((s as any)?.label || (s as any)?.name || (s as any)?.size || (s as any)?.id || '').trim();
          if (!label) return null;
          const priceRaw = typeof (s as any)?.price === 'number' ? (s as any).price : Number((s as any)?.price);
          const price = Number.isFinite(priceRaw) ? Math.round(priceRaw * 100) / 100 : NaN;
          return { label, price };
        }
        return null;
      })
      .filter(Boolean) as Array<{ label: string; price: number }>;
  }, [(product as any)?.sizes]);
  const menuVariantsDef = isRestaurant
    ? (Array.isArray((product as any)?.menuVariants)
      ? (product as any).menuVariants
      : (Array.isArray((product as any)?.menu_variants) ? (product as any).menu_variants : []))
    : [];
  const hasMenuVariants = Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0;
  const selectedMenuVariant = (() => {
    if (!hasMenuVariants) return null;
    const type = (menuVariantsDef as any[]).find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim());
    if (!type) return null;
    const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
    const size = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === String(selectedMenuSizeId || '').trim());
    if (!size) return null;
    const priceRaw = typeof (size as any)?.price === 'number' ? (size as any).price : Number((size as any)?.price || 0);
    const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;
    return {
      typeId: String((type as any)?.id || (type as any)?.typeId || (type as any)?.variantId || '').trim(),
      typeName: String((type as any)?.name || (type as any)?.label || '').trim() || String(selectedMenuTypeId || ''),
      sizeId: String((size as any)?.id || (size as any)?.sizeId || '').trim(),
      sizeLabel: String((size as any)?.label || (size as any)?.name || '').trim() || String(selectedMenuSizeId || ''),
      price,
    };
  })();
  const addonsDef = isRestaurant
    ? (Array.isArray((shop as any)?.addons) ? (shop as any).addons : [])
    : (Array.isArray((product as any)?.addons) ? (product as any).addons : []);
  const addonsTotal = (() => {
    const priceByKey = new Map<string, number>();
    for (const g of addonsDef || []) {
      const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
      for (const opt of options) {
        const optId = String(opt?.id || '').trim();
        if (!optId) continue;
        const vars = Array.isArray(opt?.variants) ? opt.variants : [];
        for (const v of vars) {
          const vid = String(v?.id || '').trim();
          if (!vid) continue;
          const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
        }
      }
    }
    return (selectedAddons || []).reduce((sum, a) => sum + (priceByKey.get(`${a.optionId}:${a.variantId}`) || 0), 0);
  })();
  const basePrice = hasMenuVariants
    ? (() => {
      const sel = selectedMenuVariant as any;
      const typeId = String(sel?.typeId || '').trim();
      const sizeId = String(sel?.sizeId || '').trim();
      const rows = Array.isArray((offer as any)?.variantPricing) ? (offer as any).variantPricing : [];
      const found = rows.find((r: any) => String(r?.typeId || r?.variantId || r?.type || r?.variant || '').trim() === typeId
        && String(r?.sizeId || r?.size || '').trim() === sizeId);
      const priceRaw = typeof found?.newPrice === 'number' ? found.newPrice : Number(found?.newPrice || NaN);
      if (Number.isFinite(priceRaw) && priceRaw >= 0) return priceRaw;
      return Number(sel?.price || 0);
    })()
    : (() => {
      if (isFashion) {
        const sizeLabel = String(selectedFashionSize || '').trim();
        const selected = (fashionSizes as any[]).find((s: any) => String(s?.label || '').trim() === sizeLabel);
        const prices = (fashionSizes as any[])
          .map((s: any) => Number(s?.price))
          .filter((n: any) => Number.isFinite(n) && n >= 0);
        const minSize = prices.length > 0 ? Math.min(...prices) : NaN;
        const rawPrice = selected && Number.isFinite(Number((selected as any)?.price))
          ? Number((selected as any)?.price)
          : (Number.isFinite(minSize) ? minSize : Number(currentPrice) || 0);
        const disc = typeof (offer as any)?.discount === 'number' ? (offer as any).discount : Number((offer as any)?.discount);
        if (Number.isFinite(disc) && disc > 0) {
          return Math.round(rawPrice * (1 - disc / 100) * 100) / 100;
        }
        return rawPrice;
      }
      return Number(currentPrice) || 0;
    })();
  const unitPrice = (Number(basePrice) || 0) + (Number(addonsTotal) || 0);
  const hasDiscount = !!offer;
  const trackStock = typeof (product as any)?.trackStock === 'boolean'
    ? (product as any).trackStock
    : (typeof (product as any)?.track_stock === 'boolean' ? (product as any).track_stock : true);

  // WhatsApp button logic
  const shopPhone = shop?.phone || '';
  const shopWhatsApp = (shop as any)?.layoutConfig?.whatsapp || shopPhone;
  const whatsappDigits = String(shopWhatsApp || '').replace(/[^\d]/g, '');
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`مرحبا ${shop?.name || ''}، أنا مهتم بمنتج: ${product?.name || ''}`)}`
    : '';

  const WhatsAppIcon = (
    <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M19.11 17.48c-.28-.14-1.64-.81-1.9-.9-.25-.1-.43-.14-.62.14-.18.28-.71.9-.88 1.09-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.63-1.54-1.9-.16-.28-.02-.43.12-.57.13-.13.28-.32.43-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.48-.07-.14-.62-1.5-.86-2.06-.23-.55-.46-.48-.62-.49h-.53c-.18 0-.48.07-.73.35-.25.28-.96.94-.96 2.29s.98 2.65 1.11 2.83c.14.18 1.93 2.95 4.67 4.13.65.28 1.16.45 1.56.57.65.2 1.24.17 1.7.1.52-.08 1.64-.67 1.87-1.31.23-.65.23-1.2.16-1.31-.07-.12-.25-.18-.53-.32z" />
      <path d="M26.72 5.28A14.92 14.92 0 0 0 16.02 0C7.18 0 0 7.18 0 16.02c0 2.82.74 5.57 2.14 7.99L0 32l8.2-2.09a15.9 15.9 0 0 0 7.82 2c8.84 0 16.02-7.18 16.02-15.9 0-4.27-1.66-8.29-4.32-10.73zm-10.7 24.1a13.2 13.2 0 0 1-6.73-1.84l-.48-.28-4.87 1.24 1.3-4.74-.31-.49a13.14 13.14 0 0 1-2.01-7.25c0-7.22 5.88-13.1 13.1-13.1 3.5 0 6.78 1.36 9.23 3.83a12.92 12.92 0 0 1 3.86 9.27c0 7.22-5.88 13.36-13.09 13.36z" />
    </svg>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20 text-right font-sans" dir="rtl">
      {/* Cart Icon in Header for Mobile */}
      <div className="fixed top-24 right-4 z-[90] lg:hidden">
        <CartIconWithAnimation 
          count={cartItems.length}
          onClick={() => setIsCartOpen(true)}
        />
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 font-black mb-12 hover:text-black transition-all"
      >
        <ArrowRight size={20} /> العودة للسابق
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        {/* Left: Image Gallery */}
        <MotionDiv 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl"
          onTouchStart={onGalleryTouchStart}
          onTouchEnd={onGalleryTouchEnd}
        >
          <img loading="lazy" src={activeImageSrc || product.imageUrl || (product as any).image_url} className="w-full h-full object-contain" alt={product.name} />
          {hasDiscount && (
            <div className="absolute top-10 left-10 bg-[#BD00FF] text-white px-8 py-3 rounded-2xl font-black text-xl shadow-2xl">
              -{offer?.discount}%
            </div>
          )}
          <button 
            onClick={toggleFavorite}
            className={`absolute top-10 right-10 p-5 rounded-3xl backdrop-blur-md transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/40 text-slate-900 hover:bg-white'}`}
          >
            <Heart size={28} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </MotionDiv>
        {galleryImages.length > 1 && (
          <div className="mt-4 grid grid-cols-6 gap-2">
            {galleryImages.slice(0, 6).map((src) => {
              const active = src === activeImageSrc;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImageSrc(src)}
                  className={`aspect-square rounded-2xl overflow-hidden border transition-all ${active ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <img loading="lazy" src={src} className="w-full h-full object-contain md:object-cover" alt="thumb" />
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Info */}
        <MotionDiv 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
             {shop && (
               <Link to={`/shop/${shop.slug}`} className="inline-flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-full border border-slate-100 group">
                  <img src={shop.logoUrl || (shop as any).logo_url} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm font-black text-slate-900 group-hover:text-[#00E5FF] transition-colors">{shop.name}</span>
               </Link>
             )}
             <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">{product.name}</h1>
             <div className="flex items-center gap-6">
                <span className="text-4xl md:text-6xl font-black text-[#00E5FF] tracking-tighter">ج.م {unitPrice}</span>
                {hasDiscount && !hasMenuVariants && (
                  <span className="text-2xl md:text-3xl text-slate-300 line-through font-bold">ج.م {product.price}</span>
                )}
             </div>
          </div>

          {isFashion && (fashionColors.length > 0 || fashionSizes.length > 0) && (
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
              {fashionColors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-500">الألوان</p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {fashionColors.map((c: any) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedFashionColorValue(String(c.value || '').trim())}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border font-black text-xs transition-all ${
                          String(selectedFashionColorValue || '').trim() === String(c.value || '').trim()
                            ? 'bg-white border-slate-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c.value }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {fashionSizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black text-slate-500">المقاسات</p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {fashionSizes.map((s: any) => (
                      <button
                        key={String(s?.label || '')}
                        type="button"
                        onClick={() => setSelectedFashionSize(String(s?.label || '').trim())}
                        className={`inline-flex items-center px-3 py-2 rounded-full border font-black text-xs transition-all ${
                          String(selectedFashionSize || '').trim() === String(s?.label || '').trim()
                            ? 'bg-white border-slate-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {String(s?.label || '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
             {isRestaurant && hasMenuVariants && (
               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black">اختيار النوع والحجم</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <p className="text-xs font-black text-slate-500">النوع</p>
                     <select
                       value={selectedMenuTypeId}
                       onChange={(e) => setSelectedMenuTypeId(String(e.target.value || ''))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-black"
                     >
                       {(menuVariantsDef as any[]).map((t: any, idx: number) => {
                         const tid = String(t?.id || t?.typeId || t?.variantId || idx).trim();
                         const label = String(t?.name || t?.label || '').trim() || tid;
                         return (
                           <option key={tid} value={tid}>
                             {label}
                           </option>
                         );
                       })}
                     </select>
                   </div>

                   <div className="space-y-2">
                     <p className="text-xs font-black text-slate-500">الحجم</p>
                     <select
                       value={selectedMenuSizeId}
                       onChange={(e) => setSelectedMenuSizeId(String(e.target.value || ''))}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-black"
                     >
                       {(() => {
                         const type = (menuVariantsDef as any[]).find(
                           (t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim(),
                         );
                         const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
                         return sizes.map((s: any, idx: number) => {
                           const sid = String(s?.id || s?.sizeId || idx).trim();
                           const label = String(s?.label || s?.name || '').trim() || sid;
                           const priceRaw = typeof s?.price === 'number' ? s.price : Number(s?.price || 0);
                           const p = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : 0;
                           return (
                             <option key={sid} value={sid}>
                               {label} (ج.م {p})
                             </option>
                           );
                         });
                       })()}
                     </select>
                   </div>
                 </div>
               </div>
             )}
             {isRestaurant && Array.isArray(addonsDef) && addonsDef.length > 0 && (
               <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black">منتجات إضافية</h3>
                   <span className="text-xs font-black text-slate-400">اختياري</span>
                 </div>

                 <div className="space-y-6">
                   {(addonsDef as any[]).map((group, gi) => (
                     <div key={String(group?.id || gi)} className="space-y-4">
                       {group?.title ? <p className="text-xs font-black text-slate-500">{String(group.title)}</p> : null}
                       <div className="space-y-3">
                         {(Array.isArray(group?.options) ? group.options : []).map((opt: any) => {
                           const optId = String(opt?.id || '').trim();
                           if (!optId) return null;
                           const currentVariantId = selectedAddons.find((a) => a.optionId === optId)?.variantId || '';
                           const variants = Array.isArray(opt?.variants) ? opt.variants : [];
                           return (
                             <div key={optId} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                               {opt?.imageUrl && (
                                 <img src={String(opt.imageUrl)} className="w-12 h-12 rounded-xl object-cover" alt={String(opt?.name || '')} />
                               )}
                               <div className="flex-1">
                                 <p className="font-black text-sm text-slate-900">{String(opt?.name || 'إضافة')}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">اختر الحجم</p>
                               </div>
                               <select
                                 value={currentVariantId}
                                 onChange={(e) => {
                                   const v = String(e.target.value || '');
                                   setSelectedAddons((prev) => {
                                     const next = Array.isArray(prev) ? [...prev] : [];
                                     const idx = next.findIndex((x) => x.optionId === optId);
                                     if (!v) {
                                       if (idx >= 0) next.splice(idx, 1);
                                       return next;
                                     }
                                     if (idx >= 0) next[idx] = { optionId: optId, variantId: v };
                                     else next.push({ optionId: optId, variantId: v });
                                     return next;
                                   });
                                 }}
                                 className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-black"
                               >
                                 <option value="">بدون</option>
                                 {variants.map((v: any, idx: number) => {
                                   const vid = String(v?.id || idx).trim();
                                   const label = String(v?.label || v?.name || '').trim() || 'اختيار';
                                   const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
                                   return (
                                     <option key={vid} value={vid}>
                                       {label} (+{Number.isFinite(p) ? p : 0} ج.م)
                                     </option>
                                   );
                                 })}
                               </select>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#BD00FF] shadow-sm">
                   <Package size={24} />
                </div>
                <div>
                   <p className="font-black text-slate-900">حالة المخزون</p>
                   <p className="text-sm text-slate-400 font-bold">
                     {!trackStock ? 'متوفر' : (product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'نفذت الكمية')}
                   </p>
                </div>
             </div>
             
             <div className="flex flex-col md:flex-row gap-4">
               {shop?.category === Category.FOOD && Array.isArray((product as any)?.packOptions) && (product as any).packOptions.length > 0 && (
                 <div className="flex-1">
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right">الباقة</label>
                   <select
                     value={selectedPackId}
                     onChange={(e) => setSelectedPackId(e.target.value)}
                     className="w-full py-6 bg-white border border-slate-200 rounded-[2.5rem] font-black text-lg text-right px-6"
                   >
                     <option value="">اختر</option>
                     {(product as any).packOptions.map((p: any) => (
                       <option key={String(p?.id || '')} value={String(p?.id || '')}>
                         {String(p?.label || p?.name || '').trim() || `${p?.qty} ${p?.unit || (product as any)?.unit || ''}`} - {p?.price} ج.م
                       </option>
                     ))}
                   </select>
                 </div>
               )}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                  <ShoppingCart size={28} /> أضف للسلة
                </button>
                <button 
                  onClick={() => {
                    if (hasMenuVariants && (!selectedMenuTypeId || !selectedMenuSizeId)) {
                      try {
                        const toast = document.createElement('div');
                        toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
                        toast.textContent = 'يرجى اختيار النوع والحجم';
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2500);
                      } catch {
                      }
                      return;
                    }

                    if (shop?.category === Category.FASHION) {
                      if (fashionColors.length === 0 || fashionSizes.length === 0) {
                        try {
                          const toast = document.createElement('div');
                          toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
                          toast.textContent = 'هذا المنتج يحتاج تحديد لون ومقاس من لوحة التاجر';
                          document.body.appendChild(toast);
                          setTimeout(() => toast.remove(), 2500);
                        } catch {
                        }
                        return;
                      }
                      if (!selectedFashionColorValue || !selectedFashionSize) {
                        try {
                          const toast = document.createElement('div');
                          toast.className = 'fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[9999] font-black text-sm';
                          toast.textContent = 'يرجى اختيار اللون والمقاس';
                          document.body.appendChild(toast);
                          setTimeout(() => toast.remove(), 2500);
                        } catch {
                        }
                        return;
                      }
                    }

                    setIsResModalOpen(true);
                  }}
                  className="flex-1 py-6 bg-[#00E5FF] text-black rounded-[2.5rem] font-black text-2xl hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4"
                >
                  <CalendarCheck size={28} /> حجز العرض
                </button>
             </div>

             {shop && (
               <button
                 onClick={() => navigate(`/shop/${shop.slug}`)}
                 className="w-full py-5 bg-slate-50 text-slate-900 rounded-[2.5rem] font-black text-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100"
               >
                 <Store size={22} /> {isRestaurant ? 'زيارة المطعم' : 'زيارة المحل'}
               </button>
             )}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-12 border-t border-slate-100">
             <div className="flex items-center gap-4">
                <Truck className="text-slate-300" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">توصيل سريع</p>
                   <p className="font-bold text-sm">خلال ٢٤-٤٨ ساعة</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <ShieldCheck className="text-slate-300" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-400">ضمان MNMKNK</p>
                   <p className="font-bold text-sm">منتج أصلي ١٠٠٪</p>
                </div>
             </div>
          </div>
        </MotionDiv>
      </div>

      <ReservationModal 
        isOpen={isResModalOpen} 
        onClose={() => setIsResModalOpen(false)} 
        item={{
          id: product.id,
          name: product.name,
          image: product.imageUrl || (product as any).image_url,
          price: unitPrice,
          shopId: shop?.id || 's1',
          shopName: shop?.name || 'MNMKNK',
          addons: (() => {
            const isRestaurant = shop?.category === Category.RESTAURANT;
            const addonsDef = isRestaurant
              ? (Array.isArray((shop as any)?.addons) ? (shop as any).addons : [])
              : (Array.isArray((product as any)?.addons) ? (product as any).addons : []);
            const priceByKey = new Map<string, number>();
            const labelByKey = new Map<string, string>();
            const optionNameById = new Map<string, string>();
            const optionImageById = new Map<string, string>();
            for (const g of addonsDef || []) {
              const options = Array.isArray((g as any)?.options) ? (g as any).options : [];
              for (const opt of options) {
                const optId = String(opt?.id || '').trim();
                if (!optId) continue;
                optionNameById.set(optId, String(opt?.name || opt?.title || '').trim() || optId);
                if (typeof opt?.imageUrl === 'string' && String(opt.imageUrl).trim()) {
                  optionImageById.set(optId, String(opt.imageUrl).trim());
                }
                const vars = Array.isArray(opt?.variants) ? opt.variants : [];
                for (const v of vars) {
                  const vid = String(v?.id || '').trim();
                  if (!vid) continue;
                  const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
                  priceByKey.set(`${optId}:${vid}`, Number.isFinite(p) ? p : 0);
                  labelByKey.set(`${optId}:${vid}`, String(v?.label || v?.name || '').trim() || vid);
                }
              }
            }
            return (selectedAddons || []).map((a) => {
              const key = `${a.optionId}:${a.variantId}`;
              return {
                optionId: a.optionId,
                optionName: optionNameById.get(a.optionId) || a.optionId,
                optionImage: optionImageById.get(a.optionId) || null,
                variantId: a.variantId,
                variantLabel: labelByKey.get(key) || a.variantId,
                price: priceByKey.get(key) || 0,
              };
            });
          })(),
          variantSelection: isFashion
            ? {
                kind: 'fashion',
                colorName: String((fashionColors.find((c: any) => String(c?.value || '').trim() === String(selectedFashionColorValue || '').trim()) as any)?.name || '').trim(),
                colorValue: String(selectedFashionColorValue || '').trim(),
                size: String(selectedFashionSize || '').trim(),
              }
            : selectedMenuVariant,
        }}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartItemQuantity}
      />

      {/* Floating WhatsApp Button for Mobile */}
      {whatsappHref && (
        <div className="fixed bottom-24 right-4 z-[150] flex flex-col gap-4 items-end md:hidden">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-2 border-white bg-[#25D366] text-white"
            aria-label="تواصل عبر واتساب"
          >
            {WhatsAppIcon}
          </a>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
