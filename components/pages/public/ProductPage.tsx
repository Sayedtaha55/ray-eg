import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowRight, Home, ShoppingCart, User } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import { Offer, Product, Shop } from '@/types';
import { Category } from '@/types';
import { useCartSound } from '@/hooks/useCartSound';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';
import { Skeleton } from '@/components/common/ui';
import { coerceBoolean } from '@/components/pages/public/ShopProfile/utils';

import ProductTabs from './product/ProductTabs';
import ProductGallery from './product/ProductGallery';
import ProductDetails from './product/ProductDetails';

const ReservationModal = lazy(() => import('../shared/ReservationModal'));
const CartDrawer = lazy(() => import('../shared/CartDrawer'));

const { useParams, useNavigate } = ReactRouterDOM as any;

const ProductPage: React.FC = () => {
  const { id, slug } = useParams();
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
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [pageBgReady, setPageBgReady] = useState(false);

  const isRestaurant = shop?.category === Category.RESTAURANT;
  const isFashion = shop?.category === Category.FASHION;
  const touchStartXRef = useRef<number | null>(null);

  const hasSalesModule = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return false;
    return raw.some((x: any) => String(x || '').trim() === 'sales');
  }, [shop]);

  const hasReservationsModule = useMemo(() => {
    const raw = (shop as any)?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return false;
    return raw.some((x: any) => String(x || '').trim() === 'reservations');
  }, [shop]);

  const showAddToCartButton = useMemo(() => {
    const design = (shop as any)?.pageDesign;
    const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return true;
    if (!('productCardAddToCart' in elementsVisibility)) return true;
    return coerceBoolean(elementsVisibility['productCardAddToCart'], true);
  }, [shop]);

  const showReserveButton = useMemo(() => {
    const design = (shop as any)?.pageDesign;
    const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return true;
    if (!('productCardReserve' in elementsVisibility)) return true;
    return coerceBoolean(elementsVisibility['productCardReserve'], true);
  }, [shop]);

  const canUseCart = hasSalesModule;
  const canShowAddToCart = canUseCart && showAddToCartButton;
  const canShowReserve = hasReservationsModule && showReserveButton;

  const isVisible = useMemo(() => {
    const design = (shop as any)?.pageDesign || (shop as any)?.page_design;
    const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
    return (key: string, fallback: boolean = true) => {
      if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
      if (!(key in elementsVisibility)) return fallback;
      return coerceBoolean(elementsVisibility[key], fallback);
    };
  }, [shop]);

  const showFooter = isVisible('footer', true);
  const showMobileBottomNav = showFooter && isVisible('mobileBottomNav', true);
  const showMobileBottomNavHome = isVisible('mobileBottomNavHome', true);
  const showMobileBottomNavCart = isVisible('mobileBottomNavCart', true);
  const showMobileBottomNavAccount = isVisible('mobileBottomNavAccount', true);

  const productShopSlug = String(slug || (shop as any)?.slug || '').trim();

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
    if (!canUseCart) return;

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
          return label ? { label, price: NaN } : null;
        }
        if (s && typeof s === 'object') {
          const label = String((s as any)?.label || (s as any)?.name || (s as any)?.size || (s as any)?.id || '').trim();
          const priceRaw = typeof (s as any)?.price === 'number' ? (s as any).price : Number((s as any)?.price);
          const price = Number.isFinite(priceRaw) ? Math.round(priceRaw * 100) / 100 : NaN;
          return label ? { label, price } : null;
        }
        return null;
      })
      .filter(Boolean) as Array<{ label: string; price: number }>;
  }, [(product as any)?.sizes]);

  const packDefs = useMemo(() => {
    const isFood = shop?.category === Category.FOOD;
    if (!isFood) return [];
    const raw = (product as any)?.packOptions ?? (product as any)?.pack_options;
    return Array.isArray(raw) ? raw : [];
  }, [shop?.category, (product as any)?.packOptions, (product as any)?.pack_options]);

  const hasPacks = packDefs.length > 0;

  const menuVariantsDef = useMemo(() => {
    if (!isRestaurant) return [];
    const raw = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
    return Array.isArray(raw) ? raw : [];
  }, [isRestaurant, (product as any)?.menuVariants, (product as any)?.menu_variants]);

  const addonsDef = useMemo(() => {
    return isRestaurant
      ? (Array.isArray((shop as any)?.addons) ? (shop as any).addons : [])
      : (Array.isArray((product as any)?.addons) ? (product as any).addons : []);
  }, [isRestaurant, shop, product]);

  const displayedPrice = useMemo(() => {
    if (offer) return Number(offer.newPrice) || 0;
    if (isRestaurant && Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0) {
      const type = (menuVariantsDef as any[]).find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim());
      const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
      const size = sizes.find((s: any) => String(s?.id || s?.sizeId || '').trim() === String(selectedMenuSizeId || '').trim());
      const priceRaw = typeof (size as any)?.price === 'number' ? (size as any).price : Number((size as any)?.price || NaN);
      const price = Number.isFinite(priceRaw) && priceRaw >= 0 ? priceRaw : NaN;
      if (Number.isFinite(price)) return price;
    }
    return Number(product?.price) || 0;
  }, [offer, product, isRestaurant, menuVariantsDef, selectedMenuTypeId, selectedMenuSizeId]);

  const productImageSrc = useMemo(
    () => String((product as any)?.imageUrl || (product as any)?.image_url || '').trim(),
    [(product as any)?.imageUrl, (product as any)?.image_url],
  );

  const galleryImages = useMemo(() => {
    const extras = Array.isArray((product as any)?.images) ? (product as any).images : [];
    const merged = [productImageSrc, ...extras].map((u) => String(u || '').trim()).filter(Boolean);
    return Array.from(new Set(merged));
  }, [productImageSrc, (product as any)?.images]);

  const [activeImageSrc, setActiveImageSrc] = useState('');
  useEffect(() => {
    setActiveImageSrc((prev) => {
      const next = String(prev || '').trim();
      if (next && galleryImages.includes(next)) return next;
      return galleryImages[0] || '';
    });
  }, [galleryImages]);

  const isLowEndDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    return isMobile && (cores <= 4 || memory <= 4);
  }, []);

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
    let endX: number | undefined;
    try {
      endX = e.changedTouches?.[0]?.clientX;
    } catch {
      endX = undefined;
    }
    if (typeof endX !== 'number') return;

    const dx = endX - startX;
    if (Math.abs(dx) < 35) return;
    const currentIndex = galleryImages.indexOf(activeImageSrc);
    const idx = currentIndex >= 0 ? currentIndex : 0;
    if (dx < 0) setActiveImageSrc(galleryImages[Math.min(idx + 1, galleryImages.length - 1)] || '');
    else setActiveImageSrc(galleryImages[Math.max(idx - 1, 0)] || '');
  };

  const whatsappHref = useMemo(() => {
    const shopPhone = (shop as any)?.phone || '';
    const shopWhatsApp = (shop as any)?.layoutConfig?.whatsapp || shopPhone;
    const digits = String(shopWhatsApp || '').replace(/[^\d]/g, '');
    if (!digits) return '';
    const text = `مرحبا ${shop?.name || ''}، أنا مهتم بمنتج: ${product?.name || ''}`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }, [shop, product]);

  const pageBgColor = useMemo(() => {
    const design = (shop as any)?.pageDesign || (shop as any)?.page_design;
    const raw = (design as any)?.pageBackgroundColor || (design as any)?.backgroundColor;
    return String(raw || '#F8FAFC');
  }, [shop]);

  const pageBgImage = useMemo(() => {
    const design = (shop as any)?.pageDesign || (shop as any)?.page_design;
    return String((design as any)?.backgroundImageUrl || '').trim();
  }, [shop]);

  if (loading) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: pageBgColor }} dir="rtl">
        {pageBgImage ? (
          <img
            key={pageBgImage}
            src={pageBgImage}
            alt=""
            className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 w-full h-full object-cover"
            style={{ opacity: pageBgReady ? 1 : 0 }}
            loading="lazy"
            decoding="async"
            onLoad={() => setPageBgReady(true)}
            onError={() => setPageBgReady(true)}
          />
        ) : null}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 pb-28 md:pb-12">
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
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: pageBgColor }} dir="rtl">
        {pageBgImage ? (
          <img
            key={pageBgImage}
            src={pageBgImage}
            alt=""
            className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 w-full h-full object-cover"
            style={{ opacity: pageBgReady ? 1 : 0 }}
            loading="lazy"
            decoding="async"
            onLoad={() => setPageBgReady(true)}
            onError={() => setPageBgReady(true)}
          />
        ) : null}
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

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: pageBgColor }} dir="rtl">
      {pageBgImage ? (
        <img
          key={pageBgImage}
          src={pageBgImage}
          alt=""
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 w-full h-full object-cover"
          style={{ opacity: pageBgReady ? 1 : 0 }}
          loading="lazy"
          decoding="async"
          onLoad={() => setPageBgReady(true)}
          onError={() => setPageBgReady(true)}
        />
      ) : null}
      <div className={`relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 ${showMobileBottomNav ? 'pb-28 md:pb-12' : ''} text-right font-sans`}>
        {canUseCart ? (
          <div className="fixed top-24 right-4 z-[90] lg:hidden">
            <CartIconWithAnimation count={cartItems.length} onClick={() => setIsCartOpen(true)} />
          </div>
        ) : null}

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black mb-12 hover:text-black transition-all">
          <ArrowRight size={20} /> العودة للسابق
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24" style={{ contentVisibility: 'auto' }}>
          <ProductGallery
            galleryImages={galleryImages}
            activeImageSrc={activeImageSrc}
            setActiveImageSrc={setActiveImageSrc}
            productName={product?.name || ''}
            hasDiscount={!!offer}
            discount={offer?.discount}
            onGalleryTouchStart={onGalleryTouchStart}
            onGalleryTouchEnd={onGalleryTouchEnd}
          />

          <ProductDetails
            product={product}
            shop={shop}
            offer={offer}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            handleShare={() => {}} // TODO
            handleAddToCart={handleAddToCart}
            showAddToCartButton={canShowAddToCart}
            showReserveButton={canShowReserve}
            setIsResModalOpen={setIsResModalOpen}
            displayedPrice={displayedPrice}
            hasDiscount={!!offer}
            isRestaurant={isRestaurant}
            isFashion={isFashion}
            hasPacks={hasPacks}
            packDefs={packDefs}
            selectedPackId={selectedPackId}
            setSelectedPackId={setSelectedPackId}
            menuVariantsDef={menuVariantsDef}
            selectedMenuTypeId={selectedMenuTypeId}
            setSelectedMenuTypeId={setSelectedMenuTypeId}
            selectedMenuSizeId={selectedMenuSizeId}
            setSelectedMenuSizeId={setSelectedMenuSizeId}
            fashionColors={fashionColors}
            selectedFashionColorValue={selectedFashionColorValue}
            setSelectedFashionColorValue={setSelectedFashionColorValue}
            fashionSizes={fashionSizes}
            selectedFashionSize={selectedFashionSize}
            setSelectedFashionSize={setSelectedFashionSize}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
            addonsDef={addonsDef}
            whatsappHref={whatsappHref}
            primaryColor="#00E5FF"
          />

        </div>

        <div className="mt-20">
          <ProductTabs
            activeTab={activeTab as any}
            setActiveTab={setActiveTab as any}
            productDescription={String((product as any)?.description || '').trim()}
            product={product}
            primaryColor="#00E5FF"
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <ReservationModal
          isOpen={isResModalOpen}
          onClose={() => setIsResModalOpen(false)}
          item={product ? {
            id: product.id,
            name: product.name,
            image: productImageSrc,
            price: displayedPrice,
            shopId: shop?.id,
            shopName: shop?.name,
          } : null}
        />
        {canUseCart ? (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onRemove={removeFromCart}
            onUpdateQuantity={updateCartItemQuantity}
          />
        ) : null}
      </Suspense>

      {showMobileBottomNav ? (
        <div className="fixed bottom-0 left-0 right-0 z-[350] md:hidden">
          <div className="mx-auto max-w-[1400px] px-4 pb-4">
            <div className="rounded-[1.8rem] bg-white/95 backdrop-blur border border-slate-100 shadow-2xl overflow-hidden">
              <div className="grid grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    if (productShopSlug) navigate(`/shop/${productShopSlug}`);
                    else navigate('/');
                  }}
                  className={`py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavHome ? '' : 'hidden'} text-slate-500`}
                >
                  <Home size={18} />
                  الرئيسية
                </button>

                {canUseCart ? (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className={`relative py-3.5 flex flex-col items-center justify-center gap-1 font-black text-[10px] ${showMobileBottomNavCart ? '' : 'hidden'} text-slate-500`}
                  >
                    <ShoppingCart size={18} />
                    السلة
                    {Array.isArray(cartItems) && cartItems.length > 0 ? (
                      <span className="absolute top-2 right-6 w-5 h-5 rounded-full bg-[#BD00FF] text-white text-[10px] font-black flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    ) : null}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const raw = localStorage.getItem('ray_user');
                      const user = raw ? JSON.parse(raw) : null;
                      if (user) {
                        navigate('/profile');
                      } else {
                        navigate('/login');
                      }
                    } catch {
                      navigate('/login');
                    }
                  }}
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

export default ProductPage;
