import React, { useMemo, useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, ChevronRight, ChevronUp, CheckCircle2, Loader2, Printer, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  addons?: any;
  variantSelection?: any;
}

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

const POSSystem: React.FC<{ onClose: () => void; shopId: string; shop?: any }> = ({ onClose, shopId, shop }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [receiptTheme, setReceiptTheme] = useState<any>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configProduct, setConfigProduct] = useState<any | null>(null);
  const [selectedMenuTypeId, setSelectedMenuTypeId] = useState('');
  const [selectedMenuSizeId, setSelectedMenuSizeId] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Array<{ optionId: string; variantId: string }>>([]);
  const [usingOfflineData, setUsingOfflineData] = useState(false);

  const isRestaurant = String(shop?.category || shop?.shopCategory || '').toUpperCase() === 'RESTAURANT';
  const shopAddonsDef = useMemo(() => {
    const raw = (shop as any)?.addons;
    return Array.isArray(raw) ? raw : [];
  }, [shop]);

  useEffect(() => {
    try {
      if (shopId) {
        localStorage.setItem(`pos_shop_addons_${shopId}`, JSON.stringify(shopAddonsDef || []));
      }
    } catch {
    }
  }, [shopId, shopAddonsDef]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await ApiService.getProducts(shopId);
        setProducts(data || []);
        setUsingOfflineData(false);
        try {
          localStorage.setItem(`pos_products_${shopId}`, JSON.stringify(data || []));
        } catch {
        }
      } catch {
        try {
          const raw = localStorage.getItem(`pos_products_${shopId}`);
          const cached = raw ? JSON.parse(raw) : null;
          if (Array.isArray(cached) && cached.length > 0) {
            setProducts(cached);
            setUsingOfflineData(true);
            return;
          }
        } catch {
        }
        setProducts([]);
        setUsingOfflineData(true);
      }
    };
    loadProducts();
  }, [shopId]);

  useEffect(() => {
    const loadTheme = () => {
      const raw = RayDB.getReceiptTheme(shopId) as any;
      const merged = {
        ...raw,
        shopName: String(raw?.shopName || shop?.name || ''),
        phone: String(raw?.phone || shop?.phone || ''),
        city: String(raw?.city || shop?.city || ''),
        address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
        logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      };
      setReceiptTheme(merged);
    };
    loadTheme();
    window.addEventListener('receipt-theme-update', loadTheme);
    return () => window.removeEventListener('receipt-theme-update', loadTheme);
  }, [shopId, shop?.name, shop?.phone, shop?.city, shop?.addressDetailed, shop?.address_detailed, shop?.logoUrl, shop?.logo_url]);

  const effectiveReceiptTheme = (() => {
    const raw = (receiptTheme || {}) as any;
    return {
      ...raw,
      shopName: String(raw?.shopName || shop?.name || ''),
      phone: String(raw?.phone || shop?.phone || ''),
      city: String(raw?.city || shop?.city || ''),
      address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
      logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      footerNote: String(raw?.footerNote || ''),
      vatRatePercent: (() => {
        const v = raw?.vatRatePercent;
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n)) return 14;
        return Math.min(100, Math.max(0, n));
      })(),
    };
  })();

  const getProductStock = (product: any) => {
    const trackStock = typeof product?.trackStock === 'boolean'
      ? product.trackStock
      : (typeof product?.track_stock === 'boolean' ? product.track_stock : true);
    if (!trackStock) return Number.POSITIVE_INFINITY;
    const stock = product?.stock;
    return typeof stock === 'number' && Number.isFinite(stock) ? stock : Number.POSITIVE_INFINITY;
  };

  const isProductTrackStockEnabled = (product: any) => {
    const trackStock = typeof product?.trackStock === 'boolean'
      ? product.trackStock
      : (typeof product?.track_stock === 'boolean' ? product.track_stock : true);
    return Boolean(trackStock);
  };

  const getProductMenuVariantMinPrice = (product: any) => {
    const menuVariants = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
    if (!Array.isArray(menuVariants)) return undefined;
    let min: number | undefined;
    for (const t of menuVariants) {
      const sizes = Array.isArray(t?.sizes) ? t.sizes : [];
      for (const s of sizes) {
        const p = typeof s?.price === 'number' ? s.price : Number(s?.price);
        if (!Number.isFinite(p) || p <= 0) continue;
        min = typeof min === 'number' ? Math.min(min, p) : p;
      }
    }
    return min;
  };

  const getProductEffectivePrice = (product: any) => {
    const minVariantPrice = getProductMenuVariantMinPrice(product);
    if (typeof minVariantPrice === 'number' && Number.isFinite(minVariantPrice)) return minVariantPrice;
    const base = typeof product?.price === 'number' ? product.price : Number(product?.price);
    return Number.isFinite(base) ? base : 0;
  };

  const isProductHasMenuVariants = (product: any) => {
    const menuVariants = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
    return Array.isArray(menuVariants) && menuVariants.length > 0;
  };

  const getProductMenuVariantsDef = (product: any) => {
    const menuVariants = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
    return Array.isArray(menuVariants) ? menuVariants : [];
  };

  const getAvailableShopAddonOptions = () => {
    const first = Array.isArray(shopAddonsDef) ? shopAddonsDef[0] : null;
    const options = Array.isArray(first?.options) ? first.options : [];
    return options;
  };

  const computeAddonsTotalAndNormalized = (addonsSelections: Array<{ optionId: string; variantId: string }>) => {
    const addonsDef = isRestaurant ? shopAddonsDef : [];
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

    const normalized = (addonsSelections || []).map((a) => {
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

    const total = normalized.reduce((sum, x) => sum + (Number(x?.price) || 0), 0);
    return { total, normalized };
  };

  const openConfigurator = (product: any) => {
    setConfigProduct(product);
    setSelectedAddons([]);
    const menuVariantsDef = getProductMenuVariantsDef(product);
    if (Array.isArray(menuVariantsDef) && menuVariantsDef.length > 0) {
      const firstType = menuVariantsDef[0];
      const typeId = String(firstType?.id || firstType?.typeId || firstType?.variantId || '').trim();
      setSelectedMenuTypeId(typeId);
      const sizes = Array.isArray(firstType?.sizes) ? firstType.sizes : [];
      const firstSize = sizes[0];
      const sizeId = String(firstSize?.id || firstSize?.sizeId || '').trim();
      setSelectedMenuSizeId(sizeId);
    } else {
      setSelectedMenuTypeId('');
      setSelectedMenuSizeId('');
    }
    setIsConfigOpen(true);
  };

  const getSelectedMenuVariantForProduct = (product: any) => {
    const menuVariantsDef = getProductMenuVariantsDef(product);
    if (!Array.isArray(menuVariantsDef) || menuVariantsDef.length === 0) return null;
    const type = menuVariantsDef.find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(selectedMenuTypeId || '').trim());
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
  };

  const addConfiguredToCart = (product: any, qty: number = 1) => {
    if (!product) return;
    const stock = getProductStock(product);
    if (stock <= 0) return;

    const hasMenuVariants = isProductHasMenuVariants(product);
    const selectedVariant = hasMenuVariants ? getSelectedMenuVariantForProduct(product) : null;
    if (hasMenuVariants && (!selectedVariant || !selectedVariant?.typeId || !selectedVariant?.sizeId)) return;

    const basePrice = hasMenuVariants
      ? Number((selectedVariant as any)?.price || 0)
      : Number(getProductEffectivePrice(product) || 0);
    const addonCalc = computeAddonsTotalAndNormalized(selectedAddons);
    const unitPrice = (Number(basePrice) || 0) + (Number(addonCalc.total) || 0);

    const addonsKey = (selectedAddons || [])
      .slice()
      .sort((a, b) => `${a.optionId}:${a.variantId}`.localeCompare(`${b.optionId}:${b.variantId}`))
      .map((x) => `${x.optionId}:${x.variantId}`)
      .join('|');
    const lineId = `${String(product?.id || '')}__${String((selectedVariant as any)?.typeId || '')}__${String((selectedVariant as any)?.sizeId || '')}__${addonsKey}`;

    const addonsSummary = Array.isArray(addonCalc.normalized) && addonCalc.normalized.length > 0
      ? ` + ${addonCalc.normalized.map((x: any) => `${x?.optionName || ''} ${x?.variantLabel || ''}`).filter(Boolean).join('، ')}`
      : '';
    const variantSummary = selectedVariant ? ` (${String(selectedVariant?.typeName || '')} - ${String(selectedVariant?.sizeLabel || '')})` : '';
    const displayName = `${String(product?.name || '')}${variantSummary}${addonsSummary}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      const currentQty = existing?.quantity || 0;
      const desiredQty = currentQty + qty;
      const nextQty = Number.isFinite(stock) ? Math.min(stock, desiredQty) : desiredQty;
      if (existing) {
        return prev.map((item) => (item.id === lineId ? { ...item, quantity: nextQty } : item));
      }
      const initialQty = Number.isFinite(stock) ? Math.min(stock, qty) : qty;
      return [
        ...prev,
        {
          id: lineId,
          productId: String(product?.id || ''),
          name: displayName,
          price: unitPrice,
          quantity: initialQty,
          addons: addonCalc.normalized,
          variantSelection: selectedVariant,
        },
      ];
    });
  };

  const addToCart = (product: any, qty: number = 1) => {
    if (!product) return;
    const stock = getProductStock(product);
    if (stock <= 0) return;

    const hasMenuVariants = isProductHasMenuVariants(product);
    const hasShopAddons = isRestaurant && Array.isArray(shopAddonsDef) && shopAddonsDef.length > 0;
    if (hasMenuVariants || hasShopAddons) {
      openConfigurator(product);
      return;
    }

    const lineId = String(product?.id || '');
    setCart((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      const currentQty = existing?.quantity || 0;
      const desiredQty = currentQty + qty;
      const nextQty = Number.isFinite(stock) ? Math.min(stock, desiredQty) : desiredQty;
      if (existing) {
        return prev.map((item) => (item.id === lineId ? { ...item, quantity: nextQty } : item));
      }
      const initialQty = Number.isFinite(stock) ? Math.min(stock, qty) : qty;
      return [
        ...prev,
        {
          id: lineId,
          productId: String(product?.id || ''),
          name: String(product?.name || ''),
          price: getProductEffectivePrice(product),
          quantity: initialQty,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find((x) => x.id === id);
    const product = products.find((p) => String(p.id) === String(item?.productId || ''));
    const maxQty = getProductStock(product);
    setCart(prev => prev
      .map(item => item.id === id
        ? { ...item, quantity: Math.min(maxQty, Math.max(0, item.quantity + delta)) }
        : item
      )
      .filter(item => item.quantity > 0)
    );
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vatRate = Number((effectiveReceiptTheme as any)?.vatRatePercent);
    const vatRatePct = Number.isFinite(vatRate) ? vatRate : 14;
    const vatAmount = subtotal * (vatRatePct / 100);
    const totalWithVat = subtotal + vatAmount;

    setTimeout(() => {
      (async () => {
        try {
          await ApiService.placeOrder({
            shopId,
            items: cart.map((i) => ({ id: i.productId, quantity: i.quantity })),
            total: totalWithVat,
            paymentMethod: orderType,
          });

          const updated = await ApiService.getProducts(shopId);
          setProducts(updated || []);
          window.dispatchEvent(new Event('orders-updated'));
        } catch {
          // Stock sync errors are ignored
        } finally {
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setCart([]);
            onClose();
          }, 1500);
        }
      })();
    }, 1200);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatRate = Number((effectiveReceiptTheme as any)?.vatRatePercent);
  const vatRatePct = Number.isFinite(vatRate) ? vatRate : 14;
  const vatAmount = subtotal * (vatRatePct / 100);
  const total = subtotal + vatAmount;
  const showVat = vatRatePct > 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = products.filter(p => String(p?.name || '').toLowerCase().includes(normalizedSearch));

  const formatInvoiceText = () => {
    const lines: string[] = [];
    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();
    const now = new Date();

    if (shopName) lines.push(shopName);
    if (phone) lines.push(`هاتف: ${phone}`);
    if (city) lines.push(`المدينة: ${city}`);
    if (address) lines.push(`العنوان: ${address}`);
    lines.push('--------------------------');
    lines.push(`الوقت: ${now.toLocaleString('ar-EG')}`);
    lines.push(`نوع الطلب: ${orderType === 'dine-in' ? 'محلي' : 'سفري'}`);
    lines.push('--------------------------');

    for (const item of cart) {
      lines.push(`${item.name} x${item.quantity} = ج.م ${(item.price * item.quantity).toFixed(0)}`);
    }

    lines.push('--------------------------');
    lines.push(`الإجمالي قبل الضريبة: ج.م ${subtotal.toFixed(0)}`);
    if (showVat) {
      lines.push(`ضريبة (${vatRatePct}%): ج.م ${vatAmount.toFixed(0)}`);
    }
    lines.push(`الإجمالي: ج.م ${total.toFixed(0)}`);
    if (footerNote) {
      lines.push('--------------------------');
      lines.push(footerNote);
    }

    return lines.join('\n');
  };

  const normalizeWhatsappPhone = (raw: string) => {
    const digits = String(raw || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (/^01\d{9}$/.test(digits)) return `20${digits.slice(1)}`;
    if (/^0\d{9,14}$/.test(digits)) return digits.slice(1);
    return digits;
  };

  const handleWhatsAppInvoice = () => {
    if (cart.length === 0) return;
    const phone = normalizeWhatsappPhone(customerPhone);
    if (!phone) return;
    const text = encodeURIComponent(formatInvoiceText());
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrintInvoice = () => {
    if (cart.length === 0) return;

    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();
    const logoDataUrl = String(effectiveReceiptTheme?.logoDataUrl || '').trim();
    const now = new Date();

    const itemsHtml = cart
      .map((item) => {
        const name = String(item.name || '');
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const lineTotal = price * qty;
        return `
          <div class="item">
            <div class="item-name">${name}</div>
            <div class="item-meta">
              <span>×${qty}</span>
              <span>ج.م ${price.toFixed(0)}</span>
              <span>ج.م ${lineTotal.toFixed(0)}</span>
            </div>
          </div>
        `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            html, body { margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; color: #111; display: flex; justify-content: center; }
            .paper { width: 72mm; padding: 4mm; }
            .center { text-align: center; }
            .shop { font-weight: 900; font-size: 16px; margin: 0; }
            .meta { font-size: 11px; font-weight: 700; margin-top: 2px; color: #333; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .items { margin-top: 6px; }
            .item { padding: 6px 0; border-bottom: 1px dotted #bbb; }
            .item-name { font-size: 12px; font-weight: 900; }
            .item-meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-top: 2px; }
            .totals { margin-top: 8px; font-size: 12px; font-weight: 900; }
            .totals-row { display: flex; justify-content: space-between; margin-top: 4px; }
            .footer { margin-top: 8px; font-size: 11px; font-weight: 800; text-align: center; color: #333; }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="center">
              ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo" style="width:52px;height:52px;border-radius:14px;object-fit:cover;border:1px solid #eee;" />` : ''}
              ${shopName ? `<p class="shop">${shopName}</p>` : ''}
              ${phone ? `<div class="meta">هاتف: ${phone}</div>` : ''}
              ${city ? `<div class="meta">المدينة: ${city}</div>` : ''}
              ${address ? `<div class="meta">العنوان: ${address}</div>` : ''}
              <div class="meta">${now.toLocaleString('ar-EG')}</div>
              <div class="meta">${orderType === 'dine-in' ? 'محلي' : 'سفري'}</div>
            </div>
            <div class="divider"></div>
            <div class="items">${itemsHtml}</div>
            <div class="divider"></div>
            <div class="totals">
              <div class="totals-row"><span>قبل الضريبة</span><span>ج.م ${subtotal.toFixed(0)}</span></div>
              ${showVat ? `<div class="totals-row"><span>ضريبة ${vatRatePct}%</span><span>ج.م ${vatAmount.toFixed(0)}</span></div>` : ''}
              <div class="totals-row"><span>الإجمالي</span><span>ج.م ${total.toFixed(0)}</span></div>
            </div>
            ${footerNote ? `<div class="footer">${footerNote}</div>` : ''}
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      try {
        document.body.removeChild(iframe);
      } catch {
      }
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
        }
      }, 300);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row font-sans text-right overflow-hidden" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      
      {/* Product Feed - Main Area */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <header className="sticky top-0 z-50 p-4 md:p-8 bg-white border-b border-slate-100 flex items-center gap-3 md:gap-6 flex-row-reverse">
          <button onClick={onClose} className="p-3 md:p-4 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all active:scale-95">
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-slate-900" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl py-4 md:py-5 pr-12 md:pr-16 pl-4 md:pl-8 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all text-base md:text-xl font-bold text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {usingOfflineData && (
            <div className="hidden md:block px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
              وضع أوفلاين
            </div>
          )}
          <div className="relative">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم العميل"
              className="bg-white border border-slate-200 rounded-xl md:rounded-2xl py-4 md:py-5 px-4 md:px-6 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all text-base md:text-xl font-bold text-right w-40 md:w-48"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6 pb-24 md:pb-4">
          {filteredProducts.map(product => (
            <MotionDiv 
              whileTap={{ scale: 0.95 }}
              key={product.id}
              onClick={() => addToCart(product, 1)}
              className="relative active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed aspect-square"
            >
              <div className="w-full h-full rounded-lg md:rounded-[1.8rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#BD00FF] transition-all group overflow-hidden relative">
                <div className="absolute inset-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <ShoppingCart className="w-6 h-6 md:w-12 md:h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1 md:p-3 bg-white/95 backdrop-blur border-t border-slate-100">
                    <p className="font-black text-[10px] md:text-sm text-slate-900 text-center line-clamp-1">
                      {String(product?.name || '')}
                    </p>
                    <p className="text-[#BD00FF] font-black text-[10px] md:text-lg text-center leading-tight">
                      {isProductHasMenuVariants(product) ? 'يبدأ من ' : ''}ج.م {getProductEffectivePrice(product)}
                    </p>
                  </div>
                  {(() => {
                    const trackStock = isProductTrackStockEnabled(product);
                    if (!trackStock) {
                      return (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] md:text-[10px] font-black shadow-sm bg-emerald-50 text-emerald-700">
                          متاح
                        </div>
                      );
                    }

                    const stock = typeof product.stock === 'number' ? product.stock : undefined;
                    const cls = (stock ?? 0) <= 0 ? 'bg-slate-900 text-white' : (stock ?? 0) < 5 ? 'bg-red-500 text-white' : 'bg-white/90';
                    return (
                      <div className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] md:text-[10px] font-black shadow-sm ${cls}` }>
                        {(stock ?? 0) <= 0 ? 'نفد' : (typeof stock === 'number' ? stock : '-')}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>

      {/* Mobile: Invoice Bar + Full Screen Invoice */}
      {!isInvoiceOpen && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-[250] bg-white border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            type="button"
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full p-4 bg-slate-900 text-white font-black text-sm md:text-base flex items-center justify-between gap-4"
          >
            <span>عرض الفاتورة</span>
            <span className="bg-[#BD00FF] text-black px-3 py-1 rounded-lg text-xs md:text-sm font-black">
              {cart.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0).toFixed(2)} ج.م
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isInvoiceOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[300] bg-white flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="p-3 md:p-3 border-b border-slate-100 flex items-center justify-between flex-row-reverse gap-3">
              <h2 className="text-lg md:text-xl font-black">الفاتورة</h2>
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(false)}
                className="p-2 bg-slate-100 rounded-full transition-colors hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-row-reverse p-3 border-b border-slate-100">
              <div className="text-right flex-1">
                {effectiveReceiptTheme?.shopName ? (
                  <p className="font-black text-sm text-slate-900 leading-tight">{effectiveReceiptTheme.shopName}</p>
                ) : null}
                <div className="text-[10px] font-bold text-slate-400 leading-tight">
                  {effectiveReceiptTheme?.phone ? <span>{effectiveReceiptTheme.phone}</span> : null}
                  {effectiveReceiptTheme?.phone && (effectiveReceiptTheme as any)?.city ? <span> • </span> : null}
                  {(effectiveReceiptTheme as any)?.city ? <span>{String((effectiveReceiptTheme as any).city)}</span> : null}
                </div>
              </div>

              {effectiveReceiptTheme?.logoDataUrl ? (
                <img
                  src={effectiveReceiptTheme.logoDataUrl}
                  className="w-10 h-10 rounded-2xl object-cover bg-white border border-slate-100"
                  alt="receipt-logo"
                />
              ) : (
                <div className="w-10 h-10" />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                  <p className="font-black text-base">السلة فارغة</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between flex-row-reverse">
                    <div className="text-right flex-1 pr-2">
                      <p className="font-black text-[13px] text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">ج.م {item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100 flex-row-reverse">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-50 rounded-xl active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Minus size={16} /></button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-50 rounded-xl active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-red-500 active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <div className="bg-white border border-slate-100 rounded-2xl p-3 mb-3">
                <div className="flex items-center justify-between flex-row-reverse text-[11px] font-black text-slate-600">
                  <span>قبل الضريبة</span>
                  <span>ج.م {subtotal.toFixed(0)}</span>
                </div>
                {showVat && (
                  <div className="flex items-center justify-between flex-row-reverse text-[11px] font-black text-slate-600 mt-2">
                    <span>ضريبة {vatRatePct}%</span>
                    <span>ج.م {vatAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between flex-row-reverse text-sm font-black text-slate-900 mt-2">
                  <span>الإجمالي</span>
                  <span className="text-[#BD00FF]">ج.م {total.toFixed(0)}</span>
                </div>
              </div>

              {effectiveReceiptTheme?.footerNote && (
                <div className="pb-2 text-center text-[10px] font-bold text-slate-400">{effectiveReceiptTheme.footerNote}</div>
              )}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={handlePrintInvoice}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Printer size={18} /> طباعة
                  </button>
                  <button
                    type="button"
                    disabled={cart.length === 0 || !String(customerPhone || '').trim()}
                    onClick={handleWhatsAppInvoice}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <MessageCircle size={18} /> واتساب
                  </button>
                </div>
              </div>
              <button
                disabled={cart.length === 0 || isProcessing}
                onClick={processPayment}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-[#BD00FF] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97] min-h-[44px] touch-manipulation"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
              </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="hidden md:flex md:w-[450px] lg:w-[500px] h-full bg-white border-r border-slate-100 flex-col shadow-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-row-reverse gap-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#BD00FF]" /> الفاتورة
          </h2>

          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="text-right">
              {effectiveReceiptTheme?.shopName && <p className="font-black text-lg text-slate-900 leading-tight">{effectiveReceiptTheme.shopName}</p>}
              <div className="text-xs font-bold text-slate-400 leading-tight">
                {effectiveReceiptTheme?.phone ? <span>{effectiveReceiptTheme.phone}</span> : null}
                {effectiveReceiptTheme?.phone && (effectiveReceiptTheme as any)?.city ? <span> • </span> : null}
                {(effectiveReceiptTheme as any)?.city ? <span>{String((effectiveReceiptTheme as any).city)}</span> : null}
              </div>
              {effectiveReceiptTheme?.address && <div className="text-[11px] font-bold text-slate-400 leading-tight">{effectiveReceiptTheme.address}</div>}
            </div>
            {effectiveReceiptTheme?.logoDataUrl ? (
              <img src={effectiveReceiptTheme.logoDataUrl} className="w-14 h-14 rounded-3xl object-cover bg-white border border-slate-100" alt="receipt-logo" />
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-black text-lg">السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between flex-row-reverse">
                <div className="text-right flex-1 pr-3">
                  <p className="font-black text-sm text-slate-900">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">ج.م {item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-slate-100 flex-row-reverse">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-50 rounded-lg active:scale-95"><Minus size={16} /></button>
                    <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-50 rounded-lg active:scale-95"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-red-500 active:scale-95"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-3">
            <div className="flex justify-between items-center flex-row-reverse text-xs font-black text-slate-600">
              <span>قبل الضريبة</span>
              <span>ج.م {subtotal.toFixed(0)}</span>
            </div>
            {showVat && (
              <div className="flex justify-between items-center flex-row-reverse text-xs font-black text-slate-600 mt-2">
                <span>ضريبة {vatRatePct}%</span>
                <span>ج.م {vatAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center flex-row-reverse mt-2">
              <span className="font-black text-slate-900 text-sm">الإجمالي</span>
              <span className="text-2xl font-black text-[#BD00FF]">ج.م {total.toFixed(0)}</span>
            </div>
          </div>
          {effectiveReceiptTheme?.footerNote && (
            <div className="text-center text-xs font-bold text-slate-400">{effectiveReceiptTheme.footerNote}</div>
          )}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handlePrintInvoice}
                className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-base text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Printer size={20} /> طباعة
              </button>
              <button
                type="button"
                disabled={cart.length === 0 || !String(customerPhone || '').trim()}
                onClick={handleWhatsAppInvoice}
                className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-base text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <MessageCircle size={20} /> واتساب
              </button>
            </div>
          </div>
          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={processPayment}
            className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97]"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isConfigOpen && configProduct && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/40 flex items-center justify-center p-4"
          >
            <MotionDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-[2rem] p-5 md:p-6 text-right"
              dir="rtl"
            >
              <div className="flex items-center justify-between flex-row-reverse mb-4">
                <h3 className="text-lg md:text-xl font-black">{String(configProduct?.name || '')}</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfigOpen(false);
                    setConfigProduct(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-black text-xs"
                >
                  إغلاق
                </button>
              </div>

              {isProductHasMenuVariants(configProduct) && (
                <div className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3 mb-4">
                  <h4 className="font-black text-sm text-slate-900">اختيار النوع والحجم</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-500">النوع</p>
                      <select
                        value={selectedMenuTypeId}
                        onChange={(e) => {
                          const nextType = String(e.target.value || '');
                          setSelectedMenuTypeId(nextType);
                          const menuVariantsDef = getProductMenuVariantsDef(configProduct);
                          const type = menuVariantsDef.find((t: any) => String(t?.id || t?.typeId || t?.variantId || '').trim() === String(nextType).trim());
                          const sizes = Array.isArray((type as any)?.sizes) ? (type as any).sizes : [];
                          const firstSize = sizes[0];
                          const sizeId = String(firstSize?.id || firstSize?.sizeId || '').trim();
                          setSelectedMenuSizeId(sizeId);
                        }}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-black"
                      >
                        {getProductMenuVariantsDef(configProduct).map((t: any, idx: number) => {
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
                      <p className="text-[11px] font-black text-slate-500">الحجم</p>
                      <select
                        value={selectedMenuSizeId}
                        onChange={(e) => setSelectedMenuSizeId(String(e.target.value || ''))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-black"
                      >
                        {(() => {
                          const type = getProductMenuVariantsDef(configProduct).find(
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

              {isRestaurant && Array.isArray(shopAddonsDef) && shopAddonsDef.length > 0 && (
                <div className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-slate-900">إضافات</h4>
                    <span className="text-[10px] font-black text-slate-400">اختياري</span>
                  </div>
                  <div className="space-y-3">
                    {getAvailableShopAddonOptions().map((opt: any) => {
                      const optId = String(opt?.id || '').trim();
                      if (!optId) return null;
                      const currentVariantId = selectedAddons.find((a) => a.optionId === optId)?.variantId || '';
                      const variants = Array.isArray(opt?.variants) ? opt.variants : [];
                      return (
                        <div key={optId} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
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
              )}

              <div className="flex items-center justify-between flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addConfiguredToCart(configProduct, 1);
                    setIsConfigOpen(false);
                    setConfigProduct(null);
                  }}
                  className="flex-1 py-3 rounded-2xl text-white font-black text-sm shadow-xl transition-all hover:opacity-90 bg-slate-900"
                >
                  إضافة للسلة
                </button>
                <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black text-sm text-slate-900">
                  ج.م {(() => {
                    const hasMenuVariants = isProductHasMenuVariants(configProduct);
                    const selectedVariant = hasMenuVariants ? getSelectedMenuVariantForProduct(configProduct) : null;
                    const base = hasMenuVariants ? Number((selectedVariant as any)?.price || 0) : Number(getProductEffectivePrice(configProduct) || 0);
                    const addonCalc = computeAddonsTotalAndNormalized(selectedAddons);
                    return ((Number(base) || 0) + (Number(addonCalc.total) || 0)).toFixed(0);
                  })()}
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
        {showSuccess && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[500] bg-white flex items-center justify-center p-6 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-[#BD00FF] rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black">تم البيع بنجاح</h2>
              <p className="text-slate-500 font-bold">تم تحديث المخزون والتقارير المالية.</p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSSystem;
