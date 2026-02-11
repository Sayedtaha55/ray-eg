import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarCheck, Heart, Home, Loader2, Share2, ShoppingCart, Truck, ShieldCheck, Package, User } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';
import { Offer, Product, Shop, ShopDesign } from '@/types';
import ReservationModal from '../shared/ReservationModal';
import CartDrawer from '../shared/CartDrawer';
import { useCartSound } from '@/hooks/useCartSound';
import { CartIconWithAnimation } from '@/components/common/CartIconWithAnimation';

const { useParams, useNavigate, Link, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const hexToRgba = (hex: string, alpha: number) => {
  const raw = String(hex || '').replace('#', '').trim();
  const normalized = raw.length === 3 ? raw.split('').map((c) => `${c}${c}`).join('') : raw;
  if (normalized.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const coerceBoolean = (value: any, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const coerceNumber = (value: any, fallback: number) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const ShopProductPage: React.FC = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const fromOffers = useMemo(() => {
    try {
      const q = new URLSearchParams(String(location?.search || ''));
      return String(q.get('from') || '').toLowerCase() === 'offers';
    } catch {
      return false;
    }
  }, [location?.search]);

  const [user, setUser] = useState<any>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { playSound } = useCartSound();

  const [shop, setShop] = useState<Shop | null>(null);
  const [design, setDesign] = useState<ShopDesign | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = RayDB.getFavorites();
      return favs.includes(String(id || ''));
    } catch {
      return false;
    }
  });
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [selectedAddons, setSelectedAddons] = useState<Array<{ optionId: string; variantId: string }>>([]);
  const [selectedMenuTypeId, setSelectedMenuTypeId] = useState('');
  const [selectedMenuSizeId, setSelectedMenuSizeId] = useState('');
  const [activeImageSrc, setActiveImageSrc] = useState('');
  const [selectedFashionColorValue, setSelectedFashionColorValue] = useState('');
  const [selectedFashionSize, setSelectedFashionSize] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        if (!slug || !id) {
          setError(true);
          return;
        }

        const [shopRes, productRes, offerRes] = await Promise.allSettled([
          ApiService.getShopBySlug(String(slug)),
          ApiService.getProductById(String(id)),
          ApiService.getOfferByProductId(String(id)),
        ]);

        const s = shopRes.status === 'fulfilled' ? shopRes.value : null;
        const p = productRes.status === 'fulfilled' ? productRes.value : null;

        if (!s || !p) {
          setError(true);
          return;
        }

        setShop(JSON.parse(JSON.stringify(s)));

        const d = (s as any).pageDesign || {
          layout: 'modern',
          primaryColor: '#00E5FF',
          secondaryColor: '#BD00FF',
          bannerUrl: '/placeholder-banner.jpg',
        };
        const canApplyPreview = (() => {
          try {
            const rawUser = localStorage.getItem('ray_user');
            if (!rawUser) return false;
            const user = JSON.parse(rawUser);
            const userShopId = String(user?.shopId || user?.shop_id || '').trim();
            return userShopId && userShopId === String((s as any)?.id || '').trim();
          } catch {
            return false;
          }
        })();

        if (canApplyPreview) {
          try {
            const rawPreview = localStorage.getItem('ray_builder_preview_design');
            const parsed = rawPreview ? JSON.parse(rawPreview) : null;
            const previewDesign = parsed && typeof parsed === 'object' ? parsed : null;
            if (previewDesign) setDesign({ ...d, ...previewDesign } as any);
            else setDesign(d);
          } catch {
            setDesign(d);
          }
        } else {
          setDesign(d);
        }

        const shopIdFromProduct = String((p as any)?.shopId || (p as any)?.shop_id || '');
        if (shopIdFromProduct && String((s as any)?.id || '') && shopIdFromProduct !== String((s as any)?.id || '')) {
          setError(true);
          return;
        }

        setProduct(p);
        setSelectedAddons([]);

        if (offerRes.status === 'fulfilled' && offerRes.value) {
          setOffer(offerRes.value as any);
        }

        // Removed: favorites check was moved to state initializer
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, id]);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('ray_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    const syncCart = () => {
      try {
        setCartItems(RayDB.getCart());
      } catch {
        setCartItems([]);
      }
    };

    checkAuth();
    syncCart();
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('cart-updated', syncCart);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('cart-updated', syncCart);
    };
  }, []);

  useEffect(() => {
    const applyPreview = () => {
      const sid = String((shop as any)?.id || '').trim();
      if (!sid) return;
      try {
        const rawUser = localStorage.getItem('ray_user');
        if (!rawUser) return;
        const user = JSON.parse(rawUser);
        const userShopId = String(user?.shopId || user?.shop_id || '').trim();
        if (!userShopId || userShopId !== sid) return;

        const rawPreview = localStorage.getItem('ray_builder_preview_design');
        const parsed = rawPreview ? JSON.parse(rawPreview) : null;
        const previewDesign = parsed && typeof parsed === 'object' ? parsed : null;
        if (!previewDesign) return;
        setDesign((prev) => (prev ? ({ ...prev, ...previewDesign } as any) : (previewDesign as any)));
      } catch {
      }
    };

    applyPreview();
    window.addEventListener('ray-builder-preview-update', applyPreview);
    return () => window.removeEventListener('ray-builder-preview-update', applyPreview);
  }, [shop?.id]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return offer ? (offer as any).newPrice : (product as any).price;
  }, [offer, product]);

  const rawMenuVariantsDef = (Array.isArray((product as any)?.menuVariants)
    ? (product as any).menuVariants
    : (Array.isArray((product as any)?.menu_variants) ? (product as any).menu_variants : [])) as any[];
  const hasAnyMenuVariants = Array.isArray(rawMenuVariantsDef) && rawMenuVariantsDef.length > 0;
  const isRestaurant = String((shop as any)?.category || '').toUpperCase() === 'RESTAURANT' || hasAnyMenuVariants;
  const menuVariantsDef = isRestaurant ? rawMenuVariantsDef : [];
  const hasMenuVariants = Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0;

  useEffect(() => {
    if (!isRestaurant || !hasMenuVariants) {
      setSelectedMenuTypeId('');
      setSelectedMenuSizeId('');
      return;
    }

    setSelectedMenuTypeId((prev) => {
      const exists = (menuVariantsDef as any[]).some(
        (t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(prev || '').trim(),
      );
      if (exists) return prev;
      return String((menuVariantsDef as any[])[0]?.id || (menuVariantsDef as any[])[0]?.typeId || (menuVariantsDef as any[])[0]?.variantId || '').trim();
    });
  }, [isRestaurant, hasMenuVariants, (product as any)?.id]);

  useEffect(() => {
    if (!isRestaurant || !hasMenuVariants) return;
    const type = (menuVariantsDef as any[]).find(
      (t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim(),
    );
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
  }, [isRestaurant, hasMenuVariants, (product as any)?.id, selectedMenuTypeId]);

  const selectedMenuVariant = useMemo(() => {
    if (!hasMenuVariants) return null;
    const type = (menuVariantsDef as any[]).find(
      (t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim(),
    );
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
  }, [hasMenuVariants, menuVariantsDef, selectedMenuTypeId, selectedMenuSizeId]);

  const elementsVisibility = (((design as any)?.elementsVisibility || {}) as Record<string, any>) || {};
  const isVisible = useCallback((key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (!(key in elementsVisibility)) return fallback;
    return coerceBoolean(elementsVisibility[key], fallback);
  }, [elementsVisibility]);

  const primaryColor = String((design as any)?.primaryColor || '#00E5FF');
  const layout = String((design as any)?.layout || 'modern');
  const isBold = layout === 'bold';
  const isMinimal = layout === 'minimal';

  const pageBgColor = String((design as any)?.pageBackgroundColor || (design as any)?.backgroundColor || '#FFFFFF');
  const pageBgImage = String((design as any)?.backgroundImageUrl || '');

  const headerTextColor = String((design as any)?.headerTextColor || '#0F172A');
  const headerBackgroundColor = String((design as any)?.headerBackgroundColor || pageBgColor);
  const headerBackgroundImageUrl = String((design as any)?.headerBackgroundImageUrl || '');
  const headerOpacity = coerceNumber((design as any)?.headerOpacity, 95) / 100;
  const headerTransparent = coerceBoolean((design as any)?.headerTransparent, false);
  const headerBg = headerTransparent
    ? hexToRgba(headerBackgroundColor, headerOpacity)
    : headerBackgroundColor;

  const footerTextColor = String((design as any)?.footerTextColor || (isBold ? '#FFFFFF' : '#0F172A'));
  const footerBackgroundColor = String(
    (design as any)?.footerBackgroundColor || (isBold ? '#0F172A' : isMinimal ? '#FFFFFF' : '#F8FAFC')
  );
  const footerOpacity = coerceNumber((design as any)?.footerOpacity, 100) / 100;
  const footerTransparent = coerceBoolean((design as any)?.footerTransparent, false);
  const footerBg = footerTransparent ? 'transparent' : footerBackgroundColor;

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showFooter = isVisible('footer', true);
  const showFooterQuickLinks = isVisible('footerQuickLinks', true);
  const showFooterContact = isVisible('footerContact', true);

  const showMobileBottomNav = fromOffers ? true : isVisible('mobileBottomNav', true);
  const showMobileBottomNavHome = fromOffers ? true : isVisible('mobileBottomNavHome', true);
  const showMobileBottomNavCart = fromOffers ? true : isVisible('mobileBottomNavCart', true);
  const showMobileBottomNavAccount = fromOffers ? true : isVisible('mobileBottomNavAccount', true);

  const showProductTabs = isVisible('productTabs', true);
  const showProductShareButton = isVisible('productShareButton', true);
  const showProductQuickSpecs = isVisible('productQuickSpecs', true);

  const showPrice = isVisible('productCardPrice', true);
  const showStock = isVisible('productCardStock', true);
  const showAddToCart = isVisible('productCardAddToCart', true);
  const showReserve = isVisible('productCardReserve', true);

  const handleToggleFavorite = () => {
    if (!product) return;
    const state = RayDB.toggleFavorite(String((product as any)?.id || ''));
    setIsFavorite(state);
  };

  const handleAddToCart = () => {
    if (!product || !shop) return;
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

    if (isFashion) {
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

    const fashionSelectedColor = isFashion
      ? fashionColors.find((c: any) => String(c?.value || '').trim() === String(selectedFashionColorValue || '').trim())
      : null;

    RayDB.addToCart({
      ...product,
      price: displayedPrice,
      quantity: 1,
      shopId: (shop as any)?.id,
      shopName: (shop as any)?.name,
      addons: normalizedAddons,
      variantSelection: isFashion
        ? {
            kind: 'fashion',
            colorName: String((fashionSelectedColor as any)?.name || '').trim(),
            colorValue: String(selectedFashionColorValue || '').trim(),
            size: String(selectedFashionSize || '').trim(),
          }
        : selectedMenuVariant,
    });
    playSound();
  };

  const handleShare = async () => {
    try {
      const href = window.location.href;
      if ((navigator as any)?.share) {
        await (navigator as any).share({
          title: String((product as any)?.name || 'منتج'),
          text: String((product as any)?.name || 'منتج'),
          url: href,
        });
        return;
      }
      const clipboard = (navigator as any)?.clipboard;
      if (clipboard?.writeText) clipboard.writeText(href);
    } catch {
    }
  };

  const shopLogoSrc = String((shop as any)?.logoUrl || (shop as any)?.logo_url || '').trim();
  const productImageSrc = String((product as any)?.imageUrl || (product as any)?.image_url || '').trim();
  const productDescription = String((product as any)?.description || (product as any)?.details || '').trim();

  const isFashion = String((shop as any)?.category || '').toUpperCase() === 'FASHION';
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

  useEffect(() => {
    setActiveImageSrc((prev) => {
      const next = String(prev || '').trim();
      if (next && galleryImages.includes(next)) return next;
      return galleryImages[0] || '';
    });
  }, [galleryImages]);

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

  const normalizedAddons = (() => {
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
  const displayedPrice = (Number(basePrice) || 0) + (Number(addonsTotal) || 0);

  const shopPrefix = String(location?.pathname || '').startsWith('/shop/') ? '/shop' : '/s';

  const quickSpecs = useMemo(
    () => [
      { label: 'القسم', value: String((product as any)?.category || 'عام') },
      { label: 'المخزون', value: typeof (product as any)?.stock === 'number' ? String((product as any).stock) : '—' },
    ],
    [(product as any)?.category, (product as any)?.stock],
  );

  const prefersReducedMotion = useReducedMotion();

  const removeFromCart = (lineId: string) => {
    try {
      RayDB.removeFromCart(lineId);
    } catch {
    }
  };

  const updateCartItemQuantity = (lineId: string, delta: number) => {
    try {
      RayDB.updateCartItemQuantity(lineId, delta);
    } catch {
    }
  };

  const TabContent = useMemo(() => {
    if (activeTab === 'details') {
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="font-black text-sm mb-2">التفاصيل</h3>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            {productDescription || 'لا يوجد تفاصيل إضافية بعد.'}
          </p>
        </div>
      );
    }
    if (activeTab === 'specs') {
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
          <h3 className="font-black text-sm mb-2">المواصفات</h3>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">سيتم إضافة المواصفات قريباً.</p>
        </div>
      );
    }
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 className="font-black text-sm mb-2">الشحن</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-row-reverse">
            <Truck className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">شحن سريع (قد يختلف حسب المنطقة)</span>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <ShieldCheck className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">ضمان وجودة</span>
          </div>
          <div className="flex items-center gap-3 flex-row-reverse">
            <Package className="text-slate-300" />
            <span className="text-sm font-bold text-slate-600">تغليف آمن</span>
          </div>
        </div>
      </div>
    );
  }, [activeTab, productDescription]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <Loader2 className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (error || !shop || !design || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <Home className="w-16 h-16 text-slate-300 mb-6" />
        <h2 className="text-2xl font-black mb-4">عفواً، المنتج غير متاح</h2>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24 lg:pb-0"
      dir="rtl"
      style={{
        backgroundColor: pageBgColor,
        backgroundImage: pageBgImage ? `url(${pageBgImage})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <header
        className={`sticky top-0 z-[120] backdrop-blur-lg border-b transition-all duration-500 ${
          headerTransparent ? 'border-transparent' : 'border-slate-100'
        }`}
        style={{
          backgroundColor: headerBg,
          backgroundImage: headerBackgroundImageUrl ? `url(${headerBackgroundImageUrl})` : undefined,
          backgroundRepeat: headerBackgroundImageUrl ? 'no-repeat' : undefined,
          backgroundSize: headerBackgroundImageUrl ? 'cover' : undefined,
          backgroundPosition: headerBackgroundImageUrl ? 'center' : undefined,
          color: headerTextColor,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`${shopPrefix}/${String(slug)}`)}
              className="p-3 md:p-4 hover:bg-slate-100/60 rounded-xl md:rounded-2xl transition-all active:scale-95"
              style={{ color: headerTextColor }}
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {showHeaderNav && (
              <nav className="hidden md:flex items-center gap-6 md:gap-8">
                {showHeaderNavHome && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=products`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    المعروضات
                  </Link>
                )}
                {showHeaderNavGallery && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=gallery`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    معرض الصور
                  </Link>
                )}
                {showHeaderNavInfo && (
                  <Link
                    to={`${shopPrefix}/${String(slug)}?tab=info`}
                    className="text-xs md:text-sm font-black transition-opacity hover:opacity-80"
                    style={{ color: headerTextColor, opacity: 0.75 }}
                  >
                    معلومات المتجر
                  </Link>
                )}
              </nav>
            )}

            <div className="flex items-center gap-2 md:gap-3">
              {(showHeaderShareButton || showProductShareButton) && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 md:p-2.5 bg-slate-900 text-white rounded-full font-black text-[9px] md:text-xs transition-all shadow-sm hover:bg-black"
                >
                  <Share2 size={14} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-14">
        {showProductTabs && (
          <div className="flex items-center justify-end mb-6">
            <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'details' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                التفاصيل
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'specs' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                المواصفات
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'shipping' ? 'text-white bg-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                الشحن
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-10">
          <div className="w-full md:w-[420px]">
            <div className="aspect-square rounded-[2rem] bg-slate-100 border border-slate-200 shadow-sm overflow-hidden">
              {activeImageSrc ? (
                <img src={activeImageSrc} className="w-full h-full object-contain md:object-cover" alt={String((product as any)?.name || 'product')} />
              ) : null}
            </div>
            {galleryImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {galleryImages.slice(0, 5).map((src) => {
                  const active = src === activeImageSrc;
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImageSrc(src)}
                      className={`aspect-square rounded-xl overflow-hidden border transition-all ${active ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'}`}
                    >
                      <img src={src} className="w-full h-full object-contain md:object-cover" alt="thumb" />
                    </button>
                  );
                })}
              </div>
            )}
            {shopLogoSrc && showStock && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-xs font-black text-slate-600">{(product as any)?.stock > 0 ? 'متوفر' : 'غير متوفر'}</span>
                </div>
                <img src={shopLogoSrc} className="w-8 h-8 rounded-full object-cover border border-slate-100" alt={shop.name} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-right">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: primaryColor }}>
                {String((product as any)?.name || '')}
              </h1>
              {productDescription ? (
                <p className="text-sm md:text-base font-bold text-slate-500">{productDescription}</p>
              ) : (
                <p className="text-sm md:text-base font-bold text-slate-500">وصف المنتج سيتم إضافته قريباً.</p>
              )}
            </div>

            {showPrice && (
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-xl md:text-2xl font-black text-slate-900">ج.م {displayedPrice}</span>
                {offer && !hasMenuVariants && (
                  <span className="text-xs font-black text-slate-400 line-through">ج.م {String((product as any)?.price || '')}</span>
                )}
              </div>
            )}

            {isFashion && (fashionColors.length > 0 || fashionSizes.length > 0) && (
              <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-4">
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

            {isRestaurant && hasMenuVariants && (
              <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-4">
                <h3 className="font-black text-sm text-slate-900">اختيار النوع والحجم</h3>
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
              <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900">منتجات إضافية</h3>
                  <span className="text-[10px] font-black text-slate-400">اختياري</span>
                </div>

                <div className="space-y-4">
                  {(addonsDef as any[]).map((group, gi) => (
                    <div key={String(group?.id || gi)} className="space-y-3">
                      {group?.title ? <p className="text-[10px] font-black text-slate-500">{String(group.title)}</p> : null}
                      <div className="space-y-3">
                        {(Array.isArray(group?.options) ? group.options : []).map((opt: any) => {
                          const optId = String(opt?.id || '').trim();
                          if (!optId) return null;
                          const currentVariantId = selectedAddons.find((a) => a.optionId === optId)?.variantId || '';
                          const variants = Array.isArray(opt?.variants) ? opt.variants : [];
                          return (
                            <div key={optId} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                              {opt?.imageUrl && (
                                <img src={String(opt.imageUrl)} className="w-10 h-10 rounded-xl object-cover" alt={String(opt?.name || '')} />
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

            {(showAddToCart || showProductShareButton) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {showAddToCart && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl transition-all hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <ShoppingCart size={16} /> إضافة للسلة
                    </span>
                  </button>
                )}

                {showProductShareButton && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-6 py-3 rounded-2xl font-black text-sm border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Share2 size={16} /> مشاركة
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {showReserve ? (
                <button
                  type="button"
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

                    if (isFashion) {
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
                  className="px-6 py-3 rounded-2xl font-black text-sm bg-slate-900 text-white shadow-sm transition-all hover:bg-black"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <CalendarCheck size={16} /> حجز
                  </span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`px-6 py-3 rounded-2xl font-black text-sm border shadow-sm transition-all ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'}`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'في المفضلة' : 'مفضلة'}
                </span>
              </button>
            </div>

            {showProductQuickSpecs && (
              <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-3">
                <h3 className="font-black text-sm text-slate-900">مواصفات سريعة</h3>
                <div className="space-y-2">
                  {quickSpecs.map((s) => (
                    <div key={s.label} className="flex items-center justify-between flex-row-reverse text-sm">
                      <span className="font-black text-slate-500">{s.label}</span>
                      <span className="font-bold text-slate-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {prefersReducedMotion ? (
                TabContent
              ) : (
                <MotionDiv
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-slate-100 rounded-2xl p-5"
                >
                  {activeTab === 'details' ? (
                    <>
                      <h3 className="font-black text-sm mb-2">التفاصيل</h3>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        {productDescription || 'لا يوجد تفاصيل إضافية بعد.'}
                      </p>
                    </>
                  ) : activeTab === 'specs' ? (
                    <>
                      <h3 className="font-black text-sm mb-2">المواصفات</h3>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">سيتم إضافة المواصفات قريباً.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-black text-sm mb-2">الشحن</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Truck className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">شحن سريع (قد يختلف حسب المنطقة)</span>
                        </div>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <ShieldCheck className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">ضمان وجودة</span>
                        </div>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Package className="text-slate-300" />
                          <span className="text-sm font-bold text-slate-600">تغليف آمن</span>
                        </div>
                      </div>
                    </>
                  )}
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {showFooter && (
        <footer
          className={`mt-16 md:mt-24 border-t transition-all duration-500 ${
            footerTransparent
              ? 'bg-transparent border-transparent'
              : isBold
                ? 'bg-slate-900 border-slate-700'
                : isMinimal
                  ? 'bg-white border-slate-100'
                  : 'bg-slate-50 border-slate-200'
          }`}
          style={{ backgroundColor: footerBg, color: footerTextColor, opacity: footerTransparent ? 1 : footerOpacity }}
        >
          <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  {shopLogoSrc ? (
                    <img src={shopLogoSrc} className="w-8 h-8 rounded-full border-2 border-white shadow-md object-cover" alt={shop.name} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                  )}
                  <h4 className={`font-black ${isBold ? 'text-lg' : 'text-base'}`} style={{ color: footerTextColor }}>
                    {shop.name}
                  </h4>
                </div>
                <p className="text-xs md:text-sm font-bold leading-relaxed" style={{ opacity: 0.8 }}>
                  منصة متكاملة لتقديم أفضل الخدمات والمنتجات بجودة عالية.
                </p>
              </div>

              {showFooterQuickLinks && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>روابط سريعة</h5>
                  <div className="space-y-2">
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=products`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      المعروضات
                    </Link>
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=gallery`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معرض الصور
                    </Link>
                    <Link
                      to={`${shopPrefix}/${String(slug)}?tab=info`}
                      className="block text-xs md:text-sm font-bold transition-opacity hover:opacity-80"
                      style={{ color: footerTextColor, opacity: 0.8 }}
                    >
                      معلومات المتجر
                    </Link>
                  </div>
                </div>
              )}

              {showFooterContact && (
                <div className="text-center md:text-right">
                  <h5 className="font-black mb-3 text-sm md:text-base" style={{ color: footerTextColor }}>تواصل معنا</h5>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {String((shop as any)?.phone || 'جاري تحديث رقم الهاتف')}
                    </p>
                    <p className="text-xs md:text-sm font-bold" style={{ color: footerTextColor, opacity: 0.8 }}>
                      {String((shop as any)?.addressDetailed || `${(shop as any)?.city || ''}, ${(shop as any)?.governorate || ''}`)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`pt-6 border-t text-center text-xs md:text-sm font-bold ${
                isBold ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
              style={{ color: footerTextColor, opacity: 0.75 }}
            >
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {shop.name} • تطوير بواسطة منصة تست</p>
            </div>
          </div>
        </footer>
      )}

      {showMobileBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-[160] px-4 pb-4 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] px-2">
              <div className="flex items-stretch justify-between gap-1" dir="rtl">
                {showMobileBottomNavHome && (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black"
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-black">الرئيسية</span>
                  </button>
                )}

                {showMobileBottomNavCart && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black">
                    <CartIconWithAnimation
                      count={cartItems.length}
                      onClick={() => setCartOpen(true)}
                    />
                    <span className="text-[10px] font-black">السلة</span>
                  </div>
                )}

                {showMobileBottomNavAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        const role = String(user?.role || '').toLowerCase();
                        navigate(role === 'merchant' ? '/business/dashboard' : '/profile');
                        return;
                      }
                      const q = new URLSearchParams();
                      q.set('returnTo', `${location.pathname}${location.search || ''}`);
                      navigate(`/login?${q.toString()}`);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-black"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-black">حسابي</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartItemQuantity}
      />

      <ReservationModal
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        item={(() => {
          if (!product || !shop) return null;
          const itemImage = String((product as any)?.image || (product as any)?.imageUrl || (product as any)?.image_url || '').trim();
          if (hasMenuVariants && selectedMenuVariant) {
            return {
              ...product,
              image: itemImage,
              price: displayedPrice,
              shopId: String((shop as any)?.id || ''),
              shopName: String((shop as any)?.name || ''),
              addons: normalizedAddons,
              variantSelection: selectedMenuVariant,
            };
          }

          return {
            ...product,
            image: itemImage,
            price: displayedPrice,
            shopId: String((shop as any)?.id || ''),
            shopName: String((shop as any)?.name || ''),
            addons: normalizedAddons,
            variantSelection: isFashion
              ? {
                  kind: 'fashion',
                  colorName: String((fashionColors.find((c: any) => String(c?.value || '').trim() === String(selectedFashionColorValue || '').trim()) as any)?.name || '').trim(),
                  colorValue: String(selectedFashionColorValue || '').trim(),
                  size: String(selectedFashionSize || '').trim(),
                }
              : selectedMenuVariant,
          };
        })()}
      />
    </div>
  );
};

export default ShopProductPage;
